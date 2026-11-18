const formRecuperacao = document.getElementById('form-recuperar');
const mensagemRecuperacao = document.getElementById('mensagem-recuperacao');
const botaoEnviarCodigo = document.getElementById('enviar-codigo');

botaoEnviarCodigo.addEventListener('click', async () => {
  const campoEmail = formRecuperacao.elements.email;
  if (!campoEmail.reportValidity()) return;

  botaoEnviarCodigo.disabled = true;
  mensagemRecuperacao.hidden = false;
  mensagemRecuperacao.textContent = 'Solicitando o envio do código...';
  try {
    const result = await window.DevAcademy.api('/api/send-recovery-code', {email: campoEmail.value});
    mensagemRecuperacao.textContent = result.message;
  } catch (error) {
    mensagemRecuperacao.textContent = error.message;
  } finally {
    botaoEnviarCodigo.disabled = false;
  }
});

formRecuperacao.addEventListener('submit', async event => {
  event.preventDefault();
  const botao = formRecuperacao.querySelector('[type="submit"]');
  botao.disabled = true;
  mensagemRecuperacao.hidden = false;
  mensagemRecuperacao.textContent = 'Atualizando sua senha...';

  try {
    const result = await window.DevAcademy.api('/api/recover', {
      email: formRecuperacao.elements.email.value,
      code: formRecuperacao.elements.code.value,
      password: formRecuperacao.elements.password.value
    });
    mensagemRecuperacao.textContent = 'Senha alterada. Guarde seu novo código de recuperação em um local seguro: ' + result.recovery;
    formRecuperacao.reset();
  } catch (error) {
    mensagemRecuperacao.textContent = error.message;
    botao.disabled = false;
  }
});
