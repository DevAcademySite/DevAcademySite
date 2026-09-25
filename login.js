const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que a página recarregue

    const emailDigitado = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('senha').value;

    if (emailDigitado === '' || senhaDigitada === '') {
        alert('Por favor, preencha todos os campos!');
        return; 
    }

    // Teste de login com redirecionamento
    if (emailDigitado === 'aluno@dev.academy' && senhaDigitada === '1234') {
        window.location.href = "quiz.teste.html"; // Redireciona para a próxima tela
    } else {
        alert('E-mail ou senha incorretos. Tente: aluno@dev.academy / 1234');
    }
});