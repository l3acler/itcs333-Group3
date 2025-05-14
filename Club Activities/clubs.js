document.addEventListener('DOMContentLoaded', function() {
    const clubList = document.getElementById('clubList');
    const clubDetails = document.getElementById('clubDetails');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    const addClubBtn = document.getElementById('addClubBtn');
    const clubForm = document.getElementById('clubForm');
    const addClubModal = new bootstrap.Modal(document.getElementById('addClubModal'));
    
    const API_BASE_URL = 'https://e5f252c2-de2b-4f17-a365-0ef039fa2293-00-1ndxdydgdwt4a.pike.replit.dev/clubs';
    let currentPage = 1;
    const clubsPerPage = 6;
    let allClubs = [];
    let filteredClubs = [];
    
    init();
    
    function init() {
        loadClubs();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        searchInput.addEventListener('input', filterClubs);
        categoryFilter.addEventListener('change', filterClubs);
        sortBy.addEventListener('change', filterClubs);
        
        addClubBtn.addEventListener('click', () => {
            clubForm.reset();
            addClubModal.show();
        });
        
        clubForm.addEventListener('submit', handleFormSubmit);
    }
    
    async function loadClubs() {
        try {
            showLoading(true);
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error('Failed to fetch clubs');
            }
            
            const data = await response.json();
            allClubs = data.records || [];
            filterClubs();
        } catch (error) {
            console.error('Error loading clubs:', error);
            showError('Failed to load clubs. Please try again later.');
        } finally {
            showLoading(false);
        }
    }
    
    function filterClubs() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        filteredClubs = allClubs.filter(club => {
            const matchesSearch = club.name.toLowerCase().includes(searchTerm) || 
                                club.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || club.category === category;
            return matchesSearch && matchesCategory;
        });
        
        const sortValue = sortBy.value;
        if (sortValue === 'name') {
            filteredClubs.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filteredClubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        currentPage = 1;
        renderClubs();
        renderPagination();
    }
    
    function renderClubs() {
        clubList.innerHTML = '';
        
        if (filteredClubs.length === 0) {
            clubList.innerHTML = '<div class="col-12 text-center py-4"><p>No clubs found. Try adjusting your search.</p></div>';
            clubDetails.innerHTML = '<p class="text-muted">No clubs to display</p>';
            return;
        }
        
        const startIndex = (currentPage - 1) * clubsPerPage;
        const endIndex = Math.min(startIndex + clubsPerPage, filteredClubs.length);
        const clubsToDisplay = filteredClubs.slice(startIndex, endIndex);
        
        clubsToDisplay.forEach(club => {
            const clubCard = document.createElement('div');
            clubCard.className = 'col-md-6 mb-3';
            clubCard.innerHTML = `
                <div class="card h-100 club-card" data-id="${club.id}">
                    <div class="card-body">
                        <h5 class="card-title">${club.name}</h5>
                        <p class="card-text text-muted">${club.category}</p>
                        <p class="card-text">${club.description.substring(0, 100)}${club.description.length > 100 ? '...' : ''}</p>
                        <button class="btn btn-sm btn-outline-primary view-details">View Details</button>
                    </div>
                </div>
            `;
            clubList.appendChild(clubCard);
        });
        
        document.querySelectorAll('.club-card').forEach(card => {
            card.addEventListener('click', function() {
                const clubId = this.getAttribute('data-id');
                showClubDetails(clubId);
            });
        });
        
        if (clubsToDisplay.length > 0) {
            showClubDetails(clubsToDisplay[0].id);
        }
    }
    
    function renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        const totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
        
        if (totalPages <= 1) return;
        
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderClubs();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        pagination.appendChild(prevLi);
        
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderClubs();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(pageLi);
        }
        
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderClubs();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        pagination.appendChild(nextLi);
    }
    
    async function showClubDetails(clubId) {
        try {
            const club = filteredClubs.find(c => c.id == clubId);
            
            if (!club) {
                clubDetails.innerHTML = '<p class="text-danger">Club details not found</p>';
                return;
            }
            
            clubDetails.innerHTML = `
                <h4>${club.name}</h4>
                <p class="text-muted">${club.category}</p>
                <p><strong>Meeting Schedule:</strong> ${club.meeting_schedule || 'Not specified'}</p>
                <p><strong>Contact:</strong> ${club.contact_email || 'Not specified'}</p>
                <hr>
                <h5>Description</h5>
                <p>${club.description}</p>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-sm btn-outline-primary">Join Club</button>
                    <button class="btn btn-sm btn-outline-secondary">Contact Organizer</button>
                </div>
            `;
            
            document.querySelectorAll('.club-card').forEach(card => {
                card.classList.remove('border-primary');
                if (card.getAttribute('data-id') == clubId) {
                    card.classList.add('border-primary');
                }
            });
        } catch (error) {
            console.error('Error showing club details:', error);
            clubDetails.innerHTML = '<p class="text-danger">Failed to load club details</p>';
        }
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const clubData = {
            name: document.getElementById('clubName').value,
            description: document.getElementById('clubDescription').value,
            meeting_schedule: document.getElementById('clubSchedule').value,
            contact_email: document.getElementById('clubEmail').value,
            category: document.getElementById('clubCategory').value
        };
        
        try {
            showLoading(true);
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clubData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create club');
            }
            
            addClubModal.hide();
            await loadClubs(); 
            showSuccess('Club created successfully!');
        } catch (error) {
            console.error('Error creating club:', error);
            showError('Failed to create club. Please try again.');
        } finally {
            showLoading(false);
        }
    }
    
    function validateForm() {
        let isValid = true;
        const formElements = clubForm.elements;
        
        for (let element of formElements) {
            element.classList.remove('is-invalid');
        }
        
        if (!formElements['clubName'].value.trim()) {
            formElements['clubName'].classList.add('is-invalid');
            isValid = false;
        }
        
        if (!formElements['clubDescription'].value.trim()) {
            formElements['clubDescription'].classList.add('is-invalid');
            isValid = false;
        }
        
        if (formElements['clubEmail'].value && !isValidEmail(formElements['clubEmail'].value)) {
            formElements['clubEmail'].classList.add('is-invalid');
            isValid = false;
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
        clubList.style.display = show ? 'none' : 'flex';
    }
    
    function showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('main .container');
        container.prepend(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    function showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('main .container');
        container.prepend(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
});