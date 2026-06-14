/**
 * CodeCraftHub Course Dashboard
 * Vanilla JavaScript CRUD frontend for the Flask REST API.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = 'http://127.0.0.1:5000/api/courses';

const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Application state
let courses = [];
let editingCourseId = null;
let courseToDelete = null;
let isLoading = false;

// =============================================================================
// DOM ELEMENT REFERENCES
// =============================================================================

const elements = {
    courseForm: document.getElementById('course-form'),
    formTitle: document.getElementById('form-title'),
    courseIdInput: document.getElementById('course-id'),
    courseNameInput: document.getElementById('course-name'),
    courseDescriptionInput: document.getElementById('course-description'),
    courseTargetDateInput: document.getElementById('course-target-date'),
    courseStatusSelect: document.getElementById('course-status'),
    submitBtn: document.getElementById('submit-btn'),
    submitBtnText: document.getElementById('submit-btn-text'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    coursesGrid: document.getElementById('courses-grid'),
    emptyState: document.getElementById('empty-state'),
    loadingIndicator: document.getElementById('loading-indicator'),
    toastContainer: document.getElementById('toast-container'),
    deleteModal: document.getElementById('delete-modal'),
    deleteModalMessage: document.getElementById('delete-modal-message'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    statTotal: document.getElementById('stat-total'),
    statNotStarted: document.getElementById('stat-not-started'),
    statInProgress: document.getElementById('stat-in-progress'),
    statCompleted: document.getElementById('stat-completed'),
    footerYear: document.getElementById('footer-year'),
    errors: {
        name: document.getElementById('error-name'),
        description: document.getElementById('error-description'),
        targetDate: document.getElementById('error-target-date'),
        status: document.getElementById('error-status'),
    },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Show a toast notification (success, error, or warning).
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

/**
 * Toggle the global loading indicator and disable form buttons.
 */
function setLoading(loading) {
    isLoading = loading;
    elements.loadingIndicator.classList.toggle('hidden', !loading);
    elements.submitBtn.disabled = loading;
    elements.refreshBtn.disabled = loading;
}

/**
 * Get CSS class for a status badge based on course status.
 */
function getStatusClass(status) {
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Completed') return 'status-completed';
    return 'status-not-started';
}

/**
 * Format a date string for display.
 */
function formatDisplayDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Clear all form validation error messages.
 */
function clearFormErrors() {
    Object.values(elements.errors).forEach((el) => {
        el.textContent = '';
    });
    [elements.courseNameInput, elements.courseDescriptionInput,
        elements.courseTargetDateInput, elements.courseStatusSelect].forEach((input) => {
        input.classList.remove('invalid');
    });
}

// =============================================================================
// CLIENT-SIDE VALIDATION
// =============================================================================

/**
 * Validate form fields before submitting to the API.
 * Returns true if valid, false otherwise.
 */
function validateForm() {
    clearFormErrors();
    let isValid = true;

    const name = elements.courseNameInput.value.trim();
    const description = elements.courseDescriptionInput.value.trim();
    const targetDate = elements.courseTargetDateInput.value;
    const status = elements.courseStatusSelect.value;

    if (!name) {
        elements.errors.name.textContent = 'Course name is required.';
        elements.courseNameInput.classList.add('invalid');
        isValid = false;
    }

    if (!description) {
        elements.errors.description.textContent = 'Description is required.';
        elements.courseDescriptionInput.classList.add('invalid');
        isValid = false;
    }

    if (!targetDate) {
        elements.errors.targetDate.textContent = 'Target date is required.';
        elements.courseTargetDateInput.classList.add('invalid');
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        elements.errors.targetDate.textContent = 'Date must be in YYYY-MM-DD format.';
        elements.courseTargetDateInput.classList.add('invalid');
        isValid = false;
    }

    if (!status || !VALID_STATUSES.includes(status)) {
        elements.errors.status.textContent = 'Please select a valid status.';
        elements.courseStatusSelect.classList.add('invalid');
        isValid = false;
    }

    if (!isValid) {
        showToast('Please fix the validation errors.', 'warning');
    }

    return isValid;
}

/**
 * Build course payload object from form values.
 */
function getFormData() {
    return {
        name: elements.courseNameInput.value.trim(),
        description: elements.courseDescriptionInput.value.trim(),
        target_date: elements.courseTargetDateInput.value,
        status: elements.courseStatusSelect.value,
    };
}

// =============================================================================
// API FUNCTIONS (Fetch + async/await)
// =============================================================================

/**
 * Generic API request helper with error handling.
 */
async function apiRequest(url, options = {}) {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            const message = data?.message || `Request failed with status ${response.status}`;
            throw new Error(message);
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the API. Is the Flask server running?');
        }
        throw error;
    }
}

/**
 * Fetch all courses from the API.
 */
async function fetchCourses() {
    const result = await apiRequest(API_BASE_URL);
    return result.data || [];
}

/**
 * Create a new course via POST.
 */
async function createCourse(courseData) {
    return apiRequest(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(courseData),
    });
}

/**
 * Update an existing course via PUT.
 */
async function updateCourse(id, courseData) {
    return apiRequest(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
    });
}

/**
 * Delete a course via DELETE.
 */
