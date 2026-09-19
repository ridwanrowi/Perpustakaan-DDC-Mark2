import React, { useState, useEffect } from 'react';
import { X, Printer, CheckSquare, Square, Filter, FileText } from 'lucide-react';
import { Book } from '../types';
import { generateCallNumber, generateQrDataUrl, generateQrPayload } from '../utils/qrUtils';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  books,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [labelsPerPage, setLabelsPerPage] = useState<8 | 12 | 6>(8);
  const [includeAuthor, setIncludeAuthor] = useState(true);

  // Initialize with all books selected
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(books.map((b) => b.id));
    }
  }, [isOpen, books]);

  // Generate QR for all selected books
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generateAll = async () => {
      const newMap: Record<string, string> = {};
      for (const book of books) {
        if (selectedIds.includes(book.id)) {
          const payload = generateQrPayload(book);
          const url = await generateQrDataUrl(payload, { width: 160, margin: 1 });
          newMap[book.id] = url;
        }
      }
      if (isMounted) {
        setQrMap(newMap);
      }
    };

    generateAll();
    return () => {
      isMounted = false;
    };
  }, [isOpen, books, selectedIds]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === books.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(books.map((b) => b.id));
    }
  };

  const selectedBooks = books.filter((b) => selectedIds.includes(b.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cetak Label QR Pustaka Massal (Sheet Stiker)
              </h2>
              <p className="text-xs text-slate-500">
                Format siap cetak untuk kertas stiker label punggung / kartu perpustakaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900"
            >
              {selectedIds.length === books.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedIds.length === books.length ? 'Batal Pilih Semua' : 'Pilih Semua'} ({selectedIds.length}/{books.length})
              </span>
            </button>

            <span className="text-slate-300">|</span>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600">
              <input
                type="checkbox"
                checked={includeAuthor}
                onChange={(e) => setIncludeAuthor(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Tampilkan Pengarang</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Grid Stiker:</span>
            <div className="flex items-center gap-1">
              {[6, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLabelsPerPage(num as 6 | 8 | 12)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    labelsPerPage === num
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} / Halaman
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              disabled={selectedBooks.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 ml-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak ({selectedBooks.length}) Label</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-200/50">
          {selectedBooks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum ada buku yang dipilih</p>
              <p className="text-xs text-slate-400 mt-1">Centang buku di atas untuk membuat lembar cetak label QR.</p>
            </div>
          ) : (
            /* PRINTABLE GRID */
            <div
              id="printable-batch-sheet"
              className={`bg-white p-6 rounded-xl border border-slate-300 shadow-sm mx-auto max-w-[210mm] min-h-[297mm] ${
                labelsPerPage === 6
                  ? 'grid grid-cols-2 gap-4'
                  : labelsPerPage === 12
                  ? 'grid grid-cols-3 sm:grid-cols-4 gap-3'
                  : 'grid grid-cols-2 sm:grid-cols-2 gap-4'
              }`}
            >
              {selectedBooks.map((book) => {
                const callNumber = generateCallNumber(book);
                const qr = qrMap[book.id];

                return (
                  <div
                    key={book.id}
                    className="border-2 border-dashed border-slate-300 p-3 rounded-lg flex flex-col justify-between bg-white text-slate-900 page-break-inside-avoid relative group"
                  >
                    {/* Toggle check in preview (Hidden in print) */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(book.id)}
                      className="print:hidden absolute top-2 right-2 text-slate-400 hover:text-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Top Header */}
                    <div className="border-b border-slate-200 pb-1 mb-2 text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        PERPUSTAKAAN DDC
                      </p>
                    </div>

                    {/* QR & Call Number Center */}
                    <div className="flex items-center gap-3 my-1">
                      {qr ? (
                        <img src={qr} alt={book.id} className="w-20 h-20 shrink-0 border border-slate-200 p-0.5 rounded-sm" />
                      ) : (
                        <div className="w-20 h-20 shrink-0 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                          QR...
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <div className="bg-slate-100 p-1 rounded-sm border border-slate-200 text-center">
                          <span className="text-[8px] text-slate-500 uppercase font-semibold block">
                            Nomor Panggil
                          </span>
                          <span className="text-xs font-mono font-black text-slate-900 tracking-wider">
                            {callNumber}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-700 truncate">
                          {book.id}
                        </p>
                      </div>
                    </div>

                    {/* Book Title & Meta */}
                    <div className="mt-1 pt-1 border-t border-slate-100 text-left">
                      <p className="font-bold text-slate-900 text-[11px] leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      {includeAuthor && (
                        <p className="text-[10px] text-slate-600 truncate mt-0.5">
                          {book.author} ({book.publicationYear})
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
