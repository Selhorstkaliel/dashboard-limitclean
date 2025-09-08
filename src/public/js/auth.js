// Authentication functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const totpGroup = document.getElementById('totpGroup');
    const loginBtn = document.getElementById('loginBtn');

    if (!loginForm) return;

    let requires2FA = false;
    let tempToken = null;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const totpToken = formData.get('totpToken');

        if (!email || !password) {
            utils.showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        utils.showLoading(loginBtn);

        try {
            if (requires2FA && totpToken) {
                // Verify 2FA token
                await verify2FA(tempToken, totpToken);
            } else {
                // Initial login
                await performLogin(email, password);
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showAlert(error.message || 'Erro no login. Tente novamente.', 'error');
        } finally {
            utils.hideLoading(loginBtn);
        }
    });

    async function performLogin(email, password) {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        if (response.requires2FA) {
            // Show 2FA input
            requires2FA = true;
            tempToken = response.tempToken;
            totpGroup.style.display = 'block';
            
            const btnText = loginBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Verificar 2FA';
            }
            
            utils.showAlert('Digite o código do seu autenticador.', 'warning');
            document.getElementById('totpToken').focus();
        } else {
            // Login successful
            handleLoginSuccess(response);
        }
    }

    async function verify2FA(tempToken, totpToken) {
        const response = await api.post('/auth/2fa/verify', {
            tempToken,
            token: totpToken
        });

        handleLoginSuccess(response);
    }

    function handleLoginSuccess(response) {
        // Store tokens
        api.setToken(response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        utils.setUser(response.user);

        // Show success message
        utils.showAlert('Login realizado com sucesso!', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    // Handle forgot password
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            if (!email) {
                utils.showAlert('Por favor, digite seu e-mail primeiro.', 'warning');
                return;
            }

            // TODO: Implement forgot password functionality
            utils.showAlert('Funcionalidade de recuperação de senha em desenvolvimento.', 'warning');
        });
    }

    // Auto-focus first input
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }

    // Enter key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    });
});