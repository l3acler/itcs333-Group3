const clubGrid = document.getElementById("clubGrid");

fetch("https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php?limit=12")
    .then(response => response.json())
    .then(data => {
        const clubs = data.clubs || [];

        if (clubs.length === 0) {
            clubGrid.innerHTML = "<p>No clubs found.</p>";
            return;
        }

        clubs.forEach(club => {
            const card = document.createElement("div");
            card.className = "club-card";
            card.innerHTML = `
        <h3>${club.name}</h3>
  <p><strong>Category:</strong> ${club.category}</p>
  <p>${club.description}</p>
  <a href="club-details.html?id=${club.id}" class="contrast outline"><button>View Details</button></a>
      `;
            clubGrid.appendChild(card);
        });
    })
    .catch(err => {
        clubGrid.innerHTML = `<p>Error loading clubs.</p>`;
        console.error(err);
    });
