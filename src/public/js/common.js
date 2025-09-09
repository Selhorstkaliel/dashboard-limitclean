// Common utilities and API functions
class API {
    constructor() {
        this.baseURL = '';
        this.token = localStorage.getItem('accessToken');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

// Global API instance
const api = new API();

// Utility functions
const utils = {
    // Format CPF/CNPJ
    formatCpfCnpj(value) {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        
        if (numbers.length <= 11) {
            // CPF format
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
            // CNPJ format
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
    },

    // Format currency
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Format date
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...options
        }).format(new Date(date));
    },

    // Format date time
    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Show alert
    showAlert(message, type = 'info', element = null) {
        const alertElement = element || document.getElementById('alertMessage');
        if (!alertElement) return;

        alertElement.className = `alert ${type}`;
        alertElement.textContent = message;
        alertElement.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    },

    // Show loading spinner
    showLoading(button) {
        const spinner = button.querySelector('.spinner');
        const text = button.querySelector('.btn-text');
        
        if (spinner) spinner.style.display = 'block';
        if (text) text.style.display = 'none';
        button.disabled = true;
    },

    // Hide loading spinner
    hideLoading(button) {
        const spinner = button.querySelector('.spinner');
        const text = button.querySelector('.btn-text');
        
        if (spinner) spinner.style.display = 'none';
        if (text) text.style.display = 'inline';
        button.disabled = false;
    },

    // Check authentication
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Logout
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    // Get user data
    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // Set user data
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate pagination
    generatePagination(currentPage, totalPages, onPageChange) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        pagination.innerHTML = '';

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '‹ Anterior';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => onPageChange(currentPage - 1);
        pagination.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === currentPage ? 'active' : '';
            pageBtn.onclick = () => onPageChange(i);
            pagination.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Próxima ›';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => onPageChange(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication for protected pages
    const protectedPages = ['index.html', 'cadastro.html', 'usuario.html', 'suporte.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (protectedPages.includes(currentPage)) {
        if (!utils.requireAuth()) {
            return;
        }

        // Set user info in header
        const user = utils.getUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = user.nome;
            }
        }

        // Set up logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?')) {
                    utils.logout();
                }
            });
        }
    }
});