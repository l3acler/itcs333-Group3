const API_URL = "https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php";
let currentPage = 1;
const itemsPerPage = 5;

document.addEventListener("DOMContentLoaded", () => {
  const clubList = document.getElementById("clubList");
  const form = document.getElementById("clubFormElement");
  const formContainer = document.getElementById("clubForm");
  const showFormBtn = document.getElementById("showForm");
  const cancelEditBtn = document.getElementById("cancelEdit");

  const name = document.getElementById("name");
  const description = document.getElementById("description");
  const category = document.getElementById("category");
  const meetingTime = document.getElementById("meeting_time");
  const clubId = document.getElementById("clubId");

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  function fetchClubs(page = 1) {
    currentPage = page;
    const search = searchInput.value;
    const category = categoryFilter.value;

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", itemsPerPage);
    if (search) params.append("search", search);
    if (category) params.append("category", category);

    fetch(`${API_URL}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const { clubs, total } = data;

        clubList.innerHTML = "";
        if (!clubs.length) {
          clubList.innerHTML = "<p>No clubs found.</p>";
          document.getElementById("pagination").innerHTML = "";
          return;
        }

        clubs.forEach(club => {
          const div = document.createElement("article");
          div.innerHTML = `
            <h3>${club.name}</h3>
            <p><strong>Category:</strong> ${club.category}</p>
            <p><strong>Meeting Time:</strong> ${club.meeting_time}</p>
            <p>${club.description}</p>
            <button onclick="editClub(${club.id})">Edit</button>
            <button onclick="deleteClub(${club.id})">Delete</button>
          `;
          clubList.appendChild(div);
        });

        renderPagination(total);
      });
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === currentPage ? "contrast" : "";
      btn.onclick = () => fetchClubs(i);
      pagination.appendChild(btn);
    }
  }

  window.editClub = function(id) {
    fetch(`${API_URL}?id=${id}`)
      .then(res => res.json())
      .then(club => {
        clubId.value = club.id;
        name.value = club.name;
        description.value = club.description;
        category.value = club.category;
        meetingTime.value = club.meeting_time;
        document.getElementById("formTitle").textContent = "Edit Club";
        formContainer.style.display = "block";
      });
  };

  window.deleteClub = function(id) {
    if (confirm("Are you sure you want to delete this club?")) {
      fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => fetchClubs(currentPage));
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      name: name.value,
      description: description.value,
      category: category.value,
      meeting_time: meetingTime.value,
    };
    const id = clubId.value;

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}?id=${id}` : API_URL;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(() => {
        form.reset();
        formContainer.style.display = "none";
        fetchClubs(1);
      });
  });

  cancelEditBtn.addEventListener("click", () => {
    form.reset();
    clubId.value = "";
    formContainer.style.display = "none";
  });

  showFormBtn.addEventListener("click", () => {
    form.reset();
    clubId.value = "";
    document.getElementById("formTitle").textContent = "Create Club";
    formContainer.style.display = "block";
  });

  searchInput.addEventListener("input", () => fetchClubs(1));
  categoryFilter.addEventListener("change", () => fetchClubs(1));

  fetchClubs();
});