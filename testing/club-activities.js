const API_URL = 'https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php'; // <-- change this

// DOM Elements
const clubList = document.getElementById('club-list');
const form = document.getElementById('club-form');
const message = document.getElementById('message');

// Fetch and render all clubs
async function loadClubs() {
  try {
    const res = await fetch(API_URL);
    const clubs = await res.json();
    clubList.innerHTML = '';
    clubs.forEach(club => {
      const item = document.createElement('div');
      item.className = 'club-item';
      item.innerHTML = `
        <h3>${club.name}</h3>
        <p><strong>Category:</strong> ${club.category}</p>
        <p>${club.description}</p>
        <button onclick="deleteClub(${club.id})">Delete</button>
      `;
      clubList.appendChild(item);
    });
  } catch (err) {
    showMessage('Error loading clubs', true);
  }
}

// Add new club
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const category = form.category.value.trim();
  const description = form.description.value.trim();

  if (!name || !category || !description) {
    showMessage('All fields are required', true);
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, description })
    });

    const result = await res.json();
    if (res.ok) {
      showMessage(result.message);
      form.reset();
      loadClubs();
    } else {
      showMessage(result.message || 'Error saving club', true);
    }
  } catch (err) {
    showMessage('Error saving club', true);
  }
});

// Delete club
async function deleteClub(id) {
  if (!confirm('Delete this club?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    showMessage(result.message);
    loadClubs();
  } catch (err) {
    showMessage('Error deleting club', true);
  }
}

// Show message
function showMessage(msg, isError = false) {
  message.textContent = msg;
  message.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    message.textContent = '';
  }, 3000);
}

// Initial load
loadClubs();
