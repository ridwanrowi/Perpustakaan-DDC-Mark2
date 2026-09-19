import React, { useState, useEffect } from 'react';
import { X, Printer, Edit, Trash2, Calendar, User, BookOpen, Layers, QrCode as QrIcon, Tag } from 'lucide-react';
import { Book } from '../types';
import { generateCallNumber, generateQrDataUrl, generateQrPayload } from '../utils/qrUtils';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onOpenQrPrint: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
  onEdit,
  onDelete,
  onOpenQrPrint,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (book) {
      const payload = generateQrPayload(book);
      generateQrDataUrl(payload, { width: 220, margin: 1 }).then(setQrUrl);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const callNumber = generateCallNumber(book);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 text-amber-400 rounded-md">
              {book.id}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-md">
              Panggil: {callNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Top Section: Cover + Title + QR Preview */}
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Book Cover */}
            <div className="w-32 h-44 sm:w-36 sm:h-52 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm mx-auto sm:mx-0">
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            {/* Info & Meta */}
            <div className="flex-1 space-y-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                  DDC {book.ddcCode} • {book.ddcCategory}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {book.title}
                </h2>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{book.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tahun Terbit: <strong className="text-slate-800">{book.publicationYear}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Kualitas: <span className="text-slate-800 font-medium">{book.printQuality}</span></span>
                </div>
              </div>

              {/* QR Code Mini Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {qrUrl && (
                    <img src={qrUrl} alt="QR Code" className="w-12 h-12 bg-white p-1 rounded-md border border-slate-200" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">
                      QR Code Otomatis Aktif
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {callNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenQrPrint(book)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-lg transition-transform active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Label</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Ringkasan Penulis */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Ringkasan Penulis
            </h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              {book.authorSummary || (
                <span className="italic text-slate-400">Belum ada data biografi singkat untuk penulis ini.</span>
              )}
            </div>
          </div>

          {/* Section: Ringkasan / Sinopsis Buku */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Ringkasan & Sinopsis Buku
            </h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {book.synopsis || (
                <span className="italic text-slate-400">Belum ada sinopsis terdaftar untuk buku ini.</span>
              )}
            </div>
          </div>

          {/* Section: Detail Spesifikasi Cetak & Metadata */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Kualitas Cetakan & Fisik
              </span>
              <span className="font-semibold text-slate-800">{book.printQuality}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Kategori Dewey (DDC)
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                [{book.ddcCode}] {book.ddcCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/70 rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
                onDelete(book.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Buku</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Metadata</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenQrPrint(book)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak QR & Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
