const DATA_URL = 'data/content.json';
const VIDEOS_URL = 'data/videos.json';
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

function getLeadingNumber(filename = '') {
  const cleanName = String(filename).split(/[\\/]/).pop().trim();
  const match = cleanName.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function getTitleFromFilename(filename = '') {
  return String(filename)
    .split(/[\\/]/)
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+\s*/, '')
    .trim();
}

function getThumbnailPath(thumbnail = '', folder = '') {
  const value = String(thumbnail).trim();
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('/') || value.includes('/')) return value;
  return `${String(folder).replace(/\/$/, '')}/${value}`;
}

function normalizeVideos(manifest = {}) {
  const folder = manifest.thumbnailFolder || 'assets/VideoThumbnails/Low res';
  const items = manifest.items || manifest.videos || [];

  return items
    .map(item => {
      const thumbnail = item.thumbnail || item.file || '';
      const order = getLeadingNumber(thumbnail);
      const caption = item.caption || '';
      const title = item.title || caption || `Video ${order}`;

      return {
        order,
        title,
        caption,
        thumbnailPath: getThumbnailPath(thumbnail, folder),
        youtubeUrl: item.youtubeUrl || item.url || ''
      };
    })
    .filter(video => Number.isInteger(video.order) && video.thumbnailPath)
    .sort((first, second) => first.order - second.order);
}

function getYouTubeEmbedUrl(value = '') {
  const rawUrl = String(value).trim();
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, '');
    let id = '';

    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      if (pathParts[0] === 'embed' || pathParts[0] === 'shorts') id = pathParts[1] || '';
    }

    if (!id) return '';

    const start = url.searchParams.get('start');
    const startQuery = start ? `&start=${encodeURIComponent(start)}` : '';
    return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0${startQuery}`;
  } catch (error) {
    return '';
  }
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
  const grid = $('#themesGrid');
  if (!grid) return;
  grid.innerHTML = themes.map(theme => `
    <article class="theme-card">
      <h3>${escapeHtml(theme.title)}</h3>
      <p>${escapeHtml(theme.text)}</p>
    </article>
  `).join('');
}

function renderEpisodeFallbackCards(episodes = []) {
  const track = $('#episodesTrack');

  track.innerHTML = episodes.map((episode, index) => `
    <article class="episode-card">
      <span class="episode-number">Del ${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(episode.title)}</h3>
      <p>${escapeHtml(episode.text)}</p>
    </article>
  `).join('');

  setupCarouselDots(Math.max(1, Math.ceil(episodes.length / 3)));
}

function renderEpisodes(videos = []) {
  const track = $('#episodesTrack');

  if (!videos.length) {
    renderEpisodeFallbackCards([]);
    return;
  }

  track.innerHTML = videos.map(video => {
    const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl);
    const hasVideo = Boolean(embedUrl);
    const title = video.title || `Video ${video.order}`;
    const caption = video.caption || '';

    return `
      <article class="episode-card thumbnail-card ${hasVideo ? 'has-video' : ''}">
        <button
          class="thumbnail-button"
          type="button"
          data-video-url="${escapeHtml(video.youtubeUrl)}"
          data-video-title="${escapeHtml(title)}"
          aria-label="${hasVideo ? `Spela ${escapeHtml(title)}` : escapeHtml(title)}"
          ${hasVideo ? '' : 'aria-disabled="true"'}
        >
          <img src="${escapeHtml(encodeURI(video.thumbnailPath))}" alt="${escapeHtml(title)}" loading="lazy" />
          <span class="thumbnail-play" aria-hidden="true"></span>
        </button>
        ${caption ? `<h3>${escapeHtml(caption)}</h3>` : ''}
      </article>
    `;
  }).join('');

  setupCarouselDots(Math.max(1, Math.ceil(videos.length / 3)));
}

function setupCarouselDots(dotCount) {
  const dots = $('#episodeDots');
  dots.innerHTML = Array.from({ length: dotCount }, (_, index) => `
    <button type="button" aria-label="Gå till grupp ${index + 1}" data-dot-index="${index}" class="${index === 0 ? 'active' : ''}"></button>
  `).join('');
}

function setupCarouselInteractions() {
  const track = $('#episodesTrack');
  const dots = $('#episodeDots');

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
    const buttons = $$('button', dots);
    const activeIndex = Math.min(
      Math.max(Math.round(track.scrollLeft / (track.clientWidth * 0.9)), 0),
      Math.max(buttons.length - 1, 0)
    );
    buttons.forEach((button, index) => button.classList.toggle('active', index === activeIndex));
  }, { passive: true });

  track.addEventListener('click', event => {
    const button = event.target.closest('.thumbnail-button');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    openVideoModal(button.dataset.videoUrl, button.dataset.videoTitle);
  });
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
  button.textContent = contact.buttonLabel || 'Ta kontakt';
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

function openVideoModal(videoUrl, title = '') {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  if (!embedUrl) return;

  const modal = $('#videoModal');
  const frame = $('#videoFrame');
  const titleElement = $('#videoModalTitle');

  titleElement.textContent = title || 'Video';
  frame.src = embedUrl;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  closeMobileMenu();

  window.setTimeout(() => $('#videoClose')?.focus(), 160);
}

function closeVideoModal() {
  const modal = $('#videoModal');
  const frame = $('#videoFrame');

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  frame.src = '';
}

function setupVideoModal() {
  const modal = $('#videoModal');
  if (!modal) return;

  $('#videoClose')?.addEventListener('click', closeVideoModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeVideoModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeVideoModal();
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
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Kunde inte läsa ${DATA_URL}`);
    const data = await response.json();
    const videoResponse = await fetch(VIDEOS_URL, { cache: 'no-store' });
    const videoManifest = videoResponse.ok ? await videoResponse.json() : {};
    const videos = normalizeVideos(videoManifest);

    renderNavigation(data.navigation);
    renderHero(data.hero);
    renderAbout(data.about, data.audiences);
    renderServices(data.services);
    renderInsight(data.insight);
    renderThemes(data.themes);
    videos.length ? renderEpisodes(videos) : renderEpisodeFallbackCards(data.episodes);
    renderGoals(data.goals);
    renderContact(data.contact);
    $('#footerText').textContent = data.site?.footer || '';

    setupInteractions();
    setupCarouselInteractions();
    setupVideoModal();
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
