import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  getExtensionSettings,
  setBulkDownloadEnabled,
  setDownloadButtonEnabled
} from '../features/download-button/model/settings';
import './styles.css';

function App() {
  const [downloadButtonEnabled, setDownloadButtonState] = useState<boolean>(true);
  const [bulkDownloadEnabled, setBulkDownloadState] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void (async () => {
      const settings = await getExtensionSettings();
      setDownloadButtonState(settings.downloadButtonEnabled);
      setBulkDownloadState(settings.bulkDownloadEnabled);
      setLoading(false);
    })();
  }, []);

  const onToggleDownloadButton = async () => {
    const next = !downloadButtonEnabled;
    setDownloadButtonState(next);
    await setDownloadButtonEnabled(next);
  };

  const onToggleBulkDownload = async () => {
    const next = !bulkDownloadEnabled;
    setBulkDownloadState(next);
    await setBulkDownloadEnabled(next);
  };

  return (
    <main className='popup'>
      <section className='card'>
        <h1 className='title'>Yandex Archive Downloader</h1>
        <p className='subtitle'>Управление функциями расширения</p>

        <div className='row'>
          <span className='label'>Кнопка скачивания</span>
          <button
            type='button'
            className='switch'
            role='switch'
            aria-checked={downloadButtonEnabled}
            aria-label='Кнопка скачивания'
            onClick={onToggleDownloadButton}
            disabled={loading}
          />
        </div>

        <div className='row row-with-gap'>
          <span className='label'>Скачать все на странице</span>
          <button
            type='button'
            className='switch'
            role='switch'
            aria-checked={bulkDownloadEnabled}
            aria-label='Скачать все на странице'
            onClick={onToggleBulkDownload}
            disabled={loading}
          />
        </div>
      </section>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Popup root container not found');
}

createRoot(root).render(<App />);
