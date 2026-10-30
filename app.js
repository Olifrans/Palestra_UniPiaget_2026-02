(() => {
  const slides = window.PRESENTATION_SLIDES || [];
  if (!slides.length) return;

  const frame = document.querySelector('#slideFrame');
  const stage = document.querySelector('#stage');
  const title = document.querySelector('#slideTitle');
  const counter = document.querySelector('#slideCounter');
  const progress = document.querySelector('#progressBar');
  const progressTrack = document.querySelector('#progressTrack');
  const notesPanel = document.querySelector('#notesPanel');
  const notesText = document.querySelector('#notesText');
  const notesButton = document.querySelector('#notesButton');
  const overview = document.querySelector('#overview');
  const overviewButton = document.querySelector('#overviewButton');
  const slideGrid = document.querySelector('#slideGrid');
  let current = 0;

  const pad = (number) => String(number).padStart(2, '0');

  function fitSlide() {
    const scale = Math.min(stage.clientWidth / 1280, stage.clientHeight / 720);
    frame.style.setProperty('--slide-scale', String(scale));
  }

  function render(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    const slide = slides[current];
    frame.src = slide.file;
    frame.title = `Slide ${current + 1}: ${slide.title}`;
    title.textContent = slide.title;
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    notesText.textContent = slide.notes || 'Sem nota do apresentador para este slide.';
    document.querySelector('#previousButton').disabled = current === 0;
    document.querySelector('#nextButton').disabled = current === slides.length - 1;
    [...slideGrid.children].forEach((item, index) => item.setAttribute('aria-current', String(index === current)));
  }

  function closeOverview() {
    overview.hidden = true;
    overviewButton.setAttribute('aria-expanded', 'false');
  }

  function toggleOverview() {
    overview.hidden = !overview.hidden;
    overviewButton.setAttribute('aria-expanded', String(!overview.hidden));
    if (!overview.hidden) document.querySelector('#closeOverview').focus();
  }

  function handleKeyboard(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!overview.hidden && event.key === 'Escape') { closeOverview(); return; }
    if (event.target instanceof HTMLButtonElement && ['Enter', ' '].includes(event.key)) return;
    switch (event.key) {
      case 'ArrowRight': case 'PageDown': case ' ': event.preventDefault(); render(current + 1); break;
      case 'ArrowLeft': case 'PageUp': event.preventDefault(); render(current - 1); break;
      case 'Home': render(0); break;
      case 'End': render(slides.length - 1); break;
      case 'f': case 'F': document.querySelector('#fullscreenButton').click(); break;
      case 'n': case 'N': notesButton.click(); break;
      case 'o': case 'O': toggleOverview(); break;
    }
  }

  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.className = 'overview-item';
    button.type = 'button';
    button.innerHTML = `<span class="overview-preview"><iframe src="${slide.file}" tabindex="-1" title=""></iframe></span><span class="overview-label">${pad(index + 1)} · ${slide.title}</span>`;
    button.addEventListener('click', () => { render(index); closeOverview(); });
    slideGrid.appendChild(button);
  });

  document.querySelector('#previousButton').addEventListener('click', () => render(current - 1));
  document.querySelector('#nextButton').addEventListener('click', () => render(current + 1));
  document.querySelector('#overviewButton').addEventListener('click', toggleOverview);
  document.querySelector('#closeOverview').addEventListener('click', closeOverview);
  notesButton.addEventListener('click', () => {
    notesPanel.hidden = !notesPanel.hidden;
    notesButton.setAttribute('aria-pressed', String(!notesPanel.hidden));
  });
  document.querySelector('#fullscreenButton').addEventListener('click', async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });
  progressTrack.addEventListener('click', (event) => {
    const bounds = progressTrack.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    render(Math.round(fraction * (slides.length - 1)));
  });
  overview.addEventListener('click', (event) => { if (event.target === overview) closeOverview(); });
  document.addEventListener('keydown', handleKeyboard);
  window.addEventListener('resize', fitSlide);
  if ('ResizeObserver' in window) new ResizeObserver(fitSlide).observe(stage);
  frame.addEventListener('load', () => {
    try { frame.contentWindow.addEventListener('keydown', handleKeyboard); } catch { /* Navegador pode restringir conteúdo local via file://. */ }
  });

  fitSlide();
  render(0);
})();
