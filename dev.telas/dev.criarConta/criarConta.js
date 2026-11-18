const formCadastro = document.getElementById('form-criar-conta');
const mensagemCadastro = document.getElementById('mensagem-cadastro');

formCadastro.addEventListener('submit', async event => {
  event.preventDefault();
  const botao = formCadastro.querySelector('[type="submit"]');
  botao.disabled = true;
  mensagemCadastro.hidden = false;
  mensagemCadastro.textContent = 'Criando sua conta...';

  try {
    const {recovery} = await window.DevAcademy.api('/api/register', {
      name: formCadastro.elements.nome.value,
      email: formCadastro.elements.email.value,
      password: formCadastro.elements.senha.value
    });
    mensagemCadastro.textContent = 'Conta criada. Guarde este código de recuperação em um local seguro: ' + recovery;
    formCadastro.reset();
  } catch (error) {
    mensagemCadastro.textContent = error.message;
    botao.disabled = false;
  }
});
