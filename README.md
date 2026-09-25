# Typeform Clone - Fullstack Web Application

A fullstack clone of the Typeform platform replicating Typeform's signature design, user experience, drag-and-drop style form builder, and animated one-question-at-a-time conversational respondent flow.

---

## 🚀 Live Demo & Project Overview

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti)
- **Backend**: FastAPI (Python 3.13, SQLAlchemy ORM, Pydantic V2, SQLite)
- **Database**: SQLite (persisted relational schema with cascading deletions)

---

## 🛠 Features

### 1. Form Builder
- **Dynamic Question Types**: Short Text, Long Text, Multiple Choice, Dropdown, Email, Number, Yes / No, and Rating (star / score).
- **Interactive Editing**: Inline editing of question titles and helper descriptions.
- **Reordering & Management**: Move questions up/down, add options for multiple choice/dropdown, set min/max rating steps.
- **Per-Question Settings**: Required validation toggle, custom placeholders, numerical ranges.
- **Live Preview Drawer**: Embedded real-time interactive preview of respondent flow without leaving the builder.
- **Theme Customization**: Custom primary accent color picker and completion screen settings.

### 2. Form Management (CRUD)
- **Dashboard**: Filter by status (All, Published, Draft), search forms by title.
- **Lifecycle Operations**: Create, rename, duplicate, and delete forms.
- **Publishing & Sharing**: One-click publish / unpublish with instant shareable link modal and clipboard copy.
- **Persistent Storage**: All form schemas and question definitions persist in SQLite.

### 3. Signature Respondent Flow (The Typeform Experience)
- **Conversational Experience**: One question at a time, full-screen, with smooth slide animations.
- **Keyboard Navigation**:
  - `Enter ↵`: Advance to next question or submit.
  - `Shift + Tab` or `↑`: Go back to previous question.
  - `A, B, C, D`: Select Multiple Choice options with keyboard.
  - `Y / N`: Quick keys for Yes / No questions.
  - `1-9`: Direct number keys for Ratings.
- **Progress Tracking**: Real-time progress bar tracking completion percentage.
- **Client & Server Validation**: Email regex, numerical limits, required checks with inline alerts.
- **Thank-You Celebration**: Dynamic celebration screen with confetti animation and submission summary.
- **No Auth Required**: Public respondents can view and submit without logging in.

### 4. Results & Analytics
- **Summary KPI Cards**: Total submissions, average completion time in seconds, active questions count.
- **Per-Question Analytics**:
  - Breakdown percentages and visual bar distribution for choice questions.
  - Average score calculations for rating questions.
  - Real sample responses for open-ended text fields.
- **Submissions Table**: Timestamped individual submissions with drill-down modal into complete answer payload.
- **CSV Export**: Real-time dynamic CSV export generated on the server with custom headers.

---

## 📐 Architecture & Database Schema

### Database Schema (SQLite)

- **`forms`**:
  - `id` (VARCHAR PK): Form identifier or slug.
  - `title` (VARCHAR NOT NULL): Form title.
  - `description` (TEXT): Subtitle or instructions.
  - `status` (VARCHAR): `'draft'` or `'published'`.
  - `theme` (JSON): Primary color, background color, fonts.
  - `settings` (JSON): Progress bar toggle, thank you title & message.
  - `created_at`, `updated_at` (DATETIME).

- **`questions`**:
  - `id` (VARCHAR PK): Question UUID.
  - `form_id` (VARCHAR FK -> `forms.id` ON DELETE CASCADE).
  - `order_index` (INTEGER): Zero-indexed order of question.
  - `question_type` (VARCHAR): `'short_text'`, `'long_text'`, `'multiple_choice'`, `'dropdown'`, `'email'`, `'number'`, `'yes_no'`, `'rating'`.
  - `title` (TEXT NOT NULL): Question prompt.
  - `description` (TEXT): Helper text.
  - `is_required` (BOOLEAN): Mandatory answer validation.
  - `properties` (JSON): Choices array, placeholder, min/max limits.

- **`responses`**:
  - `id` (VARCHAR PK): Submission UUID.
  - `form_id` (VARCHAR FK -> `forms.id` ON DELETE CASCADE).
  - `submitted_at` (DATETIME).
  - `completion_time_seconds` (INTEGER).

- **`answers`**:
  - `id` (VARCHAR PK): Answer UUID.
  - `response_id` (VARCHAR FK -> `responses.id` ON DELETE CASCADE).
  - `question_id` (VARCHAR FK -> `questions.id` ON DELETE CASCADE).
  - `value` (JSON): Stored respondent answer.

---

## 🏃 Running the Application

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Swagger Interactive Docs: `http://localhost:8000/docs`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
- Frontend Web App: `http://localhost:3000`

### 3. Run Backend Tests
```bash
cd backend
pytest test_api.py
```
*(or `python -u test_api.py`)*

## Application Routes

- `/` - Typeform-inspired marketing homepage
- `/studio` - creator dashboard and form workspace
- `/builder/new` - create a form and open its builder
- `/builder/{id}` - edit questions, reorder, preview, and publish
- `/forms/{id}/preview` - draft-safe respondent preview
- `/form/{publicId}` - published one-question-at-a-time respondent flow
- `/forms/{id}/responses` - analytics and submissions
- `/forms/{id}/responses/{responseId}` - individual response detail
- `/settings` - workspace settings placeholders

## API Overview

Forms use `GET/POST /api/forms`, `GET/PATCH/DELETE /api/forms/{id}`, plus
`POST /api/forms/{id}/duplicate`, `/publish`, and `/unpublish`.
Questions use `POST /api/forms/{id}/questions`, `PATCH/DELETE /api/questions/{id}`,
and `POST /api/forms/{id}/questions/reorder`.
Published forms are read from `GET /api/public/forms/{id}` and accept submissions at
`POST /api/public/forms/{id}/submit`. Results are available from
`GET /api/forms/{id}/responses`, `GET /api/forms/{id}/responses/{responseId}`,
`GET /api/forms/{id}/stats`, and the CSV export endpoint.

## Environment

Create `frontend/.env.local` when the API is not running on the default address:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The SQLite database is created at `backend/typeform.db`. Run `python seed.py` from
the backend directory to reset it with the sample published forms and responses.
