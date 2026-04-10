import uuid
import re

from fastapi import HTTPException
from sqlmodel import Session, col, select

from app.models import (
    AuditLog,
    Form,
    FormCreate,
    FormSchema,
    FormUpdate,
    FormVersion,
    Submission,
    SubmissionCreate,
    SubmissionUpdate,
    User,
    diff_json_objects,
    FormSchemaField,
    get_datetime_utc,
)


def _dump_form_schema(schema: FormSchema | None) -> dict[str, object]:
    if schema is None:
        return {}
    return schema.model_dump(exclude_none=True)


def _schema_fields(schema: FormSchema) -> list[FormSchemaField]:
    if schema.sections:
        return [field for section in schema.sections for field in section.fields]
    return schema.fields


def _validate_submission_field(
    *, field: FormSchemaField, value: object | None
) -> str | None:
    validation = field.validation

    if value in (None, ""):
        if field.required:
            return f'{field.label} is required.'
        return None

    if field.type in {"text", "textarea", "email", "date"}:
        if not isinstance(value, str):
            return f'{field.label} must be text.'
        if validation is not None and validation.min_length is not None and len(value) < validation.min_length:
            return (
                f'{field.label} must be at least '
                f'{validation.min_length} characters.'
            )
        if validation is not None and validation.max_length is not None and len(value) > validation.max_length:
            return (
                f'{field.label} must be at most '
                f'{validation.max_length} characters.'
            )
        if validation is not None and validation.pattern and not re.fullmatch(validation.pattern, value):
            return f'{field.label} is in an invalid format.'
        if field.type == "email" and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            return f'{field.label} must be a valid email address.'
        if field.type == "date" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            return f'{field.label} must be a valid date.'
        return None

    if field.type == "number":
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            return f'{field.label} must be a number.'
        numeric_value = float(value)
        if validation is not None and validation.min_value is not None and numeric_value < validation.min_value:
            return (
                f'{field.label} must be at least '
                f'{validation.min_value:g}.'
            )
        if validation is not None and validation.max_value is not None and numeric_value > validation.max_value:
            return (
                f'{field.label} must be at most '
                f'{validation.max_value:g}.'
            )
        return None

    if field.type in {"select", "radio"}:
        if not isinstance(value, str):
            return f'{field.label} must be a valid option.'
        if field.options and value not in field.options:
            return f'{field.label} must match one of the available options.'
        return None

    if field.type == "checkbox":
        if not isinstance(value, bool):
            return f'{field.label} must be true or false.'
        return None

    return None


def _validate_submission_data(
    *, schema_payload: dict[str, object], data: dict[str, object]
) -> None:
    schema = FormSchema.model_validate(schema_payload)
    errors = [
        error
        for field in _schema_fields(schema)
        if (error := _validate_submission_field(field=field, value=data.get(field.id)))
    ]
    if errors:
        raise HTTPException(status_code=422, detail=errors[0])


def get_owned_form(*, session: Session, user: User, form_id: uuid.UUID) -> Form:
    form = session.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if not user.is_superuser and form.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return form


def _get_active_form_version(*, session: Session, form: Form) -> FormVersion:
    if form.active_version_id:
        active_version = session.get(FormVersion, form.active_version_id)
        if active_version:
            return active_version

    statement = (
        select(FormVersion)
        .where(FormVersion.form_id == form.id, FormVersion.is_active)
        .order_by(col(FormVersion.version_number).desc())
    )
    active_version = session.exec(statement).first()
    if not active_version:
        raise HTTPException(status_code=409, detail="Form has no active version")
    return active_version


def get_draft_form_version(*, session: Session, form: Form) -> FormVersion | None:
    active_version = _get_active_form_version(session=session, form=form)
    statement = (
        select(FormVersion)
        .where(
            FormVersion.form_id == form.id,
            FormVersion.is_active.is_(False),
            FormVersion.version_number > active_version.version_number,
        )
        .order_by(col(FormVersion.version_number).desc())
    )
    return session.exec(statement).first()


