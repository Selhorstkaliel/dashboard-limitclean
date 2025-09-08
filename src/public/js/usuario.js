// User account page functionality
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize user account page
    await initializeAccountPage();
    
    // Set up event listeners
    setupAccountEventListeners();
});

async function initializeAccountPage() {
    try {
        // Get current user data
        currentUser = utils.getUser();
        
        if (currentUser) {
            // Load user profile data
            await loadUserProfile();
            
            // Load active sessions
            await loadActiveSessions();
            
            // Load user tokens
            await loadUserTokens();
            
            // Check 2FA status
            await check2FAStatus();
        }
    } catch (error) {
        console.error('Failed to initialize account page:', error);
        utils.showAlert('Erro ao carregar configurações da conta.', 'error');
    }
}

async function loadUserProfile() {
    try {
        // For now, use data from localStorage
        // In production, you'd fetch from /account/profile
        const user = currentUser;
        
        if (user) {
            document.getElementById('nome').value = user.nome || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('cpfCnpj').value = utils.formatCpfCnpj(user.cpfCnpj) || '';
            document.getElementById('papel').value = user.papel || '';
            
            // Update avatar if available
            if (user.avatarPath) {
                document.getElementById('avatarPreview').src = user.avatarPath;
                document.getElementById('userAvatar').src = user.avatarPath;
            }
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

async function loadActiveSessions() {
    const sessionsContainer = document.getElementById('activeSessions');
    if (!sessionsContainer) return;
    
    try {
        // Mock sessions data - replace with actual API call
        const sessions = [
            {
                id: '1',
                userAgent: 'Chrome 120 on Windows 10',
                ip: '192.168.1.100',
                createdAt: new Date(),
                current: true
            }
        ];
        
        sessionsContainer.innerHTML = '';
        
        sessions.forEach(session => {
            const sessionElement = createSessionElement(session);
            sessionsContainer.appendChild(sessionElement);
        });
        
    } catch (error) {
        console.error('Failed to load sessions:', error);
        sessionsContainer.innerHTML = '<div class="text-center text-muted">Erro ao carregar sessões</div>';
    }
}

function createSessionElement(session) {
    const div = document.createElement('div');
    div.className = 'session-item';
    
    const isCurrent = session.current ? ' (Atual)' : '';
    
    div.innerHTML = `
        <div class="session-info">
            <div class="session-title">${session.userAgent}${isCurrent}</div>
            <div class="session-details">
                IP: ${session.ip} • ${utils.formatDateTime(session.createdAt)}
            </div>
        </div>
        <div class="session-actions">
            <button onclick="revokeSession('${session.id}')" ${session.current ? 'disabled' : ''}>
                ${session.current ? 'Sessão Atual' : 'Revogar'}
            </button>
        </div>
    `;
    
    return div;
}

async function loadUserTokens() {
    const tokensContainer = document.getElementById('tokensList');
    if (!tokensContainer) return;
    
    try {
        // Mock tokens data - replace with actual API call
        const tokens = [];
        
        tokensContainer.innerHTML = '';
        
        if (tokens.length === 0) {
            tokensContainer.innerHTML = '<div class="text-center text-muted">Nenhum token criado</div>';
        } else {
            tokens.forEach(token => {
                const tokenElement = createTokenElement(token);
                tokensContainer.appendChild(tokenElement);
            });
        }
        
    } catch (error) {
        console.error('Failed to load tokens:', error);
        tokensContainer.innerHTML = '<div class="text-center text-muted">Erro ao carregar tokens</div>';
    }
}

function createTokenElement(token) {
    const div = document.createElement('div');
    div.className = 'token-item';
    
    div.innerHTML = `
        <div class="token-info">
            <div class="token-name">${token.name}</div>
            <div class="token-details">
                Criado em ${utils.formatDate(token.createdAt)} • Último uso: ${token.lastUsed ? utils.formatDateTime(token.lastUsed) : 'Nunca'}
            </div>
        </div>
        <div class="token-scope ${token.scope}">
            ${token.scope === 'read' ? 'Leitura' : 'Leitura e Escrita'}
        </div>
        <div class="token-actions">
            <button onclick="revokeToken('${token.id}')" class="delete-btn" title="Revogar token">
                🗑️
            </button>
        </div>
    `;
    
    return div;
}

async function check2FAStatus() {
    // Mock 2FA status check - replace with actual API call
    const is2FAEnabled = currentUser?.twofaEnabled || false;
    
    const statusIndicator = document.getElementById('2faStatus');
    const setupSection = document.getElementById('2faSetup');
    const disableSection = document.getElementById('2faDisable');
    
    if (is2FAEnabled) {
        statusIndicator.innerHTML = `
            <div class="status-on">
                <span class="status-icon">✅</span>
                <span>2FA Ativado</span>
            </div>
        `;
        setupSection.style.display = 'none';
        disableSection.style.display = 'block';
    } else {
        statusIndicator.innerHTML = `
            <div class="status-off">
                <span class="status-icon">⚠️</span>
                <span>2FA Desativado</span>
            </div>
        `;
        setupSection.style.display = 'block';
        disableSection.style.display = 'none';
    }
}

function setupAccountEventListeners() {
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
            }
        }
    });
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
    
    // Avatar file input
    const avatarFile = document.getElementById('avatarFile');
    if (avatarFile) {
        avatarFile.addEventListener('change', handleAvatarChange);
    }
    
    // 2FA setup
    const enable2faBtn = document.getElementById('enable2faBtn');
    if (enable2faBtn) {
        enable2faBtn.addEventListener('click', handle2FASetup);
    }
    
    const verify2faBtn = document.getElementById('verify2faBtn');
    if (verify2faBtn) {
        verify2faBtn.addEventListener('click', handle2FAVerify);
    }
    
    const cancel2faBtn = document.getElementById('cancel2faBtn');
    if (cancel2faBtn) {
        cancel2faBtn.addEventListener('click', cancel2FASetup);
    }
    
    const disable2faBtn = document.getElementById('disable2faBtn');
    if (disable2faBtn) {
        disable2faBtn.addEventListener('click', handle2FADisable);
    }
    
    // Revoke all sessions
    const revokeAllBtn = document.getElementById('revokeAllBtn');
    if (revokeAllBtn) {
        revokeAllBtn.addEventListener('click', handleRevokeAllSessions);
    }
    
    // Create token
    const createTokenBtn = document.getElementById('createTokenBtn');
    if (createTokenBtn) {
        createTokenBtn.addEventListener('click', showCreateTokenModal);
    }
    
    const createTokenForm = document.getElementById('createTokenForm');
    if (createTokenForm) {
        createTokenForm.addEventListener('submit', handleCreateToken);
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        nome: formData.get('nome'),
        email: formData.get('email')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    utils.showLoading(submitBtn);
    
    try {
        // Mock profile update - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update user data
        currentUser.nome = data.nome;
        currentUser.email = data.email;
        utils.setUser(currentUser);
        
        // Update header
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = data.nome;
        }
        
        utils.showAlert('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('Failed to update profile:', error);
        utils.showAlert('Erro ao atualizar perfil.', 'error');
    } finally {
        utils.hideLoading(submitBtn);
    }
}

