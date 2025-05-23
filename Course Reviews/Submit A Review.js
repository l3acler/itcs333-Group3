document.addEventListener("DOMContentLoaded", () => {
    const currentDateElement = document.getElementById("currentDate");
    const courseSelectElement = document.getElementById("course"); // Ensure this matches the HTML
    const form = document.querySelector("form");
    const feedbackTextarea = document.querySelector("textarea[name='feedback']");
    const errorElement = document.getElementById("error");
    const cancelButton = document.querySelector("input[type='reset']");

    // Set the current date
    if (currentDateElement) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        currentDateElement.textContent = `Date: ${formattedDate}`;
    }

    // Fetch courses and populate the select options
    if (courseSelectElement) {
        fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/courses')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(courses => {
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.courseId; // Use courseId as the value
                    option.textContent = course.courseCode;
                    courseSelectElement.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error fetching courses:", error);
                const errorOption = document.createElement("option");
                errorOption.disabled = true;
                errorOption.textContent = "Failed to load courses";
                courseSelectElement.appendChild(errorOption);
            });
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Prepare form data
            const formData = {
                courseId: courseSelectElement.value, // Get courseId from the selected option
                posterId: 3, // Fixed value
                name: "Guest", // Fixed value
                date: new Date().toISOString().split('T')[0], // Use the current date in YYYY-MM-DD format
                rating: document.querySelector('input[name="radio"]:checked')?.value, // Get the selected rating
                content: feedbackTextarea.value // Get the feedback content
            };

            // Validate form data
            if (!formData.courseId || !formData.rating || !formData.content.trim()) {
                errorElement.textContent = "Please fill out all required fields.";
                return;
            } else {
                errorElement.textContent = ""; // Clear the error message
            }

            try {
                // Send the review data to the API
                const response = await fetch('https://3d119289-7941-49ae-853e-6c46621ce2bf-00-2l5z9rmdmv5cz.sisko.replit.dev/api.php/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    form.reset(); // Clear the form
                    alert("Review submitted successfully!");
                    window.location.href = "All Course Reviews.html"; // Redirect to All Course Reviews.html
                } else {
                    const errorData = await response.json();
                    console.error("Error submitting review:", errorData);
                    errorElement.textContent = "Failed to submit the review. Please try again.";
                }
            } catch (error) {
                console.error("Error adding review:", error);
                errorElement.textContent = "An error occurred while submitting the review. Please try again.";
            }
        });
    }

    // Handle the cancel button
    if (cancelButton) {
        cancelButton.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent the default reset behavior
            form.reset(); // Clear the form
            window.location.href = "All Course Reviews.html"; // Redirect to All Course Reviews.html
        });
    }
});