const DATA_URL = 'https://raw.githubusercontent.com/pabcha/apps-configs/refs/heads/main/churo-vaul.resource.json';
const PROMPT_PREVIEW_LIMIT = 60;

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function truncatePrompt(content, limit = PROMPT_PREVIEW_LIMIT) {
  const text = typeof content === 'string' ? content : '';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}...`;
}

function setStatus(message, { isError = false } = {}) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fca5a5' : 'var(--muted)';
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 2000);
}

async function copyToClipboard(text, button) {
  const originalLabel = button?.textContent;
  const originalAria = button?.getAttribute('aria-label');
  if (button) {
    button.disabled = true;
    button.textContent = '¡Copiado!';
    button.setAttribute('aria-label', '¡Copiado!');
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    showToast('¡Listo! Prompt copiado');
  } catch (err) {
    console.error('Error al copiar:', err);
    showToast('No pude copiar el prompt');
  } finally {
    if (button) {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalLabel || 'Copiar';
        button.setAttribute('aria-label', originalAria || 'Copiar');
      }, 1200);
    }
  }
}

function createCard(prompt) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = prompt.name || 'Sin título';

  const text = document.createElement('p');
  text.className = 'prompt';
  text.textContent = truncatePrompt(prompt.content);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const button = document.createElement('button');
  button.className = 'button';
  button.type = 'button';
  button.textContent = 'Copiar';
  button.setAttribute('aria-label', `Copiar prompt ${prompt.name || ''}`.trim());
  button.addEventListener('click', () => copyToClipboard(prompt.content || '', button));

  actions.appendChild(button);
  card.appendChild(title);
  card.appendChild(text);
  card.appendChild(actions);
  return card;
}

function renderPrompts(prompts) {
  gridEl.innerHTML = '';
  if (!Array.isArray(prompts) || prompts.length === 0) {
    setStatus('Aún no tienes prompts guardados.');
    return;
  }

  const fragment = document.createDocumentFragment();
  prompts.forEach((item) => {
    fragment.appendChild(createCard(item));
  });
  gridEl.appendChild(fragment);
  setStatus(`${prompts.length} prompts listos.`);
}

async function loadPrompts() {
  setStatus('Preparando tus prompts...');
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('El JSON no es un array.');
    }
    renderPrompts(data.map((p) => ({ id: p.id, name: p.name, content: p.content })));
  } catch (err) {
    console.error('Error al cargar prompts:', err);
    setStatus('No pude cargar tus prompts.', { isError: true });
    showToast('No pude cargar los prompts');
  }
}

document.addEventListener('DOMContentLoaded', loadPrompts);
