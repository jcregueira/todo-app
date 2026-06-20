"""
Backend integration tests.
"""
import pytest


# ── Auth tests ────────────────────────────────────────────────

class TestAuth:
    def test_register(self, client):
        resp = client.post("/auth/register", json={"email": "new@example.com", "password": "password123"})
        assert resp.status_code == 201
        assert resp.json()["email"] == "new@example.com"

    def test_register_duplicate_email(self, client):
        client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
        resp = client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
        assert resp.status_code == 409

    def test_login_success(self, client):
        client.post("/auth/register", json={"email": "login@example.com", "password": "password123"})
        resp = client.post("/auth/login", json={"email": "login@example.com", "password": "password123"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client):
        client.post("/auth/register", json={"email": "wrong@example.com", "password": "password123"})
        resp = client.post("/auth/login", json={"email": "wrong@example.com", "password": "wrong"})
        assert resp.status_code == 401


# ── Task tests ────────────────────────────────────────────────

class TestTasks:
    def test_create_task(self, client, auth_headers):
        resp = client.post("/api/tasks/", json={"title": "Test task"}, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["title"] == "Test task"
        assert resp.json()["status"] == "pending"

    def test_list_tasks(self, client, auth_headers):
        client.post("/api/tasks/", json={"title": "Task 1"}, headers=auth_headers)
        client.post("/api/tasks/", json={"title": "Task 2"}, headers=auth_headers)
        resp = client.get("/api/tasks/", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 2

    def test_get_task(self, client, auth_headers):
        created = client.post("/api/tasks/", json={"title": "Get me"}, headers=auth_headers).json()
        resp = client.get(f"/api/tasks/{created['id']}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Get me"

    def test_update_task(self, client, auth_headers):
        created = client.post("/api/tasks/", json={"title": "Update me"}, headers=auth_headers).json()
        resp = client.patch(f"/api/tasks/{created['id']}", json={"status": "completed"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"
        assert resp.json()["completed_at"] is not None

    def test_delete_task(self, client, auth_headers):
        created = client.post("/api/tasks/", json={"title": "Delete me"}, headers=auth_headers).json()
        client.delete(f"/api/tasks/{created['id']}", headers=auth_headers)
        resp = client.get(f"/api/tasks/{created['id']}", headers=auth_headers)
        assert resp.status_code == 404

    def test_filter_by_status(self, client, auth_headers):
        client.post("/api/tasks/", json={"title": "Pending task"}, headers=auth_headers)
        created = client.post("/api/tasks/", json={"title": "Completed task"}, headers=auth_headers).json()
        client.patch(f"/api/tasks/{created['id']}", json={"status": "completed"}, headers=auth_headers)
        resp = client.get("/api/tasks/?status=completed", headers=auth_headers)
        assert all(t["status"] == "completed" for t in resp.json()["data"])

    def test_search_tasks(self, client, auth_headers):
        client.post("/api/tasks/", json={"title": "Buy groceries"}, headers=auth_headers)
        client.post("/api/tasks/", json={"title": "Walk the dog"}, headers=auth_headers)
        resp = client.get("/api/tasks/?q=groceries", headers=auth_headers)
        assert resp.status_code == 200
        assert any("groceries" in t["title"].lower() for t in resp.json()["data"])

    def test_task_not_found(self, client, auth_headers):
        resp = client.get("/api/tasks/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_unauthorized_access(self, client):
        resp = client.get("/api/tasks/")
        assert resp.status_code in (401, 403)
