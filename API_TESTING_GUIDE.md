# CodeCraftHub API Testing Guide

A beginner-friendly guide for testing the **CodeCraftHub** Flask REST API. This document walks you through every endpoint with copy-paste-ready `curl` commands, expected responses, validation tests, and troubleshooting tips.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Happy Path Test Cases](#2-happy-path-test-cases)
3. [Validation and Error Test Cases](#3-validation-and-error-test-cases)
4. [API Response Validation Checklist](#4-api-response-validation-checklist)
5. [Beginner-Friendly Testing Sequence](#5-beginner-friendly-testing-sequence)
6. [Troubleshooting Guide](#6-troubleshooting-guide)

---

## 1. Prerequisites

### 1.1 Install Dependencies

Open a terminal in the `codecrafthub` folder and run:

```bash
cd codecrafthub
pip install -r requirements.txt
```

### 1.2 Start the Flask Server

```bash
python app.py
```

You should see output similar to:

```text
============================================================
CodeCraftHub - Learning Management REST API
============================================================
Server URL     : http://0.0.0.0:5000
Data file path : ...\codecrafthub\courses.json
Debug mode     : Enabled
============================================================
```

Keep this terminal window open while testing.

### 1.3 Verify the API Is Running

Open a **second terminal** and run:

```bash
curl http://localhost:5000/api/courses
```

**Expected HTTP status:** `200 OK`

**Expected response:**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": []
}
```

If `courses.json` already contains data, `data` will be a list of existing courses instead of `[]`.

### 1.4 Base URL

All examples in this guide use:

```text
http://localhost:5000
```

Full endpoint pattern:

```text
http://localhost:5000/api/courses
http://localhost:5000/api/courses/<id>
```

### 1.5 Optional: Reset Test Data

For a clean test run, reset `courses.json` to an empty list before starting:

```json
[]
```

The API also creates this file automatically if it does not exist.

### 1.6 Windows Note

On Windows, use `curl.exe` if `curl` is aliased to PowerShell:

```bash
curl.exe http://localhost:5000/api/courses
```

---

## 2. Happy Path Test Cases

These tests confirm that normal CRUD operations work correctly.

---

### Test Case 1 — Create a New Course (POST)

**Purpose:** Verify that a valid course can be created and saved to `courses.json`.

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Fundamentals\",\"description\":\"Learn Python programming from scratch\",\"target_date\":\"2026-12-31\",\"status\":\"Not Started\"}"
```

**Request body:**

```json
{
  "name": "Python Fundamentals",
  "description": "Learn Python programming from scratch",
  "target_date": "2026-12-31",
  "status": "Not Started"
}
```

**Expected HTTP status:** `201 Created`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "name": "Python Fundamentals",
    "description": "Learn Python programming from scratch",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-06-14 10:30:00"
  }
}
```

> **Note:** `id` and `created_at` are auto-generated. Your actual `created_at` value will match the current date and time.

---

### Test Case 2 — Create Another Course (POST)

**Purpose:** Verify that multiple courses can be created and IDs increment automatically.

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Flask Web Development\",\"description\":\"Build REST APIs with Flask\",\"target_date\":\"2026-09-30\",\"status\":\"In Progress\"}"
```

**Request body:**

```json
{
  "name": "Flask Web Development",
  "description": "Build REST APIs with Flask",
  "target_date": "2026-09-30",
  "status": "In Progress"
}
```

**Expected HTTP status:** `201 Created`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 2,
    "name": "Flask Web Development",
    "description": "Build REST APIs with Flask",
    "target_date": "2026-09-30",
    "status": "In Progress",
    "created_at": "2026-06-14 10:35:00"
  }
}
```

---

### Test Case 3 — Get All Courses (GET)

**Purpose:** Verify that all stored courses can be retrieved.

**curl command:**

```bash
curl http://localhost:5000/api/courses
```

**Expected HTTP status:** `200 OK`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Python Fundamentals",
      "description": "Learn Python programming from scratch",
      "target_date": "2026-12-31",
      "status": "Not Started",
      "created_at": "2026-06-14 10:30:00"
    },
    {
      "id": 2,
      "name": "Flask Web Development",
      "description": "Build REST APIs with Flask",
      "target_date": "2026-09-30",
      "status": "In Progress",
      "created_at": "2026-06-14 10:35:00"
    }
  ]
}
```

