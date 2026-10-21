const form=document.querySelector('#access-form');
const statusText=document.querySelector('#access-status');
const title=document.querySelector('#access-title');
const submit=document.querySelector('#access-submit');
const password=document.querySelector('#password');
let mode='login', currentUser=null, pendingQuiz=null, availableModules=[];
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
  title.textContent=isRegister?'Criar nova conta':isRecover?'Recuperar acesso':'Entrar na sua conta';
  submit.textContent=isRegister?'Criar minha conta':isRecover?'Redefinir senha':'Entrar';
  const description=document.querySelector('#access-description');
  description.textContent=isRecover?'Use o código entregue ao criar sua conta. Ainda não enviamos recuperação por e-mail.':isRegister?'Comece sua jornada de programação.':'';
  description.hidden=mode==='login';
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
      const destination=pendingQuiz || target;
      rememberDestination(destination);
      location.assign(destination);
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
  document.body.classList.toggle('is-authenticated',!!user);
  document.querySelectorAll('[data-guest]').forEach(el=>el.hidden=!!user);
  document.querySelectorAll('[data-member], [data-logout]').forEach(el=>el.hidden=!user);
  document.querySelector('[data-auth-panel]').hidden=!!user;
  document.querySelector('#welcome').hidden=!user;
  if(user) {
    document.querySelector('[data-auth-panel]').hidden=true;
    document.querySelector('#welcome').hidden=false;
    document.querySelector('#welcome-name').textContent='Olá, '+user.name+'. Vamos dar mais um passo?';
    document.querySelector('#student-summary').setAttribute('aria-busy','true');
    try {
      const result=await DevAcademy.api('/api/progress');
      availableModules=Object.entries(result.tracks).flatMap(([track,p])=>(p.modules||[]).map(module=>({...module,track})));
      renderStudentSummary(result.tracks);
      document.querySelectorAll('[data-track]').forEach(card=>{
        const progress=result.tracks[card.dataset.track];
        if(!progress)return;
        updateMetric(card.dataset.track,progress);
        card.querySelector('progress').value=progress.percent;
        card.querySelector('[data-percent]').textContent=progress.percent+'%';
        card.querySelector('[data-progress-detail]').textContent=progress.completed+' de '+progress.total+' pergunta(s) com acerto';
        const link=card.closest('a').querySelector('.course-link');
        setLinkText(link,progress.status==='completed'?'Revisar módulo':progress.status==='in_progress'?'Continuar módulo':'Começar módulo');
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
      document.querySelector('#summary-detail').textContent='Não foi possível carregar seu progresso. Atualize a página para tentar novamente.';
      document.querySelectorAll('[data-percent]').forEach(el=>el.textContent='Indisponível');
      document.querySelectorAll('[data-progress-detail]').forEach(el=>el.textContent='Atualize a página para tentar carregar o progresso.');
    } finally {document.querySelector('#student-summary').setAttribute('aria-busy','false');}
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
  if(currentUser){rememberDestination(link.href);location.assign(link.href);return;}
  pendingQuiz=link.href;
  document.querySelector('#login').scrollIntoView({behavior:'smooth'});
  statusText.textContent='Entre na sua conta para começar o quiz.';
  document.querySelector('#email').focus({preventScroll:true});
}));


// A última trilha é uma preferência local por conta, nunca uma prova de login.
function lastTrackKey(){return currentUser?.email?'devAcademyLastTrack:'+encodeURIComponent(currentUser.email):null;}
function rememberDestination(destination){
  if(!currentUser)return;
  try{
    const url=new URL(destination,location.href),track=url.searchParams.get('track');
    const key=lastTrackKey();
    if(key && ['web','backend'].includes(track))localStorage.setItem(key,track);
  }catch(error){/* O estudo continua mesmo com armazenamento local desativado. */}
}
function setLinkText(link,text){
  if(!link)return;
  link.replaceChildren(document.createTextNode(text+' '));
  const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.append(arrow);
}
function updateMetric(track,progress){
  const modules=document.querySelector('[data-module-count="'+track+'"]');
  if(modules && progress.modules){modules.textContent=progress.modules.length;modules.nextSibling.textContent=progress.modules.length===1?' módulo disponível':' módulos disponíveis';}
  const questions=document.querySelector('[data-question-count="'+track+'"]');
  if(questions){questions.textContent=progress.total;questions.nextSibling.textContent=progress.total===1?' questão':' questões';}
}
function renderStudentSummary(tracks){
  const totals=Object.values(tracks).reduce((sum,track)=>({correct:sum.correct+track.completed,total:sum.total+track.total}),{correct:0,total:0});
  document.querySelector('#hero-track-count').textContent=Object.keys(tracks).length;
  document.querySelector('#hero-question-count').textContent=totals.total;
  const finished=availableModules.filter(module=>module.progress.status==='completed').length;
  const percent=totals.total?Math.round(totals.correct*100/totals.total):0;
  document.querySelector('#summary-correct').textContent=totals.correct+'/'+totals.total;
  document.querySelector('#summary-modules').textContent=finished+'/'+availableModules.length;
  document.querySelector('#summary-percent').textContent=percent+'%';
  document.querySelector('#summary-bar').value=percent;
  document.querySelector('#summary-detail').textContent=finished===availableModules.length && availableModules.length?'Você concluiu os módulos disponíveis. Revise para consolidar o aprendizado.':totals.correct?'Cada acerto conta. Seu progresso está salvo para continuar.':'Escolha uma trilha e comece sua primeira conquista.';
  let last=null;
  try{const key=lastTrackKey();last=key?localStorage.getItem(key):null;}catch(error){}
  const lastModules=availableModules.filter(module=>module.track===last);
  const candidate=lastModules.find(module=>module.progress.status!=='completed')||availableModules.find(module=>module.progress.status==='in_progress')||availableModules.find(module=>module.progress.status!=='completed')||lastModules[0]||availableModules[0];
  if(!candidate)return;
  const isReview=candidate.progress.status==='completed';
  document.querySelector('#resume-card').hidden=false;
  document.querySelector('#resume-label').textContent=isReview?'HORA DE REVISAR':candidate.track===last?'SUA ÚLTIMA TRILHA':'SEU PRÓXIMO PASSO';
  document.querySelector('#resume-module').textContent=candidate.title;
  document.querySelector('#resume-detail').textContent=candidate.progress.percent+'% concluído · '+candidate.progress.completed+' de '+candidate.progress.total+' pergunta(s) com acerto';
  const destination='../Quiz/quiz.teste.html?track='+encodeURIComponent(candidate.track)+'&module='+encodeURIComponent(candidate.id);
  const resume=document.querySelector('#resume-link');resume.href=destination;
  setLinkText(resume,isReview?'Revisar módulo':candidate.progress.status==='in_progress'?'Continuar estudando':'Começar este módulo');
  const hero=document.querySelector('#hero-start');hero.href=destination;setLinkText(hero,isReview?'Revisar meu aprendizado':'Continuar estudando');
}
for(const id of ['resume-link','hero-start']){
  const link=document.getElementById(id);if(link)link.addEventListener('click',()=>rememberDestination(link.href));
}

// Mantém a marca legível mesmo quando uma imagem não é encontrada.
document.querySelectorAll('[data-robot-image]').forEach(img=>{
  const fallback=()=>{img.hidden=true;const sibling=img.nextElementSibling;if(sibling)sibling.hidden=false;};
  img.addEventListener('error',fallback);
  if(img.complete && !img.naturalWidth)fallback();
});