async function deleteCourse(id) {
    return apiRequest(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
}

// =============================================================================
// UI RENDERING
// =============================================================================

/**
 * Update statistics cards from the current courses array.
 */
function updateStatistics() {
    const total = courses.length;
    const notStarted = courses.filter((c) => c.status === 'Not Started').length;
    const inProgress = courses.filter((c) => c.status === 'In Progress').length;
    const completed = courses.filter((c) => c.status === 'Completed').length;

    elements.statTotal.textContent = total;
    elements.statNotStarted.textContent = notStarted;
    elements.statInProgress.textContent = inProgress;
    elements.statCompleted.textContent = completed;
}

/**
 * Render all course cards in the grid.
 */
function renderCourses() {
    elements.coursesGrid.innerHTML = '';

    if (courses.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.coursesGrid.classList.add('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');
    elements.coursesGrid.classList.remove('hidden');

    courses.forEach((course) => {
        const card = document.createElement('article');
        card.className = 'course-card';
        card.dataset.id = course.id;

        card.innerHTML = `
            <div class="course-card-header">
                <h3>${escapeHtml(course.name)}</h3>
                <span class="course-id">ID: ${course.id}</span>
            </div>
            <span class="status-badge ${getStatusClass(course.status)}">${escapeHtml(course.status)}</span>
            <p class="course-description">${escapeHtml(course.description)}</p>
            <div class="course-meta">
                <span><strong>Target:</strong> ${formatDisplayDate(course.target_date)}</span>
                <span><strong>Created:</strong> ${formatDisplayDate(course.created_at)}</span>
            </div>
            <div class="course-actions">
                <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${course.id}">
                    Edit
                </button>
                <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${course.id}">
                    Delete
                </button>
            </div>
        `;

        elements.coursesGrid.appendChild(card);
    });
}

/**
 * Prevent XSS by escaping HTML in user-provided text.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

/**
 * Reset the form to create mode (not editing).
 */
function resetForm() {
    editingCourseId = null;
    elements.courseForm.reset();
    elements.courseIdInput.value = '';
    elements.formTitle.textContent = 'Add New Course';
    elements.submitBtnText.textContent = 'Add Course';
    elements.cancelEditBtn.classList.add('hidden');
    clearFormErrors();
}

/**
 * Populate the form for editing an existing course.
 */
function enterEditMode(course) {
    editingCourseId = course.id;
    elements.courseIdInput.value = course.id;
    elements.courseNameInput.value = course.name;
    elements.courseDescriptionInput.value = course.description;
    elements.courseTargetDateInput.value = course.target_date;
    elements.courseStatusSelect.value = course.status;
    elements.formTitle.textContent = 'Edit Course';
    elements.submitBtnText.textContent = 'Update Course';
    elements.cancelEditBtn.classList.remove('hidden');
    clearFormErrors();
    elements.courseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Load courses from API and refresh the UI.
 */
async function loadAndRenderCourses() {
    setLoading(true);
    try {
        courses = await fetchCourses();
        updateStatistics();
        renderCourses();
    } catch (error) {
        showToast(error.message, 'error');
        courses = [];
        updateStatistics();
        renderCourses();
    } finally {
        setLoading(false);
    }
}

/**
 * Handle form submission for create or update.
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const courseData = getFormData();
    setLoading(true);

    try {
        if (editingCourseId) {
            await updateCourse(editingCourseId, courseData);
            showToast('Course updated successfully!', 'success');
        } else {
            await createCourse(courseData);
            showToast('Course created successfully!', 'success');
        }

        resetForm();
        await loadAndRenderCourses();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * Show delete confirmation modal.
 */
function openDeleteModal(course) {
    courseToDelete = course;
    elements.deleteModalMessage.textContent =
        `Are you sure you want to delete "${course.name}"? This action cannot be undone.`;
    elements.deleteModal.classList.remove('hidden');
}

/**
 * Hide delete confirmation modal.
 */
function closeDeleteModal() {
    courseToDelete = null;
    elements.deleteModal.classList.add('hidden');
}

/**
 * Confirm and execute course deletion.
 */
async function handleConfirmDelete() {
    if (!courseToDelete) return;

    setLoading(true);
    closeDeleteModal();

    try {
        await deleteCourse(courseToDelete.id);
        showToast('Course deleted successfully!', 'success');

        if (editingCourseId === courseToDelete.id) {
            resetForm();
        }

        await loadAndRenderCourses();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * Handle clicks on Edit and Delete buttons in course cards.
 */
function handleCourseGridClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const courseId = Number(button.dataset.id);
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    if (button.dataset.action === 'edit') {
        enterEditMode(course);
    } else if (button.dataset.action === 'delete') {
        openDeleteModal(course);
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function init() {
    elements.footerYear.textContent = new Date().getFullYear();

    elements.courseForm.addEventListener('submit', handleFormSubmit);
    elements.cancelEditBtn.addEventListener('click', resetForm);
    elements.refreshBtn.addEventListener('click', loadAndRenderCourses);
    elements.coursesGrid.addEventListener('click', handleCourseGridClick);
    elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.modalBackdrop.addEventListener('click', closeDeleteModal);

    loadAndRenderCourses();
}

document.addEventListener('DOMContentLoaded', init);
