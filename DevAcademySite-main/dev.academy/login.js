document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o formulário de login
    const loginForm = document.querySelector('form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Impede o recarregamento padrão do formulário
            e.preventDefault();

            // Pega os campos de entrada (email e senha)
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');

            // Validação simples dos campos
            if (emailInput && !emailInput.value) {
                alert('Por favor, preencha o campo de e-mail.');
                emailInput.focus();
                return;
            }

            if (passwordInput && !passwordInput.value) {
                alert('Por favor, preencha o campo de senha.');
                passwordInput.focus();
                return;
            }

            // Mensagem de sucesso (opcional)
            console.log('Login efetuado com sucesso!');

            // Redireciona para a Home Page (home.html)
            window.location.href = '/home.html';        });
    }
});