---

### Test Case 4 — Get a Specific Course by ID (GET)

**Purpose:** Verify that a single course can be retrieved using its ID.

**curl command:**

```bash
curl http://localhost:5000/api/courses/1
```

**Expected HTTP status:** `200 OK`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": 1,
    "name": "Python Fundamentals",
    "description": "Learn Python programming from scratch",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-06-14 10:30:00"
  }
}
```

---

### Test Case 5 — Update Course Status (PUT)

**Purpose:** Verify that a course status can be updated from `"Not Started"` to `"In Progress"`.

**curl command:**

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"In Progress\"}"
```

**Request body:**

```json
{
  "status": "In Progress"
}
```

**Expected HTTP status:** `200 OK`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": 1,
    "name": "Python Fundamentals",
    "description": "Learn Python programming from scratch",
    "target_date": "2026-12-31",
    "status": "In Progress",
    "created_at": "2026-06-14 10:30:00"
  }
}
```

---

### Test Case 6 — Update Multiple Course Fields (PUT)

**Purpose:** Verify that multiple fields can be updated in a single request.

**curl command:**

```bash
curl -X PUT http://localhost:5000/api/courses/2 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Advanced Flask APIs\",\"description\":\"Master Flask REST API development\",\"target_date\":\"2026-11-15\",\"status\":\"Completed\"}"
```

**Request body:**

```json
{
  "name": "Advanced Flask APIs",
  "description": "Master Flask REST API development",
  "target_date": "2026-11-15",
  "status": "Completed"
}
```

**Expected HTTP status:** `200 OK`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": 2,
    "name": "Advanced Flask APIs",
    "description": "Master Flask REST API development",
    "target_date": "2026-11-15",
    "status": "Completed",
    "created_at": "2026-06-14 10:35:00"
  }
}
```

---

### Test Case 7 — Delete a Course (DELETE)

**Purpose:** Verify that a course can be removed from the system.

**curl command:**

```bash
curl -X DELETE http://localhost:5000/api/courses/2
```

**Expected HTTP status:** `200 OK`

**Expected JSON response:**

```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": {
    "id": 2,
    "name": "Advanced Flask APIs",
    "description": "Master Flask REST API development",
    "target_date": "2026-11-15",
    "status": "Completed",
    "created_at": "2026-06-14 10:35:00"
  }
}
```

---

### Test Case 8 — Verify the Course Was Deleted (GET)

**Purpose:** Confirm that a deleted course no longer exists.

**curl command:**

```bash
curl http://localhost:5000/api/courses/2
```

**Expected HTTP status:** `404 Not Found`

**Expected JSON response:**

```json
{
  "success": false,
  "message": "Course not found"
}
```

**Optional follow-up — verify remaining courses:**

```bash
curl http://localhost:5000/api/courses
```

You should now see only course `id: 1` in the `data` array.

---

## 3. Validation and Error Test Cases

These tests confirm that invalid input is rejected with clear error messages.

---

### 3.1 Missing Required Fields

All missing-field tests use `POST /api/courses` and return **HTTP 400 Bad Request**.

#### Missing `name`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Learn Python\",\"target_date\":\"2026-12-31\",\"status\":\"Not Started\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: name"
}
```

#### Missing `description`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"target_date\":\"2026-12-31\",\"status\":\"Not Started\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: description"
}
```

#### Missing `target_date`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"status\":\"Not Started\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: target_date"
}
```

#### Missing `status`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"2026-12-31\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: status"
}
```

#### Missing multiple fields

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: description, target_date, status"
}
```

> Field order in the message may vary slightly depending on Python set iteration.

---

### 3.2 Invalid Data

#### Invalid status value

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"2026-12-31\",\"status\":\"Pending\"}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid status value. Allowed values: \"Completed\", \"In Progress\", \"Not Started\""
}
```

