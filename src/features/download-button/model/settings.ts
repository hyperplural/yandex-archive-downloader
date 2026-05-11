import { STORAGE_KEYS } from '../../../shared/config/storageKeys';
import type { ExtensionSettings } from './types';

const DEFAULT_SETTINGS: ExtensionSettings = {
  downloadButtonEnabled: true,
  bulkDownloadEnabled: true
};

export async function getExtensionSettings(): Promise<ExtensionSettings> {
  const values = await chrome.storage.sync.get([
    STORAGE_KEYS.downloadButtonEnabled,
    STORAGE_KEYS.bulkDownloadEnabled
  ]);

  const downloadButtonEnabled =
    typeof values[STORAGE_KEYS.downloadButtonEnabled] === 'boolean'
      ? values[STORAGE_KEYS.downloadButtonEnabled]
      : DEFAULT_SETTINGS.downloadButtonEnabled;

  const bulkDownloadEnabled =
    typeof values[STORAGE_KEYS.bulkDownloadEnabled] === 'boolean'
      ? values[STORAGE_KEYS.bulkDownloadEnabled]
      : DEFAULT_SETTINGS.bulkDownloadEnabled;

  return {
    downloadButtonEnabled,
    bulkDownloadEnabled
  };
}

export async function setDownloadButtonEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.downloadButtonEnabled]: enabled });
}

export async function setBulkDownloadEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.bulkDownloadEnabled]: enabled });
}
