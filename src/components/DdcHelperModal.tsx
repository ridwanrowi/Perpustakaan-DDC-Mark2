import React, { useState } from 'react';
import { X, Search, BookmarkCheck, BookOpen, Layers, Info } from 'lucide-react';
import { DDC_CLASSES, DDC_MAIN_CLASSES } from '../data/ddcData';

interface DdcHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDdc?: (code: string, category: string) => void;
}

export const DdcHelperModal: React.FC<DdcHelperModalProps> = ({
  isOpen,
  onClose,
  onSelectDdc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainClass, setSelectedMainClass] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredList = DDC_CLASSES.filter((item) => {
    const matchesMain = selectedMainClass === 'ALL' || item.mainClassCode === selectedMainClass;
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMain && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pedoman Dewey Decimal Classification (DDC)
              </h2>
              <p className="text-xs text-slate-500">
                Sistem klasifikasi 10 kelas utama perpustakaan standar internasional & Perpusnas RI
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

        {/* Search & Main Classes Filter */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode DDC atau topik buku (misal: 005.1, pemrograman, agama, psikologi, 959.8)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 shadow-xs"
            />
          </div>

          {/* 10 Main Classes Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedMainClass('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedMainClass === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua (000-900)
            </button>
            {DDC_MAIN_CLASSES.map((mc) => (
              <button
                key={mc.code}
                onClick={() => setSelectedMainClass(mc.code)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedMainClass === mc.code
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mc.code} {mc.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Tidak ditemukan klasifikasi DDC yang cocok dengan kata kunci tersebut.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((item) => (
                <div
                  key={item.code}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        DDC {item.code}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Kelas {item.mainClassCode}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.name}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {onSelectDdc && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDdc(item.code, item.name);
                          onClose();
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Gunakan Kode Ini &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DDC Structure Explainer Footer */}
          <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Rumus Nomor Panggil Perpustakaan (Call Number):</span>
              <p className="text-amber-800 leading-relaxed">
                Nomor panggil dibentuk dari: <strong>[Kode DDC] + [3 Huruf Pertama Nama Pengarang (Kapital)] + [1 Huruf Pertama Judul Buku (Kecil)]</strong>.
                Contoh: Buku karya Suhendra berjudul <em>Struktur Data</em> dengan DDC 005.1 &rarr; <strong>005.1 SUH s</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
