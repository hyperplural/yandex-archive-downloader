function getFileNameByUrl(url: string, index: number): string {
  const idMatch = url.match(/[?&]id=([^&]+)/i);
  if (idMatch) {
    return `${decodeURIComponent(idMatch[1])}.jpg`;
  }
  return `archive_scan_${index + 1}.jpg`;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'download-original' && typeof message.url === 'string') {
    chrome.downloads.download(
      {
        url: message.url,
        filename: getFileNameByUrl(message.url, 0),
        saveAs: false
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }

        sendResponse({ ok: true, downloadId });
      }
    );

    return true;
  }

  if (message?.type === 'download-batch' && Array.isArray(message.urls)) {
    const urls = message.urls.filter((url: unknown): url is string => typeof url === 'string');

    let started = 0;
    for (const [index, url] of urls.entries()) {
      chrome.downloads.download(
        {
          url,
          filename: getFileNameByUrl(url, index),
          saveAs: false
        },
        () => {
          if (!chrome.runtime.lastError) {
            started += 1;
          }
        }
      );
    }

    sendResponse({ ok: true, requested: urls.length, started });
  }
});
