import { Book, GasConfig } from '../types';
import { INITIAL_BOOKS } from '../data/initialBooks';

const STORAGE_KEY = 'perpus_ddc_books_v1';
const CONFIG_KEY = 'perpus_gas_config_v1';

export const getSavedGasConfig = (): GasConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading GAS config', e);
  }
  return {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbyxrE8_hDFoUPi7sbmi9SPHs7-O5DdYjuLP8Q0MzlTPT2_QSzwYdqxf_2M4mjyzppXW/exec',
    sheetName: 'Katalog_Buku',
    autoSync: false,
    isConnected: false,
  };
};

export const saveGasConfig = (config: GasConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving GAS config', e);
  }
};

export const getLocalBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local books', e);
  }
  // Initialize with initial books
  saveLocalBooks(INITIAL_BOOKS);
  return INITIAL_BOOKS;
};

export const saveLocalBooks = (books: Book[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Error saving local books', e);
  }
};

/**
 * Test connection to Google Apps Script Web App
 */
export const testGasConnection = async (webAppUrl: string): Promise<{ success: boolean; message: string; count?: number }> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl.includes('script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Pastikan URL berformat https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=getBooks` : `${cleanUrl}?action=getBooks`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Koneksi gagal (HTTP ${response.status}). Pastikan hak akses Apps Script diatur ke 'Siapa Saja' (Anyone).`,
      };
    }

    const data = await response.json();
    if (data.status === 'success') {
      return {
        success: true,
        message: `Terhubung! Ditemukan ${data.total ?? (data.data?.length || 0)} data buku di Google Sheets.`,
        count: data.total ?? (data.data?.length || 0),
      };
    } else {
      return {
        success: false,
        message: data.message || 'Respons Apps Script mengembalikan status kesalahan.',
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal menghubungi Google Apps Script: ${errorMsg}. Periksa kembali URL dan izin akses Web App.`,
    };
  }
};

/**
 * Fetch all books from Google Apps Script Web App
 */
export const fetchBooksFromGas = async (webAppUrl: string): Promise<Book[]> => {
  const fetchUrl = webAppUrl.includes('?') ? `${webAppUrl}&action=getBooks` : `${webAppUrl}?action=getBooks`;
  const response = await fetch(fetchUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const result = await response.json();
  if (result.status === 'success' && Array.isArray(result.data)) {
    return result.data;
  }
  throw new Error(result.message || 'Gagal memuat data dari Google Sheets');
};

/**
 * Send a new book to Google Apps Script
 */
export const syncBookToGas = async (webAppUrl: string, book: Book, action: 'create' | 'update' | 'delete' = 'create'): Promise<boolean> => {
  if (!webAppUrl) return false;

  try {
    const payload = action === 'delete' ? { action: 'delete', id: book.id } : { action, book };

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain without preflight CORS issues
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      console.warn('GAS sync returned status:', response.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error('GAS sync error:', e);
    return false;
  }
};

/**
 * Sync entire catalog to Google Sheets
 */
export const syncBatchToGas = async (webAppUrl: string, books: Book[]): Promise<{ success: boolean; message: string }> => {
  if (!webAppUrl) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'batch_sync',
        books,
      }),
      redirect: 'follow',
    });

    const resJson = await response.json();
    if (resJson.status === 'success') {
      return { success: true, message: resJson.message || 'Sinkronisasi berhasil' };
    }
    return { success: false, message: resJson.message || 'Gagal sinkronisasi' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
};
