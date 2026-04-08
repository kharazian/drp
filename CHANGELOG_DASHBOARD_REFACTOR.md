# Dashboard Refactor Notes

## Goal

Replace the existing `items` feature with a new dashboard-oriented model:

- `items` -> `dashboards`
- add `datasources`
- split backend models into a package
- add backend API routes for dashboards and data sources
- update frontend navigation and route structure

## Main Code Changes Attempted

### Backend

- Replaced `items` router registration with:
  - `dashboards`
  - `datasources`
- Added new route files:
  - `backend/app/api/routes/dashboards.py`
  - `backend/app/api/routes/datasources.py`
- Updated CRUD helpers in:
  - `backend/app/crud.py`
- Replaced old single-file model module with package-based models under:
  - `backend/app/models/`
- Added models for:
  - `Dashboard`
  - `DataSource`
  - shared datetime helper
- Updated user relationships to dashboards and data sources
- Added migration:
  - `backend/app/alembic/versions/3d2b7c1a9f0e_replace_items_with_dashboards_and_datasources.py`
- Added placeholder service modules:
  - `backend/app/services/dashboards.py`
  - `backend/app/services/datasources.py`
  - `backend/app/services/chart_data.py`

### Frontend

- Removed the old `/items` page and related components
- Added `/dashboards` route page:
  - `frontend/src/routes/_layout/dashboards.tsx`
- Updated sidebar navigation to point to `/dashboards`
- Updated generated route tree references

### Tests

- Removed old item API and helper tests
- Added:
  - `backend/tests/api/routes/test_dashboards.py`
- Existing Playwright `items` test coverage was still present and stale

## Important Findings During Review

### 1. Data-loss migration risk

The new Alembic migration drops the `item` table and creates fresh `dashboard`
and `datasource` tables. There is no data migration path from existing items.

Impact:

- upgrading an existing environment would delete all current `item` data

### 2. Frontend regression

The previous items CRUD UI was removed, but the new dashboards page is only a
placeholder. Navigation changes point users to a page that does not yet provide
the old functionality.

### 3. Generated client drift

The frontend generated API client still referenced `/api/v1/items/*` while the
backend router changed to `/dashboards` and `/datasources`.

### 4. Test coverage drift

- old Playwright tests still targeted `/items`
- no equivalent dashboard frontend coverage was added
- datasource backend route tests were still missing

## Runtime / Debugging Issues Found

While trying to bring the app up in Docker, several model compatibility issues
showed up in sequence.

### Relationship annotation issue

The new model files initially used annotations like:

```python
created_by: "User" | None = Relationship(...)
```

This caused import and mapper resolution failures under the project runtime.

### SQLModel field compatibility issue

Using `Literal[...]` types for persisted SQLModel fields and later using
`pattern=` on `Field()` caused runtime compatibility errors with the dependency
versions in the container.

### Mapper resolution issue

Even after postponing annotations, SQLAlchemy still failed when relationship
targets were interpreted as expressions like:

- `"'User' | None"`
- `'User | None'`

## Fixes Applied During Debugging

The following fixes were applied locally while debugging startup:

- added `from __future__ import annotations` in:
  - `backend/app/models/dashboard.py`
  - `backend/app/models/datasource.py`
  - `backend/app/models/user.py`
- changed persisted `Literal[...]` model fields to plain `str`
- removed unsupported `pattern=` usage from model `Field(...)`
- changed relationship annotations away from optional union expressions

## Observed Startup Progress

After the model fixes:

- tables were created successfully in Postgres
- `prestart` progressed farther than before

However, startup/seeding was still not fully validated end-to-end during this
session, and the initial superuser record was not confirmed present in the DB.

## Current Workspace State

At the time this note was created, the workspace still contains:

- tracked modifications
- deletions
- newly added files

This note was added before cleanup so the attempted refactor and debugging trail
would not be lost.

## Suggested Restart Plan

If restarting the work from scratch:

1. reset the repo to a clean baseline
2. reintroduce backend model changes incrementally
3. validate model imports before touching migrations
4. validate `prestart`, migrations, and `initial_data.py`
5. keep the old frontend items flow until a working dashboard replacement exists
6. regenerate the frontend API client only after backend routes stabilize
7. update or replace stale Playwright coverage before merging
