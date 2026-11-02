let currentUser = null;
let availableModules = [];

// Gerencia destinos e preferências do quiz
function lastTrackKey() {
  return currentUser?.email ? 'devAcademyLastTrack:' + encodeURIComponent(currentUser.email) : null;
}

function rememberDestination(destination) {
  try {
    const url = new URL(destination, location.href);
    const track = url.searchParams.get('track');
    const key = lastTrackKey() || 'devAcademyLastTrack';
    if (track && ['web', 'backend'].includes(track)) {
      localStorage.setItem(key, track);
    }
  } catch (error) {}
}

function setLinkText(link, text) {
  if (!link) return;
  link.replaceChildren(document.createTextNode(text + ' '));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  link.append(arrow);
}

function updateMetric(track, progress) {
  const modules = document.querySelector('[data-module-count="' + track + '"]');
  if (modules && progress.modules) {
    modules.textContent = progress.modules.length;
    if (modules.nextSibling) {
      modules.nextSibling.textContent = progress.modules.length === 1 ? ' módulo disponível' : ' módulos disponíveis';
    }
  }
  const questions = document.querySelector('[data-question-count="' + track + '"]');
  if (questions) {
    questions.textContent = progress.total;
    if (questions.nextSibling) {
      questions.nextSibling.textContent = progress.total === 1 ? ' questão' : ' questões';
    }
  }
}

// Atualização de sessão se o backend estiver disponível
if (window.DevAcademy) {
  DevAcademy.ready.then(async user => {
    currentUser = user;
    document.body.classList.toggle('is-authenticated', !!user);
    document.querySelectorAll('[data-guest]').forEach(el => el.hidden = !!user);
    document.querySelectorAll('[data-member], [data-logout]').forEach(el => el.hidden = !user);

    if (user) {
      try {
        const result = await DevAcademy.api('/api/progress');
        availableModules = Object.entries(result.tracks).flatMap(([track, p]) => (p.modules || []).map(module => ({ ...module, track })));
        
        document.querySelectorAll('[data-track]').forEach(card => {
          const progress = result.tracks[card.dataset.track];
          if (!progress) return;
          updateMetric(card.dataset.track, progress);
          const progBar = card.querySelector('progress');
          if (progBar) progBar.value = progress.percent;
          const perc = card.querySelector('[data-percent]');
          if (perc) perc.textContent = progress.percent + '%';
          const detail = card.querySelector('[data-progress-detail]');
          if (detail) detail.textContent = progress.completed + ' de ' + progress.total + ' pergunta(s) com acerto';
          const link = card.closest('a')?.querySelector('.course-link');
          setLinkText(link, progress.status === 'completed' ? 'Revisar módulo' : progress.status === 'in_progress' ? 'Continuar módulo' : 'Começar módulo');
        });
      } catch (error) {}
    }
  }).catch(() => {});
}

// Links para o quiz iniciam diretamente
document.querySelectorAll('[data-quiz-link]').forEach(link => {
  link.addEventListener('click', () => {
    rememberDestination(link.href);
  });
});

for (const id of ['hero-start']) {
  const link = document.getElementById(id);
  if (link) link.addEventListener('click', () => rememberDestination(link.href));
}

// Mantém a marca legível mesmo quando uma imagem não é encontrada
document.querySelectorAll('[data-robot-image]').forEach(img => {
  const fallback = () => {
    img.hidden = true;
    const sibling = img.nextElementSibling;
    if (sibling) sibling.hidden = false;
  };
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth) fallback();
});
