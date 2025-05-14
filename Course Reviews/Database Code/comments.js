
document.addEventListener("DOMContentLoaded", () => {
  let state = {
    'set': [],
    'page': 1,
    'rows': 5,
    'window': 5
  };

  async function loadComments() {
    try {
      const response = await fetch('api.php/comments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        state.set = data;
        displayComments();
        setupPagination();
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      document.querySelector('table tbody').innerHTML = '<tr><td colspan="6">Failed to load comments. Please try again later.</td></tr>';
    }
  }

  function displayComments() {
    const tbody = document.querySelector('table tbody');
    const pageData = paginate(state.set, state.page, state.rows);

    tbody.innerHTML = '';
    pageData.set.forEach(comment => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${comment.commentId}</td>
        <td>${comment.reviewId}</td>
        <td>${comment.name}</td>
        <td>${comment.date}</td>
        <td>
          <span class="display-text">${comment.content}</span>
          <textarea class="edit-input" style="display:none">${comment.content}</textarea>
        </td>
        <td>
          <button onclick="editComment(${comment.commentId}, this)">Edit</button>
          <button onclick="deleteComment(${comment.commentId})">Delete</button>
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

  const form = document.getElementById('comment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      reviewId: document.getElementById('reviewId').value,
      name: document.getElementById('name').value,
      date: document.getElementById('date').value,
      content: document.getElementById('content').value
    };

    try {
      const response = await fetch('api.php/comments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        form.reset();
        loadComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  });

  window.changePage = (newPage) => {
    state.page = newPage;
    displayComments();
    setupPagination();
  };

  window.editComment = (commentId, button) => {
    const row = button.closest('tr');
    const displaySpan = row.querySelector('.display-text');
    const editInput = row.querySelector('.edit-input');

    if (button.textContent === 'Edit') {
      displaySpan.style.display = 'none';
      editInput.style.display = 'inline';
      button.textContent = 'Save';
    } else {
      const newContent = editInput.value;

      fetch(`api.php/comments/${commentId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content: newContent })
      })
      .then(response => {
        if (response.ok) {
          displaySpan.textContent = newContent;
          displaySpan.style.display = 'inline';
          editInput.style.display = 'none';
          button.textContent = 'Edit';
          loadComments();
        }
      })
      .catch(error => console.error('Error updating comment:', error));
    }
  };

  window.deleteComment = (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      fetch(`api.php/comments/${commentId}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          loadComments();
        }
      })
      .catch(error => console.error('Error deleting comment:', error));
    }
  };

  loadComments();
});
