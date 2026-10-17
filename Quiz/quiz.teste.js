DevAcademy.ready.then(async user => {
  if (!user) return;
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search),track=params.get('track');
  const box=$('caixa-alternativas'),question=$('texto-pergunta'),next=$('proxima-pergunta');
  let module=null,questions=[],attempt=[],index=0,points=0,locked=false;
  let completed=new Set(),progress=null,completedBefore=false;
  const statusName=p=>p.status==='completed'?'✓ Concluído':p.status==='in_progress'?'Em andamento':'Não iniciado';
  function node(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
  function action(label,callback,parent=box){
    const button=node('button',label,'btn-alternativa');button.type='button';button.addEventListener('click',callback);parent.append(button);return button;
  }
  function robot(text){$('fala-robo').textContent=text;}
  function stage(value){
    $('lesson-steps').hidden=!value;
    document.querySelectorAll('[data-step]').forEach(el=>{
      if(el.dataset.step===value)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
    });
  }
  function clean(){box.replaceChildren();$('lesson-content').replaceChildren();$('lesson-content').hidden=true;$('explicacao').hidden=true;next.hidden=true;$('review-lesson').hidden=true;$('question-state').hidden=true;}
  function updateProgress(p,isModule=true){
    progress=p;$('track-bar').value=p.percent;$('track-percent').textContent=p.percent+'%';
    $('progress-label').textContent=isModule?'Seu progresso no módulo':'Seu progresso na trilha';
    $('track-bar').setAttribute('aria-label',isModule?'Progresso no módulo':'Progresso na trilha');
    $('track-detail').textContent=statusName(p)+' · '+p.completed+' de '+p.total+' pergunta(s) com acerto.';
  }
  async function openModule(id){
    clean();question.textContent='Carregando módulo…';
    try{
      const result=await DevAcademy.api('/api/quiz?track='+track+'&module='+encodeURIComponent(id));
      if(!result.module)throw new Error('Módulo não encontrado.');
      module=result.module;questions=result.questions;completed=new Set(result.completed_ids);
      const state=await DevAcademy.api('/api/module',{track,module:module.id,phase:'start'});
      updateProgress(state.module_progress);$('track-title').textContent=result.name+' · '+module.title;
      document.title=module.title+' — DevAcademy';
      if(state.module_progress.lesson_read && state.module_progress.status!=='completed')startQuiz(false);
      else showLesson();
    }catch(error){clean();question.textContent='Não foi possível abrir o módulo.';robot(error.message);action('Tentar novamente',()=>openModule(id));}
  }
  function showLesson(){
    clean();stage('lesson');question.textContent=module.title;
    $('pontuacao').textContent='Aula curta';$('progresso').textContent=module.duration;
    const lesson=$('lesson-content');lesson.hidden=false;
    lesson.append(node('p','Leia os exemplos e observe a prévia. Você poderá consultar esta aula durante os exercícios.','lesson-intro'));
    for(const block of module.lesson){
      const section=node('section');section.append(node('h3',block.title),node('p',block.text));
      if(block.code){const pre=node('pre'),code=node('code',block.code);pre.append(code);section.append(pre);}
      if(block.preview){
        const preview=node('div',undefined,'lesson-preview');preview.append(node('p','PRÉVIA DO CONTEÚDO','preview-label'),node('h4','Minha jornada na programação'),node('p','Hoje comecei a aprender HTML.'));
        // A prévia usa elementos fixos; nunca executa código vindo de textos da aula.
        const link=node('a','Visitar site');link.href='https://example.com';link.target='_blank';link.rel='noopener noreferrer';preview.append(link);
        section.append(preview,node('p','O título da aba vem de <title>. A prévia acima mostra apenas o conteúdo do <body>, com estilos de demonstração.','preview-note'));
      }
      lesson.append(section);
    }
    const label=progress.lesson_read?(progress.status==='completed'?'Revisar os exercícios':'Continuar exercícios'):'Concluir leitura e praticar';
    action(label,async event=>{
      const button=event.currentTarget;button.disabled=true;
      try{const result=await DevAcademy.api('/api/module',{track,module:module.id,phase:'read'});updateProgress(result.module_progress);startQuiz(false);question.focus();}
      catch(error){button.disabled=false;robot(error.message+' Tente continuar novamente.');}
    });
    robot('Leia no seu ritmo. Quando estiver pronto, comece a prática.');
  }
  function startQuiz(reviewAll=false){
    const pending=questions.filter(q=>!completed.has(q.id));
    attempt=reviewAll||!pending.length?[...questions]:pending;
    index=0;points=0;completedBefore=progress.status==='completed';render();
  }
  function render(){
    clean();stage('quiz');locked=false;
    const current=attempt[index];question.textContent=current.pergunta;
    $('question-state').hidden=false;$('question-state').textContent=completed.has(current.id)?'✓ Já concluída — modo de revisão':'Pergunta pendente';
    $('progresso').textContent=`Pergunta ${index+1}/${attempt.length}`;
    $('pontuacao').textContent=`Pontos nesta tentativa: ${points}`;
    $('review-lesson').hidden=false;
    robot('Escolha uma alternativa. Cada novo acerto fica salvo na sua conta.');
    current.alternativas.forEach((text,i)=>action(text,()=>answer(i)));
  }
  async function answer(selected){
    if(locked)return;locked=true;$('review-lesson').hidden=true;
    const buttons=Array.from(box.querySelectorAll('button'));buttons.forEach(b=>b.disabled=true);
    robot('Salvando sua resposta…');
    try{
      const current=attempt[index];
      const result=await DevAcademy.api('/api/answer',{track,question:current.id,answer:String(selected)});
      buttons[result.correctIndex].classList.add('correta');
      if(result.correct){points+=10;const reviewed=completed.has(current.id);completed.add(current.id);robot(reviewed?'Resposta correta! Este acerto já estava registrado.':'Acerto registrado! Você avançou neste módulo.');}
      else{buttons[selected].classList.add('errada');robot('Leia a explicação. Esta pergunta continua disponível para revisar.');}
      $('pontuacao').textContent=`Pontos nesta tentativa: ${points}`;
      $('question-state').textContent=completed.has(current.id)?'✓ Pergunta concluída':'Pergunta pendente — revise ao terminar';
      $('texto-explicacao').textContent=result.explanation;$('explicacao').hidden=false;
      updateProgress(result.module_progress);next.textContent=index===attempt.length-1?'Ver resultado':'Próxima pergunta';next.hidden=false;next.focus();
    }catch(error){locked=false;$('review-lesson').hidden=false;buttons.forEach(b=>b.disabled=false);robot(error.message+' Sua resposta não foi salva. Tente selecionar novamente.');}
  }
  function finish(){
    clean();stage('result');
    const pending=questions.filter(q=>!completed.has(q.id));
    if(!pending.length){
      question.textContent=completedBefore?'Revisão finalizada!':'Módulo concluído!';
      robot(completedBefore?`Você fez ${points} de ${attempt.length*10} pontos nesta revisão. Seus acertos anteriores continuam salvos.`:`Parabéns! Você acertou as ${questions.length} perguntas do módulo. Continue praticando para consolidar o aprendizado.`);
    }else{
      question.textContent='Etapa finalizada. Vamos revisar?';
      robot(`Você fez ${points} de ${attempt.length*10} pontos nesta tentativa. Faltam ${pending.length} pergunta(s) para concluir o módulo. Seus acertos já estão salvos.`);
      action(`Revisar ${pending.length} pergunta(s) pendente(s)`,()=>{startQuiz(false);question.focus();});
    }
    $('progresso').textContent=statusName(progress);
    action('Revisar todas as perguntas',()=>{startQuiz(true);question.focus();});
    action('Ler a aula novamente',()=>{showLesson();question.focus();});
    action('Voltar aos módulos',()=>{loadTrack();question.focus();});
  }
  next.addEventListener('click',()=>{if(!locked)return;index++;if(index<attempt.length)render();else finish();question.focus();});
  $('review-lesson').addEventListener('click',()=>{
    if(locked)return;clean();stage('lesson');question.textContent='Consulta rápida da aula';const lesson=$('lesson-content');lesson.hidden=false;
    for(const block of module.lesson){lesson.append(node('h3',block.title),node('p',block.text));if(block.code){const pre=node('pre');pre.append(node('code',block.code));lesson.append(pre);}}
    action('Voltar à pergunta',()=>{
      render();question.focus();
    });question.focus();
  });
  async function loadTrack(){
    clean();stage(null);question.textContent='Carregando módulos…';$('pontuacao').textContent='';$('progresso').textContent='';
    try{
      const result=await DevAcademy.api('/api/quiz?track='+track);updateProgress(result.progress,false);$('track-title').textContent=result.name;question.textContent='Escolha seu módulo';
      for(const item of result.progress.modules){
        const card=node('section',undefined,'module-card');card.append(node('h3',item.title),node('p',item.description),node('span',statusName(item.progress),'module-state '+item.progress.status));
        const bar=node('progress');bar.max=100;bar.value=item.progress.percent;bar.setAttribute('aria-label','Progresso em '+item.title);card.append(bar,node('p',`${item.progress.percent}% · ${item.progress.completed} de ${item.progress.total} pergunta(s) com acerto · ${item.duration}`));
        action(item.progress.status==='completed'?'Revisar módulo':item.progress.status==='in_progress'?'Continuar módulo':'Começar aula',()=>openModule(item.id),card);box.append(card);
      }
      robot('Cada módulo tem uma aula curta, exercícios e progresso próprios.');
    }catch(error){question.textContent='Não foi possível carregar os módulos.';robot(error.message);action('Tentar novamente',loadTrack);}
  }
  if(!['web','backend'].includes(track)){
    clean();stage(null);question.textContent='Qual trilha você quer estudar?';$('pontuacao').textContent='';$('progresso').textContent='';
    action('Desenvolvimento Web',()=>location.assign('quiz.teste.html?track=web'));
    action('Desenvolvimento Backend',()=>location.assign('quiz.teste.html?track=backend'));return;
  }
  if(params.get('module'))await openModule(params.get('module'));else await loadTrack();
});
