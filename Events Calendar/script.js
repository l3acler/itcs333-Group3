const eventList = document.getElementById("eventList");
const searchInput = document.getElementById("events");
const filterType = document.getElementById("filterType");
const sortBy = document.getElementById("sortBy");

let eventsData = [];


async function fetchEvents() {
    showLoading();
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await res.json();
        eventsData = data.slice(0, 10).map((e, i) => ({
            name: e.title,
            date: `2025-05-${String(10 + i).padStart(2, '0')}`,
            time: `${1 + (i % 5)}:00pm`,
            type: ['Workshop', 'Seminar', 'Festival'][i % 3],
            description: e.body
        }));
        renderEvents(eventsData);
    } catch (err) {
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
      <details><summary>Show Details</summary><p>${event.description}</p></details>
    `;
        eventList.appendChild(article);
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
    const filtered = eventsData.filter(e => e.type === type);
    renderEvents(filtered);
});


sortBy.addEventListener("change", () => {
    showLoading();
    const criteria = sortBy.value;
    const sorted = [...eventsData].sort((a, b) => {
        if (criteria === "date") return new Date(a.date) - new Date(b.date);
        if (criteria === "time") return a.time.localeCompare(b.time);
    });
    renderEvents(sorted);
});


document.querySelector("#creat form").addEventListener("submit", e => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input");
    let valid = true;
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.style.border = "2px solid red";
            valid = false;
        } else {
            input.style.border = "";
        }
    });
    if (valid) alert("Event submitted successfully (form not actually submitted)");
});

fetchEvents();