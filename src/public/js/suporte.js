// Suporte page functionality
document.addEventListener('DOMContentLoaded', () => {
    setupSuporteEventListeners();
    loadTickets();
});

function setupSuporteEventListeners() {
    // New ticket button
    const newTicketBtn = document.getElementById('newTicketBtn');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', showNewTicketModal);
    }
    
    // New ticket form
    const newTicketForm = document.getElementById('newTicketForm');
    if (newTicketForm) {
        newTicketForm.addEventListener('submit', handleNewTicket);
    }
    
    // Modal close
    const modalClose = document.querySelector('#newTicketModal .modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeNewTicketModal);
    }
    
    // Search and filters
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('input', utils.debounce(() => {
            loadTickets();
        }, 500));
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadTickets();
        });
    }
}

async function loadTickets() {
    const tableBody = document.getElementById('ticketsTable');
    if (!tableBody) return;

    try {
        // Show loading
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Carregando tickets...</td></tr>';
        
        // Mock tickets data - replace with actual API call
        const tickets = [
            {
                id: '1',
                assunto: 'Problema com login',
                status: 'ABERTO',
                autor: 'João Silva',
                createdAt: new Date(),
                mensagem: 'Não consigo fazer login na conta'
            },
            {
                id: '2', 
                assunto: 'Dúvida sobre contrato',
                status: 'RESOLVIDO',
                autor: 'Maria Santos',
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                mensagem: 'Como posso alterar dados do contrato?'
            }
        ];
        
        tableBody.innerHTML = '';
        
        if (tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum ticket encontrado</td></tr>';
            return;
        }
        
        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            
            const statusClass = `status-${ticket.status.toLowerCase().replace('_', '')}`;
            const statusText = {
                'ABERTO': 'Aberto',
                'EM_ANDAMENTO': 'Em Andamento',
                'RESOLVIDO': 'Resolvido',
                'FECHADO': 'Fechado'
            }[ticket.status] || ticket.status;
            
            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td>
                    <span class="client-name" onclick="viewTicket('${ticket.id}')">
                        ${ticket.assunto}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>${ticket.autor}</td>
                <td>${utils.formatDate(ticket.createdAt)}</td>
                <td>
                    <button class="btn btn-sm" onclick="viewTicket('${ticket.id}')">
                        Ver
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Failed to load tickets:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar tickets</td></tr>';
    }
}

function showNewTicketModal() {
    const modal = document.getElementById('newTicketModal');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('ticketSubject').focus();
    }
}

function closeNewTicketModal() {
    const modal = document.getElementById('newTicketModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('newTicketForm').reset();
    }
}

async function handleNewTicket(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    if (!data.subject.trim() || !data.message.trim()) {
        utils.showAlert('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    utils.showLoading(submitBtn);
    
    try {
        // Mock ticket creation - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('Ticket criado com sucesso!', 'success');
        closeNewTicketModal();
        
        // Reload tickets
        await loadTickets();
        
    } catch (error) {
        console.error('Failed to create ticket:', error);
        utils.showAlert('Erro ao criar ticket. Tente novamente.', 'error');
    } finally {
        utils.hideLoading(submitBtn);
    }
}

function viewTicket(ticketId) {
    utils.showAlert('Funcionalidade de visualização de ticket em desenvolvimento.', 'warning');
}

// Make functions available globally
window.closeNewTicketModal = closeNewTicketModal;
window.viewTicket = viewTicket;