async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        utils.showAlert('As senhas não coincidem.', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        utils.showAlert('A nova senha deve ter pelo menos 8 caracteres.', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    utils.showLoading(submitBtn);
    
    try {
        // Mock password change - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('Senha alterada com sucesso!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Failed to change password:', error);
        utils.showAlert('Erro ao alterar senha.', 'error');
    } finally {
        utils.hideLoading(submitBtn);
    }
}

function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        utils.showAlert('Por favor, selecione um arquivo de imagem.', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        utils.showAlert('A imagem deve ter no máximo 2MB.', 'error');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const avatarPreview = document.getElementById('avatarPreview');
        const userAvatar = document.getElementById('userAvatar');
        
        if (avatarPreview) avatarPreview.src = e.target.result;
        if (userAvatar) userAvatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // TODO: Upload file to server
    utils.showAlert('Upload de avatar em desenvolvimento.', 'warning');
}

async function handle2FASetup() {
    const qrSection = document.getElementById('qrCodeSection');
    const enable2faBtn = document.getElementById('enable2faBtn');
    
    enable2faBtn.style.display = 'none';
    qrSection.style.display = 'block';
    
    // TODO: Generate QR code
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '<div class="text-center">QR Code será gerado aqui</div>';
    
    utils.showAlert('Funcionalidade de 2FA em desenvolvimento.', 'warning');
}

async function handle2FAVerify() {
    const totpCode = document.getElementById('totpCode').value;
    
    if (!totpCode || totpCode.length !== 6) {
        utils.showAlert('Digite o código de 6 dígitos.', 'error');
        return;
    }
    
    try {
        // Mock 2FA verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('2FA ativado com sucesso!', 'success');
        
        // Update UI
        currentUser.twofaEnabled = true;
        utils.setUser(currentUser);
        await check2FAStatus();
        
        // Show backup codes
        showBackupCodes();
        
    } catch (error) {
        console.error('Failed to verify 2FA:', error);
        utils.showAlert('Código inválido.', 'error');
    }
}

function cancel2FASetup() {
    const qrSection = document.getElementById('qrCodeSection');
    const enable2faBtn = document.getElementById('enable2faBtn');
    
    qrSection.style.display = 'none';
    enable2faBtn.style.display = 'inline-block';
    
    document.getElementById('totpCode').value = '';
}

function showBackupCodes() {
    const backupCodes = document.getElementById('backupCodes');
    const backupList = document.getElementById('backupCodesList');
    
    // Mock backup codes
    const codes = [
        'ABC123', 'DEF456', 'GHI789',
        'JKL012', 'MNO345', 'PQR678'
    ];
    
    backupList.innerHTML = '';
    codes.forEach(code => {
        const codeElement = document.createElement('div');
        codeElement.className = 'backup-code';
        codeElement.textContent = code;
        backupList.appendChild(codeElement);
    });
    
    backupCodes.style.display = 'block';
}

async function handle2FADisable() {
    if (!confirm('Tem certeza que deseja desativar o 2FA? Isso reduzirá a segurança da sua conta.')) {
        return;
    }
    
    try {
        // Mock 2FA disable
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentUser.twofaEnabled = false;
        utils.setUser(currentUser);
        await check2FAStatus();
        
        utils.showAlert('2FA desativado.', 'warning');
    } catch (error) {
        console.error('Failed to disable 2FA:', error);
        utils.showAlert('Erro ao desativar 2FA.', 'error');
    }
}

async function handleRevokeAllSessions() {
    if (!confirm('Tem certeza que deseja revogar todas as sessões? Você será desconectado de todos os dispositivos.')) {
        return;
    }
    
    try {
        // Mock revoke all sessions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('Todas as sessões foram revogadas. Você será redirecionado para o login.', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            utils.logout();
        }, 2000);
    } catch (error) {
        console.error('Failed to revoke sessions:', error);
        utils.showAlert('Erro ao revogar sessões.', 'error');
    }
}

