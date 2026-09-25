import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_list_forms():
    res = client.get("/api/forms")
    assert res.status_code == 200
    forms = res.json()
    assert len(forms) >= 3
    form_ids = [f["id"] for f in forms]
    assert "csat-feedback-2026" in form_ids

def test_get_form_detail():
    res = client.get("/api/forms/csat-feedback-2026")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Customer Experience & Feedback Survey"
    assert len(data["questions"]) == 8
    assert data["response_count"] == 5

def test_public_form_view():
    res = client.get("/api/public/forms/csat-feedback-2026")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "published"
    assert len(data["questions"]) == 8

def test_submit_response_validation():
    # Attempt submit without required field
    res = client.post("/api/public/forms/csat-feedback-2026/submit", json={
        "answers": [
            {"question_id": "invalid-id", "value": "test"}
        ],
        "completion_time_seconds": 20
    })
    # Must fail because required questions are missing
    assert res.status_code == 422

def test_form_stats():
    res = client.get("/api/forms/csat-feedback-2026/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_responses"] == 5
    assert len(stats["questions"]) == 8

def test_csv_export():
    res = client.get("/api/forms/csat-feedback-2026/export/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Customer_Experience" in res.headers["content-disposition"]
    assert "Submission ID" in res.text

def test_crud_form_flow():
    # 1. Create
    res = client.post("/api/forms", json={
        "title": "Temporary Test Form",
        "description": "Testing CRUD flow",
        "status": "draft"
    })
    assert res.status_code == 200
    form_id = res.json()["id"]

    # 2. Add question
    res = client.post(f"/api/forms/{form_id}/questions", json={
        "title": "What is your role?",
        "question_type": "short_text",
        "is_required": True,
        "properties": {}
    })
    assert res.status_code == 200
    q_id = res.json()["id"]

    # 3. Duplicate
    res = client.post(f"/api/forms/{form_id}/duplicate")
    assert res.status_code == 200
    dup_id = res.json()["id"]

    # 4. Delete duplicated
    res = client.delete(f"/api/forms/{dup_id}")
    assert res.status_code == 200

    # 5. Delete original
    res = client.delete(f"/api/forms/{form_id}")
    assert res.status_code == 200

if __name__ == "__main__":
    test_health()
    test_list_forms()
    test_get_form_detail()
    test_public_form_view()
    test_submit_response_validation()
    test_form_stats()
    test_csv_export()
    test_crud_form_flow()
    print("All backend tests passed successfully!")
