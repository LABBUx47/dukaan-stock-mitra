import React from 'react';
import {
  Boxes,
  PlusCircle,
  Camera,
  MapPin,
  User,
  Package,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface BottomNavProps {
  language: Language;
  activeTab: 'stock' | 'map' | 'profile';
  isMapOpen: boolean;
  onOpenScan: () => void;
  onOpenAdd: () => void;
  onToggleMap: () => void;
  onOpenProfile: () => void;
  onScrollToStock: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  language,
  isMapOpen,
  onOpenScan,
  onOpenAdd,
  onToggleMap,
  onOpenProfile,
  onScrollToStock,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-between relative">
        {/* 1. Leftmost: Inventory / Stock List */}
        <button
          onClick={onScrollToStock}
          aria-label={language === 'hi' ? 'स्टॉक देखें' : 'View Stock'}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
        >
          <Boxes className="w-5 h-5 mb-0.5 text-sky-400" />
          <span className="text-[10px] font-semibold tracking-tight">
            {language === 'hi' ? 'स्टॉक' : 'Stock'}
          </span>
        </button>

        {/* 2. Left of Center: Add Item Icon */}
        <button
          onClick={onOpenAdd}
          aria-label={t.addManual}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 flex items-center justify-center mb-0.5 transition-all">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight text-slate-300">
            {language === 'hi' ? 'जोड़ें' : 'Add Item'}
          </span>
        </button>

        {/* 3. Center Elevated: AI Photo Cam Icon */}
        <div className="relative -top-5 flex flex-col items-center px-1">
          <button
            onClick={onOpenScan}
            aria-label={t.aiScan}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 hover:from-emerald-400 hover:to-sky-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-4 ring-slate-950 transform active:scale-90 transition-all cursor-pointer"
          >
            <Camera className="w-7 h-7 stroke-[2.2]" />
          </button>
          <span className="text-[10px] font-bold text-emerald-400 mt-1 whitespace-nowrap">
            {language === 'hi' ? 'फोटो स्कैन' : 'Scan'}
          </span>
        </div>

        {/* 4. Right of Center: Shop Floor Map Icon */}
        <button
          onClick={onToggleMap}
          aria-label={t.shopMap}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            isMapOpen ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all border ${
              isMapOpen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight text-slate-300">
            {language === 'hi' ? 'नक्शा' : 'Floor Map'}
          </span>
        </button>

        {/* 5. Rightmost: Profile Section */}
        <button
          onClick={onOpenProfile}
          aria-label={language === 'hi' ? 'दुकानदार प्रोफाइल' : 'Shop Profile'}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-sky-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-950/60 border border-slate-700 hover:border-sky-500/50 flex items-center justify-center mb-0.5 transition-all">
            <User className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight">
            {language === 'hi' ? 'प्रोफाइल' : 'Profile'}
          </span>
        </button>
      </div>
    </nav>
  );
};
