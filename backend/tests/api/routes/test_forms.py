from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.form import create_random_form


def test_create_form_with_initial_version(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    payload = {
        "title": "Safety Checklist",
        "schema": {"fields": [{"id": "site", "label": "Site", "type": "text"}]},
    }

    response = client.post(
        f"{settings.API_V1_STR}/forms/",
        headers=superuser_token_headers,
        json=payload,
    )

    assert response.status_code == 200
    content = response.json()
    assert content["title"] == payload["title"]
    assert content["active_version"]["version_number"] == 1
    assert content["active_version"]["schema"] == payload["schema"]
    assert len(content["versions"]) == 1


def test_title_only_update_keeps_active_version(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)
    initial_response = client.get(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
    )
    initial_version_id = initial_response.json()["active_version"]["id"]

    response = client.put(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
        json={"title": "Renamed Form"},
    )

    assert response.status_code == 200
    content = response.json()
    assert content["title"] != "Renamed Form"
    assert content["draft_title"] == "Renamed Form"
    assert content["active_version"]["id"] == initial_version_id
    assert content["draft_version"] is None
    assert len(content["versions"]) == 1


def test_schema_update_saves_draft_without_replacing_active_version(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)
    initial_response = client.get(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
    )
    initial_version_id = initial_response.json()["active_version"]["id"]

    response = client.put(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
        json={
            "schema": {
                "fields": [
                    {"id": "name", "label": "Name", "type": "text"},
                    {"id": "severity", "label": "Severity", "type": "number"},
                ]
            }
        },
    )

    assert response.status_code == 200
    content = response.json()
    assert content["active_version"]["id"] == initial_version_id
    assert content["active_version"]["version_number"] == 1
    assert content["draft_version"]["version_number"] == 2
    assert len(content["versions"]) == 2
    assert content["versions"][0]["is_active"] is False
    assert content["versions"][1]["is_active"] is True


def test_publish_form_promotes_draft_version(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)
    update_response = client.put(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
        json={
            "schema": {
                "fields": [
                    {"id": "name", "label": "Name", "type": "text"},
                    {"id": "severity", "label": "Severity", "type": "number"},
                ]
            }
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["draft_version"]["version_number"] == 2

    publish_response = client.post(
        f"{settings.API_V1_STR}/forms/{form.id}/publish",
        headers=superuser_token_headers,
    )

    assert publish_response.status_code == 200
    content = publish_response.json()
    assert content["active_version"]["version_number"] == 2
    assert content["active_version"]["is_active"] is True
    assert content["draft_version"] is None


def test_publish_form_promotes_draft_title(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)

    update_response = client.put(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
        json={"title": "Published Rename"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] != "Published Rename"
    assert update_response.json()["draft_title"] == "Published Rename"

    publish_response = client.post(
        f"{settings.API_V1_STR}/forms/{form.id}/publish",
        headers=superuser_token_headers,
    )

    assert publish_response.status_code == 200
    content = publish_response.json()
    assert content["title"] == "Published Rename"
    assert content["draft_title"] is None


def test_submission_is_bound_to_specific_version_and_audited(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)
    form_response = client.get(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
    )
    active_version = form_response.json()["active_version"]

    create_response = client.post(
        f"{settings.API_V1_STR}/forms/{form.id}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": active_version["id"],
            "data": {"name": "Alex", "priority": "high"},
        },
    )
    assert create_response.status_code == 200
    submission = create_response.json()
    assert submission["form_version_id"] == active_version["id"]

    update_response = client.put(
        f"{settings.API_V1_STR}/forms/{form.id}/submissions/{submission['id']}",
        headers=superuser_token_headers,
        json={"data": {"name": "Alex", "priority": "critical"}},
    )
    assert update_response.status_code == 200

    history_response = client.get(
        f"{settings.API_V1_STR}/forms/{form.id}/submissions/{submission['id']}/history",
        headers=superuser_token_headers,
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert history["count"] == 1
    assert history["data"][0]["before_state"]["priority"] == "high"
    assert history["data"][0]["after_state"]["priority"] == "critical"
    assert history["data"][0]["changes"]["priority"] == {
        "before": "high",
        "after": "critical",
    }


def test_submission_validation_is_enforced(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    payload = {
        "title": "Validation Form",
        "schema": {
            "fields": [
                {
                    "id": "summary",
                    "label": "Summary",
                    "type": "text",
                    "required": True,
                    "validation": {"min_length": 5},
                },
                {
                    "id": "severity",
                    "label": "Severity",
                    "type": "number",
                    "validation": {"min_value": 2},
                },
            ]
        },
    }

    form_response = client.post(
        f"{settings.API_V1_STR}/forms/",
        headers=superuser_token_headers,
        json=payload,
    )
    assert form_response.status_code == 200
    form = form_response.json()

    submission_response = client.post(
        f"{settings.API_V1_STR}/forms/{form['id']}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": form["active_version"]["id"],
            "data": {"summary": "bad", "severity": 1},
        },
    )

    assert submission_response.status_code == 422
    assert "at least 5 characters" in submission_response.json()["detail"]


def test_extended_field_types_are_supported(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    payload = {
        "title": "Extended Fields",
        "schema": {
            "fields": [
                {
                    "id": "contact_email",
                    "label": "Contact Email",
                    "type": "email",
                    "required": True,
                },
                {
                    "id": "visit_date",
                    "label": "Visit Date",
                    "type": "date",
                    "required": True,
                },
                {
                    "id": "consent",
                    "label": "Consent",
                    "type": "checkbox",
                    "required": True,
                },
                {
                    "id": "channel",
                    "label": "Preferred Channel",
                    "type": "radio",
                    "options": ["email", "phone"],
                },
            ]
        },
    }

    form_response = client.post(
        f"{settings.API_V1_STR}/forms/",
        headers=superuser_token_headers,
        json=payload,
    )
    assert form_response.status_code == 200
    form = form_response.json()

    good_submission = client.post(
        f"{settings.API_V1_STR}/forms/{form['id']}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": form["active_version"]["id"],
            "data": {
                "contact_email": "team@example.com",
                "visit_date": "2026-04-09",
                "consent": True,
                "channel": "email",
            },
        },
    )
    assert good_submission.status_code == 200

    bad_submission = client.post(
        f"{settings.API_V1_STR}/forms/{form['id']}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": form["active_version"]["id"],
            "data": {
                "contact_email": "not-an-email",
                "visit_date": "04/09/2026",
                "consent": "yes",
                "channel": "fax",
            },
        },
    )
    assert bad_submission.status_code == 422


def test_section_based_schema_is_supported_end_to_end(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    payload = {
        "title": "Sectioned Intake",
        "schema": {
            "version": 2,
            "settings": {
                "title": "Sectioned Intake",
                "description": "Section-based form",
                "submitLabel": "Send",
            },
            "sections": [
                {
                    "id": "requester_info",
                    "title": "Requester Info",
                    "description": "Basic contact details",
                    "layout": {"columns": 12},
                    "fields": [
                        {
                            "id": "requester_name",
                            "label": "Requester Name",
                            "type": "text",
                            "required": True,
                            "span": 3,
                            "start_column": 1,
                            "custom_classes": "rounded-xl border-primary/40",
                            "style_preset": "accent",
                        },
                        {
                            "id": "requester_email",
                            "label": "Requester Email",
                            "type": "email",
                            "required": True,
                            "default_value": "ops@example.com",
                            "span": 4,
                            "start_column": 5,
                        },
                    ],
                },
                {
                    "id": "details",
                    "title": "Details",
                    "layout": {"columns": 12},
                    "fields": [
                        {
                            "id": "priority",
                            "label": "Priority",
                            "type": "radio",
                            "options": ["low", "high"],
                            "required": True,
                        }
                    ],
                },
            ],
        },
    }

    form_response = client.post(
        f"{settings.API_V1_STR}/forms/",
        headers=superuser_token_headers,
        json=payload,
    )
    assert form_response.status_code == 200
    form = form_response.json()
    assert form["active_version"]["schema"]["version"] == 2
    assert len(form["active_version"]["schema"]["sections"]) == 2
    requester_section = form["active_version"]["schema"]["sections"][0]
    assert requester_section["layout"]["columns"] == 12
    assert requester_section["fields"][0]["span"] == 3
    assert requester_section["fields"][0]["start_column"] == 1
    assert requester_section["fields"][0]["style_preset"] == "accent"
    assert (
        requester_section["fields"][0]["custom_classes"]
        == "rounded-xl border-primary/40"
    )
    assert requester_section["fields"][1]["default_value"] == "ops@example.com"
    assert requester_section["fields"][1]["span"] == 4
    assert requester_section["fields"][1]["start_column"] == 5

    valid_submission = client.post(
        f"{settings.API_V1_STR}/forms/{form['id']}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": form["active_version"]["id"],
            "data": {
                "requester_name": "Jordan Lee",
                "requester_email": "jordan@example.com",
                "priority": "high",
            },
        },
    )
    assert valid_submission.status_code == 200

    invalid_submission = client.post(
        f"{settings.API_V1_STR}/forms/{form['id']}/submissions",
        headers=superuser_token_headers,
        json={
            "form_version_id": form["active_version"]["id"],
            "data": {
                "requester_name": "Jordan Lee",
                "requester_email": "bad-email",
                "priority": "urgent",
            },
        },
    )
    assert invalid_submission.status_code == 422


def test_section_field_layout_rejects_out_of_bounds_grid_placement(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    payload = {
        "title": "Invalid Grid Placement",
        "schema": {
            "version": 2,
            "sections": [
                {
                    "id": "main",
                    "title": "Main",
                    "layout": {"columns": 12},
                    "fields": [
                        {
                            "id": "overflowing_field",
                            "label": "Overflowing Field",
                            "type": "text",
                            "start_column": 11,
                            "span": 4,
                        }
                    ],
                }
            ],
        },
    }

    response = client.post(
        f"{settings.API_V1_STR}/forms/",
        headers=superuser_token_headers,
        json=payload,
    )

    assert response.status_code == 422


def test_delete_form(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    form = create_random_form(db)

    response = client.delete(
        f"{settings.API_V1_STR}/forms/{form.id}",
        headers=superuser_token_headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Form deleted successfully"
