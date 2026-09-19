/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Printer,
  Filter,
  Download,
  Cloud,
  CloudOff,
  BookOpen,
  BookmarkCheck,
  FileCode2,
  RefreshCw,
  Library,
  ArrowUpDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Book, GasConfig, ViewMode } from './types';
import {
  getLocalBooks,
  saveLocalBooks,
  getSavedGasConfig,
  saveGasConfig,
  syncBookToGas,
  fetchBooksFromGas,
} from './services/gasService';
import { DDC_MAIN_CLASSES } from './data/ddcData';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookFormModal } from './components/BookFormModal';
import { BookDetailModal } from './components/BookDetailModal';
import { QrLabelModal } from './components/QrLabelModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { GasGuideModal } from './components/GasGuideModal';
import { DdcHelperModal } from './components/DdcHelperModal';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [gasConfig, setGasConfig] = useState<GasConfig>(getSavedGasConfig());
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainClass, setSelectedMainClass] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'year' | 'ddc'>('newest');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);
  const [selectedBookForQr, setSelectedBookForQr] = useState<Book | null>(null);

  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isDdcModalOpen, setIsDdcModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize books from local storage
  useEffect(() => {
    const loaded = getLocalBooks();
    setBooks(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add or Edit Book
  const handleSaveBook = async (savedBook: Book) => {
    const exists = books.some((b) => b.id === savedBook.id);
    let updatedBooks: Book[];

    if (exists) {
      updatedBooks = books.map((b) => (b.id === savedBook.id ? savedBook : b));
      showToast(`Data buku "${savedBook.title}" berhasil diperbarui.`);
    } else {
      updatedBooks = [savedBook, ...books];
      showToast(`Buku baru "${savedBook.title}" berhasil ditambahkan ke katalog.`);
    }

    setBooks(updatedBooks);
    saveLocalBooks(updatedBooks);
    setIsFormOpen(false);
    setEditingBook(null);

    // Sync to Google Sheets if configured
    if (gasConfig.webAppUrl && gasConfig.isConnected) {
      try {
        await syncBookToGas(gasConfig.webAppUrl, savedBook, exists ? 'update' : 'create');
      } catch (e) {
        console.warn('Sync to GAS failed:', e);
      }
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    saveLocalBooks(updated);
    showToast(`Buku ${target ? `"${target.title}"` : bookId} telah dihapus.`);

    // Sync deletion to Google Sheets if configured
    if (gasConfig.webAppUrl && gasConfig.isConnected) {
      try {
        await syncBookToGas(gasConfig.webAppUrl, { id: bookId } as Book, 'delete');
      } catch (e) {
        console.warn('Sync delete to GAS failed:', e);
      }
    }
  };

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Filter by DDC main class (000, 100, 200, etc.)
        if (selectedMainClass !== 'ALL') {
          const classPrefix = selectedMainClass.slice(0, 1);
          const bookClassPrefix = book.ddcCode.slice(0, 1);
          if (classPrefix !== bookClassPrefix) {
            return false;
          }
        }

        // Search in ID, Title, Author, DDC Code, DDC Category, and Synopsis
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = book.id.toLowerCase().includes(q);
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchDdc = book.ddcCode.toLowerCase().includes(q);
          const matchCat = book.ddcCategory.toLowerCase().includes(q);
          const matchSynopsis = (book.synopsis || '').toLowerCase().includes(q);
          return matchId || matchTitle || matchAuthor || matchDdc || matchCat || matchSynopsis;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'year') {
          return b.publicationYear - a.publicationYear;
        }
        if (sortBy === 'ddc') {
          return a.ddcCode.localeCompare(b.ddcCode, undefined, { numeric: true });
        }
        return 0;
      });
  }, [books, searchTerm, selectedMainClass, sortBy]);

  // Export CSV format matching exact Google Sheets structure
  const handleExportCsv = () => {
    const headers = [
      'ID Buku',
      'Judul Buku',
      'Pengarang',
      'Ringkasan Penulis',
      'Ringkasan/Sinopsis Buku',
      'Kualitas Cetakan',
      'Kode DDC',
      'Kategori DDC',
      'Tahun Terbit',
      'URL Gambar Sampul',
      'Tanggal Input',
    ];

    const rows = books.map((b) => [
      `"${(b.id || '').replace(/"/g, '""')}"`,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      `"${(b.authorSummary || '').replace(/"/g, '""')}"`,
      `"${(b.synopsis || '').replace(/"/g, '""')}"`,
      `"${(b.printQuality || '').replace(/"/g, '""')}"`,
      `"${(b.ddcCode || '').replace(/"/g, '""')}"`,
      `"${(b.ddcCategory || '').replace(/"/g, '""')}"`,
      b.publicationYear || '',
      `"${(b.coverUrl || '').replace(/"/g, '""')}"`,
      `"${b.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Katalog_Perpustakaan_DDC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh (kompatibel dengan Google Sheets).');
  };

  const uniqueDdcCount = useMemo(() => {
    return new Set(books.map((b) => b.ddcCode)).size;
  }, [books]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => {
          if (v === 'batch-print') {
            setIsBatchPrintOpen(true);
          } else if (v === 'gas-guide') {
            setIsGasModalOpen(true);
          } else if (v === 'ddc-guide') {
            setIsDdcModalOpen(true);
          } else {
            setCurrentView(v);
          }
        }}
        onOpenAddModal={() => {
          setEditingBook(null);
          setIsFormOpen(true);
        }}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        gasConfig={gasConfig}
        totalBooks={books.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* STATS & QUICK BANNER */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sistem Pendataan Buku Perpustakaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Klasifikasi Dewey Decimal (DDC), pencatatan metadata lengkap, dan generator QR Code otomatis siap cetak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs w-full md:w-auto">
            {/* Stat Total Buku */}
            <div className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Koleksi</span>
              <span className="text-base font-extrabold text-slate-900">{books.length} Buku</span>
            </div>

            {/* Stat Kategori DDC */}
            <div className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Variasi DDC</span>
              <span className="text-base font-extrabold text-blue-700">{uniqueDdcCount} Kelas</span>
            </div>

            {/* Google Sheets Status */}
            <div
              onClick={() => setIsGasModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border cursor-pointer hover:opacity-90 transition-opacity bg-slate-100/80 border-slate-200/80"
            >
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Google Sheets</span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {gasConfig.isConnected && gasConfig.webAppUrl ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-700">Tersinkron</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-amber-700">Penyimpanan Lokal</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & CONTROLS TOOLBAR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan judul, nama pengarang, ID buku, atau kode DDC..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 w-full md:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap text-slate-500">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Urutkan Buku"
                  className="bg-transparent border-none focus:outline-hidden font-bold text-slate-900 cursor-pointer"
                >
                  <option value="newest">Terbaru Ditambahkan</option>
                  <option value="title">Judul (A-Z)</option>
                  <option value="year">Tahun Terbit</option>
                  <option value="ddc">Kode DDC</option>
                </select>
              </div>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                title="Ekspor Seluruh Data ke Format CSV Google Sheets"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>

              {/* Batch Print Button */}
              <button
                type="button"
                onClick={() => setIsBatchPrintOpen(true)}
                title="Cetak Lembar Stiker QR Massal"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shrink-0 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Label Massal</span>
              </button>
            </div>
          </div>

          {/* DDC 10 MAIN CLASSES FILTER BAR */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Kelas DDC:
              </span>

              <button
                onClick={() => setSelectedMainClass('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedMainClass === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({books.length})
              </button>

              {DDC_MAIN_CLASSES.map((mc) => {
                const count = books.filter((b) => b.ddcCode.startsWith(mc.code.slice(0, 1))).length;
                return (
                  <button
                    key={mc.code}
                    onClick={() => setSelectedMainClass(mc.code)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedMainClass === mc.code
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="font-mono font-bold text-xs">{mc.code}</span>
                    <span className="hidden sm:inline">{mc.name.split(' ')[0]}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedMainClass === mc.code ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOOK LIST GRID */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Tidak Ada Buku yang Cocok
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan buku yang sesuai dengan pencarian &quot;{searchTerm}&quot; atau filter kelas DDC yang dipilih.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMainClass('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filter Pencarian
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onView={(b) => setSelectedBookDetail(b)}
                onEdit={(b) => {
                  setEditingBook(b);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteBook}
                onPrintQr={(b) => setSelectedBookForQr(b)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <Library className="w-4 h-4 text-amber-500" />
            <span>Sistem Pendataan Perpustakaan DDC & QR Code</span>
            <span>•</span>
            <span>Google Apps Script Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDdcModalOpen(true)}
              className="hover:text-slate-900 font-semibold"
            >
              Kamus Dewey (DDC)
            </button>
            <button
              onClick={() => setIsGasModalOpen(true)}
              className="hover:text-slate-900 font-semibold"
            >
              Panduan Google Apps Script
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Form Modal (Add / Edit) */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        initialBook={editingBook}
      />

      {/* 2. Detail Modal */}
      <BookDetailModal
        isOpen={!!selectedBookDetail}
        onClose={() => setSelectedBookDetail(null)}
        book={selectedBookDetail}
        onEdit={(b) => {
          setSelectedBookDetail(null);
          setEditingBook(b);
          setIsFormOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteBook(id);
          setSelectedBookDetail(null);
        }}
        onOpenQrPrint={(b) => {
          setSelectedBookDetail(null);
          setSelectedBookForQr(b);
        }}
      />

      {/* 3. Single QR Label Print Modal */}
      <QrLabelModal
        isOpen={!!selectedBookForQr}
        onClose={() => setSelectedBookForQr(null)}
        book={selectedBookForQr}
      />

      {/* 4. Batch Print Modal */}
      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        books={books}
      />

      {/* 5. Google Apps Script Setup & Sync Modal */}
      <GasGuideModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        config={gasConfig}
        onSaveConfig={(cfg) => {
          setGasConfig(cfg);
          saveGasConfig(cfg);
          showToast('Pengaturan Google Apps Script tersimpan.');
        }}
        books={books}
        onBooksLoaded={(newBooks) => {
          setBooks(newBooks);
          saveLocalBooks(newBooks);
          showToast(`${newBooks.length} buku dimuat dari Google Sheets.`);
        }}
      />

      {/* 6. DDC Classification Reference Modal */}
      <DdcHelperModal
        isOpen={isDdcModalOpen}
        onClose={() => setIsDdcModalOpen(false)}
      />
    </div>
  );
}
