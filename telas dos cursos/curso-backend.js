const moduleButtons = [...document.querySelectorAll('[data-module-select]')];
const modulePdf = document.getElementById('module-pdf');
const progressSummary = document.getElementById('course-progress-summary');
const progressBar = document.getElementById('course-progress-bar');
const pdfModuleStatus = document.getElementById('pdf-module-status');
const pdfProgressStatus = document.getElementById('pdf-progress-status');
const quizProgressStatus = document.getElementById('quiz-progress-status');
const editorProgressStatus = document.getElementById('editor-progress-status');
const progressError = document.getElementById('course-progress-error');
const quizFrame = document.querySelector('#quiz iframe');
const editorFrame = document.querySelector('#editor-codigo iframe');
const localKey = 'devAcademyBackendCourseProgress';

const emptyProgress = () => ({
  completed: 0,
  total: 3,
  percent: 0,
  pdf_opened: false,
  quiz_completed: false,
  quiz_completed_count: 0,
  quiz_total: 1,
  editor_completed: false
});

let currentUser = null;
let courseProgress = emptyProgress();
let progressReady = Promise.resolve();

function showProgressError(message) {
  progressError.textContent = message;
  progressError.hidden = false;
}

function readLocalProgress() {
  const saved = localStorage.getItem(localKey);
  return saved ? { ...emptyProgress(), ...JSON.parse(saved) } : emptyProgress();
}

function saveLocalProgress() {
  localStorage.setItem(localKey, JSON.stringify(courseProgress));
}

function renderCourseProgress() {
  const pdfOpened = Boolean(courseProgress.pdf_opened);
  const quizDone = Boolean(courseProgress.quiz_completed);
  const editorDone = Boolean(courseProgress.editor_completed);
  const completed = Number(pdfOpened) + Number(quizDone) + Number(editorDone);

  progressBar.value = completed;
  progressSummary.textContent = `${completed} de 3 atividades concluídas`;
  pdfModuleStatus.textContent = pdfOpened ? 'PDF aberto' : 'PDF não aberto';
  pdfProgressStatus.textContent = pdfOpened ? 'Aberto' : 'Não aberto';
  quizProgressStatus.textContent = quizDone
    ? 'Concluído'
    : `${courseProgress.quiz_completed_count || 0} de ${courseProgress.quiz_total || 1} acertos`;
  editorProgressStatus.textContent = editorDone ? 'Concluído' : 'Não concluído';
}

async function refreshProgress() {
  if (currentUser && window.DevAcademy) {
    const result = await DevAcademy.api('/api/course-progress?track=backend');
    courseProgress = result.course_progress;
  } else {
    courseProgress = readLocalProgress();
  }
  renderCourseProgress();
}

async function recordPdfOpened() {
  await progressReady;
  if (courseProgress.pdf_opened) return;

  if (currentUser && window.DevAcademy) {
    const result = await DevAcademy.api('/api/course-progress', {
      track: 'backend',
      module: '1',
      phase: 'pdf_opened'
    });
    courseProgress = result.course_progress;
  } else {
    courseProgress.pdf_opened = true;
    saveLocalProgress();
  }
  renderCourseProgress();
}

moduleButtons.forEach(button => {
  button.addEventListener('click', () => {
    moduleButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    modulePdf.src = 'modulo-sql.pdf#view=FitH';
    recordPdfOpened().catch(error => showProgressError(error.message));
  });
});

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
    currentUser = null;
    courseProgress = readLocalProgress();
    renderCourseProgress();
  }
})();

recordPdfOpened().catch(error => showProgressError(error.message));
