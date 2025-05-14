 const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      document.body.innerHTML = "<p>Invalid club ID.</p>";
    } else {
      fetch(`https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data || !data.name) {
            document.body.innerHTML = "<p>Club not found.</p>";
            return;
          }

          document.getElementById("clubName").textContent = data.name;
          document.getElementById("clubCategory").textContent = data.category;
          document.getElementById("clubMeetingTime").textContent = data.meeting_time;
          document.getElementById("clubDescription").textContent = data.description;
        })
        .catch(err => {
          document.body.innerHTML = "<p>Error loading club details.</p>";
          console.error(err);
        });
    }