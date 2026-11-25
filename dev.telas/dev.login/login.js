const formLogin = document.getElementById('form-login');
const mensagemLogin = document.getElementById('mensagem-login');
const senha = document.getElementById('senha');
const alternarSenha = document.querySelector('.password-toggle');

alternarSenha.addEventListener('click', () => {
  const mostrar = senha.type === 'password';
  senha.type = mostrar ? 'text' : 'password';
  alternarSenha.setAttribute('aria-pressed', String(mostrar));
  alternarSenha.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
});

formLogin.addEventListener('submit', async event => {
  event.preventDefault();
  const botao = formLogin.querySelector('[type="submit"]');
  botao.disabled = true;
  mensagemLogin.hidden = false;
  mensagemLogin.textContent = 'Entrando...';

  try {
    await window.DevAcademy.api('/api/login', {
      email: formLogin.elements.email.value,
      password: formLogin.elements.senha.value
    });
    location.replace('/home/home.html');
  } catch (error) {
    mensagemLogin.textContent = error.message;
    botao.disabled = false;
  }
});
