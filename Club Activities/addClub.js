document.getElementById('clubForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = {
        name: document.getElementById('name').value.trim(),
        category: document.getElementById('category').value.trim(),
        description: document.getElementById('description').value.trim()
      };

      try {
        const response = await fetch('https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          document.getElementById('message').textContent = 'Club added successfully!';
          document.getElementById('clubForm').reset();
        } else {
          document.getElementById('message').textContent = result.error || 'Something went wrong.';
        }
      } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = 'Failed to connect to the server.';
      }
    });