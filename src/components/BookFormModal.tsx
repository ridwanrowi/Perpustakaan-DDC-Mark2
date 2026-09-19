import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, BookMarked, Check, AlertCircle } from 'lucide-react';
import { Book } from '../types';
import { DDC_CLASSES, DDC_MAIN_CLASSES, PRINT_QUALITY_PRESETS } from '../data/ddcData';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  initialBook?: Book | null;
}

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBook,
}) => {
  const isEditing = !!initialBook;

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [authorSummary, setAuthorSummary] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [printQuality, setPrintQuality] = useState(PRINT_QUALITY_PRESETS[0]);
  const [customPrintQuality, setCustomPrintQuality] = useState('');
  const [ddcCode, setDdcCode] = useState(DDC_CLASSES[0].code);
  const [ddcCategory, setDdcCategory] = useState(DDC_CLASSES[0].name);
  const [publicationYear, setPublicationYear] = useState(new Date().getFullYear());
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedMainClassFilter, setSelectedMainClassFilter] = useState('ALL');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBook) {
      setId(initialBook.id);
      setTitle(initialBook.title);
      setAuthor(initialBook.author);
      setAuthorSummary(initialBook.authorSummary || '');
      setSynopsis(initialBook.synopsis || '');
      if (PRINT_QUALITY_PRESETS.includes(initialBook.printQuality)) {
        setPrintQuality(initialBook.printQuality);
        setCustomPrintQuality('');
      } else {
        setPrintQuality('Lainnya');
        setCustomPrintQuality(initialBook.printQuality);
      }
      setDdcCode(initialBook.ddcCode || DDC_CLASSES[0].code);
      setDdcCategory(initialBook.ddcCategory || DDC_CLASSES[0].name);
      setPublicationYear(initialBook.publicationYear || new Date().getFullYear());
      setCoverUrl(initialBook.coverUrl || '');
    } else {
      // Auto-generate fresh ID for new book
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setId(`LIB-DDC-${year}-${randomSeq}`);
      setTitle('');
      setAuthor('');
      setAuthorSummary('');
      setSynopsis('');
      setPrintQuality(PRINT_QUALITY_PRESETS[0]);
      setCustomPrintQuality('');
      setDdcCode(DDC_CLASSES[0].code);
      setDdcCategory(DDC_CLASSES[0].name);
      setPublicationYear(year);
      setCoverUrl(SAMPLE_COVERS[Math.floor(Math.random() * SAMPLE_COVERS.length)]);
    }
    setError(null);
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  // Handle DDC dropdown selection
  const handleDdcChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setDdcCode(code);
    const found = DDC_CLASSES.find((c) => c.code === code);
    if (found) {
      setDdcCategory(found.name);
    }
  };

  const handleGenerateNewId = () => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const cleanDdc = ddcCode.replace('.', '');
    setId(`LIB-${cleanDdc}-${publicationYear}-${randomSeq}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) {
      setError('ID Buku wajib diisi.');
      return;
    }
    if (!title.trim()) {
      setError('Judul Buku wajib diisi.');
      return;
    }
    if (!author.trim()) {
      setError('Nama Pengarang wajib diisi.');
      return;
    }

    const finalPrintQuality = printQuality === 'Lainnya' ? customPrintQuality || 'Standar Perpustakaan' : printQuality;

    const bookData: Book = {
      id: id.trim(),
      title: title.trim(),
      author: author.trim(),
      authorSummary: authorSummary.trim(),
      synopsis: synopsis.trim(),
      printQuality: finalPrintQuality,
      ddcCode,
      ddcCategory,
      publicationYear: Number(publicationYear) || new Date().getFullYear(),
      coverUrl: coverUrl.trim() || SAMPLE_COVERS[0],
      createdAt: initialBook?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(bookData);
  };

  const filteredDdcClasses = selectedMainClassFilter === 'ALL'
    ? DDC_CLASSES
    : DDC_CLASSES.filter((c) => c.mainClassCode === selectedMainClassFilter);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Data Buku' : 'Registrasi Buku Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi metadata buku sesuai standar DDC & Google Sheets
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: IDENTITAS UTAMA BUKU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ID Buku */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  ID Buku <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNewId}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                placeholder="LIB-DDC-2024-XXXX"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Tahun Terbit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tahun Terbit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1800"
                max="2100"
                value={publicationYear}
                onChange={(e) => setPublicationYear(parseInt(e.target.value) || 2024)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Pengarang */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Pengarang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                placeholder="Contoh: Dr. Ir. Rian Suhendra"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Judul Buku */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Lengkap Buku <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Masukkan judul buku beserta sub-judul jika ada"
              className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          {/* SECTION 2: KLASIFIKASI DEWEY DECIMAL CLASSIFICATION (DDC) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  Klasifikasi Dewey Decimal (DDC) <span className="text-red-500">*</span>
                </span>
                <p className="text-xs text-slate-500">
                  Pilih kode dan kategori DDC untuk penataan rak dan nomor panggil buku
                </p>
              </div>

              {/* Filter Kelas Utama DDC */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Filter Kelas:</span>
                <select
                  value={selectedMainClassFilter}
                  onChange={(e) => setSelectedMainClassFilter(e.target.value)}
                  aria-label="Filter Kelas Utama DDC"
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                >
                  <option value="ALL">Semua Kelas (000 - 900)</option>
                  {DDC_MAIN_CLASSES.map((mc) => (
                    <option key={mc.code} value={mc.code}>
                      {mc.code} - {mc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropdown DDC Subclass */}
            <div>
              <label htmlFor="ddc-classification-select" className="sr-only">Pilih Subkelas DDC</label>
              <select
                id="ddc-classification-select"
                value={ddcCode}
                onChange={handleDdcChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {filteredDdcClasses.map((item) => (
                  <option key={item.code} value={item.code}>
                    [{item.code}] {item.name} — {item.category}
                  </option>
                ))}
              </select>
            </div>

            {/* DDC Preview Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-600 font-medium">Terpilih:</span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-mono font-bold rounded-md">
                Kode DDC: {ddcCode}
              </span>
              <span className="px-2.5 py-1 bg-slate-200 text-slate-800 font-semibold rounded-md">
                Kategori: {ddcCategory}
              </span>
            </div>
          </div>

          {/* SECTION 3: RINGKASAN PENULIS & SINOPSIS BUKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ringkasan Penulis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ringkasan Penulis (Biografi Singkat)
              </label>
              <textarea
                rows={4}
                value={authorSummary}
                onChange={(e) => setAuthorSummary(e.target.value)}
                placeholder="Tuliskan latar belakang singkat, afiliasi akademik, atau kepakaran penulis..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Ringkasan / Sinopsis Buku */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ringkasan / Sinopsis Buku
              </label>
              <textarea
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Ringkasan isi, topik utama, atau sinopsis buku untuk pustakawan dan pembaca..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* SECTION 4: KUALITAS CETAKAN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kualitas Cetakan & Kondisi Fisik Buku
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {PRINT_QUALITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setPrintQuality(preset);
                    setCustomPrintQuality('');
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs border transition-all ${
                    printQuality === preset
                      ? 'bg-slate-900 text-white font-medium border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom quality input */}
            <input
              type="text"
              value={customPrintQuality}
              onChange={(e) => {
                setCustomPrintQuality(e.target.value);
                setPrintQuality('Lainnya');
              }}
              placeholder="Atau ketik kualitas spesifik (misal: Softcover Lux Emboss, Kertas Bookpaper 70gsm, dsb.)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* SECTION 5: URL GAMBAR SAMPUL */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              URL Gambar Sampul (Cover Image)
            </label>
            <div className="flex gap-4 items-start">
              {/* Preview Thumbnail */}
              <div className="w-20 h-28 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />

                {/* Sample cover presets */}
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    Atau pilih gambar contoh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_COVERS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverUrl(url)}
                        className={`w-8 h-8 rounded-md overflow-hidden border-2 transition-transform ${
                          coverUrl === url ? 'border-amber-500 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Buku & Buat QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
