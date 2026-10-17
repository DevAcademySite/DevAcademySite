const form=document.querySelector('#access-form');
const statusText=document.querySelector('#access-status');
const title=document.querySelector('#access-title');
const submit=document.querySelector('#access-submit');
const password=document.querySelector('#password');
let mode='login', currentUser=null, pendingQuiz=null;
const next=new URLSearchParams(location.search).get('next');
const requestedTrack=new URLSearchParams(location.search).get('track');
const requestedModule=new URLSearchParams(location.search).get('module');
const moduleSuffix=['html','sql'].includes(requestedModule)?'&module='+requestedModule:'';
const target=next==='profile' ? 'profile.html' : (['web','backend'].includes(requestedTrack) ? '../Quiz/quiz.teste.html?track='+requestedTrack+moduleSuffix : 'home.html#cursos');
function changeMode(value) {
  mode=value;statusText.textContent='';password.value='';password.type='password';
  document.querySelector('#show-password').textContent='Mostrar';
  document.querySelector('#show-password').setAttribute('aria-pressed','false');
  const isRegister=mode==='register', isRecover=mode==='recover';
  title.textContent=isRegister?'Criar nova conta':isRecover?'Recuperar acesso':'Login';
  submit.textContent=isRegister?'Criar minha conta':isRecover?'Redefinir senha':'Entrar';
  document.querySelector('#access-description').textContent=isRecover?'Use o código entregue ao criar sua conta. Ainda não enviamos recuperação por e-mail.':isRegister?'Comece sua jornada de programação.':'Entre para começar seus desafios.';
  document.querySelector('#password-label').textContent=isRecover?'Nova senha':'Senha';
  password.autocomplete=mode==='login'?'current-password':'new-password';
  for(const [id, enabled] of [['name-field',isRegister],['code-field',isRecover]]) {
    const field=document.getElementById(id);field.hidden=!enabled;
    field.querySelector('input').disabled=!enabled;field.querySelector('input').required=enabled;
  }
  document.querySelector('.forgot').hidden=mode!=='login';
  document.querySelector('.access-divider').hidden=mode!=='login';
  document.querySelector('[data-mode="register"]').hidden=mode!=='login';
  document.querySelector('[data-mode="login"]').hidden=mode==='login';
  title.focus();
}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>changeMode(button.dataset.mode)));
document.querySelector('#show-password').addEventListener('click',event=>{
  const show=password.type==='password';password.type=show?'text':'password';
  event.currentTarget.textContent=show?'Ocultar':'Mostrar';event.currentTarget.setAttribute('aria-pressed',String(show));
});
form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  submit.disabled=true;statusText.textContent='Aguarde…';
  try {
    const result=await DevAcademy.api('/api/'+mode,Object.fromEntries(new FormData(form)));
    password.value='';statusText.textContent='';
    if(mode==='login') {
      // Um destino #cursos pode manter o mesmo documento aberto.
      // Confirme o cookie e atualize o estado antes de navegar.
      const session=await DevAcademy.api('/api/session');
      if(!session.user) throw new Error('O navegador não manteve sua sessão. Permita cookies para este site e tente novamente.');
      await showSession(session.user);
      location.assign(pendingQuiz || target);
      return;
    }
    document.querySelector('[data-auth-panel]').hidden=true;
    document.querySelector('#recovery-result').hidden=false;
    document.querySelector('#new-recovery-code').textContent=result.recovery;
    document.querySelector('#recovery-result h2').focus();
  } catch(error) { statusText.textContent=error.message; }
  finally {submit.disabled=false;}
});
document.querySelector('#saved-code').addEventListener('click',()=>{
  document.querySelector('#new-recovery-code').textContent='';
  document.querySelector('#recovery-result').hidden=true;
  document.querySelector('[data-auth-panel]').hidden=false;changeMode('login');
  statusText.textContent='Tudo pronto. Entre com seu e-mail e senha.';
});
async function showSession(user) {
  currentUser=user;
  document.querySelectorAll('[data-guest]').forEach(el=>el.hidden=!!user);
  document.querySelectorAll('[data-member], [data-logout]').forEach(el=>el.hidden=!user);
  document.querySelector('[data-auth-panel]').hidden=!!user;
  document.querySelector('#welcome').hidden=!user;
  if(user) {
    document.querySelector('[data-auth-panel]').hidden=true;
    document.querySelector('#welcome').hidden=false;
    document.querySelector('#welcome-name').textContent='Olá, '+user.name+'. Escolha sua trilha para continuar.';
    try {
      const result=await DevAcademy.api('/api/progress');
      document.querySelectorAll('[data-track]').forEach(card=>{
        const progress=result.tracks[card.dataset.track];
        card.querySelector('progress').value=progress.percent;
        card.querySelector('[data-percent]').textContent=progress.percent+'%';
        card.querySelector('[data-progress-detail]').textContent=progress.completed+' de '+progress.total+' pergunta(s) com acerto';
        const link=card.closest('a').querySelector('.course-link');
        link.textContent=progress.status==='completed'?'Revisar módulo →':progress.status==='in_progress'?'Continuar módulo →':'Começar módulo →';
        const summary=card.querySelector('[data-module-summary]');
        if(summary){
          summary.replaceChildren();
          for(const module of progress.modules||[]){
            const line=document.createElement('div');line.className='module-summary-row';
            const name=document.createElement('span');name.textContent=module.title;
            const badge=document.createElement('span');badge.className='module-badge '+module.progress.status;
            badge.textContent=module.progress.status==='completed'?'✓ Concluído':module.progress.status==='in_progress'?'Em andamento':'Não iniciado';
            line.append(name,badge);summary.append(line);
          }
        }
      });
    } catch(error) {
      document.querySelectorAll('[data-percent]').forEach(el=>el.textContent='Indisponível');
      document.querySelectorAll('[data-progress-detail]').forEach(el=>el.textContent='Atualize a página para tentar carregar o progresso.');
    }
  } else if(next) {statusText.textContent='Faça login para acessar '+(next==='profile'?'seu perfil.':'o quiz.');}
}
DevAcademy.ready.then(user=>{
  // Uma consulta antiga de visitante não deve apagar um login recém-confirmado.
  if(!currentUser) return showSession(user);
});
document.querySelectorAll('[data-quiz-link]').forEach(link=>link.addEventListener('click',async event=>{
  // Cancele antes de aguardar: o navegador executa o link imediatamente.
  event.preventDefault();
  await DevAcademy.ready;
  if(currentUser){location.assign(link.href);return;}
  pendingQuiz=link.href;
  document.querySelector('#login').scrollIntoView({behavior:'smooth'});
  statusText.textContent='Entre na sua conta para começar o quiz.';
  document.querySelector('#email').focus({preventScroll:true});
}));
