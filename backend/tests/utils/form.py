from sqlmodel import Session

from app.models import Form, FormCreate
from app.services.forms import create_form
from tests.utils.user import create_random_user


def create_random_form(db: Session) -> Form:
    user = create_random_user(db)
    form_in = FormCreate(
        title="Incident Intake",
        schema={
            "fields": [
                {"id": "name", "label": "Name", "type": "text"},
                {"id": "priority", "label": "Priority", "type": "select"},
            ]
        },
    )
    return create_form(session=db, current_user=user, form_in=form_in)
