document.addEventListener("DOMContentLoaded", () => {
  const clubList = document.getElementById("club-list");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort");
  const pagination = document.getElementById("pagination");
  //const form = document.getElementById("club-form");
  //const formError = document.getElementById("form-error");
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("overlay");

  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalCategory = document.getElementById("modal-category");

  let clubs = [];
  let currentPage = 1;
  const itemsPerPage = 3;

  async function fetchClubs() {
    clubList.innerHTML = "<p>Loading...</p>";
    try {
      const response = await fetch("https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php/clubs");
      if (!response.ok) throw new Error("Network error");
      clubs = await response.json();
      renderClubs();
    } catch (err) {
      clubList.innerHTML = `<p class="error">Failed to load clubs: ${err.message}</p>`;
    }
  }

  function filterAndSort() {
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    let filtered = clubs.filter(c => 
      c.name.toLowerCase().includes(query) && 
      (category === "all" || c.category === category)
    );

    if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "newest") filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }

  function renderClubs() {
    const filtered = filterAndSort();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const visibleClubs = filtered.slice(start, start + itemsPerPage);

    clubList.innerHTML = visibleClubs.map(club => `
      <div class="club-item" >
        <h3>${club.name}</h3>
        <p>${club.category}</p>
        <button onclick="showDetails('${club.id}')">View details</button>
      </div>
    `).join("") || "<p>No clubs found.</p>";

    pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
      <button ${i + 1 === currentPage ? 'disabled' : ''} onclick="changePage(${i + 1})">${i + 1}</button>
    `).join("");
  }

  window.showDetails = function(id) {
    const club = clubs.find(c => c.id === id);
    if (club) {
      modalTitle.textContent = club.name;
      modalDesc.textContent = club.description;
      modalCategory.textContent = `Category: ${club.category}`;
      modal.classList.add("show");
      overlay.classList.add("show");
    }
  }

  window.closeModal = function() {
    modal.classList.remove("show");
    overlay.classList.remove("show");
  }

  window.changePage = function(page) {
    currentPage = page;
    renderClubs();
  }

  // form.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   const name = form.elements["name"].value.trim();
  //   const desc = form.elements["description"].value.trim();
  //   if (!name || !desc) {
  //     formError.textContent = "Please fill out all fields.";
  //   } else {
  //     formError.textContent = "";
  //     alert("Your club suggestion has been submitted!");
  //     form.reset();
  //   }
  // });

  searchInput.addEventListener("input", () => { currentPage = 1; renderClubs(); });
  categoryFilter.addEventListener("change", () => { currentPage = 1; renderClubs(); });
  sortSelect.addEventListener("change", () => { currentPage = 1; renderClubs(); });

  fetchClubs();
});
