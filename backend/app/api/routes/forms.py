import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, OwnedForm, SessionDep
from app.models import (
    AuditLog,
    AuditLogPublic,
    AuditLogsPublic,
    Form,
    FormCreate,
    FormDetailPublic,
    FormPublic,
    FormsPublic,
    FormUpdate,
    FormVersion,
    FormVersionPublic,
    Submission,
    SubmissionCreate,
    SubmissionPublic,
    SubmissionUpdate,
    SubmissionsPublic,
    Message,
)
from app.services.forms import (
    create_form,
    create_submission,
    delete_form,
    get_draft_form_version,
    publish_form,
    update_form,
    update_submission,
)

router = APIRouter(prefix="/forms", tags=["forms"])


def _serialize_form_detail(*, session: SessionDep, form: Form) -> FormDetailPublic:
    versions = session.exec(
        select(FormVersion)
        .where(FormVersion.form_id == form.id)
        .order_by(col(FormVersion.version_number).desc())
    ).all()
    active_version = (
        session.get(FormVersion, form.active_version_id) if form.active_version_id else None
    )
    draft_version = get_draft_form_version(session=session, form=form)
    return FormDetailPublic(
        **FormPublic.model_validate(form).model_dump(),
        active_version=(
            FormVersionPublic.model_validate(active_version) if active_version else None
        ),
        draft_version=(
            FormVersionPublic.model_validate(draft_version) if draft_version else None
        ),
        versions=[FormVersionPublic.model_validate(version) for version in versions],
    )


@router.get("/", response_model=FormsPublic)
def read_forms(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    if current_user.is_superuser:
        count = session.exec(select(func.count()).select_from(Form)).one()
        forms = session.exec(
            select(Form).order_by(col(Form.updated_at).desc()).offset(skip).limit(limit)
        ).all()
    else:
        count = session.exec(
            select(func.count()).select_from(Form).where(Form.owner_id == current_user.id)
        ).one()
        forms = session.exec(
            select(Form)
            .where(Form.owner_id == current_user.id)
            .order_by(col(Form.updated_at).desc())
            .offset(skip)
            .limit(limit)
        ).all()

    return FormsPublic(
        data=[FormPublic.model_validate(form) for form in forms],
        count=count,
    )


@router.post("/", response_model=FormDetailPublic)
def create_form_record(
    *, session: SessionDep, current_user: CurrentUser, form_in: FormCreate
) -> Any:
    form = create_form(session=session, current_user=current_user, form_in=form_in)
    return _serialize_form_detail(session=session, form=form)


@router.get("/{form_id}", response_model=FormDetailPublic)
def read_form(session: SessionDep, form: OwnedForm) -> Any:
    return _serialize_form_detail(session=session, form=form)


@router.put("/{form_id}", response_model=FormDetailPublic)
def update_form_record(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    form: OwnedForm,
    form_in: FormUpdate,
) -> Any:
    updated_form = update_form(
        session=session,
        current_user=current_user,
        form=form,
        form_in=form_in,
    )
    return _serialize_form_detail(session=session, form=updated_form)


@router.delete("/{form_id}", response_model=Message)
def delete_form_record(session: SessionDep, form: OwnedForm) -> Message:
    delete_form(session=session, form=form)
    return Message(message="Form deleted successfully")


@router.post("/{form_id}/publish", response_model=FormDetailPublic)
def publish_form_record(session: SessionDep, form: OwnedForm) -> Any:
    published_form = publish_form(session=session, form=form)
    return _serialize_form_detail(session=session, form=published_form)


@router.get("/{form_id}/submissions", response_model=SubmissionsPublic)
def read_submissions(
    session: SessionDep, form: OwnedForm, skip: int = 0, limit: int = 100
) -> Any:
    count = session.exec(
        select(func.count()).select_from(Submission).where(Submission.form_id == form.id)
    ).one()
    submissions = session.exec(
        select(Submission)
        .where(Submission.form_id == form.id)
        .order_by(col(Submission.updated_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return SubmissionsPublic(
        data=[SubmissionPublic.model_validate(submission) for submission in submissions],
        count=count,
    )


@router.post("/{form_id}/submissions", response_model=SubmissionPublic)
def create_form_submission(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    form: OwnedForm,
    submission_in: SubmissionCreate,
) -> Any:
    return create_submission(
        session=session,
        current_user=current_user,
        form=form,
        submission_in=submission_in,
    )


@router.put("/{form_id}/submissions/{submission_id}", response_model=SubmissionPublic)
def update_form_submission(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    form: OwnedForm,
    submission_id: uuid.UUID,
    submission_in: SubmissionUpdate,
) -> Any:
    return update_submission(
        session=session,
        current_user=current_user,
        form=form,
        submission_id=submission_id,
        submission_in=submission_in,
    )


@router.get(
    "/{form_id}/submissions/{submission_id}/history",
    response_model=AuditLogsPublic,
)
def read_submission_history(
    session: SessionDep, form: OwnedForm, submission_id: uuid.UUID
) -> Any:
    submission = session.get(Submission, submission_id)
    if not submission or submission.form_id != form.id:
        raise HTTPException(status_code=404, detail="Submission not found")

    audit_logs = session.exec(
        select(AuditLog)
        .where(AuditLog.submission_id == submission_id)
        .order_by(col(AuditLog.changed_at).desc())
    ).all()
    return AuditLogsPublic(
        data=[AuditLogPublic.model_validate(log) for log in audit_logs],
        count=len(audit_logs),
    )
