const formLogin = document.getElementById('form-login');
const mensagemLogin = document.getElementById('mensagem-login');

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
