# CodeCraftHub Course Dashboard

A beginner-friendly **frontend dashboard** for the CodeCraftHub Learning Management Platform. Built with **HTML5**, **CSS3**, and **vanilla JavaScript** — no frameworks required.

Connects to the Flask REST API to manage courses with full CRUD operations, live statistics, and a modern responsive UI.

---

## Project Overview

This dashboard lets you:

- View course statistics (total, not started, in progress, completed)
- Create new learning courses
- Edit existing courses
- Delete courses with confirmation
- See real-time updates from the Flask backend

All data is stored by the Flask API in `courses.json` on the backend.

---

## Features

- **Statistics dashboard** — Summary cards calculated from live course data
- **Course form** — Create and update with client-side validation
- **Course cards** — Responsive grid with status badges and metadata
- **Edit mode** — Populate form, update, or cancel editing
- **Delete confirmation** — Custom modal (no browser `alert()`)
- **Toast notifications** — Success, error, and warning messages
- **Loading states** — Visual feedback during API operations
- **Empty state** — Friendly message when no courses exist
- **Fully responsive** — Works on mobile, tablet, and desktop

---

## Technologies

| Technology | Purpose |
| ---------- | ------- |
| HTML5 | Semantic page structure |
| CSS3 | Modern styling, grid, flexbox, animations |
| JavaScript (ES6+) | API integration, DOM updates, validation |
| Fetch API | HTTP requests with `async/await` |
| Flask API | Backend data storage (separate project) |

**Not used:** React, Vue, Angular, Bootstrap, Tailwind, jQuery

---

## Project Structure

```text
codecrafthub-course-dashboard/
├── index.html      # Dashboard layout and structure
├── styles.css      # All styling (colors, layout, responsive)
├── script.js       # API calls, validation, UI logic
└── README.md       # This file
```

| File | Purpose |
| ---- | ------- |
| `index.html` | Header, stats, form, course grid, modal, toast container |
| `styles.css` | Purple-themed design system and responsive layout |
| `script.js` | CRUD operations, statistics, notifications, event handlers |
| `README.md` | Setup and usage documentation |

---

## Prerequisites

1. **Flask backend running** at `http://127.0.0.1:5000`
2. A modern web browser (Chrome, Firefox, Edge, Safari)
3. Optional: Python for a local web server (recommended)

### Start the Flask backend

```bash
cd ../codecrafthub
pip install -r requirements.txt
python app.py
```

Confirm the API responds:

```bash
curl http://127.0.0.1:5000/api/courses
```

---

## Installation & Running the Dashboard

### Option 1: Local HTTP server (recommended)

Browsers block some API requests from `file://` URLs. Serve the dashboard over HTTP:

```bash
cd codecrafthub-course-dashboard
python -m http.server 8080
```

Open in your browser:

```text
http://localhost:8080
```

### Option 2: VS Code Live Server

1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

### Option 3: Open file directly

Double-click `index.html`. This may work if CORS is enabled on the Flask backend, but Option 1 is more reliable.

---

## Backend Configuration

The dashboard connects to:

```text
http://127.0.0.1:5000/api/courses
```

To change the API URL, edit `script.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:5000/api/courses';
```

### CORS requirement

The Flask backend must allow cross-origin requests. The CodeCraftHub `app.py` includes CORS headers. If you use a custom backend, add:

```python
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response
```

Restart Flask after any backend changes.

---

## API Integration

| Action | Method | Endpoint | Function in `script.js` |
| ------ | ------ | -------- | ----------------------- |
| Fetch all | GET | `/api/courses` | `fetchCourses()` |
| Create | POST | `/api/courses` | `createCourse()` |
| Update | PUT | `/api/courses/{id}` | `updateCourse()` |
| Delete | DELETE | `/api/courses/{id}` | `deleteCourse()` |

All requests use `async/await` and the shared `apiRequest()` helper for consistent error handling.

### Request body (create/update)

```json
{
  "name": "Python Fundamentals",
  "description": "Learn Python programming",
  "target_date": "2026-12-31",
  "status": "Not Started"
}
```

### Expected API response

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": { ... }
}
```

---

## Usage Guide

### Create a course

1. Fill in **Course Name**, **Description**, **Target Date**, and **Status**
2. Click **Add Course**
3. A success toast appears and the course card is added

### Edit a course

1. Click **Edit** on a course card
2. The form populates with existing data
3. Modify fields and click **Update Course**
4. Click **Cancel Edit** to discard changes

### Delete a course

1. Click **Delete** on a course card
2. Confirm in the modal dialog
3. The course is removed and the UI refreshes

### Refresh data

Click **↻ Refresh** to reload courses from the API.

---

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| **"Unable to connect to the API"** | Start Flask: `python app.py` in the `codecrafthub` folder |
| **CORS error in browser console** | Ensure Flask has CORS headers; restart the backend |
| **Blank page / no styles** | Serve via HTTP server, not `file://` |
| **Port 5000 in use** | Stop other apps on port 5000 or change Flask port |
| **Validation errors** | Fill all required fields; use `YYYY-MM-DD` date format |
| **Courses not updating** | Click Refresh; check Flask terminal for errors |
| **Delete not working** | Confirm in the modal; check network tab for 404 |

### Check browser console

Press `F12` → **Console** tab to see JavaScript errors and failed network requests.

---

## Color Palette

| Color | Hex | Usage |
| ----- | --- | ----- |
| Primary | `#8B5CF6` | Buttons, header, accents |
| Success | `#10B981` | Completed status, success toasts |
| Warning | `#F59E0B` | In Progress status, warnings |
| Danger | `#EF4444` | Delete button, errors |
| Background | `#F8FAFC` | Page background |

---

## Learning Outcomes

By using this dashboard, you will learn:

- How a frontend consumes a REST API
- Fetch API with `async/await`
- DOM manipulation without frameworks
- Client-side form validation
- Responsive CSS with Grid and Flexbox
- UX patterns: loading states, toasts, modals, empty states

---

## License

Educational project for CodeCraftHub Learning Management Platform.
