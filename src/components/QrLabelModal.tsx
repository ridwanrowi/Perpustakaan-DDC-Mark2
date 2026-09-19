import React, { useEffect, useState, useRef } from 'react';
import { X, Printer, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { Book } from '../types';
import { generateCallNumber, generateQrDataUrl, generateQrPayload } from '../utils/qrUtils';

interface QrLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const QrLabelModal: React.FC<QrLabelModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [labelFormat, setLabelFormat] = useState<'slip' | 'spine'>('slip');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (book) {
      const payload = generateQrPayload(book);
      generateQrDataUrl(payload, { width: 320, margin: 1 }).then(setQrDataUrl);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const callNumber = generateCallNumber(book);

  const handleCopyPayload = () => {
    const payload = generateQrPayload(book);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${book.id}-${book.ddcCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Label & QR Code Cetak Buku
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {book.id} • DDC: {book.ddcCode}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Picker (Hidden during print) */}
          <div className="print:hidden flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-xl">
            <span className="text-xs font-semibold text-slate-700 ml-2">Pilih Format Cetak:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLabelFormat('slip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  labelFormat === 'slip'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu / Slip Lengkap
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('spine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  labelFormat === 'spine'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Label Punggung Rak
              </button>
            </div>
          </div>

          {/* PRINTABLE LABEL AREA */}
          <div className="flex justify-center">
            <div
              ref={printRef}
              id="printable-single-label"
              className={`border-2 border-dashed border-slate-400 bg-white text-slate-900 shadow-xs transition-all ${
                labelFormat === 'slip'
                  ? 'w-[320px] p-5 rounded-xl text-center space-y-3'
                  : 'w-[200px] p-3 rounded-lg text-center space-y-2'
              }`}
            >
              {/* Header Label */}
              <div className="border-b border-slate-300 pb-2">
                <p className="text-[10px] tracking-widest font-extrabold uppercase text-slate-500">
                  PERPUSTAKAAN
                </p>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-tight">
                  KARTU PUSTAKA DDC
                </h4>
              </div>

              {/* QR Image */}
              <div className="flex justify-center my-2">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${book.id}`}
                    className={`border border-slate-200 rounded-lg p-1 bg-white ${
                      labelFormat === 'slip' ? 'w-40 h-40' : 'w-28 h-28'
                    }`}
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Membuat QR...
                  </div>
                )}
              </div>

              {/* Call Number & DDC Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Nomor Panggil (Call Number)
                </span>
                <span className="text-sm font-mono font-black text-slate-900 tracking-wide">
                  {callNumber}
                </span>
              </div>

              {/* Details */}
              <div className="text-left space-y-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    ID Buku:
                  </span>
                  <p className="font-mono font-bold text-slate-800 text-[11px] truncate">
                    {book.id}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Judul:
                  </span>
                  <p className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                    {book.title}
                  </p>
                </div>

                {labelFormat === 'slip' && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Pengarang:
                    </span>
                    <p className="text-slate-700 text-[11px] truncate font-medium">
                      {book.author} ({book.publicationYear})
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400 italic">
                * Tempel pada lembar dalam atau punggung buku
              </div>
            </div>
          </div>

          {/* Action Buttons (Hidden during print) */}
          <div className="print:hidden space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Label Sekarang</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                title="Unduh QR Code (PNG)"
                className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Unduh PNG</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPayload}
                title="Salin Data Payload QR"
                className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Tekan tombol cetak untuk membuka dialog print browser (mendukung printer thermal atau kertas stiker A4).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
