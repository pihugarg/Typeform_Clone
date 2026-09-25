import re
import csv
import io
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

import models
import schemas

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w\.-]+\.)+[\w\.-]{2,}$")

def get_forms_list(db: Session) -> List[schemas.FormListItem]:
    forms = db.query(models.Form).order_by(models.Form.updated_at.desc()).all()
    results = []
    for f in forms:
        q_count = db.query(models.Question).filter(models.Question.form_id == f.id).count()
        r_count = db.query(models.Response).filter(models.Response.form_id == f.id).count()
        results.append(schemas.FormListItem(
            id=f.id,
            title=f.title,
            description=f.description or "",
            status=f.status,
            question_count=q_count,
            response_count=r_count,
            created_at=f.created_at,
            updated_at=f.updated_at
        ))
    return results

def get_form(db: Session, form_id: str) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def create_form(db: Session, form_in: schemas.FormCreate) -> models.Form:
    new_form = models.Form(
        id=str(uuid.uuid4()),
        title=form_in.title,
        description=form_in.description,
        status=form_in.status or "draft",
        theme=form_in.theme or {
            "primaryColor": "#0445AF",
            "backgroundColor": "#FFFFFF",
            "textColor": "#191919",
            "fontFamily": "Inter"
        },
        settings=form_in.settings or {
            "showProgressBar": True,
            "submitButtonText": "Submit",
            "thankYouTitle": "Thank you for completing this form!",
            "thankYouMessage": "Your response has been recorded.",
            "redirectUrl": ""
        }
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    return new_form

def update_form(db: Session, form_id: str, form_update: schemas.FormUpdate) -> models.Form:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    update_data = form_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(form, key, value)
    
    form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(form)
    return form

def duplicate_form(db: Session, form_id: str) -> models.Form:
    original = get_form(db, form_id)
    if not original:
        raise HTTPException(status_code=404, detail="Form not found")

    new_form = models.Form(
        id=str(uuid.uuid4()),
        title=f"{original.title} (Copy)",
        description=original.description,
        status="draft",  # Duplicates start as draft
        theme=original.theme,
        settings=original.settings,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_form)
    db.flush()

    # Duplicate questions
    for q in original.questions:
        new_q = models.Question(
            id=str(uuid.uuid4()),
            form_id=new_form.id,
            order_index=q.order_index,
            question_type=q.question_type,
            title=q.title,
            description=q.description,
            is_required=q.is_required,
            properties=q.properties,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_q)

    db.commit()
    db.refresh(new_form)
    return new_form

def delete_form(db: Session, form_id: str) -> bool:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()
    return True

# --- Question CRUD ---
def create_question(db: Session, form_id: str, q_in: schemas.QuestionCreate) -> models.Question:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # If order_index not explicitly set or 0, place at end
    current_count = db.query(models.Question).filter(models.Question.form_id == form_id).count()
    order_idx = q_in.order_index if q_in.order_index > 0 else current_count

    question = models.Question(
        id=str(uuid.uuid4()),
        form_id=form_id,
        order_index=order_idx,
        question_type=q_in.question_type,
        title=q_in.title,
        description=q_in.description or "",
        is_required=q_in.is_required,
        properties=q_in.properties or {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(question)
    form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(question)
    return question

def update_question(db: Session, question_id: str, q_update: schemas.QuestionUpdate) -> models.Question:
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    update_data = q_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(q, key, value)

    q.updated_at = datetime.utcnow()
    if q.form:
        q.form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(q)
    return q

def delete_question(db: Session, question_id: str) -> bool:
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    form_id = q.form_id
    deleted_order = q.order_index
    db.delete(q)

    # Shift remaining question order indices down
    remaining = db.query(models.Question).filter(
        models.Question.form_id == form_id,
        models.Question.order_index > deleted_order
    ).all()
    for rem in remaining:
        rem.order_index -= 1

    form = get_form(db, form_id)
    if form:
        form.updated_at = datetime.utcnow()

    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, orders: List[schemas.QuestionReorderItem]) -> List[models.Question]:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    order_map = {item.id: item.order_index for item in orders}
    questions = db.query(models.Question).filter(models.Question.form_id == form_id).all()
    for q in questions:
        if q.id in order_map:
            q.order_index = order_map[q.id]
            q.updated_at = datetime.utcnow()

    form.updated_at = datetime.utcnow()
    db.commit()
    return db.query(models.Question).filter(models.Question.form_id == form_id).order_by(models.Question.order_index).all()

# --- Respondent Flow & Validation ---
def validate_answer(question: models.Question, value: Any):
    # Check Required
    is_empty = value is None or (isinstance(value, str) and not value.strip()) or (isinstance(value, list) and len(value) == 0)
    if question.is_required and is_empty:
        raise HTTPException(
            status_code=422,
            detail=f"Question '{question.title}' is required."
        )

    if is_empty:
        return ""

    q_type = question.question_type
    props = question.properties or {}

    # Email Validation
    if q_type == "email":
        val_str = str(value).strip()
        if not EMAIL_REGEX.match(val_str):
            raise HTTPException(status_code=422, detail=f"'{val_str}' is not a valid email address.")
        return val_str

    # Number Validation
    if q_type == "number":
        try:
            num_val = float(value)
            min_val = props.get("min_value")
            max_val = props.get("max_value")
            if min_val is not None and num_val < float(min_val):
                raise HTTPException(status_code=422, detail=f"Number must be at least {min_val}.")
            if max_val is not None and num_val > float(max_val):
                raise HTTPException(status_code=422, detail=f"Number cannot exceed {max_val}.")
            return str(num_val if num_val % 1 != 0 else int(num_val))
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Value must be a valid number.")

    # Rating Validation
    if q_type == "rating":
        try:
            rating_val = int(value)
            scale = int(props.get("rating_scale", 5))
            if rating_val < 1 or rating_val > scale:
                raise HTTPException(status_code=422, detail=f"Rating must be between 1 and {scale}.")
            return str(rating_val)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Invalid rating value.")

    # Yes/No Validation
    if q_type == "yes_no":
        if isinstance(value, bool):
            return "Yes" if value else "No"
        val_str = str(value).strip().lower()
        if val_str in ["yes", "y", "true", "1"]:
            return "Yes"
        elif val_str in ["no", "n", "false", "0"]:
            return "No"
        else:
            raise HTTPException(status_code=422, detail="Answer must be Yes or No.")

    # Multiple Choice / Dropdown
    if q_type in ["multiple_choice", "dropdown"]:
        if isinstance(value, list):
            return ", ".join(str(v) for v in value)
        return str(value)

    return str(value)

def submit_form_response(db: Session, form_id: str, sub_in: schemas.ResponseSubmitRequest) -> models.Response:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    if form.status != "published":
        raise HTTPException(status_code=400, detail="This form is not currently accepting responses.")

    # Build question lookup
    questions_map = {q.id: q for q in form.questions}
    answers_map = {a.question_id: a.value for a in sub_in.answers}

    # Validate all questions
    validated_answers = []
    for q in form.questions:
        val = answers_map.get(q.id, None)
        text_val = validate_answer(q, val)
        if val is not None and val != "":
            validated_answers.append({
                "question_id": q.id,
                "question_type": q.question_type,
                "value": val,
                "value_text": text_val
            })

    # Create response
    response_rec = models.Response(
        id=str(uuid.uuid4()),
        form_id=form_id,
        submitted_at=datetime.utcnow(),
        started_at=sub_in.started_at,
        completion_time_seconds=sub_in.completion_time_seconds or 0
    )
    db.add(response_rec)
    db.flush()

    for item in validated_answers:
        ans = models.Answer(
            id=str(uuid.uuid4()),
            response_id=response_rec.id,
            question_id=item["question_id"],
            question_type=item["question_type"],
            value=item["value"],
            value_text=item["value_text"]
        )
        db.add(ans)

    db.commit()
    db.refresh(response_rec)
    return response_rec

# --- Responses & Stats View ---
def _response_payload(response: models.Response) -> dict:
    return {
        "id": response.id,
        "form_id": response.form_id,
        "submitted_at": response.submitted_at,
        "completion_time_seconds": response.completion_time_seconds or 0,
        "answers": [
            {
                "id": answer.id,
                "question_id": answer.question_id,
                "question_title": answer.question.title if answer.question else "Question",
                "question_type": answer.question_type,
                "value": answer.value,
                "value_text": answer.value_text or "",
            }
            for answer in response.answers
        ],
    }

def get_form_responses(db: Session, form_id: str) -> List[dict]:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
    return [_response_payload(response) for response in responses]

def get_response(db: Session, form_id: str, response_id: str) -> dict:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    response = db.query(models.Response).filter(
        models.Response.id == response_id,
        models.Response.form_id == form_id,
    ).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return _response_payload(response)

def get_form_stats(db: Session, form_id: str) -> schemas.FormStatsResponse:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    responses = db.query(models.Response).filter(models.Response.form_id == form_id).all()
    total_responses = len(responses)

    avg_time = 0.0
    if total_responses > 0:
        times = [r.completion_time_seconds for r in responses if r.completion_time_seconds]
        if times:
            avg_time = round(sum(times) / len(times), 1)

    question_stats = []
    for q in form.questions:
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        total_answers = len(answers)

        breakdown = None
        average = None
        min_v = None
        max_v = None

        if q.question_type in ["multiple_choice", "dropdown", "yes_no"]:
            breakdown = {}
            for a in answers:
                if a.value_text:
                    # Could be comma separated if multi-select
                    parts = [p.strip() for p in a.value_text.split(",")]
                    for p in parts:
                        if p:
                            breakdown[p] = breakdown.get(p, 0) + 1

        elif q.question_type in ["rating", "number"]:
            numeric_vals = []
            for a in answers:
                try:
                    if a.value is not None:
                        numeric_vals.append(float(a.value))
                except (ValueError, TypeError):
                    pass
            if numeric_vals:
                average = round(sum(numeric_vals) / len(numeric_vals), 2)
                min_v = min(numeric_vals)
                max_v = max(numeric_vals)

        question_stats.append(schemas.QuestionStatSummary(
            question_id=q.id,
            title=q.title,
            question_type=q.question_type,
            total_answers=total_answers,
            breakdown=breakdown,
            average=average,
            min=min_v,
            max=max_v
        ))

    return schemas.FormStatsResponse(
        form_id=form_id,
        total_responses=total_responses,
        average_completion_time_seconds=avg_time,
        questions=question_stats
    )

def generate_csv_export(db: Session, form_id: str) -> str:
    form = get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    output = io.StringIO()
    writer = csv.writer(output)

    # Header: Submission ID, Submitted At, Time Spent (s), [Question 1 Title], [Question 2 Title]...
    headers = ["Submission ID", "Submitted At (UTC)", "Time Spent (s)"]
    sorted_questions = sorted(form.questions, key=lambda q: q.order_index)
    for q in sorted_questions:
        headers.append(q.title)
    writer.writerow(headers)

    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
    for resp in responses:
        ans_by_qid = {a.question_id: a.value_text for a in resp.answers}
        row = [
            resp.id,
            resp.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if resp.submitted_at else "",
            resp.completion_time_seconds or 0
        ]
        for q in sorted_questions:
            row.append(ans_by_qid.get(q.id, ""))
        writer.writerow(row)

    return output.getvalue()
