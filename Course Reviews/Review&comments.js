document.addEventListener("DOMContentLoaded", () => {
    const innerName = document.getElementById("name");
    const rating = document.getElementById("rating");
    const date = document.getElementById("date");
    const reviewContent = document.getElementById("reviewContent");
    const backToCourse = document.getElementById("backToCourse");
    const commentsContainer = document.getElementById("comments");
    const errorElement = document.getElementById("error");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paginationWrapper = document.getElementById("pagination-wrapper");
    const commentForm = document.getElementById("commentForm");

    let state = {
        comments: [],
        filteredComments: [],
        page: 1,
        rows: 5,
        window: 5
    };

    async function fetchAndDisplayReview() {
        const reviewId = new URLSearchParams(window.location.search).get('reviewId');
        if (!reviewId) {
            console.error("No reviewId found in the URL.");
            return;
        }

        try {
            const response = await fetch(`https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/reviews/${reviewId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch review: ${response.status} ${response.statusText}`);
            }
            const review = await response.json();
            displayReview(review);

            // Update the "Back to Reviews" link with the courseId
            if (review.courseId) {
                backToCourse.href = `Specific Course.html?courseId=${review.courseId}`;
            }

            // Fetch and display comments for this review
            fetchComments(review.reviewId);
        } catch (error) {
            console.error("Error fetching review:", error);
            reviewContent.textContent = "Failed to load the review. Please try again later.";
        }
    }

    function displayReview(review) {
        const validRating = parseInt(review.rating, 10);
        const stars = validRating && validRating > 0 ? '&#x1F31F '.repeat(validRating).trim() : 'No Rating';

        innerName.innerHTML = `${review.name || 'Anonymous'}'s Review`;
        rating.innerHTML = `Rating: ${stars} (${validRating || 'No Rating'} Stars)`;
        date.innerHTML = `Date: ${review.date || 'No Date Available'}`;
        reviewContent.innerHTML = review.content || "No review content available.";
    }

    async function fetchComments(reviewId) {
        try {
            toggleLoading(true);
            const response = await fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/comments');
            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            // Filter comments to only include those with matching reviewId
            state.comments = data.filter(comment => comment.reviewId === reviewId);
            state.filteredComments = state.comments;

            displayComments();
            setupPagination();
        } catch (error) {
            console.error("Error fetching comments:", error);
            commentsContainer.innerHTML = '<p>Failed to load comments. Please try again later.</p>';
        } finally {
            toggleLoading(false);
        }
    }

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reviewId = new URLSearchParams(window.location.search).get('reviewId');
        if (!reviewId) {
            console.error("No reviewId found in the URL.");
            return;
        }

        // Get the comment content
        const commentContent = document.getElementById('text').value.trim();

        // Validate the comment content
        if (!commentContent) {
            errorElement.textContent = "Comment cannot be empty.";
            return;
        } else {
            errorElement.textContent = ""; // Clear any previous error messages
        }

        // Prepare form data
        const formData = {
            reviewId: reviewId, // Use the reviewId from the current page
            name: "Guest", // Fixed value
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            content: commentContent // Use the trimmed comment content
        };

        try {
            const response = await fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                commentForm.reset(); // Clear the form
                fetchComments(reviewId); // Reload comments
            } else {
                const errorData = await response.json();
                console.error("Error submitting comment:", errorData);
                errorElement.textContent = "Failed to submit the comment. Please try again.";
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            errorElement.textContent = "An error occurred while submitting the comment. Please try again.";
        }
    });

    function displayComments() {
        const pageData = paginate(state.filteredComments, state.page, state.rows);
        commentsContainer.innerHTML = '';

        pageData.set.forEach(comment => {
            const commentElement = document.createElement('article');
            commentElement.innerHTML = `
                <strong>${comment.name || 'Anonymous'}:</strong> ${comment.content || 'No content available'}
                <date>${comment.date || 'No Date Available'}</date>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    function setupPagination() {
        const pageInfo = paginate(state.filteredComments, state.page, state.rows);
        paginationWrapper.innerHTML = '';

        let maxLeft = state.page - Math.floor(state.window / 2);
        let maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }

        if (maxRight > pageInfo.pages) {
            maxLeft = pageInfo.pages - (state.window - 1);
            if (maxLeft < 1) maxLeft = 1;
            maxRight = pageInfo.pages;
        }

        if (state.page !== 1) {
            paginationWrapper.innerHTML += `<button class="page" value="1">&laquo; First</button>`;
        }

        for (let page = maxLeft; page <= maxRight; page++) {
            paginationWrapper.innerHTML += `
                <button class="page ${state.page === page ? 'active' : ''}" value="${page}">
                    ${page}
                </button>
            `;
        }

        if (state.page !== pageInfo.pages) {
            paginationWrapper.innerHTML += `<button class="page" value="${pageInfo.pages}">Last &raquo;</button>`;
        }

        document.querySelectorAll('.page').forEach(button => {
            button.addEventListener('click', (event) => {
                state.page = parseInt(event.target.value, 10);
                displayComments();
                setupPagination();
            });
        });
    }

    function paginate(data, page, rows) {
        const start = (page - 1) * rows;
        const end = start + rows;
        const trimmedData = data.slice(start, end);
        const totalPages = Math.ceil(data.length / rows);

        return {
            set: trimmedData,
            pages: totalPages
        };
    }

    function toggleLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }

    //document.getElementById('filterForm').addEventListener('submit', (event) => {
    //    event.preventDefault();
    //    const filterDate = document.getElementById('date').value;

    //    if (filterDate) {
            // Normalize both the filter date and comment dates to YYYY-MM-DD format
    //        const selectedDate = new Date(filterDate).toISOString().split('T')[0];
    //        state.filteredComments = state.comments.filter(comment => {
    //            const commentDate = new Date(comment.date).toISOString().split('T')[0];
    //            return commentDate >= selectedDate;
    //        });
    //    } else {
    //        state.filteredComments = state.comments;
    //    }

    //    state.page = 1;
    //    displayComments();
    //    setupPagination();
    //});

    fetchAndDisplayReview();
});