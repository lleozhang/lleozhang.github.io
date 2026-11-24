const byId = (id) => document.getElementById(id);

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(label, href) {
  const node = element('a', label);
  node.href = href;
  return node;
}

const theme = byId('theme');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let preference;
try { preference = localStorage.getItem('research-homepage-theme'); } catch {}

function updateTheme() {
  const dark = preference ? preference === 'dark' : systemTheme.matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  theme.setAttribute('aria-pressed', String(dark));
}

updateTheme();
systemTheme.addEventListener('change', updateTheme);
theme.addEventListener('click', () => {
  preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('research-homepage-theme', preference); } catch {}
  updateTheme();
});

function datedItem(date, description) {
  const row = element('li');
  row.append(element('span', date, 'meta'), element('span', description));
  return row;
}

function citation(bibtex) {
  const details = element('details');
  const pre = element('pre');
  const code = element('code', bibtex);
  const copy = element('button', 'Copy BibTeX');
  const status = element('span');
  status.setAttribute('role', 'status');
  copy.type = 'button';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      status.textContent = ' Copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = ' Text selected. Press Command+C or Ctrl+C to copy.';
    }
  });
  pre.append(code);
  details.append(element('summary', 'BibTeX'), pre, copy, status);
  return details;
}

function paperCard(paper, name) {
  const article = element('article');
  const image = element('img');
  image.src = paper.thumbnail || './assets/diffusion.png';
  image.alt = paper.thumbnailAlt || '';
  image.loading = 'lazy';
  image.width = 320;
  image.height = 200;
  const body = element('div');
  const authors = element('p');
  paper.authors.forEach((author, index) => {
    if (index) authors.append(', ');
    authors.append(author === name ? element('strong', author) : author);
  });
  body.append(element('h3', paper.title), authors,
    element('p', [paper.venue, paper.year, ...paper.topics].filter(Boolean).join(' · '), 'meta'),
    element('p', paper.description));
  const links = element('div', '', 'links');
  for (const [label, href] of Object.entries(paper.links || {})) {
    if (href) links.append(link(label, href));
  }
  if (links.childElementCount) body.append(links);
  if (paper.bibtex) body.append(citation(paper.bibtex));
  article.append(image, body);
  return article;
}

async function load() {
  const response = await fetch('./data.json');
  if (!response.ok) throw new Error('Could not load data.json');
  const { profile, interests, news, experience, publications } = await response.json();
  document.title = profile.name + ' · Research';
  for (const [id, value] of Object.entries({
    brand: profile.name,
    name: profile.name,
    role: [profile.role, profile.institution].filter(Boolean).join(' · '),
    bio: profile.bio,
    footer: profile.footer
  })) byId(id).textContent = value;

  byId('portrait').src = profile.photo || './assets/profile.png';
  byId('portrait').alt = profile.photoAlt || '';
  for (const { label, href } of profile.links || []) {
    if (href) byId('contacts').append(link(label, href));
  }
  if (profile.cv) {
    byId('cv-link').href = profile.cv;
    byId('cv-link').hidden = false;
  }
  byId('interests').append(...interests.map((interest) => element('li', interest)));
  byId('updates').append(...[...news].sort((a, b) => b.date.localeCompare(a.date))
    .map(({ date, text }) => datedItem(date, text)));
  byId('experience').append(...experience.map(({ period, text }) => datedItem(period, text)));

  const year = byId('year');
  const topic = byId('topic');
  const search = byId('search');
  const papers = [...publications].sort((a, b) => b.year - a.year);
  const years = new Set(papers.map((paper) => paper.year));
  const topics = [...new Set(papers.flatMap((paper) => paper.topics))].sort();
  for (const value of years) year.add(new Option(value, value));
  for (const value of topics) topic.add(new Option(value, value));

  function renderPapers() {
    const words = search.value.toLowerCase().trim().split(/\s+/);
    const matching = papers.filter((paper) => {
      const searchText = [paper.title, paper.venue, paper.description, ...paper.authors, ...paper.topics].join(' ').toLowerCase();
      return (!year.value || String(paper.year) === year.value)
        && (!topic.value || paper.topics.includes(topic.value))
        && words.every((word) => searchText.includes(word));
    });
    byId('count').textContent = matching.length + ' of ' + papers.length + ' publications';
    byId('papers').replaceChildren(...(matching.length
      ? matching.map((paper) => paperCard(paper, profile.name))
      : [element('p', 'No publications match the current filters.', 'empty')]));
  }
  search.addEventListener('input', renderPapers);
  year.addEventListener('change', renderPapers);
  topic.addEventListener('change', renderPapers);
  renderPapers();
  byId('content').hidden = false;
  byId('load').hidden = true;
  if (location.hash) byId(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

load().catch((error) => {
  byId('load').textContent = location.protocol === 'file:'
    ? 'Open this site through a local web server to load data.json. See README.md for setup.'
    : 'Could not load the homepage. Check that data.json is available and valid.';
  console.error(error);
});
