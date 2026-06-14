"""
CodeCraftHub - Beginner-Friendly Learning Management Platform
=============================================================
A REST API built with Flask for managing courses using JSON file storage.

Run this file directly:
    python app.py
"""

import json
import os
from datetime import datetime

from flask import Flask, jsonify, request

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Name of the JSON file used to persist course data (no database required).
COURSES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "courses.json")

# Allowed status values for every course.
VALID_STATUSES = {"Not Started", "In Progress", "Completed"}

# Required fields when creating a new course.
REQUIRED_FIELDS = {"name", "description", "target_date", "status"}

# Create the Flask application instance.
app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Allow the course dashboard frontend to call this API from another origin."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


@app.route('/api/courses', methods=['OPTIONS'])
@app.route('/api/courses/<int:course_id>', methods=['OPTIONS'])
@app.route('/api/courses/stats', methods=['OPTIONS'])
def handle_preflight(course_id=None):
    """Handle CORS preflight requests from the browser."""
    return '', 204


# =============================================================================
# HELPER FUNCTIONS - JSON FILE OPERATIONS
# =============================================================================

def load_courses():
    """
    Load all courses from the JSON file.

    If courses.json does not exist, create it with an empty list.

    Returns:
        list: A list of course dictionaries.

    Raises:
        OSError: If the file cannot be read or created.
    """
    # Create the file with an empty list if it does not exist yet.
    if not os.path.exists(COURSES_FILE):
        save_courses([])

    try:
        with open(COURSES_FILE, "r", encoding="utf-8") as file:
            courses = json.load(file)

        # Ensure the stored data is always a list.
        if not isinstance(courses, list):
            return []

        return courses

    except json.JSONDecodeError as error:
        raise OSError(f"Invalid JSON in courses file: {error}") from error
    except OSError as error:
        raise OSError(f"Failed to read courses file: {error}") from error


def save_courses(courses):
    """
    Save the course list to the JSON file.

    Args:
        courses (list): List of course dictionaries to write to disk.

    Raises:
        OSError: If the file cannot be written.
    """
    try:
        with open(COURSES_FILE, "w", encoding="utf-8") as file:
            json.dump(courses, file, indent=4)

    except OSError as error:
        raise OSError(f"Failed to write courses file: {error}") from error


def get_next_id(courses):
    """
    Generate the next available course ID.

    IDs start at 1 and increment based on the highest existing ID.

    Args:
        courses (list): Current list of courses.

    Returns:
        int: The next auto-generated course ID.
    """
    if not courses:
        return 1

    return max(course.get("id", 0) for course in courses) + 1


# =============================================================================
# HELPER FUNCTIONS - VALIDATION
# =============================================================================

def validate_course_data(data, is_update=False):
    """
    Validate course input data.

    Args:
        data (dict): Incoming request data.
        is_update (bool): True for PUT requests, False for POST requests.

    Returns:
        tuple: (is_valid, error_message)
    """
    # Reject empty or non-dictionary payloads.
    if data is None:
        return False, "Request body cannot be empty"

    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"

    if not data:
        return False, "Request body cannot be empty"

    # For create requests, all required fields must be present.
    if not is_update:
        missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"

    # Validate each field only if it is included in the request.
    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return False, "Field 'name' must be a non-empty string"

    if "description" in data:
        if not isinstance(data["description"], str) or not data["description"].strip():
            return False, "Field 'description' must be a non-empty string"

    if "target_date" in data:
        if not isinstance(data["target_date"], str):
            return False, "Field 'target_date' must be a string"

        try:
            datetime.strptime(data["target_date"], "%Y-%m-%d")
        except ValueError:
            return False, "Invalid target_date format. Use YYYY-MM-DD"

    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            allowed = ", ".join(f'"{status}"' for status in sorted(VALID_STATUSES))
            return False, f"Invalid status value. Allowed values: {allowed}"

    # For updates, at least one valid field must be provided.
    if is_update:
        updatable_fields = REQUIRED_FIELDS
        if not any(field in data for field in updatable_fields):
            return False, "At least one field must be provided for update"

    return True, None


def find_course_by_id(courses, course_id):
    """
    Find a course in the list by its ID.

    Args:
        courses (list): List of course dictionaries.
        course_id (int): Course ID to search for.

    Returns:
        tuple: (course_dict or None, index or None)
    """
    for index, course in enumerate(courses):
        if course.get("id") == course_id:
            return course, index

    return None, None


def calculate_course_stats(courses):
    """
    Calculate summary statistics for all courses.

    Counts courses by status and computes percentage breakdowns.
    Empty course lists return zero counts and 0.0% for all percentages.

    Args:
        courses (list): List of course dictionaries from courses.json.

    Returns:
        dict: Statistics including totals, status counts, and percentages.
    """
    not_started = sum(
        1 for course in courses if course.get("status") == "Not Started"
    )
    in_progress = sum(
        1 for course in courses if course.get("status") == "In Progress"
    )
    completed = sum(
        1 for course in courses if course.get("status") == "Completed"
    )
    total_courses = len(courses)

    # Avoid division by zero when no courses exist.
    if total_courses == 0:
        return {
            "total_courses": 0,
            "not_started": 0,
            "in_progress": 0,
            "completed": 0,
            "completion_percentage": 0.0,
            "in_progress_percentage": 0.0,
            "not_started_percentage": 0.0,
        }

    return {
        "total_courses": total_courses,
        "not_started": not_started,
        "in_progress": in_progress,
        "completed": completed,
        "completion_percentage": round((completed / total_courses) * 100, 1),
        "in_progress_percentage": round((in_progress / total_courses) * 100, 1),
        "not_started_percentage": round((not_started / total_courses) * 100, 1),
    }


