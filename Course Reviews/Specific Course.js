document.addEventListener("DOMContentLoaded", () => {
    let state = {
        'originalSet': [], // Preserve the original dataset
        'set': [],         // Current dataset (filtered or unfiltered)
        'page': 1,
        'rows': 10,
        'window': 5
    };

    // Fetch the courseId from the URL
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    if (!courseId) {
        console.error("No courseId found in the URL.");
        return;
    }

    // Fetch the course data and update the courseTitle
    fetch(`https://681e45b1c1c291fa66339f80.mockapi.io/333reviews/courses/${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(course => {
            const courseTitleElement = document.getElementById('courseTitle');
            if (courseTitleElement) {
                courseTitleElement.textContent = course.courseCode + ' Reviews' || 'Course Title Not Available';
            }
        })
        .catch(error => {
            console.error("Error fetching course:", error);
            const courseTitleElement = document.getElementById('courseTitle');
            if (courseTitleElement) {
                courseTitleElement.textContent = 'Failed to load course title.';
            }
        });

    // Fetch reviews and filter them by courseId
    fetch('https://681e45b1c1c291fa66339f80.mockapi.io/333reviews/ReviewsITCS333')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            toggleLoading(false); // Hide spinner after data is fetched

            // Filter reviews that match the courseId
            const filteredReviews = data.filter(review => review.courseId === courseId);

            state.originalSet = filteredReviews; // Store the filtered dataset
            state.set = filteredReviews;         // Initialize the current dataset
            displayOutput();                     // Display the reviews
            calculateAverageRating();            // Calculate and display the average rating
        })
        .catch(error => {
            toggleLoading(false); // Hide spinner if there's an error
            const reviewsElement = document.getElementById('reviews');
            if (reviewsElement) {
                reviewsElement.innerHTML = `<p>There was an error: ${error.message}</p>`;
            }
        });

    toggleLoading(true); // Show spinner while fetching data

    function toggleLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }

    function calculateAverageRating() {
        if (!state.originalSet || state.originalSet.length === 0) {
            const totalRatingElement = document.getElementById('totalRating');
            if (totalRatingElement) {
                totalRatingElement.textContent = 'No Ratings';
            }
            return;
        }

        // Calculate the average rating
        const totalRating = state.originalSet.reduce((sum, review) => {
            return sum + parseInt(review.rating, 10); // Sum up all ratings
        }, 0);

        const averageRating = totalRating / state.originalSet.length; // Calculate the average
        const roundedAverage = Math.round(averageRating); // Round to the nearest integer
        const displayRating = Math.round(averageRating * 10) / 10; // Round to one decimal place

        // Update the totalRating element with stars
        const stars = '&#x1F31F '.repeat(roundedAverage).trim(); // Generate star icons
        const totalRatingElement = document.getElementById('totalRating');
        if (totalRatingElement) {
            totalRatingElement.innerHTML = `${stars} (${displayRating})`;
        }
    }

    function displayOutput() {
        function pagination(set, page, rows) {
            let trimStart = (page - 1) * rows;
            let trimEnd = trimStart + rows;
            let trimmedData = set.slice(trimStart, trimEnd);

            let pages = Math.ceil(set.length / rows);

            return {
                'set': trimmedData,
                'pages': pages
            };
        }

        function pageButtons(pages) {
            let wrapper = document.getElementById("pagination-wrapper");
            if (!wrapper) return;
            wrapper.innerHTML = '';

            let maxLeft = state.page - Math.floor(state.window / 2);
            let maxRight = state.page + Math.floor(state.window / 2);

            if (maxLeft < 1) {
                maxLeft = 1;
                maxRight = state.window;
            }

            if (maxRight > pages) {
                maxLeft = pages - (state.window - 1);
                if (maxLeft < 1) maxLeft = 1;
                maxRight = pages;
            }

            // Add "First" button if not on the first page
            if (state.page != 1) {
                wrapper.innerHTML += '<button class="page" value="1"> &laquo;First </button>';
            }

            // Add page buttons
            for (let page = maxLeft; page <= maxRight; page++) {
                if (page == state.page) {
                    wrapper.innerHTML += `<button class="page" aria-current="true" value="${page}"> ${page} </button>`;
                    continue;
                } else {
                    wrapper.innerHTML += `<button class="page" value="${page}"> ${page} </button>`;
                }
            }

            // Add "Last" button if not on the last page
            if (state.page != pages) {
                wrapper.innerHTML += `<button class="page" value="${pages}"> Last&raquo; </button>`;
            }

            // Add event listeners to the buttons
            let buttons = document.querySelectorAll('.page');
            buttons.forEach(button => {
                button.addEventListener('click', function (event) {
                    toggleLoading(true); // Show spinner while updating content
                    const reviewsElement = document.getElementById('reviews');
                    if (reviewsElement) {
                        reviewsElement.innerHTML = '';
                    }
                    state.page = parseInt(event.target.value, 10); // Ensure the value is an integer
                    setTimeout(() => {
                        pageBuilder();
                        pageButtons(pages); // Update the navigation bar
                        toggleLoading(false); // Hide spinner after updating
                    }, 500); // Simulate loading delay
                });
            });
        }

        // Call `pageBuilder()` explicitly after setting up the initial pagination
        let pageInfo = pagination(state.set, state.page, state.rows);
        pageBuilder(); // Populate the content on the first run
        pageButtons(pageInfo.pages); // Set up the navigation bar

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the form from reloading the page

            const dateInput = document.getElementById('date').value;
            const ratingInput = document.getElementById('rating').value;
            const error = document.getElementById('error');

            // Validate inputs
            if (dateInput === '' && ratingInput === '') {
                error.textContent = 'Please select a date or a rating to filter by.';
                return;
            } else {
                error.textContent = ''; // Clear any previous error messages
            }

            // Filter reviews based on the selected date and rating
            const filteredData = state.originalSet.filter(review => {
                const reviewDate = new Date(review.date); // Convert review date to Date object
                const selectedDate = dateInput ? new Date(dateInput) : null; // Convert input date to Date object if provided
                const reviewRating = parseInt(review.rating, 10); // Convert review rating to an integer
                const selectedRating = ratingInput ? parseInt(ratingInput, 10) : null; // Convert selected rating to an integer if provided

                // Apply filters
                const dateCondition = selectedDate ? reviewDate >= selectedDate : true; // Check if review date is after or on the selected date
                const ratingCondition = selectedRating ? reviewRating === selectedRating : true; // Check if review rating matches the selected rating

                return dateCondition && ratingCondition; // Include reviews that meet both conditions
            });

            // Update the reviews and pagination with the filtered data
            state.page = 1; // Reset to the first page
            state.set = filteredData; // Update the dataset with filtered reviews
            pageBuilder(); // Rebuild the reviews
            const pageInfo = pagination(state.set, state.page, state.rows);
            pageButtons(pageInfo.pages); // Update the pagination
        });

        function pageBuilder() {
            let html = '';
            if (Array.isArray(state.set)) {
                let pageInfo = pagination(state.set, state.page, state.rows);
                pageInfo.set.forEach(ReviewsITCS333 => {
                    const id = ReviewsITCS333.id || 'Unknown';
                    const title = ReviewsITCS333.name || 'No title';
                    const rating = ReviewsITCS333.rating || 'No rating';
                    const date = ReviewsITCS333.date || 'No date';
                    html += `<article>${id} <date>${date}</date> <strong>Rating: ${rating} Stars</strong><p>(${title})</p><a href="Review&comments.html?reviewId=${id}"><button>Check Review and Comments</button></a></article>`;
                });
            } else {
                html += `<article>${JSON.stringify(state.set)}</article>`;
            }

            const reviewsElement = document.getElementById('reviews');
            if (reviewsElement) {
                reviewsElement.innerHTML = html;
            }
        }
    }
});