async function revokeSession(sessionId) {
    if (!confirm('Tem certeza que deseja revogar esta sessão?')) {
        return;
    }
    
    try {
        // Mock session revocation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('Sessão revogada com sucesso.', 'success');
        await loadActiveSessions();
    } catch (error) {
        console.error('Failed to revoke session:', error);
        utils.showAlert('Erro ao revogar sessão.', 'error');
    }
}

function showCreateTokenModal() {
    const modal = document.getElementById('createTokenModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeCreateTokenModal() {
    const modal = document.getElementById('createTokenModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('createTokenForm').reset();
    }
}

async function handleCreateToken(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('tokenName'),
        scope: formData.get('tokenScope')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    utils.showLoading(submitBtn);
    
    try {
        // Mock token creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newToken = 'lcl_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Show token to user
        showNewToken(newToken, data.name);
        
        closeCreateTokenModal();
        await loadUserTokens();
        
    } catch (error) {
        console.error('Failed to create token:', error);
        utils.showAlert('Erro ao criar token.', 'error');
    } finally {
        utils.hideLoading(submitBtn);
    }
}

function showNewToken(token, name) {
    const alertDiv = document.getElementById('alertMessage');
    
    alertDiv.className = 'alert success';
    alertDiv.innerHTML = `
        <div class="new-token-display">
            <h4>Token criado com sucesso!</h4>
            <p>Nome: <strong>${name}</strong></p>
            <p><strong>⚠️ Importante:</strong> Copie este token agora. Ele não será exibido novamente.</p>
            <div class="token-value">${token}</div>
            <button class="btn copy-token-btn" onclick="copyToken('${token}')">
                📋 Copiar Token
            </button>
        </div>
    `;
    alertDiv.style.display = 'block';
    
    // Auto hide after 30 seconds
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 30000);
}

function copyToken(token) {
    navigator.clipboard.writeText(token).then(() => {
        utils.showAlert('Token copiado para a área de transferência!', 'success');
    }).catch(() => {
        utils.showAlert('Falha ao copiar token.', 'error');
    });
}

async function revokeToken(tokenId) {
    if (!confirm('Tem certeza que deseja revogar este token? Aplicações usando este token não conseguirão mais acessar a API.')) {
        return;
    }
    
    try {
        // Mock token revocation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showAlert('Token revogado com sucesso.', 'success');
        await loadUserTokens();
    } catch (error) {
        console.error('Failed to revoke token:', error);
        utils.showAlert('Erro ao revogar token.', 'error');
    }
}

// Make functions available globally
window.revokeSession = revokeSession;
window.revokeToken = revokeToken;
window.copyToken = copyToken;
window.closeCreateTokenModal = closeCreateTokenModal;