#### Invalid date format

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"31-12-2026\",\"status\":\"Not Started\"}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid target_date format. Use YYYY-MM-DD"
}
```

#### Empty request body

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d ""
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Request body cannot be empty"
}
```

#### Empty JSON object

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: name, description, target_date, status"
}
```

#### Invalid JSON payload

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{name: Python}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid JSON payload"
}
```

#### Empty string for `name`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"   \",\"description\":\"Intro course\",\"target_date\":\"2026-12-31\",\"status\":\"Not Started\"}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Field 'name' must be a non-empty string"
}
```

#### PUT with no updatable fields

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Expected HTTP status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "At least one field must be provided for update"
}
```

---

### 3.3 Resource Not Found

All not-found tests return **HTTP 404 Not Found**.

#### GET non-existent course

```bash
curl http://localhost:5000/api/courses/999
```

**Expected response:**

```json
{
  "success": false,
  "message": "Course not found"
}
```

#### PUT non-existent course

```bash
curl -X PUT http://localhost:5000/api/courses/999 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"Completed\"}"
```

**Expected response:**

```json
{
  "success": false,
  "message": "Course not found"
}
```

#### DELETE non-existent course

```bash
curl -X DELETE http://localhost:5000/api/courses/999
```

**Expected response:**

```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 3.4 File and Server Error Scenarios

The API stores data in `courses.json`. These situations may cause server errors:

| Scenario | Cause | Expected behavior |
| -------- | ----- | ----------------- |
| Corrupted `courses.json` | File contains invalid JSON | `500 Internal Server Error` with message like `Invalid JSON in courses file` |
| File read failure | Permission denied or disk issue | `500 Internal Server Error` with `Failed to read courses file` |
| File write failure | Disk full or permission issue | `500 Internal Server Error` with `Failed to write courses file` |
| Unexpected server error | Unhandled exception | `500 Internal Server Error` with `Unexpected server error` |

**Example simulated corruption test:**

1. Stop the Flask server.
2. Edit `courses.json` and replace contents with invalid JSON:

   ```text
   { broken json
   ```

3. Restart the server.
4. Run:

   ```bash
   curl http://localhost:5000/api/courses
   ```

5. **Expected response:**

   ```json
   {
     "success": false,
     "message": "Invalid JSON in courses file: ..."
   }
   ```

6. Fix the file by resetting it to `[]` before continuing tests.

---

## 4. API Response Validation Checklist

Use this checklist after running all tests:

### HTTP Status Codes

- [ ] `POST /api/courses` with valid data returns `201 Created`
- [ ] `GET /api/courses` returns `200 OK`
- [ ] `GET /api/courses/<id>` with valid ID returns `200 OK`
- [ ] `PUT /api/courses/<id>` with valid data returns `200 OK`
- [ ] `DELETE /api/courses/<id>` with valid ID returns `200 OK`
- [ ] Validation errors return `400 Bad Request`
- [ ] Missing resources return `404 Not Found`
- [ ] File/server failures return `500 Internal Server Error`

### Response Structure

- [ ] Success responses include `"success": true`
- [ ] Success responses include `"message"`
- [ ] Success responses include `"data"` when applicable
- [ ] Error responses include `"success": false`
- [ ] Error responses include a clear `"message"`

### Data Persistence

- [ ] Created courses appear in `courses.json`
- [ ] Updated courses are saved correctly in `courses.json`
- [ ] Deleted courses are removed from `courses.json`
- [ ] Data survives server restart

### Auto-Generated Fields

- [ ] `id` starts at `1` for the first course
- [ ] `id` increments for each new course
- [ ] `created_at` is generated automatically on create
- [ ] `created_at` does not change on update

### Validation Behavior

- [ ] Missing required fields are rejected
- [ ] Invalid status values are rejected
- [ ] Invalid date formats are rejected
- [ ] Empty bodies are rejected
- [ ] Invalid JSON is rejected

### CRUD Functionality

- [ ] **Create** — new courses are added
- [ ] **Read** — all courses and single courses can be retrieved
- [ ] **Update** — single and multiple fields can be changed
- [ ] **Delete** — courses can be removed

---

## 5. Beginner-Friendly Testing Sequence

Run tests in this order for the best learning experience:

| Step | Test | Why this order |
| ---- | ---- | -------------- |
| 1 | Start server + verify `GET /api/courses` | Confirm API is alive |
| 2 | Test Case 1 — Create first course | Learn POST and auto-generated fields |
| 3 | Test Case 2 — Create second course | Confirm ID increment |
| 4 | Test Case 3 — Get all courses | Learn list retrieval |
| 5 | Test Case 4 — Get course by ID | Learn single resource retrieval |
| 6 | Test Case 5 — Update status | Learn partial PUT update |
| 7 | Test Case 6 — Update multiple fields | Learn full PUT update |
| 8 | Missing field tests | Understand validation |
| 9 | Invalid status/date tests | Understand data rules |
| 10 | Empty body / invalid JSON tests | Understand request format rules |
| 11 | Not found tests (GET/PUT/DELETE) | Understand 404 errors |
| 12 | Test Case 7 — Delete course | Learn DELETE |
| 13 | Test Case 8 — Verify deletion | Confirm delete worked |
| 14 | Review `courses.json` | Connect API to file storage |
| 15 | Complete validation checklist | Final review |

---

## 6. Troubleshooting Guide

### Flask Server Not Running

**Symptom:**

```text
curl: (7) Failed to connect to localhost port 5000
```

**Solution:**

1. Open a terminal in `codecrafthub`
2. Run `python app.py`
3. Wait for the startup banner before sending requests

---

### Port Already in Use

**Symptom:**

```text
OSError: [Errno 98] Address already in use
```

**Solution:**

1. Stop any other app using port 5000
2. On Windows, find and stop the process:

   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```

3. Restart with `python app.py`

---

### Invalid JSON Syntax in curl

**Symptom:**

```json
{
  "success": false,
  "message": "Invalid JSON payload"
}
```

**Solution:**

- Use double quotes inside JSON
- Escape inner quotes in bash:

  ```bash
  -d "{\"name\":\"Python Basics\"}"
  ```

- On Windows PowerShell, prefer:

  ```powershell
  $body = '{"name":"Python Basics","description":"Intro","target_date":"2026-12-31","status":"Not Started"}'
  Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method POST -ContentType "application/json" -Body $body
  ```

---

### `courses.json` Not Found

**Symptom:** File does not exist in the folder.

**Solution:**

- Start the server once — it auto-creates `courses.json` with `[]`
- Or manually create `courses.json` containing `[]`

---

### Endpoint Not Reachable

**Symptom:** `404 Not Found` from Flask for every URL.

**Solution:**

- Confirm exact endpoint spelling: `/api/courses`
- Do not omit `/api`
- Use `http://localhost:5000`, not `https://`

---

### Incorrect Request Format

**Symptom:** Validation errors even with seemingly correct data.

**Solution:**

- Always include header: `Content-Type: application/json`
- Use exact status values:
  - `"Not Started"`
  - `"In Progress"`
  - `"Completed"`
- Use date format: `YYYY-MM-DD` (example: `"2026-12-31"`)

---

### Changes Not Appearing

**Symptom:** API response does not match expectations.

**Solution:**

1. Open `courses.json` and inspect current data
2. Restart Flask if you manually edited the file while server was running
3. Reset file to `[]` for a clean test state

---

## Quick Reference

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| POST | `/api/courses` | Create course |
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/<id>` | Get one course |
| PUT | `/api/courses/<id>` | Update course |
| DELETE | `/api/courses/<id>` | Delete course |

**Allowed status values:** `Not Started`, `In Progress`, `Completed`

**Date format:** `YYYY-MM-DD`

**Success response shape:**

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

**Error response shape:**

```json
{
  "success": false,
  "message": "..."
}
```

---

Happy testing!
