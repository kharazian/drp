from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import Form, FormCreate, Submission, SubmissionCreate, User, UserCreate
from app.services.forms import create_form, create_submission

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)

    demo_form = session.exec(
        select(Form).where(Form.title == "Facilities Request Demo")
    ).first()
    if not demo_form:
        demo_form = create_form(
            session=session,
            current_user=user,
            form_in=FormCreate(
                title="Facilities Request Demo",
                schema={
                    "fields": [
                        {
                            "id": "requester_name",
                            "label": "Requester Name",
                            "type": "text",
                            "placeholder": "Jordan Lee",
                        },
                        {
                            "id": "department",
                            "label": "Department",
                            "type": "text",
                            "placeholder": "Operations",
                        },
                        {
                            "id": "priority",
                            "label": "Priority",
                            "type": "select",
                            "options": ["low", "medium", "high"],
                        },
                        {
                            "id": "request_details",
                            "label": "Request Details",
                            "type": "textarea",
                            "placeholder": "Describe what needs to be fixed or ordered",
                        },
                    ]
                },
            ),
        )

    has_submission = bool(
        session.exec(select(Submission).where(Submission.form_id == demo_form.id)).first()
    )
    if not has_submission and demo_form.active_version_id:
        create_submission(
            session=session,
            current_user=user,
            form=demo_form,
            submission_in=SubmissionCreate(
                form_version_id=demo_form.active_version_id,
                data={
                    "requester_name": "Jordan Lee",
                    "department": "Operations",
                    "priority": "medium",
                    "request_details": "Replace the damaged warehouse loading dock light.",
                },
            ),
        )
