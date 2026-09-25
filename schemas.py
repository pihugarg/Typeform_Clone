from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

# Choices schema
class ChoiceOption(BaseModel):
    id: str
    label: str

# Question schemas
class QuestionBase(BaseModel):
    title: str = "Your question here"
    question_type: str = "short_text"
    description: Optional[str] = ""
    is_required: bool = False
    properties: Dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    question_type: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    properties: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QuestionReorderItem(BaseModel):
    id: str
    order_index: int

class QuestionReorderRequest(BaseModel):
    orders: List[QuestionReorderItem]

# Form schemas
class FormTheme(BaseModel):
    primaryColor: str = "#0445AF"
    backgroundColor: str = "#FFFFFF"
    textColor: str = "#191919"
    fontFamily: str = "Inter"

class FormSettings(BaseModel):
    showProgressBar: bool = True
    submitButtonText: str = "Submit"
    thankYouTitle: str = "Thank you for completing this form!"
    thankYouMessage: str = "Your response has been recorded."
    redirectUrl: Optional[str] = ""

class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: Optional[str] = ""
    status: str = "draft"
    theme: Optional[Dict[str, Any]] = Field(default_factory=lambda: {
        "primaryColor": "#0445AF",
        "backgroundColor": "#FFFFFF",
        "textColor": "#191919",
        "fontFamily": "Inter"
    })
    settings: Optional[Dict[str, Any]] = Field(default_factory=lambda: {
        "showProgressBar": True,
        "submitButtonText": "Submit",
        "thankYouTitle": "Thank you for completing this form!",
        "thankYouMessage": "Your response has been recorded.",
        "redirectUrl": ""
    })

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None

class FormListItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    status: str
    question_count: int
    response_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FormDetail(FormBase):
    id: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    response_count: int = 0

    class Config:
        from_attributes = True

# Public Form (Respondent view)
class PublicQuestion(BaseModel):
    id: str
    order_index: int
    question_type: str
    title: str
    description: Optional[str] = ""
    is_required: bool
    properties: Dict[str, Any]

    class Config:
        from_attributes = True

class PublicFormView(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    status: str
    theme: Dict[str, Any]
    settings: Dict[str, Any]
    questions: List[PublicQuestion]

    class Config:
        from_attributes = True

# Answers and Responses
class AnswerSubmit(BaseModel):
    question_id: str
    value: Any

class ResponseSubmitRequest(BaseModel):
    answers: List[AnswerSubmit]
    started_at: Optional[datetime] = None
    completion_time_seconds: Optional[int] = 0

class AnswerResponse(BaseModel):
    id: str
    question_id: str
    question_title: str = "Question"
    question_type: str
    value: Any
    value_text: Optional[str] = ""

    class Config:
        from_attributes = True

class ResponseItem(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time_seconds: Optional[int] = 0
    answers: List[AnswerResponse] = []

    class Config:
        from_attributes = True

class QuestionStatSummary(BaseModel):
    question_id: str
    title: str
    question_type: str
    total_answers: int
    breakdown: Optional[Dict[str, int]] = None
    average: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None

class FormStatsResponse(BaseModel):
    form_id: str
    total_responses: int
    average_completion_time_seconds: Optional[float] = 0
    questions: List[QuestionStatSummary]
