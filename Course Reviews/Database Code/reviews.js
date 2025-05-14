document.addEventListener("DOMContentLoaded", () => {
    let state = {
        'set': [],
        'page': 1,
        'rows': 5,
        'window': 5
    };

    async function loadReviews() {
        try {
            const response = await fetch('api.php/reviews');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.data)) {
                state.set = data.data;
                displayReviews();
                setupPagination();
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            document.querySelector('table tbody').innerHTML = '<tr><td colspan="8">Failed to load reviews. Please try again later.</td></tr>';
        }
    }

    function displayReviews() {
        const tbody = document.querySelector('table tbody');
        const pageData = paginate(state.set, state.page, state.rows);

        tbody.innerHTML = '';
        pageData.set.forEach(review => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${review.reviewId}</td>
                <td>${review.courseId}</td>
                <td>${review.posterId}</td>
                <td>${review.name}</td>
                <td>${review.date}</td>
                <td>
                    <span class="display-rating">${review.rating}</span>
                    <input type="number" class="edit-rating" value="${review.rating}" min="1" max="5" style="display:none">
                </td>
                <td>
                    <span class="display-text">${review.content}</span>
                    <textarea class="edit-input" style="display:none">${review.content}</textarea>
                </td>
                <td>
                    <button onclick="editReview(${review.reviewId}, this)">Edit</button>
                    <button onclick="deleteReview(${review.reviewId})">Delete</button>
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

    const form = document.getElementById('review-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            courseId: document.getElementById('courseId').value,
            posterId: document.getElementById('posterId').value,
            name: document.getElementById('name').value,
            date: document.getElementById('date').value,
            rating: document.getElementById('rating').value,
            content: document.getElementById('content').value
        };

        try {
            const response = await fetch('api.php/reviews', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                form.reset();
                loadReviews();
            }
        } catch (error) {
            console.error('Error adding review:', error);
        }
    });

    window.changePage = (newPage) => {
        state.page = newPage;
        displayReviews();
        setupPagination();
    };

    window.editReview = (reviewId, button) => {
        const row = button.closest('tr');
        const displaySpan = row.querySelector('.display-text');
        const editInput = row.querySelector('.edit-input');
        const displayRating = row.querySelector('.display-rating');
        const editRating = row.querySelector('.edit-rating');

        if (button.textContent === 'Edit') {
            displaySpan.style.display = 'none';
            editInput.style.display = 'inline';
            displayRating.style.display = 'none';
            editRating.style.display = 'inline';
            button.textContent = 'Save';
        } else {
            const newContent = editInput.value;
            const newRating = editRating.value;

            fetch(`api.php/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ content: newContent, rating: newRating })
            })
            .then(response => {
                if (response.ok) {
                    displaySpan.textContent = newContent;
                    displayRating.textContent = newRating;
                    displaySpan.style.display = 'inline';
                    editInput.style.display = 'none';
                    displayRating.style.display = 'inline';
                    editRating.style.display = 'none';
                    button.textContent = 'Edit';
                    loadReviews();
                }
            })
            .catch(error => console.error('Error updating review:', error));
        }
    };

    window.deleteReview = (reviewId) => {
        if (confirm('Are you sure you want to delete this review?')) {
            fetch(`api.php/reviews/${reviewId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    loadReviews();
                }
            })
            .catch(error => console.error('Error deleting review:', error));
        }
    };

    loadReviews();
});
