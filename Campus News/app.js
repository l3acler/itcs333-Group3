// Fetch news data from JSON file
const newsList = document.getElementById('news-list');
const loading = document.getElementById('loading');
const filterForm = document.getElementById('filter-form');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const sortSelect = document.getElementById('sort');
const pagination = document.getElementById('pagination');

let newsData = [];
let currentPage = 1;
const itemsPerPage = 5; // Change this to how many news per page you want

async function fetchNews() {
  loading.style.display = 'block';
  try {
    const response = await fetch('news.json'); // 🔥 Make sure you have a news.json file!
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    newsData = data;
    renderNews();
  } catch (error) {
    newsList.innerHTML = '<p>Error loading news. Please try again later.</p>';
    console.error('Fetch error:', error);
  } finally {
    loading.style.display = 'none';
  }
}

// Render news
function renderNews() {
  const filteredNews = filterNews();
  const sortedNews = sortNews(filteredNews);
  const paginatedNews = paginateNews(sortedNews);

  newsList.innerHTML = '';

  if (paginatedNews.length === 0) {
    newsList.innerHTML = '<p>No news found.</p>';
    return;
  }

  paginatedNews.forEach(news => {
    const article = document.createElement('article');
    article.innerHTML = `
      <h3><a href="detail.html">${news.title}</a></h3>
      <p>${news.content.substring(0, 100)}...</p>
      <p><small>Published on: ${news.date}</small></p>
    `;
    newsList.appendChild(article);
  });

  renderPagination(filteredNews.length);
}

// Filter news based on search and category
function filterNews() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;

  return newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm) ||
                           news.content.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
}

// Sort news
function sortNews(newsArray) {
  const sortBy = sortSelect.value;
  return [...newsArray].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });
}

// Pagination logic
function paginateNews(newsArray) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return newsArray.slice(start, end);
}

// Render pagination buttons
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('a');
    pageBtn.href = "#";
    pageBtn.innerText = i;
    pageBtn.className = "button";
    if (i === currentPage) {
      pageBtn.setAttribute('aria-current', 'true');
    }
    pageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      renderNews();
    });
    pagination.appendChild(pageBtn);
  }
}

// Handle form filter submit
if (filterForm) {
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1; // Reset to first page
    renderNews();
  });
}

// Initial fetch
if (newsList) {
  fetchNews();
}
