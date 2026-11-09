const moduleButtons = [...document.querySelectorAll('[data-module-select]')];
const moduleTitle = document.getElementById('pdf-title');
const modulePdf = document.getElementById('module-pdf');
const downloadLink = document.getElementById('pdf-download');
const previousButton = document.getElementById('pdf-previous');
const nextButton = document.getElementById('pdf-next');
const progressSummary = document.getElementById('course-progress-summary');
const progressBar = document.getElementById('course-progress-bar');
const quizProgressStatus = document.getElementById('quiz-progress-status');
const editorProgressStatus = document.getElementById('editor-progress-status');
const progressError = document.getElementById('course-progress-error');
const quizFrame = document.querySelector('#quiz iframe');
const editorFrame = document.querySelector('#editor-codigo iframe');

const moduleNames = [
  'Fundamentos do HTML',
  'Estrutura e Semântica',
  'Tabelas e Formulários',
  'Mídia e CSS Essencial',
  'Responsividade, Acessibilidade e SEO',
  'Avançado e Publicação'
];

const emptyProgress = () => ({
  modules: moduleNames.map((_, index) => ({ number: index + 1, pdf_opened: false })),
  quiz_completed: false,
  quiz_completed_count: 0,
  quiz_total: 5,
  editor_completed: false
});

let selectedModule = 1;
let currentUser = null;
let courseProgress = emptyProgress();
let progressReady = Promise.resolve();

function localProgressKey() {
  const identity = currentUser?.email ? encodeURIComponent(currentUser.email) : 'guest';
  return `devAcademyCourseProgress:${identity}`;
}

function showProgressError(message) {
  progressError.textContent = message;
  progressError.hidden = false;
}

function renderCourseProgress() {
  const pdfsOpened = courseProgress.modules.filter(module => module.pdf_opened).length;
  const quizDone = Number(courseProgress.quiz_completed);
  const editorDone = Number(courseProgress.editor_completed);
  const completed = pdfsOpened + quizDone + editorDone;

  progressBar.value = completed;
  progressSummary.textContent = `${completed} de 8 atividades concluídas · ${pdfsOpened} de 6 PDFs abertos`;
  quizProgressStatus.textContent = courseProgress.quiz_completed
    ? 'Concluído'
    : `${courseProgress.quiz_completed_count || 0} de ${courseProgress.quiz_total || 5} acertos`;
  editorProgressStatus.textContent = courseProgress.editor_completed ? 'Concluído' : 'Não concluído';

  moduleButtons.forEach(button => {
    const module = courseProgress.modules.find(item => item.number === Number(button.dataset.moduleSelect));
    const status = button.querySelector('.module-progress-status');
    status.textContent = module?.pdf_opened ? 'PDF aberto' : 'PDF não aberto';
  });
}

function readLocalProgress() {
  const saved = localStorage.getItem(localProgressKey());
  if (!saved) return emptyProgress();

  const parsed = JSON.parse(saved);
  const defaults = emptyProgress();
  return {
    ...defaults,
    ...parsed,
    modules: defaults.modules.map(module => ({
      ...module,
      pdf_opened: Array.isArray(parsed.pdf_opened)
        ? parsed.pdf_opened.includes(module.number)
        : Boolean(parsed.modules?.find(item => item.number === module.number)?.pdf_opened)
    }))
  };
}

function saveLocalProgress() {
  localStorage.setItem(localProgressKey(), JSON.stringify({
    modules: courseProgress.modules,
    pdf_opened: courseProgress.modules.filter(module => module.pdf_opened).map(module => module.number),
    quiz_completed: courseProgress.quiz_completed,
    quiz_completed_count: courseProgress.quiz_completed_count,
    quiz_total: courseProgress.quiz_total,
    editor_completed: courseProgress.editor_completed
  }));
}

async function refreshProgress() {
  if (currentUser && window.DevAcademy) {
    const result = await DevAcademy.api('/api/course-progress?track=web');
    courseProgress = result.course_progress;
  } else {
    courseProgress = readLocalProgress();
  }
  renderCourseProgress();
}

async function recordPdfOpened(moduleNumber) {
  await progressReady;
  if (courseProgress.modules.find(module => module.number === moduleNumber)?.pdf_opened) return;

  if (currentUser && window.DevAcademy) {
    const result = await DevAcademy.api('/api/course-progress', {
      track: 'web',
      module: String(moduleNumber),
      phase: 'pdf_opened'
    });
    courseProgress = result.course_progress;
  } else {
    const module = courseProgress.modules.find(item => item.number === moduleNumber);
    if (module) module.pdf_opened = true;
    saveLocalProgress();
  }
  renderCourseProgress();
}

function selectModule(moduleNumber, moveFocus = false, scroll = true) {
  selectedModule = Math.min(Math.max(moduleNumber, 1), moduleNames.length);
  const moduleFile = `modulo-${selectedModule}.pdf`;

  moduleTitle.textContent = `Módulo ${selectedModule} · ${moduleNames[selectedModule - 1]}`;
  modulePdf.src = `${moduleFile}#view=FitH`;
  modulePdf.title = `Módulo ${selectedModule}: ${moduleNames[selectedModule - 1]}`;
  downloadLink.href = moduleFile;
  previousButton.disabled = selectedModule === 1;
  nextButton.disabled = selectedModule === moduleNames.length;

  moduleButtons.forEach((button, index) => {
    const isSelected = index + 1 === selectedModule;
    button.setAttribute('aria-pressed', String(isSelected));
    if (isSelected) {
      if (scroll) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      if (moveFocus) button.focus();
    }
  });

  recordPdfOpened(selectedModule).catch(error => showProgressError(error.message));
}

moduleButtons.forEach(button => {
  button.addEventListener('click', () => selectModule(Number(button.dataset.moduleSelect)));
});

previousButton.addEventListener('click', () => selectModule(selectedModule - 1, true));
nextButton.addEventListener('click', () => selectModule(selectedModule + 1, true));

window.addEventListener('message', async event => {
  if (event.origin !== location.origin ||
      (event.source !== quizFrame.contentWindow && event.source !== editorFrame.contentWindow) ||
      event.data?.type !== 'devacademy:course-progress') return;

  try {
    await progressReady;
    if (currentUser && window.DevAcademy) {
      await refreshProgress();
      return;
    }

    if (event.data.activity === 'quiz') {
      courseProgress.quiz_completed_count = event.data.completed;
      courseProgress.quiz_total = event.data.total;
      courseProgress.quiz_completed = event.data.completed === event.data.total;
    } else if (event.data.activity === 'editor') {
      courseProgress.editor_completed = event.data.completed === true;
    }
    saveLocalProgress();
    renderCourseProgress();
  } catch (error) {
    showProgressError(error.message);
  }
});

progressReady = (async () => {
  try {
    currentUser = window.DevAcademy ? await DevAcademy.ready : null;
    await refreshProgress();
  } catch (error) {
    showProgressError(error.message);
    courseProgress = readLocalProgress();
    renderCourseProgress();
  }
})();

selectModule(1, false, false);
