// Dashboard functionality
let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize dashboard
    await initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

async function initializeDashboard() {
    try {
        // Load KPIs
        await loadKPIs();
        
        // Load charts
        await loadCharts();
        
        // Load recent clients
        await loadRecentClients();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        utils.showAlert('Erro ao carregar dashboard. Tente recarregar a página.', 'error');
    }
}

async function loadKPIs() {
    try {
        const metrics = await api.get('/dashboard/metrics');
        
        // Update KPI cards
        document.getElementById('totalClients').textContent = metrics.totalClients || 0;
        document.getElementById('clientsRestriction').textContent = metrics.clientsRestriction || 0;
        document.getElementById('clientsFinalized').textContent = metrics.clientsFinalized || 0;
        document.getElementById('activeContracts').textContent = metrics.activeContracts || 0;
        document.getElementById('openTickets').textContent = metrics.openTickets || 0;
    } catch (error) {
        console.error('Failed to load KPIs:', error);
        // Set default values
        document.getElementById('totalClients').textContent = '-';
        document.getElementById('clientsRestriction').textContent = '-';
        document.getElementById('clientsFinalized').textContent = '-';
        document.getElementById('activeContracts').textContent = '-';
        document.getElementById('openTickets').textContent = '-';
    }
}

async function loadCharts() {
    try {
        const chartsData = await api.get('/dashboard/charts');
        
        // Initialize charts (will be implemented in charts.js)
        if (window.initializeCharts) {
            window.initializeCharts(chartsData);
        }
    } catch (error) {
        console.error('Failed to load charts:', error);
    }
}

async function loadRecentClients(page = 1) {
    const tableBody = document.getElementById('recentClientsTable');
    if (!tableBody) return;

    try {
        // Show loading
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Carregando dados...</td></tr>';
        
        // Build query parameters
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...currentFilters
        });

        const response = await api.get(`/dashboard/recent?${params}`);
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (response.clients && response.clients.length > 0) {
            response.clients.forEach(client => {
                const row = createClientRow(client);
                tableBody.appendChild(row);
            });
            
            // Update pagination
            if (response.pagination) {
                utils.generatePagination(
                    response.pagination.page,
                    response.pagination.pages,
                    loadRecentClients
                );
            }
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente encontrado</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load recent clients:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
    }
}

function createClientRow(client) {
    const row = document.createElement('tr');
    
    const statusClass = `status-${client.status.toLowerCase()}`;
    const statusText = {
        'RESTRICAO': 'Restrição',
        'FINALIZADO': 'Finalizado',
        'REPROTOCOLO': 'Reprotocolo'
    }[client.status] || client.status;
    
    row.innerHTML = `
        <td>
            <span class="client-name" data-client-id="${client.id}">
                ${client.nome}
            </span>
        </td>
        <td>${utils.formatCpfCnpj(client.cpfCnpj)}</td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>${client.representante?.nome || '-'}</td>
        <td>${utils.formatDate(client.createdAt)}</td>
        <td>
            <button class="btn btn-sm" onclick="viewClientDetails('${client.id}')">
                Ver detalhes
            </button>
        </td>
    `;
    
    return row;
}

function setupEventListeners() {
    // Search filter
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('input', utils.debounce((e) => {
            currentFilters.search = e.target.value;
            loadRecentClients(1);
        }, 500));
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            loadRecentClients(1);
        });
    }
    
    // Client name click handler (using event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('client-name')) {
            const clientId = e.target.getAttribute('data-client-id');
            if (clientId) {
                viewClientDetails(clientId);
            }
        }
    });
    
    // Modal close handlers
    setupModalHandlers();
}

function setupModalHandlers() {
    const modal = document.getElementById('clientDetailModal');
    const closeBtn = modal?.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            // Load tab content
            const tabName = e.target.getAttribute('data-tab');
            loadTabContent(tabName);
        }
    });
}

async function viewClientDetails(clientId) {
    const modal = document.getElementById('clientDetailModal');
    const clientName = document.getElementById('clientName');
    const tabContent = document.getElementById('clientDetailContent');
    
    if (!modal || !clientId) return;
    
    try {
        // Show modal
        modal.classList.add('show');
        
        // Reset to first tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.tab-btn[data-tab="dados"]')?.classList.add('active');
        
        // Show loading
        if (clientName) clientName.textContent = 'Carregando...';
        if (tabContent) tabContent.innerHTML = '<div class="loading">Carregando detalhes do cliente...</div>';
        
        // Load client data
        const client = await api.get(`/clients/${clientId}`);
        
        if (clientName) clientName.textContent = client.nome;
        
        // Load default tab content
        loadTabContent('dados', client);
        
    } catch (error) {
        console.error('Failed to load client details:', error);
        utils.showAlert('Erro ao carregar detalhes do cliente.', 'error');
        modal.classList.remove('show');
    }
}

function loadTabContent(tabName, clientData = null) {
    const tabContent = document.getElementById('clientDetailContent');
    if (!tabContent) return;
    
    // Mock tab content for now
    const content = {
        'dados': generateDadosTab(clientData),
        'documentos': '<div class="text-center">Documentos em desenvolvimento</div>',
        'fotos': '<div class="text-center">Fotos em desenvolvimento</div>',
        'contratos': '<div class="text-center">Contratos em desenvolvimento</div>',
        'tickets': '<div class="text-center">Tickets em desenvolvimento</div>',
        'historico': '<div class="text-center">Histórico em desenvolvimento</div>'
    };
    
    tabContent.innerHTML = content[tabName] || '<div class="text-center">Conteúdo não encontrado</div>';
}

function generateDadosTab(client) {
    if (!client) {
        return '<div class="loading">Carregando dados do cliente...</div>';
    }
    
    return `
        <div class="client-details">
            <div class="details-grid">
                <div class="detail-item">
                    <label>Nome:</label>
                    <span>${client.nome}</span>
                </div>
                <div class="detail-item">
                    <label>CPF/CNPJ:</label>
                    <span>${utils.formatCpfCnpj(client.cpfCnpj)}</span>
                </div>
                <div class="detail-item">
                    <label>E-mail:</label>
                    <span>${client.email || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge status-${client.status.toLowerCase()}">
                        ${client.status}
                    </span>
                </div>
                <div class="detail-item">
                    <label>Data de Criação:</label>
                    <span>${utils.formatDateTime(client.createdAt)}</span>
                </div>
                <div class="detail-item">
                    <label>Última Atualização:</label>
                    <span>${utils.formatDateTime(client.updatedAt)}</span>
                </div>
            </div>
        </div>
    `;
}

// Refresh dashboard data
async function refreshDashboard() {
    await initializeDashboard();
}

// Make functions available globally
window.viewClientDetails = viewClientDetails;
window.refreshDashboard = refreshDashboard;