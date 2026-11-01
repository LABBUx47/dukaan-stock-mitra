import React, { useState } from 'react';
import {
  Search,
  MapPin,
  X,
} from 'lucide-react';
import { StockItem } from '../types/stock';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface LocationQuickFinderProps {
  items: StockItem[];
  language: Language;
  onLocateItem: (item: StockItem) => void;
}

export const LocationQuickFinder: React.FC<LocationQuickFinderProps> = ({
  items,
  language,
  onLocateItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundItem, setFoundItem] = useState<StockItem | null>(null);
  const t = TRANSLATIONS[language];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFoundItem(null);
      return;
    }
    const lower = term.toLowerCase().trim();
    const match = items.find(
      (it) =>
        it.nameHindi.toLowerCase().includes(lower) ||
        it.name.toLowerCase().includes(lower) ||
        it.brand.toLowerCase().includes(lower)
    );
    setFoundItem(match || null);
  };

  const handleQuickSelect = (item: StockItem) => {
    setSearchTerm(language === 'hi' ? item.nameHindi : item.name);
    setFoundItem(item);
    onLocateItem(item);
  };

  // Sample quick presets that are nicely formatted
  const samplePresets = [
    items.find((i) => i.nameHindi.includes('हिंदी कॉपी')),
    items.find((i) => i.nameHindi.includes('पेंसिल')),
    items.find((i) => i.nameHindi.includes('पेन')),
    items.find((i) => i.nameHindi.includes('स्टेपलर') || i.nameHindi.includes('कलर')),
  ].filter(Boolean) as StockItem[];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base font-['Hind']">
              {t.finderTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {t.finderSubtitle}
            </p>
          </div>
        </div>

        {/* Quick presets for common shop queries — uniform 2-col on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
          {samplePresets.map((it) => {
            const shortLabel =
              language === 'hi'
                ? it.nameHindi.split('(')[0].trim()
                : it.name.split('(')[0].trim();

            return (
              <button
                key={it.id}
                onClick={() => handleQuickSelect(it)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center justify-center gap-1 truncate text-center h-8"
              >
                <span className="truncate">📍 {shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input with Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t.finderPlaceholder}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFoundItem(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Instant Result Card */}
      {foundItem && (
        <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-300 font-['Hind'] text-sm sm:text-base">
                📍 {language === 'hi' ? foundItem.nameHindi : foundItem.name}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                {foundItem.totalUnits} {foundItem.unitName.split('(')[0].trim()} {t.finderInStock}
              </span>
            </div>

            <div className="text-xs text-slate-200 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/80 text-[11px]">
                {foundItem.location.zoneName}
              </span>
              <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80 text-[11px]">
                {foundItem.location.shelf}
              </span>
              {foundItem.location.details && (
                <span className="text-slate-400 text-[11px] truncate max-w-[260px]">
                  ({foundItem.location.details})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onLocateItem(foundItem)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-md text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all active:scale-95 self-stretch sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 fill-current" />
            <span>{t.finderLocateBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
};
