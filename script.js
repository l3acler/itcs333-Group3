const eventList = document.getElementById("eventList");
const searchInput = document.getElementById("events");
const filterType = document.getElementById("filterType");
const sortBy = document.getElementById("sortBy");

let eventsData = [];

const baseURL = "https://02bfba0a-6521-451f-b56b-7a6a61bbd3c7-00-ub5erqwg075k.pike.replit.dev/api.php";

async function fetchEvents() {
    showLoading();
    try {
        const res = await fetch(`${baseURL}?action=fetch`);
        const data = await res.json();
        eventsData = data.map(e => ({
            id: e.id,
            name: e.name,
            date: e.date,
            time: e.time,
            type: e.type,
            description: e.description,
            location: e.location
        }));
        renderEvents(eventsData);
    } catch (err) {
        console.error("Error fetching events:", err);
        eventList.innerHTML = `<p style="color:red">Failed to fetch events. Please try again later.</p>`;
    }
}

function showLoading() {
    eventList.innerHTML = `<p>Loading events...</p>`;
}

function renderEvents(data) {
    if (data.length === 0) {
        eventList.innerHTML = `<p>No events found.</p>`;
        return;
    }

    eventList.innerHTML = "";
    data.forEach(event => {
        const article = document.createElement("article");
        article.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <details><summary>Show Details</summary><p>${event.description}</p></details>
            <button data-id="${event.id}" class="delete-btn">Delete</button>
        `;
        eventList.appendChild(article);
    });

    addEventListeners();
}

function addEventListeners() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (confirm("Delete this event?")) {
                await fetch(`${baseURL}?action=delete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `id=${id}`
                });
                fetchEvents();
            }
        });
    });
}

searchInput.addEventListener("input", () => {
    showLoading();
    const keyword = searchInput.value.toLowerCase();
    const filtered = eventsData.filter(e => e.name.toLowerCase().includes(keyword));
    renderEvents(filtered);
});

filterType.addEventListener("change", () => {
    showLoading();
    const type = filterType.value;
    
    if (type === "All") {
        renderEvents(eventsData); // Show all
    } else {
        const filtered = eventsData.filter(e => e.type === type);
        renderEvents(filtered);
    }
});

sortBy.addEventListener("change", () => {
    showLoading();
    const criteria = sortBy.value;
    const sorted = [...eventsData].sort((a, b) => {
        if (criteria === "date") return new Date(a.date) - new Date(b.date);
        if (criteria === "time") return a.time.localeCompare(b.time);
        return 0;
    });
    renderEvents(sorted);
});

document.querySelector("#creat form").addEventListener("submit", e => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input, textarea");
    let valid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.style.border = "2px solid red";
            valid = false;
        } else {
            input.style.border = "";
        }
    });

    if (!valid) return;

    const formData = new FormData(e.target);
    formData.append("action", "create");

    fetch(baseURL + "?action=create", {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Event added successfully!");
            fetchEvents();
            e.target.reset();
        } else {
            alert("Failed to add event: " + (data.error || "Unknown error"));
        }
    })
    .catch((error) => {
        console.error("Error adding event:", error);
        alert("Error adding event.");
    });
});

fetchEvents();