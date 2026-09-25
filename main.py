import os
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Response as FastAPIResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import engine, get_db, Base, SessionLocal

# Create tables if not exist
Base.metadata.create_all(bind=engine)

# Seed demo data only once when the database is empty so the app starts with populated examples.
from seed import seed_database
from sqlalchemy.orm import Session

def ensure_seed_data():
    db = SessionLocal()
    try:
        has_forms = db.query(models.Form).first() is not None
        if not has_forms:
            seed_database()
    finally:
        db.close()

ensure_seed_data()

app = FastAPI(
    title="Typeform Clone API",
    description="Backend API for Typeform-like Form Builder & Respondent Flow",
    version="1.0.0"
)

# Enable CORS for frontend Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "typeform-clone-api"}

# --- Form Endpoints ---
@app.get("/api/forms", response_model=List[schemas.FormListItem])
def list_forms(db: Session = Depends(get_db)):
    return crud.get_forms_list(db)

@app.post("/api/forms", response_model=schemas.FormDetail)
def create_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    form = crud.create_form(db, form_in)
    return schemas.FormDetail(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme,
        settings=form.settings,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=[],
        response_count=0
    )

@app.get("/api/forms/{form_id}", response_model=schemas.FormDetail)
def get_form_detail(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    response_count = db.query(models.Response).filter(models.Response.form_id == form_id).count()
    return schemas.FormDetail(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme,
        settings=form.settings,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=sorted(form.questions, key=lambda q: q.order_index),
        response_count=response_count
    )

@app.patch("/api/forms/{form_id}", response_model=schemas.FormDetail)
def update_form(form_id: str, form_update: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = crud.update_form(db, form_id, form_update)
    response_count = db.query(models.Response).filter(models.Response.form_id == form_id).count()
    return schemas.FormDetail(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme,
        settings=form.settings,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=sorted(form.questions, key=lambda q: q.order_index),
        response_count=response_count
    )

@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormDetail)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.duplicate_form(db, form_id)
    return schemas.FormDetail(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme,
        settings=form.settings,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=sorted(form.questions, key=lambda q: q.order_index),
        response_count=0
    )

@app.delete("/api/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    crud.delete_form(db, form_id)
    return {"success": True, "message": "Form deleted"}

@app.post("/api/forms/{form_id}/publish")
def publish_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    form.status = "published"
    db.commit()
    return {"status": "published", "form_id": form.id, "share_url": f"/form/{form.id}"}

@app.post("/api/forms/{form_id}/unpublish")
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    form.status = "draft"
    db.commit()
    return {"status": "draft", "form_id": form.id}

# --- Questions Endpoints ---
@app.post("/api/forms/{form_id}/questions", response_model=schemas.QuestionResponse)
def add_question(form_id: str, q_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    question = crud.create_question(db, form_id, q_in)
    return question

@app.patch("/api/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(question_id: str, q_update: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    return crud.update_question(db, question_id, q_update)

@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    crud.delete_question(db, question_id)
    return {"success": True, "message": "Question deleted"}

@app.post("/api/forms/{form_id}/questions/reorder", response_model=List[schemas.QuestionResponse])
def reorder_questions(form_id: str, req: schemas.QuestionReorderRequest, db: Session = Depends(get_db)):
    return crud.reorder_questions(db, form_id, req.orders)

# --- Public Respondent Flow (No Auth) ---
@app.get("/api/public/forms/{form_id}", response_model=schemas.PublicFormView)
def get_public_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status != "published":
        raise HTTPException(status_code=403, detail="This form is currently private or in draft mode.")
    
    sorted_questions = sorted(form.questions, key=lambda q: q.order_index)
    return schemas.PublicFormView(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme or {},
        settings=form.settings or {},
        questions=sorted_questions
    )

@app.get("/api/forms/{form_id}/preview", response_model=schemas.PublicFormView)
def get_form_preview(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    return schemas.PublicFormView(
        id=form.id,
        title=form.title,
        description=form.description or "",
        status=form.status,
        theme=form.theme or {},
        settings=form.settings or {},
        questions=sorted(form.questions, key=lambda q: q.order_index)
    )

@app.post("/api/public/forms/{form_id}/submit")
def submit_response(form_id: str, sub_in: schemas.ResponseSubmitRequest, db: Session = Depends(get_db)):
    response_rec = crud.submit_form_response(db, form_id, sub_in)
    return {
        "success": True,
        "submission_id": response_rec.id,
        "submitted_at": response_rec.submitted_at
    }

# --- Results & Analytics ---
@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.ResponseItem])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    responses = crud.get_form_responses(db, form_id)
    return responses

@app.get("/api/forms/{form_id}/responses/{response_id}", response_model=schemas.ResponseItem)
def get_response(form_id: str, response_id: str, db: Session = Depends(get_db)):
    response = crud.get_response(db, form_id, response_id)
    return response

@app.get("/api/forms/{form_id}/stats", response_model=schemas.FormStatsResponse)
def get_stats(form_id: str, db: Session = Depends(get_db)):
    return crud.get_form_stats(db, form_id)

@app.get("/api/forms/{form_id}/export/csv")
def export_csv(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    csv_content = crud.generate_csv_export(db, form_id)
    filename = f"{form.title.replace(' ', '_')}_responses.csv"
    return FastAPIResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
