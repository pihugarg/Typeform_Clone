import datetime
import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Form(Base):
    __tablename__ = "forms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    status = Column(String(20), nullable=False, default="draft")  # draft, published
    theme = Column(JSON, nullable=False, default=lambda: {
        "primaryColor": "#0445AF",
        "backgroundColor": "#FFFFFF",
        "textColor": "#191919",
        "fontFamily": "Inter"
    })
    settings = Column(JSON, nullable=False, default=lambda: {
        "showProgressBar": True,
        "submitButtonText": "Submit",
        "thankYouTitle": "Thank you for completing this form!",
        "thankYouMessage": "Your response has been recorded.",
        "redirectUrl": ""
    })
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.order_index"
    )
    responses = relationship(
        "Response",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="desc(Response.submitted_at)"
    )

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    question_type = Column(String(50), nullable=False)  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    title = Column(String(500), nullable=False, default="Your question here")
    description = Column(Text, nullable=True, default="")
    is_required = Column(Boolean, nullable=False, default=False)
    properties = Column(JSON, nullable=False, default=lambda: {})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Response(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completion_time_seconds = Column(Integer, nullable=True, default=0)
    metadata_info = Column(JSON, nullable=True, default=lambda: {})

    # Relationships
    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    response_id = Column(String(36), ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String(50), nullable=False)
    value = Column(JSON, nullable=True)  # Can hold string, list, int, bool, float
    value_text = Column(Text, nullable=True)  # Plain text summary for display & export

    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

    @property
    def question_title(self):
        return self.question.title if self.question else "Question"
