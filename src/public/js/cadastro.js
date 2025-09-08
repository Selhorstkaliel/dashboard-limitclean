// Cadastro page functionality
document.addEventListener('DOMContentLoaded', () => {
    setupCadastroEventListeners();
    loadData('usuarios');
});

function setupCadastroEventListeners() {
    // Tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            // Show corresponding content
            const tabName = e.target.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
                loadData(tabName);
            }
        }
    });
}

async function loadData(type) {
    const tableBody = document.getElementById(`${type}Table`);
    if (!tableBody) return;

    try {
        // Show loading
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Carregando dados...</td></tr>';
        
        if (type === 'usuarios') {
            await loadUsuarios();
        } else if (type === 'clientes') {
            await loadClientes();
        }
        
    } catch (error) {
        console.error(`Failed to load ${type}:`, error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Erro ao carregar ${type}</td></tr>`;
    }
}

async function loadUsuarios() {
    const tableBody = document.getElementById('usuariosTable');
    
    try {
        // Mock data - replace with actual API call
        const usuarios = [
            {
                id: '1',
                nome: 'Kaliel Selhorst',
                email: 'kalielselhorst@example.com',
                papel: 'ADMIN',
                twofaEnabled: false,
                createdAt: new Date()
            }
        ];
        
        tableBody.innerHTML = '';
        
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.papel}</td>
                <td>
                    <span class="status-badge ${usuario.twofaEnabled ? 'status-finalizado' : 'status-restricao'}">
                        ${usuario.twofaEnabled ? 'Ativado' : 'Desativado'}
                    </span>
                </td>
                <td>${utils.formatDate(usuario.createdAt)}</td>
                <td>
                    <button class="btn btn-sm" onclick="editUser('${usuario.id}')">
                        Editar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        throw error;
    }
}

async function loadClientes() {
    const tableBody = document.getElementById('clientesTable');
    
    try {
        // Mock data - replace with actual API call
        const clientes = [];
        
        tableBody.innerHTML = '';
        
        if (clientes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente encontrado</td></tr>';
            return;
        }
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${utils.formatCpfCnpj(cliente.cpfCnpj)}</td>
                <td>${cliente.email || '-'}</td>
                <td>
                    <span class="status-badge status-${cliente.status.toLowerCase()}">
                        ${cliente.status}
                    </span>
                </td>
                <td>${utils.formatDate(cliente.createdAt)}</td>
                <td>
                    <button class="btn btn-sm" onclick="editClient('${cliente.id}')">
                        Editar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        throw error;
    }
}

function editUser(userId) {
    utils.showAlert('Funcionalidade de edição de usuário em desenvolvimento.', 'warning');
}

function editClient(clientId) {
    utils.showAlert('Funcionalidade de edição de cliente em desenvolvimento.', 'warning');
}

// Make functions available globally
window.editUser = editUser;
window.editClient = editClient;