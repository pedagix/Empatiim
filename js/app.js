const DATA_URL = 'data/content.json';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeMobileMenu();
}

function closeMobileMenu() {
  const menu = $('#navLinks');
  const toggle = $('#menuToggle');
  menu?.classList.remove('is-open');
  toggle?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
}

function renderNavigation(items = []) {
  const nav = $('#navLinks');
  nav.innerHTML = items.map(item => `
    <li><a href="#${escapeHtml(item.target)}" data-scroll-target="${escapeHtml(item.target)}">${escapeHtml(item.label)}</a></li>
  `).join('');
}

function renderHero(hero = {}) {
  $('#heroTitle').textContent = hero.title || '';
  $('#heroSubtitle').textContent = hero.subtitle || '';
  $('#heroBadges').innerHTML = (hero.badges || [])
    .map(badge => `<span class="badge">${escapeHtml(badge)}</span>`)
    .join('');
}

function renderAbout(about = {}, audiences = []) {
  $('#aboutTitle').textContent = about.title || '';
  $('#aboutText').textContent = about.text || '';
  $('#audienceGrid').innerHTML = audiences.map(audience => `
    <article class="audience-card ${audience.variant === 'dark' ? 'dark' : ''}" data-emoji="${escapeHtml(audience.emoji || '')}">
      <p class="card-label">${escapeHtml(audience.label)}</p>
      <h3>${escapeHtml(audience.title)}</h3>
      <p>${escapeHtml(audience.text)}</p>
      <ul class="clean-list">
        ${(audience.points || []).map(point => `<li>${escapeHtml(point)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderServices(services = []) {
  $('#servicesGrid').innerHTML = services.map(service => `
    <article class="service-card">
      <div class="service-top">
        <div class="service-icon" aria-hidden="true">${escapeHtml(service.icon)}</div>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.text)}</p>
      </div>
      <ul class="pill-list">
        ${(service.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderInsight(insight = {}) {
  $('#insightQuote').textContent = insight.quote || '';
  $('#insightList').innerHTML = (insight.points || []).map(point => `
    <li><p><strong>${escapeHtml(point.title)}</strong>${escapeHtml(point.text)}</p></li>
  `).join('');
}

function renderThemes(themes = []) {
  $('#themesGrid').innerHTML = themes.map(theme => `
    <article class="theme-card">
      <h3>${escapeHtml(theme.title)}</h3>
      <p>${escapeHtml(theme.text)}</p>
    </article>
  `).join('');
}

function renderEpisodes(episodes = []) {
  const track = $('#episodesTrack');
  const dots = $('#episodeDots');

  track.innerHTML = episodes.map((episode, index) => `
    <article class="episode-card">
      <span class="episode-number">Del ${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(episode.title)}</h3>
      <p>${escapeHtml(episode.text)}</p>
    </article>
  `).join('');

  const dotCount = Math.max(1, Math.ceil(episodes.length / 3));
  dots.innerHTML = Array.from({ length: dotCount }, (_, index) => `
    <button type="button" aria-label="Gå till grupp ${index + 1}" data-dot-index="${index}" class="${index === 0 ? 'active' : ''}"></button>
  `).join('');

  $('#episodePrev').addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' });
  });
  $('#episodeNext').addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
  });
  dots.addEventListener('click', event => {
    const button = event.target.closest('button[data-dot-index]');
    if (!button) return;
    const index = Number(button.dataset.dotIndex);
    track.scrollTo({ left: index * track.clientWidth * 0.9, behavior: 'smooth' });
  });
  track.addEventListener('scroll', () => {
    const activeIndex = Math.round(track.scrollLeft / (track.clientWidth * 0.9));
    $$('button', dots).forEach((button, index) => button.classList.toggle('active', index === activeIndex));
  }, { passive: true });
}

function renderGoals(goals = []) {
  $('#goalsGrid').innerHTML = goals.map((goal, index) => `
    <article class="goal-card">
      <span class="goal-number">${index + 1}</span>
      <div>
        <h3>${escapeHtml(goal.title)}</h3>
        <p>${escapeHtml(goal.text)}</p>
      </div>
    </article>
  `).join('');
}

function renderContact(contact = {}) {
  $('#contactTitle').textContent = contact.title || '';
  $('#contactText').textContent = contact.text || '';
  const button = $('#contactButton');
  button.textContent = contact.buttonLabel || 'Skicka e-post';
  button.href = `mailto:${contact.email || 'benjamin.vonkraemer@gmail.com'}`;
}

function setupInteractions() {
  const toggle = $('#menuToggle');
  const menu = $('#navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-scroll-target]');
    if (!link) return;
    const targetId = link.dataset.scrollTarget;
    if (!targetId) return;
    event.preventDefault();
    scrollToSection(targetId);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileMenu();
  });
}

function setupActiveSectionTracking() {
  const sections = $$('[data-section]');
  const links = $$('.nav-links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.dataset.scrollTarget === entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
  sections.forEach(section => observer.observe(section));
}

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Kunde inte läsa ${DATA_URL}`);
    const data = await response.json();

    renderNavigation(data.navigation);
    renderHero(data.hero);
    renderAbout(data.about, data.audiences);
    renderServices(data.services);
    renderInsight(data.insight);
    renderThemes(data.themes);
    renderEpisodes(data.episodes);
    renderGoals(data.goals);
    renderContact(data.contact);
    $('#footerText').textContent = data.site?.footer || '';

    setupInteractions();
    setupActiveSectionTracking();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('afterbegin', `
      <div style="padding:1rem;background:#F28C6B;color:white;text-align:center;font-weight:800;">
        Innehållet kunde inte laddas. Kör sidan via en lokal server eller GitHub Pages så att JSON-filen kan hämtas.
      </div>
    `);
  }
}

init();
