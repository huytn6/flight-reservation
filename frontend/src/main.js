import { API_BASE } from './config.js';

const statusEl = document.querySelector('#api-status');
const summaryEl = document.querySelector('#summary');
const gridEl = document.querySelector('#airport-grid');
const refreshButton = document.querySelector('#refresh-button');

function setStatus(text, tone) {
  statusEl.textContent = text;
  statusEl.dataset.tone = tone;
}

function airportCard(airport) {
  const article = document.createElement('article');
  article.className = 'airport-card';

  const code = document.createElement('div');
  code.className = 'airport-code';
  code.textContent = airport.iata_code || '--';

  const details = document.createElement('div');
  details.className = 'airport-details';

  const name = document.createElement('h3');
  name.textContent = airport.name || 'Unnamed airport';

  const meta = document.createElement('p');
  meta.textContent = [airport.city, airport.country].filter(Boolean).join(', ');

  details.append(name, meta);
  article.append(code, details);
  return article;
}

function extractAirports(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function loadAirports() {
  setStatus('Loading', 'pending');
  summaryEl.textContent = 'Loading airport data';
  gridEl.replaceChildren();
  refreshButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/airports?size=12`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const airports = extractAirports(payload);

    gridEl.replaceChildren(...airports.map(airportCard));
    summaryEl.textContent = `${airports.length} airports loaded`;
    setStatus('API Online', 'ok');
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'empty-state';
    message.textContent = `Backend unavailable: ${error.message}`;
    gridEl.replaceChildren(message);
    summaryEl.textContent = 'No airport data loaded';
    setStatus('API Offline', 'error');
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', loadAirports);
loadAirports();
