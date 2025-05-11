document.addEventListener("DOMContentLoaded", () => {
    const currentDateElement = document.getElementById("currentDate");
    const courseSelectElement = document.getElementById("course");
    const form = document.querySelector("form");
    const feedbackTextarea = document.querySelector("textarea[name='feedback']");
    const errorElement = document.getElementById("error");
    const cancelButton = document.querySelector("input[type='reset']");

    // Set the current date
    if (currentDateElement) {
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        currentDateElement.textContent = `Date: ${formattedDate}`;
    }

    // Fetch courses and populate the select options
    if (courseSelectElement) {
        fetch('https://681e45b1c1c291fa66339f80.mockapi.io/333reviews/courses')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(courses => {
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.courseCode;
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

    // Prevent form submission without feedback
    if (form) {
        form.addEventListener("submit", (event) => {
            if (!feedbackTextarea.value.trim()) {
                event.preventDefault(); // Prevent form submission
                errorElement.textContent = "Please provide feedback before submitting.";
            } else {
                errorElement.textContent = ""; // Clear the error message
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