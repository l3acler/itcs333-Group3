const apiUrl = "https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/clubs_api.php";

let currentPage = 1;
const itemsPerPage = 6;
let filteredClubs = [];

let allClubs = [];

document.getElementById("clubForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("clubId").value;
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!name || !category || !description) {
    alert("Please fill in all fields.");
    return;
  }

  const data = new URLSearchParams({ name, category, description });
  if (id) data.append("id", id);

  const action = id ? "update" : "create";
  const res = await fetch(`${apiUrl}?action=${action}`, {
    method: "POST",
    body: data
  });

  const result = await res.json();
  alert(result.success ? "Saved successfully!" : result.error || "Error");
  clearForm();
  await loadClubs();
  filterClubs(document.getElementById("search").value);
});
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderClubCards(filteredClubs);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderClubCards(filteredClubs);
  }
});


function clearForm() {
  document.getElementById("clubId").value = "";
  document.getElementById("clubForm").reset();
}

function createCard(club) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
      <h3>${club.name}</h3>
      <p><strong>Category:</strong> ${club.category}</p>
      <p>${club.description}</p>
      <div class="card-actions">
        <button onclick='editClub(${JSON.stringify(club)})'>Edit</button>
        <button class="secondary" onclick='deleteClub(${club.id})'>Delete</button>
      </div>
    `;
  return card;
}

function renderClubCards(clubs) {
  filteredClubs = clubs;
  const container = document.getElementById("searchCards");
  container.innerHTML = "";

  if (!clubs.length) {
    container.innerHTML = "<p>No clubs found.</p>";
    document.getElementById("paginationControls").style.display = "none";
    return;
  }

  const totalPages = Math.ceil(clubs.length / itemsPerPage);
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const clubsToShow = clubs.slice(start, end);

  clubsToShow.forEach(club => {
    container.appendChild(createCard(club));
  });

  const pageInfo = document.getElementById("pageInfo");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("paginationControls").style.display = "flex";
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}


function filterClubs(query) {
  currentPage = 1;
  const q = query.toLowerCase();
  const filtered = allClubs.filter(club => {
    const name = (club.name || "").toLowerCase();
    const category = (club.category || "").toLowerCase();
    const description = (club.description || "").toLowerCase();
    return name.includes(q) || category.includes(q) || description.includes(q);
  });
  renderClubCards(filtered);
}


async function loadClubs() {
  const res = await fetch(`${apiUrl}?action=fetch`);
  allClubs = await res.json();
  filterClubs(document.getElementById("search").value);
}

function editClub(club) {
  document.getElementById("clubId").value = club.id;
  document.getElementById("name").value = club.name;
  document.getElementById("category").value = club.category;
  document.getElementById("description").value = club.description;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteClub(id) {
  if (!confirm("Are you sure you want to delete this club?")) return;
  const res = await fetch(`${apiUrl}?action=delete`, {
    method: "POST",
    body: new URLSearchParams({ id })
  });
  const result = await res.json();
  alert(result.success ? "Deleted!" : result.error || "Error");
  await loadClubs();
}

document.getElementById("search").addEventListener("input", function () {
  filterClubs(this.value);
});

loadClubs();
