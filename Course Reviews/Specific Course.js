fetch('https://jsonplaceholder.typicode.com/posts')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    displayOutput(data);
  })
  .catch(error => {
    displayOutput('There was an error: ' + error.message);
  });

  function displayOutput(data) {
    
    let state={
        'set': data,
        'page': 1,
        'rows': 10,
        'window': 5
    };
    
    function pagination(set, page, rows){
        let trimStart=(page-1)*rows;
        let trimEnd=trimStart+rows;
        let trimmedData=set.slice(trimStart, trimEnd);
    
        let pages=Math.ceil(set.length/rows);
    
        return{
            'set':trimmedData,
            'pages':pages
        }
    }

    function pageButtons(pages) {
        let wrapper = document.getElementById("pagination-wrapper");
        wrapper.innerHTML = '';

        let maxLeft = state.page - Math.floor(state.window / 2);
        let maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }

        if (maxRight > pages) {
            maxLeft = pages - (state.window - 1);
            if (maxLeft < 1) maxLeft = 1;
            maxRight = pages;
        }

        // Add "First" button if not on the first page
        if (state.page != 1) {
            wrapper.innerHTML += '<button class="page" value="1"> &laquo;First </button>';
        }

        // Add page buttons
        for (let page = maxLeft; page <= maxRight; page++) {
            if (page == state.page) {
                wrapper.innerHTML += `<button class="page" aria-current="true" value="${page}"> ${page} </button>`;
                continue;
            }else{
                wrapper.innerHTML += `<button class="page" value="${page}"> ${page} </button>`;
            }
           
        }

        // Add "Last" button if not on the last page
        if (state.page != pages) {
            wrapper.innerHTML += `<button class="page" value="${pages}"> Last&raquo; </button>`;
        }

        // Add event listeners to the buttons
        let buttons = document.querySelectorAll('.page');
        buttons.forEach(button => {
            button.addEventListener('click', function (event) {
                document.getElementById('reviews').innerHTML = '';
                state.page = parseInt(event.target.value, 10); // Ensure the value is an integer
                pageBuilder();
                pageButtons(pages); // Update the navigation bar
            });
        });
    }

    // Call `pageBuilder()` explicitly after setting up the initial pagination
    let pageInfo = pagination(state.set, state.page, state.rows);
    pageBuilder(); // Populate the content on the first run
    pageButtons(pageInfo.pages); // Set up the navigation bar

    function pageBuilder(){
    let html = '';
    if (Array.isArray(data)) {
        let pageInfo=pagination(state.set, state.page, state.rows);
      pageInfo.set.forEach(post => {
        const name = post.id || 'Unknown';
        const title = post.title || 'No email';
        html += `<article>${name} <date></date> <p>(${title})</p><a href="##"><button>Check Review and Comments</button></a></article>`;
      });
    } else {
      html += `<article>${JSON.stringify(data)}</article>`;
    }
    
    html += '';
    document.getElementById('reviews').innerHTML = html;
    }
  }