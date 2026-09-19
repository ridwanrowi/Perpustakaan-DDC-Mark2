import React from 'react';
import { Calendar, User, Printer, Eye, Edit, Trash2, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { generateCallNumber } from '../utils/qrUtils';

interface BookCardProps {
  book: Book;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onPrintQr: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onView,
  onEdit,
  onDelete,
  onPrintQr,
}) => {
  const callNumber = generateCallNumber(book);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Cover Banner */}
        <div className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onView(book)}>
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* DDC Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-900/90 backdrop-blur-xs text-amber-400 rounded-md shadow-xs">
              DDC {book.ddcCode}
            </span>
          </div>

          {/* Quick Print QR button overlay */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrintQr(book);
            }}
            title="Cetak Label QR Buku"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-xs text-slate-800 hover:bg-white hover:text-slate-950 flex items-center justify-center shadow-xs transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Call Number & ID */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {book.id}
            </span>
            <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {callNumber}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onView(book)}
            className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {book.title}
          </h3>

          {/* Author & Year */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-700">{book.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Tahun {book.publicationYear}</span>
            </div>
          </div>

          {/* Print Quality Badge */}
          <div className="pt-1">
            <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-full">
              {book.printQuality}
            </span>
          </div>

          {/* Synopsis preview */}
          {book.synopsis && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
              {book.synopsis}
            </p>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
        <button
          type="button"
          onClick={() => onView(book)}
          className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 py-1 px-2 rounded-md hover:bg-slate-200/60 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Detail</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPrintQr(book)}
            title="Cetak Label & QR"
            className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 py-1 px-2.5 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(book)}
            title="Edit Buku"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Hapus buku "${book.title}"?`)) {
                onDelete(book.id);
              }
            }}
            title="Hapus Buku"
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
