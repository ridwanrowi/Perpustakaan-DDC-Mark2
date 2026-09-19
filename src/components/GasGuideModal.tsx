import React, { useState } from 'react';
import { X, Copy, Check, Cloud, RefreshCw, UploadCloud, DownloadCloud, ExternalLink, ShieldCheck, AlertCircle, FileCode, BookOpen } from 'lucide-react';
import { GasConfig, Book } from '../types';
import { GAS_CODE_GS } from '../data/gasScriptCode';
import { testGasConnection, fetchBooksFromGas, syncBatchToGas } from '../services/gasService';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GasConfig;
  onSaveConfig: (cfg: GasConfig) => void;
  books: Book[];
  onBooksLoaded: (books: Book[]) => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  books,
  onBooksLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'sync'>('setup');
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testGasConnection(webAppUrl);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      const updated = {
        ...config,
        webAppUrl: webAppUrl.trim(),
        isConnected: true,
        lastSyncTime: new Date().toISOString(),
      };
      onSaveConfig(updated);
    }
  };

  const handlePullFromSheets = async () => {
    if (!webAppUrl) return;
    setSyncing(true);
    try {
      const loaded = await fetchBooksFromGas(webAppUrl);
      if (loaded.length > 0) {
        onBooksLoaded(loaded);
        alert(`Berhasil memuat ${loaded.length} data buku dari Google Sheets.`);
      } else {
        alert('Google Sheets terhubung, namun data buku belum ada di lembar kerja.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert('Gagal memuat data dari Google Sheets: ' + msg);
    } finally {
      setSyncing(false);
    }
  };

  const handlePushAllToSheets = async () => {
    if (!webAppUrl) return;
    if (!window.confirm(`Kirim seluruh (${books.length}) data buku ke Google Sheets? Data di sheet Katalog_Buku akan diperbarui.`)) {
      return;
    }
    setSyncing(true);
    const result = await syncBatchToGas(webAppUrl, books);
    setSyncing(false);
    alert(result.message);
    if (result.success) {
      onSaveConfig({
        ...config,
        lastSyncTime: new Date().toISOString(),
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Integrasi Google Sheets & Google Apps Script
              </h2>
              <p className="text-xs text-slate-500">
                Backend database awan gratis dan otomatis tersimpan di Google Drive Anda
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

        {/* Tab Selector */}
        <div className="px-6 border-b border-slate-200 bg-slate-100/50 flex gap-2 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Koneksi URL Web App</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Kode Backend (Code.gs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sinkronisasi Data ({books.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Status Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  config.isConnected && config.webAppUrl
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    config.isConnected && config.webAppUrl ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold block text-sm">
                    {config.isConnected && config.webAppUrl
                      ? 'Google Sheets Terhubung'
                      : 'Belum Terhubung ke Google Apps Script'}
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Aplikasi ini dirancang menggunakan Google Apps Script sebagai backend REST API tanpa biaya server.
                    Buku yang Anda input otomatis disinkronkan ke Spreadsheet Anda.
                  </p>
                </div>
              </div>

              {/* Form Input Web App URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL Web App Google Apps Script
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || !webAppUrl.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4 text-amber-400" />}
                    <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dapatkan URL ini setelah menerapkan (Deploy) skrip Google Apps Script pada Spreadsheet Anda.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Step by Step Setup Guide */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  Panduan Pemasangan 5 Langkah Mudah:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      1. Buat Spreadsheet Baru
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Buka Google Sheets di browser Anda dan buat lembar kerja baru bernama <em>&quot;Database Perpustakaan DDC&quot;</em>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      2. Buka Menu Apps Script
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Pada Google Sheets, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      3. Tempel Kode Backend
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Salin kode dari tab <strong>Kode Backend (Code.gs)</strong> di atas dan gantikan isi editor skrip Anda.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      4. Terapkan Sebagai Web App
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru</strong> &gt; Pilih <strong>Aplikasi Web</strong>. Atur akses ke <em>Siapa saja (Anyone)</em>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    File: Code.gs (Google Apps Script)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Skrip ini bertindak sebagai API serverless untuk Google Sheets dengan dukungan DDC, JSON CORS, dan ID otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-transform active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[50vh] border border-slate-800 leading-relaxed">
                <pre>{GAS_CODE_GS}</pre>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 block">
                  Pusat Sinkronisasi Data Buku ({books.length} Buku Terdaftar)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Gunakan tombol di bawah untuk mentransfer data bolak-balik antara aplikasi web dan Spreadsheet Google Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pull from Sheets */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Tarik dari Google Sheets</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Muat seluruh data buku yang ada di Google Sheets ke dalam aplikasi web ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullFromSheets}
                    disabled={syncing || !webAppUrl}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {syncing ? 'Mengunduh...' : 'Tarik Data Buku'}
                  </button>
                </div>

                {/* Push to Sheets */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Kirim ke Google Sheets</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unggah {books.length} buku saat ini ke lembar kerja Google Sheets Katalog_Buku.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushAllToSheets}
                    disabled={syncing || !webAppUrl}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {syncing ? 'Mengunggah...' : 'Unggah Semua Buku'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50/70 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
