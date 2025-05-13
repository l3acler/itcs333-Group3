document.addEventListener("DOMContentLoaded", () => {
    const innerName = document.getElementById("name");
    const rating = document.getElementById("rating");
    const date = document.getElementById("date");
    const reviewContent = document.getElementById("reviewContent");
    const backToCourse = document.getElementById("backToCourse");

    async function fetchAndDisplayReview() {
        const reviewId = new URLSearchParams(window.location.search).get('reviewId');
        if (!reviewId) {
            console.error("No reviewId found in the URL.");
            return;
        }

        try {
            const response = await fetch(`https://681e45b1c1c291fa66339f80.mockapi.io/333reviews/ReviewsITCS333/${reviewId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch review: ${response.status} ${response.statusText}`);
            }
            const review = await response.json();
            displayReview(review);

            // Update the "Back to Reviews" link with the courseId
            if (review.courseId) {
                backToCourse.href = `Specific Course.html?courseId=${review.courseId}`;
            }
        } catch (error) {
            console.error("Error fetching review:", error);
            reviewContent.textContent = "Failed to load the review. Please try again later.";
        }
    }

    function displayReview(review) {
        // Ensure the rating is a valid number
        const validRating = parseInt(review.rating, 10);
        const stars = validRating && validRating > 0 ? '&#x1F31F '.repeat(validRating).trim() : 'No Rating';

        // Update the page with the review details
        innerName.innerHTML = `${review.name || 'Anonymous'}'s Review`; // Fallback to 'Anonymous' if name is missing
        rating.innerHTML = `Rating: ${stars} (${validRating || 'No Rating'} Stars)`; // Display stars or fallback message
        date.innerHTML = `Date: ${review.date || 'No Date Available'}`; // Fallback to 'No Date Available' if date is missing
        reviewContent.innerHTML = review.content || "No review content available."; // Fallback to 'No review content available'
    }

    // Fetch and display the review when the page loads
    fetchAndDisplayReview();
});