import './content.css';
import { getExtensionSettings } from '../features/download-button/model/settings';
import { STORAGE_KEYS } from '../shared/config/storageKeys';
import { DOWNLOAD_ICON_SVG } from '../shared/ui/icons';

const BUTTON_CLASS = 'ya-archive-download-btn';
const HOST_CLASS = 'ya-archive-download-host';
const BULK_BUTTON_CLASS = 'ya-archive-bulk-download-btn';
const IMG_SELECTOR = "img[src*='/archive/api/image'], img[src*='type=thumb']";

let singleDownloadEnabled = true;
let bulkDownloadEnabled = true;

function toAbsoluteUrl(src: string): URL | null {
  try {
    return new URL(src, window.location.href);
  } catch {
    return null;
  }
}

function toOriginalUrl(src: string): string | null {
  const absUrl = toAbsoluteUrl(src);
  if (!absUrl) return null;

  absUrl.searchParams.set('type', 'original');
  return absUrl.toString();
}

function getAllOriginalUrlsFromPage(): string[] {
  const urls = new Set<string>();
  document.querySelectorAll(IMG_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLImageElement)) return;
    const src = node.getAttribute('src') || '';
    const originalUrl = toOriginalUrl(src);
    if (originalUrl) {
      urls.add(originalUrl);
    }
  });
  return [...urls];
}

function findHostContainer(img: HTMLImageElement): HTMLElement | null {
  let current: HTMLElement | null = img.parentElement;
  const maxDepth = 5;
  let depth = 0;

  while (current && depth < maxDepth) {
    const rect = current.getBoundingClientRect();
    if (rect.width >= 120 && rect.height >= 120) {
      return current;
    }
    current = current.parentElement;
    depth += 1;
  }

  return img.parentElement;
}

function createPerImageButton(originalUrl: string): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = BUTTON_CLASS;
  btn.setAttribute('aria-label', 'Скачать оригинал');
  btn.title = 'Скачать оригинал';

  btn.innerHTML = DOWNLOAD_ICON_SVG;

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    chrome.runtime.sendMessage({ type: 'download-original', url: originalUrl });
  });

  return btn;
}

function createBulkButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${BULK_BUTTON_CLASS} Button2 Button2_size_s Button2_view_ghost`;
  btn.setAttribute('autocomplete', 'off');
  btn.innerHTML = `
    <span class="Icon Icon_size_m Icon_hasGlyph_noFill Icon_sizeManagement_self Button2-Icon" aria-hidden="true">
      ${DOWNLOAD_ICON_SVG}
    </span>
    <span class="Button2-Text">Скачать все на странице</span>
  `;

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const urls = getAllOriginalUrlsFromPage();
    if (urls.length === 0) {
      return;
    }

    chrome.runtime.sendMessage({ type: 'download-batch', urls });
  });

  return btn;
}

function createBulkButtonFromSortTemplate(sortButton: HTMLElement): HTMLButtonElement {
  const template = sortButton.cloneNode(false);
  const btn = template instanceof HTMLButtonElement ? template : createBulkButton();

  btn.classList.add(BULK_BUTTON_CLASS);
  btn.classList.remove('Button2_width_max');
  Array.from(btn.classList)
    .filter((className) => className.startsWith('SortOrderFilter_'))
    .forEach((className) => btn.classList.remove(className));
  btn.removeAttribute('data-tour');
  btn.removeAttribute('role');
  btn.removeAttribute('aria-haspopup');
  btn.removeAttribute('aria-expanded');
  btn.removeAttribute('aria-multiselectable');
  btn.removeAttribute('aria-pressed');
  btn.setAttribute('type', 'button');
  btn.setAttribute('autocomplete', 'off');
  btn.replaceChildren();

  const icon = document.createElement('span');
  icon.className = 'Icon Icon_size_m Icon_hasGlyph_noFill Icon_sizeManagement_self Button2-Icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.style.marginLeft = '15px';
  icon.innerHTML = DOWNLOAD_ICON_SVG;

  const text = document.createElement('span');
  text.className = 'Button2-Text';
  text.textContent = 'Скачать все';

  btn.append(icon, text);
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const urls = getAllOriginalUrlsFromPage();
    if (urls.length === 0) return;
    chrome.runtime.sendMessage({ type: 'download-batch', urls });
  });

  return btn;
}

function mountBulkButton(): void {
  const existing = document.querySelector(`.${BULK_BUTTON_CLASS}`);
  if (existing) return;

  const sortButton = document.querySelector(
    "button[role='listbox'][data-tour='sort-order-filter'], button[role='listbox']"
  );
  if (!(sortButton instanceof HTMLElement)) return;

  const host = sortButton.closest('span') ?? sortButton.parentElement;
  if (!(host instanceof HTMLElement) || !host.parentElement) return;

  const wrapper = document.createElement('span');
  wrapper.className = host.className || 'Select2 Select2_size_s Select2_view_ghost';
  wrapper.appendChild(createBulkButtonFromSortTemplate(sortButton));
  host.parentElement.insertBefore(wrapper, host.nextSibling);
}

function unmountBulkButton(): void {
  document.querySelectorAll(`.${BULK_BUTTON_CLASS}`).forEach((node) => node.remove());
}

function addButtonForImage(img: HTMLImageElement): void {
  const src = img.getAttribute('src') || '';
  const originalUrl = toOriginalUrl(src);
  if (!originalUrl) return;

  const host = findHostContainer(img);
  if (!host) return;

  if (!host.classList.contains(HOST_CLASS)) {
    host.classList.add(HOST_CLASS);
  }

  const existingButton = host.querySelector(`:scope > .${BUTTON_CLASS}`);
  if (existingButton) return;

  host.appendChild(createPerImageButton(originalUrl));
}

function removeAllImageButtons(): void {
  document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((node) => node.remove());
  document.querySelectorAll(`.${HOST_CLASS}`).forEach((node) => node.classList.remove(HOST_CLASS));
}

function processRoot(root: ParentNode): void {
  if (singleDownloadEnabled) {
    root.querySelectorAll(IMG_SELECTOR).forEach((node) => {
      if (node instanceof HTMLImageElement) {
        addButtonForImage(node);
      }
    });
  }

  if (bulkDownloadEnabled) {
    mountBulkButton();
  }
}

function rerender(): void {
  if (!singleDownloadEnabled) {
    removeAllImageButtons();
  } else {
    processRoot(document);
  }

  if (!bulkDownloadEnabled) {
    unmountBulkButton();
  } else {
    mountBulkButton();
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element || node instanceof DocumentFragment) {
        processRoot(node);
      }
    });
  }
});

async function init(): Promise<void> {
  const settings = await getExtensionSettings();
  singleDownloadEnabled = settings.downloadButtonEnabled;
  bulkDownloadEnabled = settings.bulkDownloadEnabled;

  rerender();

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    if (STORAGE_KEYS.downloadButtonEnabled in changes) {
      const nextValue = changes[STORAGE_KEYS.downloadButtonEnabled]?.newValue;
      singleDownloadEnabled = typeof nextValue === 'boolean' ? nextValue : true;
    }

    if (STORAGE_KEYS.bulkDownloadEnabled in changes) {
      const nextValue = changes[STORAGE_KEYS.bulkDownloadEnabled]?.newValue;
      bulkDownloadEnabled = typeof nextValue === 'boolean' ? nextValue : true;
    }

    rerender();
  });
}

void init();