def create_form(*, session: Session, current_user: User, form_in: FormCreate) -> Form:
    now = get_datetime_utc()
    schema_payload = _dump_form_schema(form_in.schema)
    form = Form(
        title=form_in.title,
        owner_id=current_user.id,
        created_at=now,
        updated_at=now,
        draft_title=None,
    )
    session.add(form)
    session.flush()

    version = FormVersion(
        form_id=form.id,
        version_number=1,
        schema=schema_payload,
        is_active=True,
        created_by_user_id=current_user.id,
        created_at=now,
    )
    session.add(version)
    session.flush()

    form.active_version_id = version.id
    session.add(form)
    session.commit()
    session.refresh(form)
    return form


def update_form(*, session: Session, current_user: User, form: Form, form_in: FormUpdate) -> Form:
    active_version = _get_active_form_version(session=session, form=form)
    draft_version = get_draft_form_version(session=session, form=form)
    now = get_datetime_utc()

    if form_in.title is not None:
        if form_in.title == form.title and not draft_version:
            form.draft_title = None
        else:
            form.draft_title = form_in.title

    next_schema = _dump_form_schema(form_in.schema) if form_in.schema is not None else None
    if next_schema is not None:
        if next_schema == active_version.schema:
            if draft_version:
                session.delete(draft_version)
            if form.draft_title == form.title:
                form.draft_title = None
        elif draft_version:
            draft_version.schema = next_schema
            draft_version.created_at = now
            draft_version.created_by_user_id = current_user.id
            session.add(draft_version)
        else:
            next_version = FormVersion(
                form_id=form.id,
                version_number=active_version.version_number + 1,
                schema=next_schema,
                is_active=False,
                created_by_user_id=current_user.id,
                created_at=now,
            )
            session.add(next_version)

    form.updated_at = now
    session.add(form)
    session.commit()
    session.refresh(form)
    return form


def publish_form(*, session: Session, form: Form) -> Form:
    active_version = _get_active_form_version(session=session, form=form)
    draft_version = get_draft_form_version(session=session, form=form)
    if not draft_version and not form.draft_title:
        raise HTTPException(status_code=409, detail="No draft version available to publish")

    if draft_version:
        active_version.is_active = False
        draft_version.is_active = True
        form.active_version_id = draft_version.id
        session.add(active_version)
        session.add(draft_version)

    if form.draft_title:
        form.title = form.draft_title
        form.draft_title = None

    form.updated_at = get_datetime_utc()
    session.add(form)
    session.commit()
    session.refresh(form)
    return form


def create_submission(
    *,
    session: Session,
    current_user: User,
    form: Form,
    submission_in: SubmissionCreate,
) -> Submission:
    version = session.get(FormVersion, submission_in.form_version_id)
    if not version or version.form_id != form.id:
        raise HTTPException(status_code=400, detail="Invalid form version")
    _validate_submission_data(
        schema_payload=version.schema,
        data=submission_in.data,
    )

    submission = Submission(
        form_id=form.id,
        form_version_id=version.id,
        data=submission_in.data,
        submitted_by_user_id=current_user.id,
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


def update_submission(
    *,
    session: Session,
    current_user: User,
    form: Form,
    submission_id: uuid.UUID,
    submission_in: SubmissionUpdate,
) -> Submission:
    submission = session.get(Submission, submission_id)
    if not submission or submission.form_id != form.id:
        raise HTTPException(status_code=404, detail="Submission not found")
    version = session.get(FormVersion, submission.form_version_id)
    if not version or version.form_id != form.id:
        raise HTTPException(status_code=400, detail="Invalid form version")
    _validate_submission_data(
        schema_payload=version.schema,
        data=submission_in.data,
    )

    before_state = submission.data
    after_state = submission_in.data
    submission.data = after_state
    submission.updated_at = get_datetime_utc()
    session.add(submission)

    audit_log = AuditLog(
        submission_id=submission.id,
        before_state=before_state,
        after_state=after_state,
        changes=diff_json_objects(before_state, after_state),
        changed_by_user_id=current_user.id,
    )
    session.add(audit_log)
    session.commit()
    session.refresh(submission)
    return submission


def delete_form(*, session: Session, form: Form) -> None:
    session.delete(form)
    session.commit()
