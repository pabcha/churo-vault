const DATA_URL = 'https://raw.githubusercontent.com/pabcha/apps-configs/refs/heads/main/churo-vaul.resource.json';
const PROMPT_PREVIEW_LIMIT = 80;

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const toastEl = document.getElementById('toast');
const dialogEl = document.getElementById('prompt-dialog');
const dialogTitleEl = document.getElementById('prompt-dialog-title');
const dialogContentEl = document.getElementById('prompt-dialog-content');
const dialogCloseEl = document.getElementById('prompt-dialog-close');
const dialogCopyEl = document.getElementById('prompt-dialog-copy');
let toastTimer = null;
let lastTriggerEl = null;
let activeDialogPromptContent = '';

function normalizePromptPreview(content) {
  const text = typeof content === 'string' ? content : '';
  return text
    .replace(/\\r\\n|\\r|\\n/g, ' ')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function truncatePrompt(content, limit = PROMPT_PREVIEW_LIMIT) {
  const text = normalizePromptPreview(content);
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

function openPromptDialog(prompt, triggerEl) {
  if (!dialogEl || !dialogTitleEl || !dialogContentEl) return;

  lastTriggerEl = triggerEl || null;
  const promptName = prompt?.name || 'Sin título';
  const promptContent = typeof prompt?.content === 'string' ? prompt.content : '';
  activeDialogPromptContent = promptContent;

  dialogTitleEl.textContent = promptName;

  dialogContentEl.textContent = promptContent;

  if (dialogCopyEl) {
    dialogCopyEl.textContent = 'Copiar';
    dialogCopyEl.setAttribute('aria-label', `Copiar prompt ${promptName}`);
  }

  dialogEl.showModal();
}

function closePromptDialog() {
  if (!dialogEl?.open) return;
  dialogEl.close();
}

function setupDialog() {
  if (!dialogEl) return;

  if (dialogCloseEl) {
    dialogCloseEl.addEventListener('click', closePromptDialog);
  }

  if (dialogCopyEl) {
    dialogCopyEl.addEventListener('click', () => {
      copyToClipboard(activeDialogPromptContent, dialogCopyEl);
    });
  }

  dialogEl.addEventListener('cancel', (event) => {
    event.preventDefault();
    closePromptDialog();
  });

  dialogEl.addEventListener('click', (event) => {
    const rect = dialogEl.getBoundingClientRect();
    const isInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInDialog) {
      closePromptDialog();
    }
  });

  dialogEl.addEventListener('close', () => {
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
    lastTriggerEl = null;
  });
}

function createCard(prompt) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = prompt.name || 'Sin título';

  const text = document.createElement('p');
  text.className = 'prompt prompt-clickable';
  text.textContent = truncatePrompt(prompt.content);
  text.setAttribute('role', 'button');
  text.setAttribute('tabindex', '0');
  text.setAttribute('aria-label', `Ver detalle de prompt ${prompt.name || ''}`.trim());
  text.setAttribute('title', 'Ver prompt completo');
  text.addEventListener('click', () => openPromptDialog(prompt, text));
  text.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPromptDialog(prompt, text);
    }
  });

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
    renderPrompts(data.map((p) => ({ ...p })));
  } catch (err) {
    console.error('Error al cargar prompts:', err);
    setStatus('No pude cargar tus prompts.', { isError: true });
    showToast('No pude cargar los prompts');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupDialog();
  loadPrompts();
});
