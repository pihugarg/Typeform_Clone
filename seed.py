import uuid
from datetime import datetime, timedelta
import random
from database import SessionLocal, Base, engine
import models

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Form 1: Customer Satisfaction & Feedback Survey (CSAT)
        form1_id = "csat-feedback-2026"
        form1 = models.Form(
            id=form1_id,
            title="Customer Experience & Feedback Survey",
            description="Help us make your experience even better by sharing 2 minutes of feedback.",
            status="published",
            theme={
                "primaryColor": "#0445AF",
                "backgroundColor": "#FFFFFF",
                "textColor": "#191919",
                "fontFamily": "Inter"
            },
            settings={
                "showProgressBar": True,
                "submitButtonText": "Submit Feedback",
                "thankYouTitle": "Thank you so much!",
                "thankYouMessage": "Your feedback helps us continuously improve our product.",
                "redirectUrl": ""
            },
            created_at=datetime.utcnow() - timedelta(days=5),
            updated_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(form1)
        db.flush()

        # Questions for Form 1
        q1_1 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=0,
            question_type="short_text",
            title="What is your full name?",
            description="We'd love to know who we are speaking with.",
            is_required=True,
            properties={"placeholder": "e.g. Jane Doe"}
        )
        q1_2 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=1,
            question_type="email",
            title="What is your work email address?",
            description="We won't spam you — only used to follow up if needed.",
            is_required=True,
            properties={"placeholder": "jane@company.com"}
        )
        q1_3 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=2,
            question_type="rating",
            title="How would you rate your overall experience with our product?",
            description="1 being poor, 5 being phenomenal.",
            is_required=True,
            properties={"rating_scale": 5, "rating_icon": "star"}
        )
        q1_4 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=3,
            question_type="multiple_choice",
            title="Which capability has been most valuable to your workflow?",
            description="Select the one that matters most.",
            is_required=True,
            properties={
                "choices": [
                    {"id": "c1", "label": "Intuitive Drag-and-Drop Builder"},
                    {"id": "c2", "label": "Conversational Respondent Flow"},
                    {"id": "c3", "label": "Real-time Responses & Analytics"},
                    {"id": "c4", "label": "Keyboard Navigation Shortcuts"}
                ]
            }
        )
        q1_5 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=4,
            question_type="dropdown",
            title="How frequently does your team use the platform?",
            description="Choose from the list.",
            is_required=False,
            properties={
                "choices": [
                    {"id": "d1", "label": "Daily"},
                    {"id": "d2", "label": "Several times a week"},
                    {"id": "d3", "label": "Once a month"},
                    {"id": "d4", "label": "First time today"}
                ]
            }
        )
        q1_6 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=5,
            question_type="yes_no",
            title="Would you recommend our tool to a peer or partner?",
            description="Press Y for Yes, N for No.",
            is_required=True,
            properties={}
        )
        q1_7 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=6,
            question_type="number",
            title="Approximately how many employees work at your organization?",
            description="Enter a whole number.",
            is_required=False,
            properties={"placeholder": "e.g. 50", "min_value": 1, "max_value": 100000}
        )
        q1_8 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form1_id,
            order_index=7,
            question_type="long_text",
            title="What feature should we build next?",
            description="Feel free to share any feedback, ideas, or pain points.",
            is_required=False,
            properties={"placeholder": "Type your message here..."}
        )
        db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5, q1_6, q1_7, q1_8])
        db.flush()

        # Seed Responses for Form 1
        sample_submissions = [
            {
                "name": "Sarah Connor",
                "email": "sarah@cyberdyne.org",
                "rating": 5,
                "valuable": "Conversational Respondent Flow",
                "freq": "Daily",
                "rec": "Yes",
                "team": 120,
                "ideas": "We love the snappy keyboard navigation. Dark mode would be fantastic!",
                "time": 48
            },
            {
                "name": "Alex Mercer",
                "email": "alex.m@biotech.io",
                "rating": 4,
                "valuable": "Intuitive Drag-and-Drop Builder",
                "freq": "Several times a week",
                "rec": "Yes",
                "team": 45,
                "ideas": "CSV export is already great, webhook integrations would be a huge plus.",
                "time": 62
            },
            {
                "name": "David Miller",
                "email": "david.m@apexdesign.co",
                "rating": 5,
                "valuable": "Real-time Responses & Analytics",
                "freq": "Daily",
                "rec": "Yes",
                "team": 15,
                "ideas": "The animation smoothness between questions is unmatched. Outstanding UX!",
                "time": 39
            },
            {
                "name": "Elena Rostova",
                "email": "elena@vanguard.com",
                "rating": 4,
                "valuable": "Keyboard Navigation Shortcuts",
                "freq": "Once a month",
                "rec": "Yes",
                "team": 350,
                "ideas": "Would love custom branding fonts and domain mapping.",
                "time": 75
            },
            {
                "name": "Marcus Wright",
                "email": "marcus.w@skyline.tech",
                "rating": 5,
                "valuable": "Conversational Respondent Flow",
                "freq": "Several times a week",
                "rec": "Yes",
                "team": 80,
                "ideas": "Higher conversion rates on our leads since switching to this conversational format.",
                "time": 54
            }
        ]

        for i, sub in enumerate(sample_submissions):
            resp = models.Response(
                id=str(uuid.uuid4()),
                form_id=form1_id,
                submitted_at=datetime.utcnow() - timedelta(days=random.randint(0, 3), hours=random.randint(1, 12)),
                started_at=datetime.utcnow() - timedelta(days=random.randint(0, 3), hours=random.randint(1, 12), seconds=sub["time"]),
                completion_time_seconds=sub["time"]
            )
            db.add(resp)
            db.flush()

            answers_data = [
                (q1_1, sub["name"]),
                (q1_2, sub["email"]),
                (q1_3, sub["rating"]),
                (q1_4, sub["valuable"]),
                (q1_5, sub["freq"]),
                (q1_6, sub["rec"]),
                (q1_7, sub["team"]),
                (q1_8, sub["ideas"]),
            ]
            for q, val in answers_data:
                db.add(models.Answer(
                    id=str(uuid.uuid4()),
                    response_id=resp.id,
                    question_id=q.id,
                    question_type=q.question_type,
                    value=val,
                    value_text=str(val)
                ))

        # Form 2: Developer Tech Stack & Community Survey (Published)
        form2_id = "developer-survey-2026"
        form2 = models.Form(
            id=form2_id,
            title="Developer Community Tech Survey 2026",
            description="A quick 1-minute pulse check on tools, frameworks, and developer workflows.",
            status="published",
            theme={
                "primaryColor": "#10B981",
                "backgroundColor": "#F8FAFC",
                "textColor": "#0F172A",
                "fontFamily": "Inter"
            },
            settings={
                "showProgressBar": True,
                "submitButtonText": "Complete Survey",
                "thankYouTitle": "Survey Recorded!",
                "thankYouMessage": "Thank you for contributing to open developer telemetry.",
                "redirectUrl": ""
            },
            created_at=datetime.utcnow() - timedelta(days=10),
            updated_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(form2)
        db.flush()

        q2_1 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form2_id,
            order_index=0,
            question_type="short_text",
            title="What is your preferred programming language?",
            description="TypeScript, Python, Go, Rust, etc.",
            is_required=True,
            properties={"placeholder": "e.g. TypeScript"}
        )
        q2_2 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form2_id,
            order_index=1,
            question_type="multiple_choice",
            title="What kind of applications do you primarily build?",
            description="Choose your primary focus.",
            is_required=True,
            properties={
                "choices": [
                    {"id": "a1", "label": "Fullstack Web Apps"},
                    {"id": "a2", "label": "Distributed Backend APIs & Microservices"},
                    {"id": "a3", "label": "AI Agents & LLM Applications"},
                    {"id": "a4", "label": "Mobile (iOS/Android)"}
                ]
            }
        )
        q2_3 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form2_id,
            order_index=2,
            question_type="rating",
            title="How would you rate developer happiness in your current stack?",
            description="From 1 to 5 stars.",
            is_required=True,
            properties={"rating_scale": 5, "rating_icon": "star"}
        )
        q2_4 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form2_id,
            order_index=3,
            question_type="yes_no",
            title="Do you use AI coding assistants daily?",
            description="Press Y or N.",
            is_required=True,
            properties={}
        )
        db.add_all([q2_1, q2_2, q2_3, q2_4])
        db.flush()

        # Seed 3 responses for Form 2
        f2_subs = [
            {"lang": "TypeScript", "app": "Fullstack Web Apps", "rate": 5, "ai": "Yes", "time": 30},
            {"lang": "Python", "app": "AI Agents & LLM Applications", "rate": 4, "ai": "Yes", "time": 35},
            {"lang": "Go", "app": "Distributed Backend APIs & Microservices", "rate": 4, "ai": "Yes", "time": 42}
        ]
        for sub in f2_subs:
            resp = models.Response(
                id=str(uuid.uuid4()),
                form_id=form2_id,
                submitted_at=datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
                completion_time_seconds=sub["time"]
            )
            db.add(resp)
            db.flush()
            db.add(models.Answer(id=str(uuid.uuid4()), response_id=resp.id, question_id=q2_1.id, question_type="short_text", value=sub["lang"], value_text=sub["lang"]))
            db.add(models.Answer(id=str(uuid.uuid4()), response_id=resp.id, question_id=q2_2.id, question_type="multiple_choice", value=sub["app"], value_text=sub["app"]))
            db.add(models.Answer(id=str(uuid.uuid4()), response_id=resp.id, question_id=q2_3.id, question_type="rating", value=sub["rate"], value_text=str(sub["rate"])))
            db.add(models.Answer(id=str(uuid.uuid4()), response_id=resp.id, question_id=q2_4.id, question_type="yes_no", value=sub["ai"], value_text=sub["ai"]))

        # Form 3: SDE Candidate Application (Draft)
        form3_id = "sde-hiring-application"
        form3 = models.Form(
            id=form3_id,
            title="Fullstack SDE Application",
            description="Apply for our Senior Fullstack Engineer position.",
            status="draft",
            theme={
                "primaryColor": "#6366F1",
                "backgroundColor": "#FFFFFF",
                "textColor": "#1E293B",
                "fontFamily": "Inter"
            },
            settings={
                "showProgressBar": True,
                "submitButtonText": "Submit Application",
                "thankYouTitle": "Application Received!",
                "thankYouMessage": "Our talent acquisition team will review your portfolio within 48 hours.",
                "redirectUrl": ""
            }
        )
        db.add(form3)
        db.flush()

        q3_1 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form3_id,
            order_index=0,
            question_type="short_text",
            title="Candidate Full Name",
            is_required=True,
            properties={"placeholder": "e.g. John Smith"}
        )
        q3_2 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form3_id,
            order_index=1,
            question_type="email",
            title="Candidate Email",
            is_required=True,
            properties={"placeholder": "john@example.com"}
        )
        q3_3 = models.Question(
            id=str(uuid.uuid4()),
            form_id=form3_id,
            order_index=2,
            question_type="number",
            title="Years of Professional Software Engineering Experience",
            is_required=True,
            properties={"placeholder": "e.g. 5", "min_value": 0, "max_value": 40}
        )
        db.add_all([q3_1, q3_2, q3_3])

        db.commit()
        print("Database seeded successfully with 3 rich forms and 8 realistic responses!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
