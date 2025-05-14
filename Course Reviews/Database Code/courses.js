document.addEventListener("DOMContentLoaded", () => {
  let state = {
    'set': [],
    'page': 1,
    'rows': 5,
    'window': 5
  };

  // Load courses from API
  async function loadCourses() {
      try {
          const response = await fetch('api.php/courses');
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (Array.isArray(data)) {
              state.set = data;
              displayCourses();
              setupPagination();
          } else {
              throw new Error('Invalid data format received from API');
          }
      } catch (error) {
          console.error('Error loading courses:', error);
          const tbody = document.getElementById('courses-tbody');
          if (tbody) {
              tbody.innerHTML = `<tr><td colspan="3">Failed to load courses. Please try again later.</td></tr>`;
          }
      }
  }

  // Display courses for current page
  function displayCourses() {
    const tbody = document.getElementById('courses-tbody');
    const pageData = paginate(state.set, state.page, state.rows);

    tbody.innerHTML = '';
    pageData.set.forEach(course => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.courseId}</td>
        <td>
          <span class="display-text">${course.courseCode}</span>
          <input type="text" class="edit-input" style="display:none" value="${course.courseCode}">
        </td>
        <td>
          <button onclick="editCourse(${course.courseId}, this)">Edit</button>
          <button onclick="deleteCourse(${course.courseId})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function setupPagination() {
    const paginationWrapper = document.getElementById('pagination-wrapper');
    if (!paginationWrapper) return;

    const pageCount = Math.ceil(state.set.length / state.rows);

    paginationWrapper.innerHTML = '';

    if (state.page > 1) {
      paginationWrapper.innerHTML += `<button onclick="changePage(1)">First</button>`;
    }

    for (let i = Math.max(1, state.page - 2); i <= Math.min(pageCount, state.page + 2); i++) {
      paginationWrapper.innerHTML += `
        <button onclick="changePage(${i})" ${state.page === i ? 'aria-current="page"' : ''}>
          ${i}
        </button>`;
    }

    if (state.page < pageCount) {
      paginationWrapper.innerHTML += `<button onclick="changePage(${pageCount})">Last</button>`;
    }
  }

  function paginate(data, page, rows) {
    const start = (page - 1) * rows;
    const end = start + rows;
    return {
      set: data.slice(start, end),
      pages: Math.ceil(data.length / rows)
    };
  }

  // Form submission handler
  const form = document.getElementById('course-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseCode = document.getElementById('courseCode').value;

    try {
      const response = await fetch('api.php/courses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ courseCode })
      });

      if (response.ok) {
        form.reset();
        loadCourses();
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  });

  // Expose functions to window for button click handlers
  window.changePage = (newPage) => {
    state.page = newPage;
    displayCourses();
    setupPagination();
  };

  window.editCourse = (courseId, button) => {
    const row = button.closest('tr');
    const displaySpan = row.querySelector('.display-text');
    const editInput = row.querySelector('.edit-input');

    if (button.textContent === 'Edit') {
      displaySpan.style.display = 'none';
      editInput.style.display = 'inline';
      button.textContent = 'Save';
    } else {
      const newCode = editInput.value;

      fetch(`api.php/courses/${courseId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ courseCode: newCode })
      })
      .then(response => {
        if (response.ok) {
          displaySpan.textContent = newCode;
          displaySpan.style.display = 'inline';
          editInput.style.display = 'none';
          button.textContent = 'Edit';
          loadCourses();
        }
      })
      .catch(error => console.error('Error updating course:', error));
    }
  };

  window.deleteCourse = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
      fetch(`api.php/courses/${courseId}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          loadCourses();
        }
      })
      .catch(error => console.error('Error deleting course:', error));
    }
  };

  // Initial load
  loadCourses();
});