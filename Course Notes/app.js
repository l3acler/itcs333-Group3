// Course Notes Application
// Main application logic for the Campus Hub Course Notes module

// Global state
const state = {
    notes: [],
    filteredNotes: [],
    currentPage: 1,
    itemsPerPage: 5,
    isLoading: false,
    error: null
  };
  
  // API URL - using JSONPlaceholder as a mock API
  const API_URL = 'https://my-json-server.typicode.com/yourusername/campus-hub/notes';
  
  // DOM Elements
  document.addEventListener('DOMContentLoaded', () => {
    // Only run initialization on the index page
    if (document.querySelector('#search-filters')) {
      initializeApp();
    }
    
    // Initialize form validation on the create note page
    if (document.querySelector('#course-code')) {
      initializeFormValidation();
    }
    
    // Check if we're on the note detail page
    const isDetailPage = document.querySelector('article header h1');
    if (isDetailPage) {
      loadNoteDetails();
    }
  });
  
  // App Initialization
  function initializeApp() {
    // Attach event listeners
    attachEventListeners();
    
    // Fetch notes data
    fetchNotes();
  }
  
  // Fetch Notes Data
  async function fetchNotes() {
  try {
    showLoading(true);
    
    let usesMockData = false;
    let notesData = [];
    
    try {
      console.log('Attempting to fetch notes from API...');
      const response = await fetch('api/notes/index.php');
      
      if (!response.ok) {
        console.warn(`API request failed with status ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API data received:', data);
      
      if (data && data.notes) {
        notesData = data.notes;
      } else {
        throw new Error('API response missing notes data');
      }
    } catch (error) {
      console.error('API fetch failed, falling back to mock data:', error);
      notesData = getMockNotes();
      usesMockData = true;
    }
    
    // Update state
    state.notes = notesData;
    state.filteredNotes = [...notesData];
    
    // Render notes
    renderNotes();
    updatePagination();
    
    showLoading(false);
    
    // Show mock data notice if using mock data
    if (usesMockData) {
      const mockNotice = document.createElement('div');
      mockNotice.style.margin = '10px 0';
      mockNotice.style.padding = '10px';
      mockNotice.style.backgroundColor = '#fff3cd';
      mockNotice.style.color = '#856404';
      mockNotice.style.borderRadius = '4px';
      mockNotice.innerHTML = '<strong>Note:</strong> Using mock data. PHP backend not connected.';
      
      const container = document.querySelector('main');
      if (container) {
        container.insertBefore(mockNotice, container.firstChild);
      }
    }
  } catch (error) {
    handleError(error);
  }
}


  
  // Render Notes to the DOM
  function renderNotes() {
    const notesContainer = document.querySelector('main');
    const availableNotesTitle = document.querySelector('main h2');
    
    // Clear previous notes (keep the header elements)
    const elements = notesContainer.querySelectorAll('.note-item');
    elements.forEach(el => el.remove());
    
    // Get current page notes
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const currentPageNotes = state.filteredNotes.slice(startIndex, endIndex);
    
    if (currentPageNotes.length === 0) {
      // No notes found
      const noResults = document.createElement('p');
      noResults.textContent = 'No notes match your search criteria.';
      notesContainer.insertBefore(noResults, document.querySelector('hr'));
    } else {
      // Create note elements
      currentPageNotes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesContainer.insertBefore(noteElement, document.querySelector('hr'));
      });
    }
    
    // Update notes count
    if (availableNotesTitle) {
      availableNotesTitle.textContent = `Available Notes (${state.filteredNotes.length})`;
    }
  }
  
  // Create a Note Element
  function createNoteElement(note) {
    const details = document.createElement('details');
    details.className = 'note-item';
    
    // Get search term for highlighting
    const searchTerm = document.querySelector('#search')?.value?.toLowerCase() || '';
    
    // Create title with highlighting if needed
    let title = `${note.courseCode} - ${note.title}`;
    if (searchTerm) {
      title = highlightText(title, searchTerm);
    }
    
    // Create description with highlighting if needed
    let description = note.description;
    if (searchTerm) {
      description = highlightText(description, searchTerm);
    }
    
    details.innerHTML = `
      <summary role="button">${title}</summary>
      <div class="grid">
          <div>
              <p>
                  <span class="tag">${getTypeLabel(note.type)}</span> 
                  <span class="tag">${getSemesterLabel(note.semester)}</span>
              </p>
              <p class="metadata">Uploaded by: ${note.uploadedBy} • ${note.uploadDate} • ${note.pages} pages</p>
              <p>${description}</p>
          </div>
          <div class="action-buttons">
              <a href="note-detail.html?id=${note.id}" role="button">View Notes</a>
          </div>
      </div>
    `;
    
    return details;
  }
  
  // Helper function to highlight search term in text
  function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
  
  // Helper function to escape special characters in search term
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Get Type Label
  function getTypeLabel(type) {
    const types = {
      'lecture': 'Lecture Notes',
      'study-guide': 'Study Guide',
      'exam-prep': 'Exam Prep',
      'summary': 'Course Summary'
    };
    
    return types[type] || type;
  }
  
  // Get Semester Label
  function getSemesterLabel(semester) {
    const semesters = {
      'spring2025': 'Spring 2025',
      'fall2024': 'Fall 2024',
      'summer2024': 'Summer 2024'
    };
    
    return semesters[semester] || semester;
  }
  
  // Attach Event Listeners
  function attachEventListeners() {
  // Search and filter form
  const filterForm = document.querySelector('#search-filters form');
  if (filterForm) {
    filterForm.addEventListener('submit', handleFilterSubmit);
  }
  
  // Pagination buttons
  const paginationButtons = document.querySelectorAll('.pagination button');
  if (paginationButtons) {
    paginationButtons.forEach(button => {
      button.addEventListener('click', handlePaginationClick);
    });
  }
  
  // Sort dropdown - make sure the selector matches your HTML
  const sortSelect = document.querySelector('select[name="sort"]');
  if (sortSelect) {
    console.log('Sort dropdown found:', sortSelect);
    sortSelect.addEventListener('change', function(e) {
      console.log('Sort changed to:', e.target.value);
      handleSortChange(e);
    });
  } else {
    console.warn('Sort dropdown not found in the DOM');
  }
}
  
  // Handle Sort Change
  function handleSortChange(event) {
  const sortOption = event.target.value;
  
  if (!sortOption) return;
  
  // Sort the filtered notes
  switch (sortOption) {
    case 'date-desc':
    case 'most-recent':
      state.filteredNotes.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      break;
    case 'date-asc':
    case 'oldest':
      state.filteredNotes.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      break;
    case 'name-asc':
    case 'a-z':
      state.filteredNotes.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
      break;
    case 'name-desc':
    case 'z-a':
      state.filteredNotes.sort((a, b) => b.courseCode.localeCompare(a.courseCode));
      break;
    case 'rating-desc':
    case 'highest-rated':
      state.filteredNotes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'rating-asc':
    case 'lowest-rated':
      state.filteredNotes.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      break;
    default:
      // Default to most recent
      state.filteredNotes.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }
  
  // Reset to first page and re-render
  state.currentPage = 1;
  renderNotes();
  updatePagination();
}
  
  // Handle Filter Submit
  function handleFilterSubmit(event) {
    event.preventDefault();
    
    // Get filter values
    const courseSearch = document.querySelector('#search').value.toLowerCase();
    const semesterFilter = document.querySelector('#semester').value;
    const typeFilter = document.querySelector('#note-type').value;
    const instructorFilter = document.querySelector('#instructor').value.toLowerCase();
    
    // Filter notes
    state.filteredNotes = state.notes.filter(note => {
      // Course filter (match course code or name)
      const courseMatch = note.courseCode.toLowerCase().includes(courseSearch) || 
                         note.courseName.toLowerCase().includes(courseSearch) ||
                         note.title.toLowerCase().includes(courseSearch);
      
      // Semester filter
      const semesterMatch = !semesterFilter || note.semester === semesterFilter;
      
      // Type filter
      const typeMatch = !typeFilter || note.type === typeFilter;
      
      // Instructor filter
      const instructorMatch = !instructorFilter || 
                             (note.instructor && note.instructor.toLowerCase().includes(instructorFilter));
      
      return courseMatch && semesterMatch && typeMatch && instructorMatch;
    });
    
    // Reset to first page and render
    state.currentPage = 1;
    renderNotes();
    updatePagination();
  }
  
  // Handle Pagination Click
  function handlePaginationClick(event) {
    event.preventDefault();
    
    const buttonText = event.target.textContent;
    const totalPages = Math.ceil(state.filteredNotes.length / state.itemsPerPage);
    
    if (buttonText === '«') {
      // Previous page
      state.currentPage = Math.max(1, state.currentPage - 1);
    } else if (buttonText === '»') {
      // Next page
      state.currentPage = Math.min(totalPages, state.currentPage + 1);
    } else {
      // Specific page
      state.currentPage = parseInt(buttonText);
    }
    
    renderNotes();
    updatePagination();
  }
  
  // Update Pagination
  function updatePagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(state.filteredNotes.length / state.itemsPerPage);
    
    // Clear existing buttons
    pagination.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '«';
    prevButton.addEventListener('click', handlePaginationClick);
    pagination.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === state.currentPage) {
        pageButton.setAttribute('aria-current', 'true');
      }
      pageButton.addEventListener('click', handlePaginationClick);
      pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = '»';
    nextButton.addEventListener('click', handlePaginationClick);
    pagination.appendChild(nextButton);
  }
  
  // Show Loading State
  function showLoading(isLoading) {
    state.isLoading = isLoading;
    
    if (isLoading) {
      // Create loading indicator if it doesn't exist
      if (!document.querySelector('.loading-indicator')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
          <div style="text-align: center; padding: 1rem;">
            <div class="spinner"></div>
            <p>Loading notes...</p>
          </div>
        `;
        
        // Insert after the filter form
        const filterSection = document.querySelector('#search-filters');
        if (filterSection) {
          filterSection.after(loadingIndicator);
        }
      }
    } else {
      // Remove loading indicator
      const loadingIndicator = document.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  }
  
  // Handle Error
  function handleError(error) {
    state.error = error.message || 'An error occurred while fetching notes';
    state.isLoading = false;
    
    // Remove loading indicator
    showLoading(false);
    
    // Display error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <div style="text-align: center; padding: 1rem; background-color: #ffdddd; border-radius: 4px; margin: 1rem 0;">
        <p>Error: ${state.error}</p>
        <button onclick="fetchNotes()">Try Again</button>
      </div>
    `;
    
    // Insert after the filter form
    const filterSection = document.querySelector('#search-filters');
    if (filterSection) {
      // Remove existing error message if any
      const existingError = document.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      
      filterSection.after(errorMessage);
    }
    
    console.error('Error fetching notes:', error);
  }
  
  // Form Validation for create-note.html
  function initializeFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Add event listeners to required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', validateField);
      field.addEventListener('input', clearError);
    });
    
    // Add file size validation
    const fileInput = document.querySelector('#notes-file');
    if (fileInput) {
      fileInput.addEventListener('change', validateFileSize);
    }
    
    // Add form submission handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Initialize file drop zone
    initializeDropZone();
  }
  
  // Initialize Drop Zone
  function initializeDropZone() {
    const dropZone = document.querySelector('.file-upload');
    const fileInput = document.querySelector('#notes-file');
    
    if (!dropZone || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    function highlight() {
      dropZone.style.backgroundColor = '#f0f0f0';
      dropZone.style.borderColor = '#1095c1';
    }
    
    function unhighlight() {
      dropZone.style.backgroundColor = '';
      dropZone.style.borderColor = '#ccc';
    }
    
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      fileInput.files = files;
      
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  }
  
  // Validate Individual Field
  function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (!value) {
      showFieldError(field, 'This field is required');
      return false;
    }
    
    // Specific validations based on field type
    if (field.id === 'course-code') {
      const regex = /^[A-Z]{2,5}\d{3}$/;
      if (!regex.test(value)) {
        showFieldError(field, 'Course code should be in format: ABCDE123');
        return false;
      }
    }
    
    clearError(event);
    return true;
  }
  
  // Validate File Size
  function validateFileSize(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    if (file) {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        showFieldError(fileInput, 'File size exceeds 10MB limit');
        fileInput.value = ''; // Clear the file input
        return false;
      }
      
      // Check file type
      const acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!acceptedTypes.includes(file.type)) {
        showFieldError(fileInput, 'Only PDF, DOCX, and PPT files are accepted');
        fileInput.value = ''; // Clear the file input
        return false;
      }
      
      clearError(event);
    }
    
    return true;
  }
  
  // Show Field Error
  function showFieldError(field, message) {
    // Clear any existing error
    clearErrorForField(field);
    
    // Create error message element
    const errorElement = document.createElement('small');
    errorElement.className = 'error-message';
    errorElement.style.color = 'red';
    errorElement.textContent = message;
    
    // Insert after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Add error class to the field
    field.classList.add('error');
  }
  
  // Clear Error on Input
  function clearError(event) {
    clearErrorForField(event.target);
  }
  
  // Clear Error for Field
  function clearErrorForField(field) {
    // Remove error class from field
    field.classList.remove('error');
    
    // Find and remove error message
    const errorElement = field.nextSibling;
    if (errorElement && errorElement.className === 'error-message') {
      errorElement.remove();
    }
  }
  
  // Handle Form Submit
  function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all required fields
    const requiredFields = event.target.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (field.type === 'file') {
        if (!field.files || field.files.length === 0) {
          showFieldError(field, 'Please select a file');
          isValid = false;
        }
      } else {
        const fieldValue = field.value.trim();
        if (!fieldValue) {
          showFieldError(field, 'This field is required');
          isValid = false;
        }
      }
    });
    
    if (isValid) {
      // Create FormData object for file upload
      const form = event.target;
      const formData = new FormData(form);
      
      // Map form field names to API expected names
      formData.set('courseCode', form.querySelector('#course-code').value);
      formData.set('courseName', form.querySelector('#course-name').value);
      formData.set('title', form.querySelector('#note-title').value);
      formData.set('description', form.querySelector('#description').value);
      formData.set('instructor', form.querySelector('#instructor').value);
      formData.set('noteType', form.querySelector('#note-type').value);
      formData.set('semester', form.querySelector('#semester').value);
      formData.set('topics', form.querySelector('#topics-covered').value);
      formData.append('file', form.querySelector('#notes-file').files[0]);
      
      // Show loading state
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
          <div class="spinner"></div>
          <p>Uploading note...</p>
        </div>
      `;
      form.prepend(loadingIndicator);
      
      // Submit the form to the API
      fetch('api/notes/create.php', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'Failed to create note');
          });
        }
        return response.json();
      })
      .then(data => {
        // Show success message
        loadingIndicator.remove();
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
          <div style="background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <p><strong>Success!</strong> Your notes have been submitted.</p>
            <p>You will be redirected to the notes page in a few seconds...</p>
          </div>
        `;
        
        // Insert at the top of the form
        form.prepend(successMessage);
        
        // Redirect after a delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 3000);
      })
      .catch(error => {
        // Show error message
        loadingIndicator.remove();
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.marginBottom = '1rem';
        errorMessage.innerHTML = `
          <div style="background-color: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <p><strong>Error:</strong> ${error.message || 'Failed to create note'}</p>
          </div>
        `;
        form.prepend(errorMessage);
        
        console.error('API Error:', error);
      });
    }
  }
  
  // Load Note Details
  async function loadNoteDetails() {
    // Get note ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    
    if (!noteId) {
      displayNotFoundMessage();
      return;
    }
    
    // Show loading state
    const article = document.querySelector('article');
    article.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div class="spinner"></div>
        <p>Loading note details...</p>
      </div>
    `;
    
    try {
      // Fetch data from our API
      const response = await fetch(`api/notes/get.php?id=${noteId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const note = await response.json();
      
      // Render note details
      renderNoteDetails(note);
    } catch (error) {
      console.error('Error loading note details:', error);
      article.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h2>Error Loading Note</h2>
          <p>There was a problem loading the note details. Please try again later.</p>
          <a href="index.html" role="button">Back to Notes</a>
        </div>
      `;
    }
  }
    
  
  // Render Note Details
  function renderNoteDetails(note) {
    const article = document.querySelector('article');
    
    let topicsHtml = '';
    if (note.topics && note.topics.length > 0) {
      topicsHtml = `
        <h3>Topics Covered</h3>
        <ul>
          ${note.topics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
      `;
    }
    
    let commentsHtml = '';
    if (note.comments && note.comments.length > 0) {
      commentsHtml = note.comments.map(comment => `
        <div class="comment">
          <div class="comment-header">
            <strong>${comment.user}</strong>
            <span>${comment.date}</span>
          </div>
          <p>${comment.text}</p>
        </div>
      `).join('');
    } else {
      commentsHtml = `<p>No comments yet. Be the first to leave feedback!</p>`;
    }
    
    article.innerHTML = `
      <header>
        <h1>${note.courseCode} - ${note.title}</h1>
        <p>
          <span class="tag">${getTypeLabel(note.type)}</span>
          <span class="tag">${getSemesterLabel(note.semester)}</span>
        </p>
        <p class="metadata">
          Uploaded by: ${note.uploadedBy} • ${note.uploadDate} • ${note.pages} pages
        </p>
      </header>
  
      <section>
        <h2>Description</h2>
        <p>${note.description}</p>
  
        ${topicsHtml}
  
        <div class="note-preview">
          <div style="text-align: center;">
            <img src="/api/placeholder/400/320" alt="PDF preview placeholder">
            <p>Preview of notes (PDF file)</p>
          </div>
        </div>
  
        <div class="grid">
          <div>
            <div class="rating">
              <span>Average Rating:</span>
              <span class="star">${getRatingStars(note.rating)}</span>
              <span>(${note.rating.toFixed(1)}/5 from ${note.ratingCount} ratings)</span>
            </div>
            
            <div class="user-rating">
              <span>Rate these notes:</span>
              <div class="star-rating" id="user-star-rating">
                <span class="star" data-value="1">★</span>
                <span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span>
                <span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
              <span id="rating-message"></span>
            </div>
          </div>
          <div style="text-align: right;">
            <a href="api/notes/download.php?id=${note.id}" role="button">Download Notes</a>
          </div>
        </div>
  
        <div class="action-buttons">
          <a href="#" role="button" class="secondary">Edit</a>
          <a href="#" role="button" class="contrast">Delete</a>
        </div>
      </section>
  
      <section>
        <h2>Comments and Feedback</h2>
  
        ${commentsHtml}
  
        <form id="comment-form">
          <label for="new-comment">Add a Comment</label>
          <textarea id="new-comment" name="comment" placeholder="Share your thoughts or ask a question..."></textarea>
          <button type="submit">Post Comment</button>
        </form>
      </section>
    `;
    
    // Add submit handler for the comment form
    const commentForm = document.querySelector('#comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', handleCommentSubmit);
    }
    
    // Initialize star rating functionality
    initializeStarRating();
  }
  
  // Helper function to generate star rating HTML
  function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '★';
    }
    
    // Add half star if needed
    if (halfStar) {
      starsHtml += '★'; // Note: We're using the full star here because we don't have a half-star character
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '☆';
    }
    
    return starsHtml;
  }
  
  // Initialize Star Rating
  function initializeStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
  const ratingMessage = document.getElementById('rating-message');
  
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const value = parseInt(this.getAttribute('data-value'));
      
      // Get note ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const noteId = urlParams.get('id');
      
      // Submit rating to API
      fetch('api/notes/rate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          noteId: noteId,
          rating: value
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to submit rating');
        }
        return response.json();
      })
      .then(data => {
        // Remove active class from all stars
        stars.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked star and all stars before it
        stars.forEach(s => {
          if (parseInt(s.getAttribute('data-value')) <= value) {
            s.classList.add('active');
          }
        });
        
        // Show thank you message
        ratingMessage.textContent = `Thanks for rating ${value}/5!`;
        
        // Update average rating display
        const ratingSpan = document.querySelector('.rating .star');
        const ratingCountSpan = document.querySelector('.rating span:last-child');
        
        if (ratingSpan && ratingCountSpan) {
          ratingSpan.innerHTML = getRatingStars(data.rating.average);
          ratingCountSpan.textContent = `(${data.rating.average}/5 from ${data.rating.count} ratings)`;
        }
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
      });
    });
    
      
      // Hover effect
      star.addEventListener('mouseover', function() {
        const value = parseInt(this.getAttribute('data-value'));
        
        stars.forEach(s => {
          if (parseInt(s.getAttribute('data-value')) <= value) {
            s.style.color = '#ffcc00';
          } else {
            s.style.color = '#ccc';
          }
        });
      });
      
      // Reset on mouseout if not already rated
      star.addEventListener('mouseout', function() {
        if (!document.querySelector('.star-rating .star.active')) {
          stars.forEach(s => {
            s.style.color = '#ccc';
          });
        } else {
          stars.forEach(s => {
            if (s.classList.contains('active')) {
              s.style.color = '#ffcc00';
            } else {
              s.style.color = '#ccc';
            }
          });
        }
      });
    });
  }
  
  // Handle Comment Submit
  function handleCommentSubmit(event) {
  event.preventDefault();
  
  const commentInput = document.querySelector('#new-comment');
  const comment = commentInput.value.trim();
  
  if (!comment) {
    alert('Please enter a comment');
    return;
  }
  
  // Get note ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = urlParams.get('id');
  
  // Submit comment to API
  fetch('api/notes/comment.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      noteId: noteId,
      comment: comment
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    return response.json();
  })
  .then(data => {
    // Create new comment element
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <div class="comment-header">
        <strong>${data.comment.user}</strong>
        <span>${data.comment.date}</span>
      </div>
      <p>${data.comment.text}</p>
    `;
    
    // Add comment to the list (before the form)
    const commentForm = document.querySelector('#comment-form');
    commentForm.parentNode.insertBefore(commentElement, commentForm);
    
    // Clear input
    commentInput.value = '';
  })
  .catch(error => {
    alert(`Error: ${error.message}`);
  });
}

// Mock Notes Data Function
function getMockNotes() {
  return [
    {
      id: 1,
      courseCode: 'ITCS333',
      courseName: 'Database Systems',
      title: 'SQL Fundamentals',
      type: 'lecture',
      semester: 'spring2025',
      uploadedBy: 'Ahmed Ali',
      uploadDate: 'Mar 29, 2025',
      pages: 15,
      description: 'Comprehensive notes on SQL queries, joins, and database normalization from weeks 3-5.',
      instructor: 'Dr. Hassan',
      topics: [
        "SQL Queries", "Database Normalization", "Joins"
      ],
      rating: 4.2,
      ratingCount: 15
    },
    {
      id: 2,
      courseCode: 'ITCS214',
      courseName: 'Data Structures',
      title: 'Final Exam Study Guide',
      type: 'study-guide',
      semester: 'spring2025',
      uploadedBy: 'Fatima Hussein',
      uploadDate: 'Apr 2, 2025',
      pages: 8,
      description: 'Complete study guide covering trees, graphs, sorting algorithms and practice problems.',
      instructor: 'Dr. Noor',
      topics: [
        "Trees", "Graphs", "Sorting Algorithms"
      ],
      rating: 4.8,
      ratingCount: 10
    },
    {
      id: 3,
      courseCode: 'ITCS380',
      courseName: 'Software Engineering',
      title: 'Agile Methodology',
      type: 'lecture',
      semester: 'spring2025',
      uploadedBy: 'Mohammed Rafiq',
      uploadDate: 'Mar 15, 2025',
      pages: 12,
      description: 'Detailed notes on Scrum, Kanban, and XP with real-world examples.',
      instructor: 'Prof. Khalid',
      topics: [
        "Agile", "Scrum", "Kanban"
      ],
      rating: 3.9,
      ratingCount: 8
    }
  ];
}

  // Mock Notes Data for Development
function getMockNotes() {
  return [
    {
      id: 1,
      courseCode: 'ITCS333',
      courseName: 'Database Systems',
      title: 'SQL Fundamentals',
      type: 'lecture',
      semester: 'spring2025',
      uploadedBy: 'Ahmed Ali',
      uploadDate: 'Mar 29, 2025',
      pages: 15,
      description: 'Comprehensive notes on SQL queries, joins, and database normalization from weeks 3-5.',
      instructor: 'Dr. Hassan',
      topics: [
        "Basic SQL Queries (SELECT, FROM, WHERE)",
        "SQL Joins and Relationships",
        "Aggregate Functions",
        "Database Normalization (1NF to 3NF)",
        "Indexing and Query Optimization"
      ],
      rating: 4.2,
      ratingCount: 15,
      comments: [
        {
          user: "Layla Mohamed",
          date: "April 5, 2025",
          text: "These notes saved me! The examples for SQL joins were much clearer than what was covered in class. Thank you for sharing!"
        },
        {
          user: "Omar Khalid",
          date: "April 2, 2025",
          text: "Great explanations for normalization. Could you possibly add more examples for 3NF? That part was a bit confusing for me."
        }
      ]
    },
    {
      id: 2,
      courseCode: 'ITCS214',
      courseName: 'Data Structures',
      title: 'Final Exam Study Guide',
      type: 'study-guide',
      semester: 'spring2025',
      uploadedBy: 'Fatima Hussein',
      uploadDate: 'Apr 2, 2025',
      pages: 8,
      description: 'Complete study guide covering trees, graphs, sorting algorithms and practice problems.',
      instructor: 'Dr. Noor',
      topics: [
        "Binary Trees and Tree Traversal",
        "Graph Algorithms",
        "Sorting Algorithms (Quick Sort, Merge Sort)",
        "Time and Space Complexity Analysis",
        "Practice Problems with Solutions"
      ],
      rating: 4.8,
      ratingCount: 10,
      comments: [
        {
          user: "Ali Mohammed",
          date: "April 10, 2025",
          text: "This study guide is so well organized! The practice problems really helped me prepare for the exam."
        }
      ]
    },
    {
      id: 3,
      courseCode: 'ITCS380',
      courseName: 'Software Engineering',
      title: 'Agile Methodology',
      type: 'lecture',
      semester: 'spring2025',
      uploadedBy: 'Mohammed Rafiq',
      uploadDate: 'Mar 15, 2025',
      pages: 12,
      description: 'Detailed notes on Scrum, Kanban, and XP with real-world examples.',
      instructor: 'Prof. Khalid',
      topics: [
        "Agile Principles and Manifesto",
        "Scrum Framework",
        "Kanban Method",
        "Extreme Programming (XP)",
        "Comparing Agile Approaches",
        "Case Studies"
      ],
      rating: 3.9,
      ratingCount: 8,
      comments: [
        {
          user: "Sara Al-Farsi",
          date: "March 20, 2025",
          text: "The case studies were especially helpful in understanding how these methodologies are applied in real projects."
        }
      ]
    }
  ];
}