# =============================================================================
# HELPER FUNCTIONS - API RESPONSES
# =============================================================================

def success_response(message, data=None, status_code=200):
    """
    Build a standardized success JSON response.

    Args:
        message (str): Human-readable success message.
        data (dict or list, optional): Response payload.
        status_code (int): HTTP status code.

    Returns:
        tuple: Flask response object and status code.
    """
    response = {
        "success": True,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    return jsonify(response), status_code


def error_response(message, status_code=400):
    """
    Build a standardized error JSON response.

    Args:
        message (str): Human-readable error message.
        status_code (int): HTTP status code.

    Returns:
        tuple: Flask response object and status code.
    """
    return jsonify({
        "success": False,
        "message": message,
    }), status_code


def get_request_json():
    """
    Safely parse JSON from the incoming request.

    Returns:
        tuple: (data_dict or None, error_message or None)
    """
    if not request.data:
        return None, "Request body cannot be empty"

    try:
        return request.get_json(), None
    except Exception:
        return None, "Invalid JSON payload"


# =============================================================================
# CRUD API ENDPOINTS
# =============================================================================

@app.route("/api/courses", methods=["POST"])
def create_course():
    """
    Create a new course.

    Required JSON fields:
        name, description, target_date, status
    """
    data, json_error = get_request_json()
    if json_error:
        return error_response(json_error, 400)

    is_valid, validation_error = validate_course_data(data, is_update=False)
    if not is_valid:
        return error_response(validation_error, 400)

    try:
        courses = load_courses()

        new_course = {
            "id": get_next_id(courses),
            "name": data["name"].strip(),
            "description": data["description"].strip(),
            "target_date": data["target_date"],
            "status": data["status"],
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        courses.append(new_course)
        save_courses(courses)

        return success_response(
            "Course created successfully",
            data=new_course,
            status_code=201,
        )

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


@app.route("/api/courses", methods=["GET"])
def get_all_courses():
    """Retrieve all courses."""
    try:
        courses = load_courses()
        return success_response("Courses retrieved successfully", data=courses)

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


# =============================================================================
# STATISTICS API ENDPOINT
# =============================================================================

@app.route("/api/courses/stats", methods=["GET"])
def get_course_stats():
    """
    Return statistics about all courses grouped by status.

    Includes total counts and percentage breakdowns for each status.
    """
    try:
        courses = load_courses()
        stats = calculate_course_stats(courses)

        return success_response(
            "Course statistics retrieved successfully",
            data=stats,
        )

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


@app.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    """Retrieve a single course by ID."""
    try:
        courses = load_courses()
        course, _ = find_course_by_id(courses, course_id)

        if course is None:
            return error_response("Course not found", 404)

        return success_response("Course retrieved successfully", data=course)

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


@app.route("/api/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    """
    Update an existing course by ID.

    Accepts partial updates, but provided fields must be valid.
    """
    data, json_error = get_request_json()
    if json_error:
        return error_response(json_error, 400)

    is_valid, validation_error = validate_course_data(data, is_update=True)
    if not is_valid:
        return error_response(validation_error, 400)

    try:
        courses = load_courses()
        course, index = find_course_by_id(courses, course_id)

        if course is None:
            return error_response("Course not found", 404)

        # Update only the fields sent in the request body.
        if "name" in data:
            course["name"] = data["name"].strip()
        if "description" in data:
            course["description"] = data["description"].strip()
        if "target_date" in data:
            course["target_date"] = data["target_date"]
        if "status" in data:
            course["status"] = data["status"]

        courses[index] = course
        save_courses(courses)

        return success_response("Course updated successfully", data=course)

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


@app.route("/api/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    """Delete a course by ID."""
    try:
        courses = load_courses()
        course, index = find_course_by_id(courses, course_id)

        if course is None:
            return error_response("Course not found", 404)

        deleted_course = courses.pop(index)
        save_courses(courses)

        return success_response("Course deleted successfully", data=deleted_course)

    except OSError as error:
        return error_response(str(error), 500)
    except Exception:
        return error_response("Unexpected server error", 500)


# =============================================================================
# APPLICATION STARTUP
# =============================================================================

if __name__ == "__main__":
    # Ensure the data file exists before the server starts accepting requests.
    try:
        load_courses()
    except OSError as error:
        print(f"Warning: Could not initialize courses file: {error}")

    print("=" * 60)
    print("CodeCraftHub - Learning Management REST API")
    print("=" * 60)
    print("Server URL     : http://0.0.0.0:5000")
    print("Data file path :", COURSES_FILE)
    print("Debug mode     : Enabled")
    print("=" * 60)

    app.run(host="0.0.0.0", port=5000, debug=True)
