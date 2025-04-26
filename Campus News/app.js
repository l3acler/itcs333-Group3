// ========== app.js ==========

// Global Variables
const NEWS_PER_PAGE = 3;
let allNews = [];
let currentPage = 1;

// Fetch news from JSON file
async function fetchNews() {
  showLoading(true);
  try {
    const response = await fetch('news.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    allNews = data;
    renderNews();
    renderPagination();
  } catch (error) {
    document.getElementById('news-list').innerHTML = `<p style="color: red;">Failed to load news: ${error.message}</p>`;
  } finally {
    showLoading(false);
  }
}

// Show or hide loading text
function showLoading(show) {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = show ? 'block' : 'none';
}

// Render news items
function renderNews() {
  const list = document.getElementById('news-list');
  if (!list) return;

  const filteredNews = applyFilters();
  const paginatedNews = paginate(filteredNews);

  if (paginatedNews.length === 0) {
    list.innerHTML = "<p>No news found.</p>";
    return;
  }

  list.innerHTML = paginatedNews.map(item => `
    <article>
      <h3><a href="detail.html?id=${item.id}">${item.title}</a></h3>
      <p>${item.summary}</p>
      <p><small>Published on: ${new Date(item.date).toLocaleDateString()}</small></p>
    </article>
  `).join('');
}

// Apply search and filter
function applyFilters() {
  const searchInput = document.getElementById('search')?.value.toLowerCase() || '';
  const categorySelect = document.getElementById('category')?.value || 'all';
  const sortSelect = document.getElementById('sort')?.value || 'newest';

  let filtered = allNews.filter(news => 
    (categorySelect === 'all' || news.category === categorySelect) &&
    (news.title.toLowerCase().includes(searchInput) || news.summary.toLowerCase().includes(searchInput))
  );

  // Sorting
  filtered.sort((a, b) => {
    if (sortSelect === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return filtered;
}

// Pagination logic
function paginate(newsArray) {
  const start = (currentPage - 1) * NEWS_PER_PAGE;
  return newsArray.slice(start, start + NEWS_PER_PAGE);
}

// Render pagination buttons
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const filteredNews = applyFilters();
  const pageCount = Math.ceil(filteredNews.length / NEWS_PER_PAGE);

  let buttons = '';
  for (let i = 1; i <= pageCount; i++) {
    buttons += `<a href="#" role="button" ${i === currentPage ? 'aria-current="true"' : ''} onclick="goToPage(${i})">${i}</a> `;
  }
  pagination.innerHTML = buttons;
}

// Go to a selected page
function goToPage(page) {
  currentPage = page;
  renderNews();
  renderPagination();
}

// Form validation
function validateForm() {
  const title = document.getElementById('title');
  const category = document.getElementById('category');
  const content = document.getElementById('content');

  if (!title.value.trim() || !category.value.trim() || !content.value.trim()) {
    alert('Please fill all fields properly.');
    return false;
  }

  alert('Form is valid! (but we are not submitting yet)');
  return false;
}

// Populate detail.html based on clicked news
async function populateDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) return;

  try {
    const response = await fetch('news.json');
    const newsData = await response.json();
    const newsItem = newsData.find(item => item.id == id);

    if (newsItem) {
      document.querySelector('h1').innerText = newsItem.title;
      document.querySelector('header p').innerText = `Published on: ${new Date(newsItem.date).toLocaleDateString()}`;
      document.querySelector('article p').innerText = newsItem.content;
    } else {
      document.querySelector('main').innerHTML = "<p>News not found.</p>";
    }
  } catch (error) {
    console.error('Failed to load detail:', error);
  }
}

// Setup event listeners
function setupListeners() {
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      currentPage = 1;
      renderNews();
      renderPagination();
    });
  }

  const newsForm = document.querySelector('form');
  if (newsForm && document.getElementById('title')) {
    newsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateForm();
    });
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('news-list')) {
    fetchNews();
    setupListeners();
  }
  if (window.location.pathname.includes('detail.html')) {
    populateDetailPage();
  }
  if (window.location.pathname.includes('form.html')) {
    setupListeners();
  }
});

