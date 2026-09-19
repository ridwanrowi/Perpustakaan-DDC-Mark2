import React from 'react';
import { BookOpen, PlusCircle, Printer, Cloud, CloudOff, FileCode2, BookmarkCheck, Library } from 'lucide-react';
import { ViewMode, GasConfig } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenGasModal: () => void;
  gasConfig: GasConfig;
  totalBooks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenGasModal,
  gasConfig,
  totalBooks,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
              <Library className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  Perpustakaan DDC
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
                  Dewey Classification
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Pendataan & QR Code Terintegrasi Google Sheets
              </p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 text-sm font-medium">
            <button
              onClick={() => onViewChange('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'catalog'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Katalog ({totalBooks})</span>
            </button>

            <button
              onClick={() => onViewChange('batch-print')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'batch-print'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label QR</span>
            </button>

            <button
              onClick={() => onViewChange('ddc-guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'ddc-guide'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Panduan DDC</span>
            </button>

            <button
              onClick={() => onViewChange('gas-guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'gas-guide'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Script Google Sheets</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Connection Status Badge */}
            <button
              onClick={onOpenGasModal}
              title="Konfigurasi Sinkronisasi Google Sheets & Apps Script"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                gasConfig.isConnected && gasConfig.webAppUrl
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {gasConfig.isConnected && gasConfig.webAppUrl ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Sheets Terhubung</span>
                  <span className="sm:hidden">Tersambung</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Sheets Setup</span>
                  <span className="sm:hidden">Sheets</span>
                </>
              )}
            </button>

            {/* Tambah Buku Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Tambah Buku</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub Navigation */}
        <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 text-xs">
          <button
            onClick={() => onViewChange('catalog')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              currentView === 'catalog' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Katalog ({totalBooks})
          </button>
          <button
            onClick={() => onViewChange('batch-print')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              currentView === 'batch-print' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Cetak QR Massal
          </button>
          <button
            onClick={() => onViewChange('ddc-guide')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              currentView === 'ddc-guide' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            DDC
          </button>
          <button
            onClick={() => onViewChange('gas-guide')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              currentView === 'gas-guide' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Script Google
          </button>
        </div>
      </div>
    </header>
  );
};
