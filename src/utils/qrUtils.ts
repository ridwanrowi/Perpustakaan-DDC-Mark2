import QRCode from 'qrcode';
import { Book } from '../types';

/**
 * Menghasilkan Nomor Panggil (Call Number) standar perpustakaan
 * Contoh: DDC 005.1, Pengarang: Suhendra -> 005.1 SUH s
 */
export const generateCallNumber = (book: Book): string => {
  const ddc = book.ddcCode || '000';
  const cleanAuthor = (book.author || 'X')
    .replace(/^(Dr\.|Prof\.|Ir\.|Dra\.|Drs\.|H\.|Hj\.)\s*/gi, '')
    .trim();
  const authorInitials = (cleanAuthor.slice(0, 3) || 'XXX').toUpperCase();
  const titleInitial = (book.title.trim().slice(0, 1) || 'x').toLowerCase();

  return `${ddc} ${authorInitials} ${titleInitial}`;
};

/**
 * Format payload data untuk di-encode ke dalam QR Code
 */
export const generateQrPayload = (book: Book): string => {
  const callNumber = generateCallNumber(book);
  return JSON.stringify({
    id: book.id,
    callNumber,
    title: book.title,
    author: book.author,
    ddc: book.ddcCode,
    category: book.ddcCategory,
    year: book.publicationYear,
    verifiedBy: 'Sistem Perpustakaan DDC',
  });
};

/**
 * Generate QR Code Data URL (PNG)
 */
export const generateQrDataUrl = async (text: string, options = { width: 256, margin: 1 }): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width,
      margin: options.margin,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
};
