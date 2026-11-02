const LOCAL_TRACKS = {
  web: {
    name: 'Desenvolvimento Web',
    modules: [{
      id: 'html',
      title: 'Primeiros passos com HTML',
      description: 'Conheça a estrutura de uma página web com tags, parágrafos e títulos.',
      duration: '5 min de leitura · 5 exercícios',
      lesson: [
        { title: 'O que é HTML?', text: 'HTML significa HyperText Markup Language (Linguagem de Marcação de Hipertexto). É a linguagem base utilizada para estruturar todo o conteúdo das páginas na web.' },
        { title: 'Títulos e parágrafos', text: 'Tags como <h1> definem títulos principais (com hierarquia até <h6>), enquanto <p> é usado para parágrafos de texto comum.', code: '<h1>Meu Título Principal</h1>\n<p>Este é um parágrafo explicativo.</p>' },
        { title: 'Links e imagens', text: 'Para inserir links usamos <a href="url">Texto</a> e para imagens usamos <img src="imagem.png" alt="Descrição">.', code: '<a href="https://example.com">Visitar site</a>\n<img src="../img/robo.png" alt="Mascote">' }
      ],
      questions: [
        { id: 'html-1', pergunta: 'O que significa a sigla HTML?', alternativas: ['Linguagem de Marcação de Hipertexto', 'Linguagem Moderna de Alta Tecnologia', 'Nível de Hiperlink e Marcação de Texto', 'Linguagem de Marcação de Ferramentas Domésticas'], respostaCorreta: 0, explicacao: 'HTML significa HyperText Markup Language, ou Linguagem de Marcação de Hipertexto. Ele organiza o conteúdo da página com elementos como títulos, parágrafos, imagens e links.' },
        { id: 'html-2', pergunta: 'Qual tag representa o título principal de uma página?', alternativas: ['<p>', '<h1>', '<a>', '<img>'], respostaCorreta: 1, explicacao: 'A tag <h1> marca o título principal do conteúdo. Os títulos seguem uma hierarquia de <h1> a <h6>.' },
        { id: 'html-3', pergunta: 'Como escrever o parágrafo "Estou aprendendo HTML" corretamente?', alternativas: ['<h1>Estou aprendendo HTML</h1>', '<p>Estou aprendendo HTML</p>', '<a>Estou aprendendo HTML</a>', '<img>Estou aprendendo HTML</img>'], respostaCorreta: 1, explicacao: '<p>Estou aprendendo HTML</p> cria um parágrafo com as tags de abertura <p> e fechamento </p>.' },
        { id: 'html-4', pergunta: 'Qual exemplo cria um link para https://example.com?', alternativas: ['<a href="https://example.com">Visitar site</a>', '<p href="https://example.com">Visitar site</p>', '<link src="https://example.com">Visitar site</link>', '<img src="https://example.com" alt="Visitar site">'], respostaCorreta: 0, explicacao: 'A tag <a> cria um link quando recebe o atributo href com o endereço de destino.' },
        { id: 'html-5', pergunta: 'Em <img src="robo.png" alt="Mascote da DevAcademy">, qual é a função do atributo alt?', alternativas: ['Definir o tamanho da imagem', 'Fornecer uma descrição textual alternativa para a imagem', 'Mudar a cor de fundo da imagem', 'Criar um link automático para a imagem'], respostaCorreta: 1, explicacao: 'alt fornece uma alternativa textual à imagem para leitores de tela e caso a imagem não carregue.' }
      ]
    }]
  },
  backend: {
    name: 'Desenvolvimento Backend',
    modules: [{
      id: 'sql',
      title: 'Consultas com SQL',
      description: 'Aprenda os conceitos básicos para consultar bancos de dados relacionais.',
      duration: '4 min de leitura · 1 exercício',
      lesson: [
        { title: 'Introdução ao SQL', text: 'SQL é a linguagem padrão para interagir com bancos de dados relacionais. Com ela podemos buscar, inserir, alterar e excluir informações de tabelas.', code: 'SELECT nome, email FROM usuarios;' }
      ],
      questions: [
        { id: 'sql-1', pergunta: 'Qual estrutura SQL é usada para selecionar dados de uma tabela?', alternativas: ['UPDATE', 'INSERT INTO', 'SELECT', 'DELETE'], respostaCorreta: 2, explicacao: 'SELECT é o comando SQL usado para consultar e selecionar dados em tabelas de um banco de dados.' }
      ]
    }]
  }
};

