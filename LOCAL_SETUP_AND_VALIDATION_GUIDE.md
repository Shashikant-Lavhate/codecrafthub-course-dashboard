# CodeCraftHub — Local Setup, Execution, Testing, and Validation Guide

A step-by-step guide to install, run, test, and verify the **CodeCraftHub** Flask REST API on your local machine. Designed for beginners learning Python, Flask, and REST APIs.

---

## Table of Contents

1. [Development Environment Setup](#1-development-environment-setup)
2. [Project Structure](#2-project-structure)
3. [Create requirements.txt](#3-create-requirementstxt)
4. [Install Dependencies](#4-install-dependencies)
5. [Running the Application](#5-running-the-application)
6. [API Testing Guide](#6-api-testing-guide)
7. [Error Testing Guide](#7-error-testing-guide)
8. [Data Persistence Verification](#8-data-persistence-verification)
9. [Validation Checklist](#9-validation-checklist)
10. [End-to-End Testing Workflow](#10-end-to-end-testing-workflow)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Expected Final Outcome](#12-expected-final-outcome)

---

## 1. Development Environment Setup

### 1.1 Verify Python Installation

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
python --version
```

**Expected output (example):**

```text
Python 3.10.11
```

On macOS or Linux, you may need:

```bash
python3 --version
```

> **Requirement:** Python 3.8 or newer is recommended.

### 1.2 Verify pip Installation

```bash
pip --version
```

**Expected output (example):**

```text
pip 24.0 from C:\...\site-packages\pip (python 3.10)
```

On macOS or Linux:

```bash
pip3 --version
```

### 1.3 Create or Navigate to the Project Directory

If you already have the project, navigate into it:

**Windows:**

```bash
cd C:\path\to\codecrafthub
```

**macOS / Linux:**

```bash
cd /path/to/codecrafthub
```

If starting from scratch, create the folder:

```bash
mkdir codecrafthub
cd codecrafthub
```

### 1.4 Confirm Required Files Exist

List the project files:

**Windows:**

```bash
dir
```

**macOS / Linux:**

```bash
ls
```

You should see at minimum:

- `app.py`
- `requirements.txt`

`courses.json` is created automatically when you first run the server.

### 1.5 Optional: Create a Virtual Environment

A virtual environment keeps project dependencies isolated.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

When active, your prompt shows `(venv)`.

---

## 2. Project Structure

```text
codecrafthub/
├── app.py                 # Main Flask application (API logic)
├── courses.json           # Course data storage (auto-created)
├── requirements.txt       # Python package dependencies
├── README.md              # Project documentation
└── API_TESTING_GUIDE.md   # Extended API testing reference (optional)
```

| File | Purpose |
| ---- | ------- |
| `app.py` | Contains all Flask routes, validation, helper functions, and server startup. This is the only file you run. |
| `courses.json` | Stores all courses as a JSON array. Created automatically with `[]` if it does not exist. |
| `requirements.txt` | Lists Flask and Werkzeug versions for `pip install`. |
| `README.md` | Full project overview and API reference. |
| `API_TESTING_GUIDE.md` | Additional test cases and troubleshooting (optional). |

---

## 3. Create requirements.txt

If `requirements.txt` does not exist, create it with these exact contents:

```txt
Flask==3.0.0
Werkzeug==3.0.1
```

### Why these dependencies?

| Package | Purpose |
| ------- | ------- |
| **Flask** | Web framework that handles HTTP requests, routing, and JSON responses |
| **Werkzeug** | Underlying WSGI toolkit used by Flask for request/response handling |

No database drivers or extra libraries are needed because data is stored in `courses.json`.

---

## 4. Install Dependencies

From inside the `codecrafthub` folder:

```bash
pip install -r requirements.txt
```

**macOS / Linux:**

```bash
pip3 install -r requirements.txt
```

### Expected output (example)

```text
Collecting Flask==3.0.0
  Downloading flask-3.0.0-py3-none-any.whl
Collecting Werkzeug==3.0.1
  Downloading werkzeug-3.0.1-py3-none-any.whl
Installing collected packages: Werkzeug, Flask
Successfully installed Flask-3.0.0 Werkzeug-3.0.1
```

### Verify installation

```bash
pip show Flask
```

**Expected:** Package details showing `Version: 3.0.0` with no errors.

---

## 5. Running the Application

### 5.1 Start the Flask Server

```bash
python app.py
```

**macOS / Linux:**

```bash
python3 app.py
```

### 5.2 Expected Startup Output

```text
============================================================
CodeCraftHub - Learning Management REST API
============================================================
Server URL     : http://0.0.0.0:5000
Data file path : C:\...\codecrafthub\courses.json
Debug mode     : Enabled
============================================================
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

> **Note:** The exact data file path will match your machine. Leave this terminal open while testing.

### 5.3 Confirm the Server Is Running

Open a **second terminal** and run:

```bash
curl http://localhost:5000/api/courses
```

**Windows (if curl is aliased):**

```bash
curl.exe http://localhost:5000/api/courses
```

**Expected response:**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": []
}
```

If you see this JSON response, the API is running correctly.

### 5.4 Application URL

| URL | Purpose |
| --- | ------- |
| `http://localhost:5000` | Base server address |
| `http://localhost:5000/api/courses` | Courses API endpoint |

### 5.5 Stop the Server

In the server terminal, press:

```text
CTRL + C
```

---

## 6. API Testing Guide

Use these tests in a **second terminal** while the server is running.

> **Tip:** Reset `courses.json` to `[]` before testing for predictable IDs starting at `1`.

---

### Test Case 1: Create Course

| | |
| --- | --- |
| **Purpose** | Add a new course to the system |
| **Method** | `POST` |
| **Endpoint** | `/api/courses` |
| **Expected status** | `201 Created` |

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Fundamentals\",\"description\":\"Learn Python programming from scratch\",\"target_date\":\"2026-12-31\",\"status\":\"Not Started\"}"
```

**Request payload:**

```json
{
  "name": "Python Fundamentals",
  "description": "Learn Python programming from scratch",
  "target_date": "2026-12-31",
  "status": "Not Started"
}
```

**Expected response:**

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

**Validation points:**

- [ ] `"success"` is `true`
- [ ] `"id"` is `1` (for first course)
- [ ] `"created_at"` is auto-generated
- [ ] HTTP status is `201`

---

### Test Case 2: Get All Courses

| | |
| --- | --- |
| **Purpose** | Retrieve every course in the system |
| **Method** | `GET` |
| **Endpoint** | `/api/courses` |
| **Expected status** | `200 OK` |

**curl command:**

```bash
curl http://localhost:5000/api/courses
```

**Expected response:**

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
    }
  ]
}
```

**Validation points:**

- [ ] `"data"` is an array
- [ ] Created course appears in the list
- [ ] HTTP status is `200`

---

### Test Case 3: Get Course By ID

| | |
| --- | --- |
| **Purpose** | Retrieve a single course by its ID |
| **Method** | `GET` |
| **Endpoint** | `/api/courses/1` |
| **Expected status** | `200 OK` |

**curl command:**

```bash
curl http://localhost:5000/api/courses/1
```

**Expected response:**

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

**Validation points:**

- [ ] `"data.id"` matches requested ID (`1`)
- [ ] All course fields are present
- [ ] HTTP status is `200`

---

### Test Case 4: Update Course

| | |
| --- | --- |
| **Purpose** | Change course status from `Not Started` to `In Progress` |
| **Method** | `PUT` |
| **Endpoint** | `/api/courses/1` |
| **Expected status** | `200 OK` |

**curl command:**

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"In Progress\"}"
```

**Request payload:**

```json
{
  "status": "In Progress"
}
```

**Expected response:**

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

**Validation points:**

- [ ] `"status"` changed to `"In Progress"`
- [ ] `"created_at"` unchanged
- [ ] HTTP status is `200`

---

### Test Case 5: Delete Course

| | |
| --- | --- |
| **Purpose** | Remove a course from the system |
| **Method** | `DELETE` |
| **Endpoint** | `/api/courses/1` |
| **Expected status** | `200 OK` |

**curl command:**

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

**Expected response:**

```json
{
  "success": true,
  "message": "Course deleted successfully",
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

**Validation points:**

- [ ] Deleted course returned in `"data"`
- [ ] Subsequent `GET /api/courses/1` returns `404`
- [ ] HTTP status is `200`

**Verify deletion:**

```bash
curl http://localhost:5000/api/courses/1
```

**Expected:**

```json
{
  "success": false,
  "message": "Course not found"
}
```

---

## 7. Error Testing Guide

These tests confirm validation and error handling work correctly.

---

### Missing Required Fields

**curl command (missing `status`):**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"2026-12-31\"}"
```

**Expected status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Missing required fields: status"
}
```

---

### Invalid Status Value

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"2026-12-31\",\"status\":\"Pending\"}"
```

**Expected status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid status value. Allowed values: \"Completed\", \"In Progress\", \"Not Started\""
}
```

---

### Invalid Date Format

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Python Basics\",\"description\":\"Intro course\",\"target_date\":\"31-12-2026\",\"status\":\"Not Started\"}"
```

**Expected status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid target_date format. Use YYYY-MM-DD"
}
```

---

### Empty Request Body

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d ""
```

**Expected status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Request body cannot be empty"
}
```

---

### Invalid JSON Payload

**curl command:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{name: Python}"
```

**Expected status:** `400 Bad Request`

**Expected response:**

```json
{
  "success": false,
  "message": "Invalid JSON payload"
}
```

---

### Non-Existent Course ID

#### GET invalid ID

```bash
curl http://localhost:5000/api/courses/999
```

**Expected status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Course not found"
}
```

#### PUT invalid ID

```bash
curl -X PUT http://localhost:5000/api/courses/999 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"Completed\"}"
```

**Expected status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Course not found"
}
```

#### DELETE invalid ID

```bash
curl -X DELETE http://localhost:5000/api/courses/999
```

**Expected status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Course not found"
}
```

---

## 8. Data Persistence Verification

CodeCraftHub stores all data in `courses.json`. Verify persistence after each operation.

### 8.1 Open courses.json

**Windows:**

```bash
notepad courses.json
```

**macOS:**

```bash
open courses.json
```

**Linux:**

```bash
cat courses.json
```

### 8.2 After creating a course

`courses.json` should contain:

```json
[
    {
        "id": 1,
        "name": "Python Fundamentals",
        "description": "Learn Python programming from scratch",
        "target_date": "2026-12-31",
        "status": "Not Started",
        "created_at": "2026-06-14 10:30:00"
    }
]
```

### 8.3 After updating a course

Status should change in the file:

```json
[
    {
        "id": 1,
        "name": "Python Fundamentals",
        "description": "Learn Python programming from scratch",
        "target_date": "2026-12-31",
        "status": "In Progress",
        "created_at": "2026-06-14 10:30:00"
    }
]
```

### 8.4 After deleting a course

File should return to an empty array:

```json
[]
```

### 8.5 Persistence after server restart

1. Create a course via POST
2. Stop the server (`CTRL + C`)
3. Restart: `python app.py`
4. Run: `curl http://localhost:5000/api/courses`
5. Confirm the course still exists

This proves data survives server restarts.

---

## 9. Validation Checklist

Use this checklist to confirm everything works:

### Application startup

- [ ] `python app.py` starts without errors
- [ ] Startup banner displays server URL and data file path
- [ ] `curl http://localhost:5000/api/courses` returns JSON

### File handling

- [ ] `courses.json` is created automatically if missing
- [ ] File contains valid JSON array format

### Auto-generated fields

- [ ] First course receives `id: 1`
- [ ] Second course receives `id: 2`
- [ ] `created_at` is set on create
- [ ] `created_at` does not change on update

### CRUD operations

- [ ] POST creates a course (`201`)
- [ ] GET all returns course list (`200`)
- [ ] GET by ID returns single course (`200`)
- [ ] PUT updates course fields (`200`)
- [ ] DELETE removes course (`200`)

### Validation

- [ ] Missing fields return `400`
- [ ] Invalid status returns `400`
- [ ] Invalid date format returns `400`
- [ ] Empty body returns `400`
- [ ] Invalid JSON returns `400`

### Error handling

- [ ] Non-existent ID returns `404` for GET, PUT, DELETE
- [ ] Error responses include `"success": false` and a clear `"message"`

### Data persistence

- [ ] Changes appear in `courses.json` immediately
- [ ] Data survives server restart

---

## 10. End-to-End Testing Workflow

Run these steps in order for a complete validation:

| Step | Action | Command / Check |
| ---- | ------ | --------------- |
| 1 | Start application | `python app.py` |
| 2 | Create course | `POST /api/courses` (Test Case 1) |
| 3 | Verify creation | Check response has `id` and `created_at` |
| 4 | Get all courses | `GET /api/courses` — course in `data` array |
| 5 | Get course by ID | `GET /api/courses/1` — full course returned |
| 6 | Update course | `PUT /api/courses/1` with `"status": "In Progress"` |
| 7 | Verify update | `GET /api/courses/1` — status is `In Progress` |
| 8 | Open courses.json | Confirm file matches API data |
| 9 | Delete course | `DELETE /api/courses/1` |
| 10 | Verify deletion | `GET /api/courses/1` returns `404` |
| 11 | Check courses.json | File is `[]` |
| 12 | Restart server | Stop and run `python app.py` again |
| 13 | Confirm empty state | `GET /api/courses` returns `"data": []` |
| 14 | Run validation checklist | Complete all items in Section 9 |

---

## 11. Troubleshooting Guide

### Flask not installed

**Symptom:**

```text
ModuleNotFoundError: No module named 'flask'
```

**Solution:**

```bash
pip install -r requirements.txt
```

---

### ModuleNotFoundError

**Symptom:** Missing module when running `app.py`.

**Solution:**

1. Activate your virtual environment
2. Reinstall dependencies:

   ```bash
   pip install Flask==3.0.0 Werkzeug==3.0.1
   ```

3. Run from the correct directory (where `app.py` lives)

---

### Port 5000 already in use

**Symptom:**

```text
OSError: [WinError 10048] Only one usage of each socket address...
```

**Solution (Windows):**

```bash
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

**Solution (macOS / Linux):**

```bash
lsof -i :5000
kill -9 <process_id>
```

Then restart: `python app.py`

---

### Permission denied

**Symptom:** Cannot read or write `courses.json`.

**Solution:**

- Run terminal as administrator (Windows) or fix file permissions
- Ensure the project folder is not read-only
- Close `courses.json` if open in another program

---

### courses.json not created

**Symptom:** File missing after starting server.

**Solution:**

1. Ensure you ran `python app.py` (not just imported the module)
2. Check the startup output for the data file path
3. Manually create the file with content: `[]`

---

### JSON decode errors

**Symptom:**

```json
{
  "success": false,
  "message": "Invalid JSON in courses file: ..."
}
```

**Solution:**

1. Stop the server
2. Open `courses.json`
3. Replace contents with: `[]`
4. Restart the server

---

### Endpoint returning 404

**Symptom:** Flask 404 page or wrong response.

**Solution:**

- Use exact path: `/api/courses` (not `/courses`)
- Include `http://localhost:5000` as base URL
- Confirm server is running

---

### curl command errors

**Symptom (Windows):**

```text
Invoke-WebRequest : Cannot bind parameter 'Headers'
```

**Solution:** Use `curl.exe` instead of `curl`, or use PowerShell:

```powershell
$body = '{"name":"Python Fundamentals","description":"Learn Python","target_date":"2026-12-31","status":"Not Started"}'
Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method POST -ContentType "application/json" -Body $body
```

---

### Invalid request body

**Symptom:**

```json
{
  "success": false,
  "message": "Invalid JSON payload"
}
```

**Solution:**

- Use double quotes inside JSON
- Escape quotes in bash: `-d "{\"name\":\"value\"}"`
- Always set header: `Content-Type: application/json`
- Use exact status values: `Not Started`, `In Progress`, `Completed`
- Use date format: `YYYY-MM-DD`

---

## 12. Expected Final Outcome

When everything is set up and tested correctly, you should have:

### A running API server

```text
CodeCraftHub - Learning Management REST API
Server URL     : http://0.0.0.0:5000
Data file path : ...\codecrafthub\courses.json
```

### Working CRUD endpoints

| Operation | Endpoint | Status |
| --------- | -------- | ------ |
| Create | `POST /api/courses` | 201 |
| Read all | `GET /api/courses` | 200 |
| Read one | `GET /api/courses/{id}` | 200 |
| Update | `PUT /api/courses/{id}` | 200 |
| Delete | `DELETE /api/courses/{id}` | 200 |

### Reliable validation

- Invalid input is rejected with `400` and a clear message
- Missing courses return `404`
- All responses use consistent JSON structure

### Persistent data storage

- `courses.json` reflects every create, update, and delete
- Data remains after restarting the server

### Beginner confirmation steps

You can confidently say the project works if:

1. **Server starts** — No errors in terminal; health check returns JSON
2. **Create works** — POST returns `201` with auto-generated `id` and `created_at`
3. **Read works** — GET returns stored courses
4. **Update works** — PUT changes fields; `created_at` stays the same
5. **Delete works** — DELETE removes course; GET returns `404`
6. **Validation works** — Bad input returns `400` with helpful messages
7. **Persistence works** — `courses.json` matches API data after restart

---

**Congratulations!** If you completed this guide successfully, your CodeCraftHub API is fully operational on your local machine.

For additional test cases, see [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) and [README.md](./README.md).
