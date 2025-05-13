document.addEventListener("DOMContentLoaded", () => {
    let state = {
        'originalSet': [], // Preserve the original dataset
        'set': [],         // Current dataset (filtered or unfiltered)
        'page': 1,
        'rows': 5,         // Number of courses per page
        'window': 5        // Number of pagination buttons to display
    };

    // Fetch courses from the API
    toggleLoading(true); // Show the loading spinner
    fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            toggleLoading(false); // Hide the loading spinner
            state.originalSet = data; // Store the original dataset
            state.set = data;         // Initialize the current dataset
            displayCourses();         // Display the courses
            setupPagination();        // Set up pagination
        })
        .catch(error => {
            toggleLoading(false); // Hide the loading spinner
            console.error("Error fetching courses:", error);
            const coursesElement = document.getElementById('courses');
            if (coursesElement) {
                coursesElement.innerHTML = `<p>Failed to load courses. Please try again later.</p>`;
            }
        });

    // Add event listener to the search form
    const searchForm = document.querySelector('#form form');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from reloading the page

        const searchInput = document.getElementById('search').value.trim().toLowerCase();
        if (searchInput === '') {
            // If the search input is empty, reset to the original dataset
            state.set = state.originalSet;
        } else {
            // Filter courses by matching the search input with courseCode or courseName
            state.set = state.originalSet.filter(course =>
                course.courseCode.toLowerCase().includes(searchInput) ||
                (course.courseName && course.courseName.toLowerCase().includes(searchInput))
            );
        }

        state.page = 1; // Reset to the first page
        displayCourses(); // Re-render the courses
        setupPagination(); // Re-render the pagination
    });

    async function fetchReviewsForCourse(courseId) {
        try {
            const response = await fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/reviews');
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
            }
            const reviews = await response.json();
            // Filter reviews for the specific course
            return reviews.filter(review => review.courseId === courseId).slice(0, 5); // Limit to 5 reviews
        } catch (error) {
            console.error(`Error fetching reviews for course ${courseId}:`, error);
            return [];
        }
    }

    async function displayCourses() {
        const coursesElement = document.getElementById('courses');
        if (!coursesElement) return;

        const pageInfo = paginate(state.set, state.page, state.rows);
        const courses = pageInfo.set;

        let html = '';
        for (const course of courses) {
            const reviews = await fetchReviewsForCourse(course.courseId); // Fetch reviews for the course
            let reviewsHtml = '';

            reviews.forEach(review => {
                reviewsHtml += `
                    <div class="grid">
                        <strong>${review.name || 'Anonymous'}</strong>:
                        <span>${'&#x1F31F '.repeat(review.rating || 0).trim()} (${review.rating || 'No Rating'} Stars)</span>
                        <span>Date: ${review.date || 'No Date'}</span>
                        <a href="Review&comments.html?reviewId=${review.reviewId}"><button>Check Review</button></a>
                    </div>
                    <br>
                `;
            });

            html += `
                <details>
                    <summary role="button">${course.courseCode || 'No Course Code'}</summary>
                    ${reviewsHtml || '<p>No reviews available for this course.</p>'}
                    <p>
                        <a href="Specific Course.html?courseId=${course.courseId}">
                            <button>Check More Reviews</button>
                        </a>
                    </p>
                </details>
            `;
        }

        coursesElement.innerHTML = html;
    }

    function setupPagination() {
        const paginationWrapper = document.getElementById('pagination-wrapper');
        if (!paginationWrapper) return;

        const pageInfo = paginate(state.set, state.page, state.rows);
        const totalPages = pageInfo.pages;

        paginationWrapper.innerHTML = '';

        let maxLeft = state.page - Math.floor(state.window / 2);
        let maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }

        if (maxRight > totalPages) {
            maxLeft = totalPages - (state.window - 1);
            if (maxLeft < 1) maxLeft = 1;
            maxRight = totalPages;
        }

        // Add "First" button
        if (state.page !== 1) {
            paginationWrapper.innerHTML += `<button class="page" value="1">&laquo; First</button>`;
        }

        // Add page buttons
        for (let page = maxLeft; page <= maxRight; page++) {
            if (page === state.page) {
                paginationWrapper.innerHTML += `<button class="page active" value="${page}" aria-current="true">${page}</button>`;
            } else {
                paginationWrapper.innerHTML += `<button class="page" value="${page}">${page}</button>`;
            }
        }

        // Add "Last" button
        if (state.page !== totalPages) {
            paginationWrapper.innerHTML += `<button class="page" value="${totalPages}">Last &raquo;</button>`;
        }

        // Add event listeners to pagination buttons
        const buttons = document.querySelectorAll('.page');
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                state.page = parseInt(event.target.value, 10); // Update the current page
                displayCourses(); // Re-render the courses
                setupPagination(); // Re-render the pagination
            });
        });
    }

    function paginate(set, page, rows) {
        const start = (page - 1) * rows;
        const end = start + rows;
        const trimmedData = set.slice(start, end);
        const totalPages = Math.ceil(set.length / rows);

        return {
            set: trimmedData,
            pages: totalPages
        };
    }

    function toggleLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }
});