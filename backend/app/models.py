import uuid
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any
from typing import Literal

from pydantic import model_validator
from pydantic import EmailStr
from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


JsonValue = dict[str, Any] | list[Any] | str | int | float | bool | None
FormFieldType = Literal["text", "textarea", "number", "select", "email", "date", "checkbox", "radio"]
GridColumn = Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
FormFieldStylePreset = Literal["plain", "rounded", "shadow", "accent"]


class FormFieldValidation(SQLModel):
    min_length: int | None = Field(default=None, ge=0)
    max_length: int | None = Field(default=None, ge=0)
    min_value: float | None = None
    max_value: float | None = None
    pattern: str | None = None


class FormSchemaField(SQLModel):
    id: str = Field(min_length=1)
    label: str = Field(min_length=1)
    type: FormFieldType
    default_value: str | None = None
    start_column: GridColumn = 1
    span: GridColumn = 12
    placeholder: str | None = None
    help_text: str | None = None
    required: bool = False
    custom_classes: str | None = None
    style_preset: FormFieldStylePreset = "plain"
    options: list[str] = Field(default_factory=list)
    validation: FormFieldValidation | None = None

    @model_validator(mode="after")
    def validate_grid_position(self) -> "FormSchemaField":
        if self.start_column + self.span - 1 > 12:
            raise ValueError("Field placement extends past column 12")
        return self


class FormSchemaLayout(SQLModel):
    columns: Literal[12] = 12


class FormSchemaSettings(SQLModel):
    title: str | None = None
    description: str | None = None
    submitLabel: str | None = None


class FormSchemaSection(SQLModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    description: str | None = None
    layout: FormSchemaLayout = Field(default_factory=FormSchemaLayout)
    fields: list[FormSchemaField] = Field(default_factory=list)


class FormSchema(SQLModel):
    fields: list[FormSchemaField] = Field(default_factory=list)
    version: int | None = None
    settings: FormSchemaSettings | None = None
    sections: list[FormSchemaSection] = Field(default_factory=list)

    @model_validator(mode="after")
    def ensure_flattenable(self) -> "FormSchema":
        if not self.fields and not self.sections:
            return self

        if self.sections:
            section_field_ids: set[str] = set()
            for section in self.sections:
                for field in section.fields:
                    if field.id in section_field_ids:
                        raise ValueError("Field IDs must be unique across sections")
                    section_field_ids.add(field.id)

        if self.fields:
            field_ids = [field.id for field in self.fields]
            if len(field_ids) != len(set(field_ids)):
                raise ValueError("Field IDs must be unique")

        return self


class FormBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)


class FormCreate(FormBase):
    schema: FormSchema = Field(default_factory=FormSchema)


class FormUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    schema: FormSchema | None = Field(default=None)


class Form(FormBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    draft_title: str | None = Field(default=None, max_length=255)
    active_version_id: uuid.UUID | None = Field(
        default=None, foreign_key="formversion.id", ondelete="SET NULL"
    )

class FormVersionBase(SQLModel):
    schema: FormSchema = Field(default_factory=FormSchema)


class FormVersion(FormVersionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    form_id: uuid.UUID = Field(
        foreign_key="form.id", nullable=False, ondelete="CASCADE"
    )
    version_number: int = Field(ge=1)
    is_active: bool = True
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    created_by_user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    schema: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )

class FormPublic(FormBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    draft_title: str | None = None
    active_version_id: uuid.UUID | None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class FormVersionPublic(FormVersionBase):
    id: uuid.UUID
    form_id: uuid.UUID
    version_number: int
    is_active: bool
    created_at: datetime | None = None
    created_by_user_id: uuid.UUID


class FormDetailPublic(FormPublic):
    active_version: FormVersionPublic | None = None
    draft_version: FormVersionPublic | None = None
    versions: list[FormVersionPublic] = Field(default_factory=list)


class FormsPublic(SQLModel):
    data: list[FormPublic]
    count: int


class SubmissionBase(SQLModel):
    data: dict[str, Any] = Field(default_factory=dict)


class SubmissionCreate(SubmissionBase):
    form_version_id: uuid.UUID


class SubmissionUpdate(SQLModel):
    data: dict[str, Any]


class Submission(SubmissionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    form_id: uuid.UUID = Field(
        foreign_key="form.id", nullable=False, ondelete="CASCADE"
    )
    form_version_id: uuid.UUID = Field(
        foreign_key="formversion.id", nullable=False, ondelete="RESTRICT"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    submitted_by_user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    data: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )

class SubmissionPublic(SubmissionBase):
    id: uuid.UUID
    form_id: uuid.UUID
    form_version_id: uuid.UUID
    submitted_by_user_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SubmissionsPublic(SQLModel):
    data: list[SubmissionPublic]
    count: int


class AuditLogBase(SQLModel):
    before_state: dict[str, Any] = Field(default_factory=dict)
    after_state: dict[str, Any] = Field(default_factory=dict)
    changes: dict[str, Any] = Field(default_factory=dict)


class AuditLog(AuditLogBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    submission_id: uuid.UUID = Field(
        foreign_key="submission.id", nullable=False, ondelete="CASCADE"
    )
    before_state: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )
    after_state: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )
    changes: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )
    changed_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    changed_by_user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )

class AuditLogPublic(SQLModel):
    id: uuid.UUID
    submission_id: uuid.UUID
    before_state: dict[str, Any]
    after_state: dict[str, Any]
    changes: dict[str, Any]
    changed_at: datetime | None = None
    changed_by_user_id: uuid.UUID


class AuditLogsPublic(SQLModel):
    data: list[AuditLogPublic]
    count: int


def diff_json_objects(before: JsonValue, after: JsonValue) -> dict[str, Any]:
    if before == after:
        return {}

    if isinstance(before, Mapping) and isinstance(after, Mapping):
        changes: dict[str, Any] = {}
        keys = set(before) | set(after)
        for key in keys:
            nested_changes = diff_json_objects(before.get(key), after.get(key))
            if nested_changes != {}:
                changes[key] = nested_changes
        return changes

    return {"before": before, "after": after}


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