(async function initQuiz() {
  const user = window.DevAcademy ? await DevAcademy.ready.catch(() => null) : null;
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const track = params.get('track');
  const box = $('caixa-alternativas'), question = $('texto-pergunta'), next = $('proxima-pergunta');
  let module = null, questions = [], attempt = [], index = 0, points = 0, locked = false;
  let completed = new Set(), progress = null, completedBefore = false;

  const statusName = p => (p && p.status === 'completed') ? '✓ Concluído' : (p && p.status === 'in_progress') ? 'Em andamento' : 'Não iniciado';
  function node(tag, text, className) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function action(label, callback, parent = box) {
    const button = node('button', label, 'btn-alternativa');
    button.type = 'button';
    button.addEventListener('click', callback);
    parent.append(button);
    return button;
  }
  function robot(text) { $('fala-robo').textContent = text; }
  function stage(value) {
    $('lesson-steps').hidden = !value;
    document.querySelectorAll('[data-step]').forEach(el => {
      if (el.dataset.step === value) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
  }
  function clean() {
    box.replaceChildren();
    $('lesson-content').replaceChildren();
    $('lesson-content').hidden = true;
    $('explicacao').hidden = true;
    next.hidden = true;
    $('review-lesson').hidden = true;
    $('question-state').hidden = true;
  }
  function updateProgress(p, isModule = true) {
    progress = p;
    $('track-bar').value = p.percent;
    $('track-percent').textContent = p.percent + '%';
    $('progress-label').textContent = isModule ? 'Seu progresso no módulo' : 'Seu progresso na trilha';
    $('track-bar').setAttribute('aria-label', isModule ? 'Progresso no módulo' : 'Progresso na trilha');
    $('track-detail').textContent = statusName(p) + ' · ' + p.completed + ' de ' + p.total + ' pergunta(s) com acerto.';
  }

  async function openModule(id) {
    clean();
    question.textContent = 'Carregando módulo…';
    try {
      if (user && window.DevAcademy) {
        const result = await DevAcademy.api('/api/quiz?track=' + track + '&module=' + encodeURIComponent(id));
        if (!result.module) throw new Error('Módulo não encontrado no servidor.');
        module = result.module;
        questions = result.questions;
        completed = new Set(result.completed_ids || []);
        const state = await DevAcademy.api('/api/module', { track, module: module.id, phase: 'start' });
        updateProgress(state.module_progress);
        $('track-title').textContent = result.name + ' · ' + module.title;
        document.title = module.title + ' — DevAcademy';
        if (state.module_progress.lesson_read && state.module_progress.status !== 'completed') startQuiz(false);
        else showLesson();
        return;
      }
    } catch (e) {}

    // Fallback local caso o backend não esteja ativo
    const trackData = LOCAL_TRACKS[track] || LOCAL_TRACKS.web;
    const found = trackData.modules.find(m => m.id === id) || trackData.modules[0];
    module = found;
    questions = found.questions;
    const localProgress = { completed: 0, total: questions.length, percent: 0, status: 'in_progress', lesson_read: true };
    updateProgress(localProgress);
    $('track-title').textContent = trackData.name + ' · ' + module.title;
    document.title = module.title + ' — DevAcademy';
    showLesson();
  }

  function showLesson() {
    clean();
    stage('lesson');
    question.textContent = module.title;
    $('pontuacao').textContent = 'Aula curta';
    $('progresso').textContent = module.duration;
    const lesson = $('lesson-content');
    lesson.hidden = false;
    lesson.append(node('p', 'Leia os exemplos e observe a prévia. Você poderá consultar esta aula durante os exercícios.', 'lesson-intro'));
    for (const block of module.lesson) {
      const section = node('section');
      section.append(node('h3', block.title), node('p', block.text));
      if (block.code) {
        const pre = node('pre'), code = node('code', block.code);
        pre.append(code);
        section.append(pre);
      }
      lesson.append(section);
    }
    const label = progress?.lesson_read ? (progress.status === 'completed' ? 'Revisar os exercícios' : 'Continuar exercícios') : 'Concluir leitura e praticar';
    action(label, async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        if (user && window.DevAcademy) {
          const result = await DevAcademy.api('/api/module', { track, module: module.id, phase: 'read' });
          updateProgress(result.module_progress);
        }
      } catch (e) {}
      startQuiz(false);
      question.focus();
    });
    robot('Leia no seu ritmo. Quando estiver pronto, comece a prática.');
  }

  function startQuiz(reviewAll = false) {
    const pending = questions.filter(q => !completed.has(q.id));
    attempt = reviewAll || !pending.length ? [...questions] : pending;
    index = 0;
    points = 0;
    completedBefore = progress?.status === 'completed';
    render();
  }

  function render() {
    clean();
    stage('quiz');
    locked = false;
    const current = attempt[index];
    question.textContent = current.pergunta;
    $('question-state').hidden = false;
    $('question-state').textContent = completed.has(current.id) ? '✓ Já concluída — modo de revisão' : 'Pergunta pendente';
    $('progresso').textContent = `Pergunta ${index + 1}/${attempt.length}`;
    $('pontuacao').textContent = `Pontos nesta tentativa: ${points}`;
    $('review-lesson').hidden = false;
    robot('Escolha uma alternativa para responder.');
    current.alternativas.forEach((text, i) => action(text, () => answer(i)));
  }

  async function answer(selected) {
    if (locked) return;
    locked = true;
    $('review-lesson').hidden = true;
    const buttons = Array.from(box.querySelectorAll('button'));
    buttons.forEach(b => b.disabled = true);
    robot('Verificando sua resposta…');

    const current = attempt[index];
    let correct = false, correctIndex = 0, explanation = '';

    try {
      if (user && window.DevAcademy) {
        const result = await DevAcademy.api('/api/answer', { track, question: current.id, answer: String(selected) });
        correct = result.correct;
        correctIndex = result.correctIndex;
        explanation = result.explanation;
        if (result.module_progress) updateProgress(result.module_progress);
      } else {
        correctIndex = current.respostaCorreta;
        correct = selected === correctIndex;
        explanation = current.explicacao;
        if (correct) completed.add(current.id);
        const percent = Math.round((completed.size / questions.length) * 100);
        updateProgress({
          completed: completed.size,
          total: questions.length,
          percent,
          status: completed.size === questions.length ? 'completed' : 'in_progress',
          lesson_read: true
        });
      }

      buttons[correctIndex].classList.add('correta');
      if (correct) {
        points += 10;
        const reviewed = completed.has(current.id);
        completed.add(current.id);
        robot(reviewed ? 'Resposta correta! Acerto registrado.' : 'Muito bem! Resposta exata! +10 pontos.');
      } else {
        buttons[selected].classList.add('errada');
        robot('Leia a explicação para entender o conceito.');
      }

      $('pontuacao').textContent = `Pontos nesta tentativa: ${points}`;
      $('question-state').textContent = completed.has(current.id) ? '✓ Pergunta concluída' : 'Pergunta pendente';
      $('texto-explicacao').textContent = explanation;
      $('explicacao').hidden = false;
      next.textContent = index === attempt.length - 1 ? 'Ver resultado' : 'Próxima pergunta';
      next.hidden = false;
      next.focus();
    } catch (error) {
      locked = false;
      $('review-lesson').hidden = false;
      buttons.forEach(b => b.disabled = false);
      robot('Ocorreu um erro ao verificar a resposta. Tente novamente.');
    }
  }

  function finish() {
    clean();
    stage('result');
    const pending = questions.filter(q => !completed.has(q.id));
    if (!pending.length) {
      question.textContent = completedBefore ? 'Revisão finalizada!' : 'Módulo concluído!';
      robot(`Parabéns! Você concluiu todas as perguntas deste módulo.`);
    } else {
      question.textContent = 'Etapa finalizada. Vamos revisar?';
      robot(`Você fez ${points} pontos nesta tentativa. Faltam ${pending.length} pergunta(s) para concluir o módulo.`);
      action(`Revisar ${pending.length} pergunta(s) pendente(s)`, () => { startQuiz(false); question.focus(); });
    }
    if (progress) $('progresso').textContent = statusName(progress);
    action('Revisar todas as perguntas', () => { startQuiz(true); question.focus(); });
    action('Ler a aula novamente', () => { showLesson(); question.focus(); });
    action('Voltar aos módulos', () => { loadTrack(); question.focus(); });
  }

  next.addEventListener('click', () => {
    if (!locked) return;
    index++;
    if (index < attempt.length) render();
    else finish();
    question.focus();
  });

  $('review-lesson').addEventListener('click', () => {
    if (locked) return;
    clean();
    stage('lesson');
    question.textContent = 'Consulta rápida da aula';
    const lesson = $('lesson-content');
    lesson.hidden = false;
    for (const block of module.lesson) {
      lesson.append(node('h3', block.title), node('p', block.text));
      if (block.code) {
        const pre = node('pre'), code = node('code', block.code);
        pre.append(code);
        lesson.append(pre);
      }
    }
    action('Voltar à pergunta', () => { render(); question.focus(); });
    question.focus();
  });

  async function loadTrack() {
    clean();
    stage(null);
    question.textContent = 'Carregando módulos…';
    $('pontuacao').textContent = '';
    $('progresso').textContent = '';

    try {
      if (user && window.DevAcademy) {
        const result = await DevAcademy.api('/api/quiz?track=' + track);
        updateProgress(result.progress, false);
        $('track-title').textContent = result.name;
        question.textContent = 'Escolha seu módulo';
        for (const item of result.progress.modules) {
          const card = node('section', undefined, 'module-card');
          card.append(node('h3', item.title), node('p', item.description), node('span', statusName(item.progress), 'module-state ' + item.progress.status));
          const bar = node('progress');
          bar.max = 100;
          bar.value = item.progress.percent;
          bar.setAttribute('aria-label', 'Progresso em ' + item.title);
          card.append(bar, node('p', `${item.progress.percent}% · ${item.progress.completed} de ${item.progress.total} pergunta(s) com acerto · ${item.duration}`));
          action(item.progress.status === 'completed' ? 'Revisar módulo' : item.progress.status === 'in_progress' ? 'Continuar módulo' : 'Começar aula', () => openModule(item.id), card);
          box.append(card);
        }
        robot('Cada módulo tem uma aula curta, exercícios e progresso próprios.');
        return;
      }
    } catch (e) {}

    // Fallback local
    const trackData = LOCAL_TRACKS[track] || LOCAL_TRACKS.web;
    $('track-title').textContent = trackData.name;
    question.textContent = 'Escolha seu módulo';
    for (const item of trackData.modules) {
      const card = node('section', undefined, 'module-card');
      card.append(node('h3', item.title), node('p', item.description), node('span', 'Disponível', 'module-state in_progress'));
      action('Começar aula', () => openModule(item.id), card);
      box.append(card);
    }
    robot('Pratique e aprenda no seu próprio ritmo.');
  }

  if (!['web', 'backend'].includes(track)) {
    clean();
    stage(null);
    question.textContent = 'Qual trilha você quer estudar?';
    $('pontuacao').textContent = '';
    $('progresso').textContent = '';
    action('Desenvolvimento Web', () => location.assign('quiz.teste.html?track=web'));
    action('Desenvolvimento Backend', () => location.assign('quiz.teste.html?track=backend'));
    return;
  }

  if (params.get('module')) await openModule(params.get('module'));
  else await openModule(track === 'backend' ? 'sql' : 'html');
})();
