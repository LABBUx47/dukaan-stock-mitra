import React from 'react';
import {
  Store,
  Camera,
  PlusCircle,
  MapPin,
  Package,
  AlertTriangle,
  Boxes,
  Smartphone,
  User,
  Bell,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  totalItems: number;
  totalPetis: number;
  lowStockCount: number;
  outOfStockCount: number;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenScan: () => void;
  onOpenAdd: () => void;
  onOpenPetiInward: () => void;
  onToggleMap: () => void;
  onOpenInstallModal: () => void;
  onOpenProfile: () => void;
  isMapOpen: boolean;
  isInstallable?: boolean;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalItems,
  totalPetis,
  lowStockCount,
  outOfStockCount,
  language,
  onLanguageChange,
  onOpenScan,
  onOpenAdd,
  onOpenPetiInward,
  onToggleMap,
  onOpenInstallModal,
  onOpenProfile,
  onOpenNotifications,
  isMapOpen,
  isInstallable,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="text-left flex items-center gap-3 group cursor-pointer"
              title={language === 'hi' ? 'दुकानदार प्रोफाइल खोलें' : 'Open Store Profile'}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-['Hind']">
                    {t.brandName}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t.brandTag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {t.brandSub}
                </p>
              </div>
            </button>
          </div>

          {/* Quick Stats Badges for larger screens */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-sky-400" />
              <div className="text-xs">
                <span className="text-slate-400">{t.totalItems}: </span>
                <span className="font-bold text-white">{totalItems}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <span className="text-slate-400">{t.sealedPetis}: </span>
                <span className="font-bold text-amber-400">
                  {totalPetis} {language === 'hi' ? 'पेटी' : 'Cartons'}
                </span>
              </div>
            </div>

            {lowStockCount > 0 && (
              <button
                onClick={onOpenNotifications}
                className="bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/70 rounded-lg px-3 py-1.5 flex items-center gap-2 animate-pulse cursor-pointer transition-colors"
                title={
                  language === 'hi'
                    ? `${lowStockCount} सामान न्यूनतम सीमा से कम हैं - क्लिक करें`
                    : `${lowStockCount} items below threshold - click to view`
                }
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div className="text-xs">
                  <span className="text-amber-300 font-semibold">
                    {t.lowStockAlert}:{' '}
                  </span>
                  <span className="font-bold text-amber-200">{lowStockCount}</span>
                </div>
              </button>
            )}
          </div>

          {/* Top Actions: Install Mobile + Language Switcher + Profile Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install on Mobile Prominent Button */}
            <button
              onClick={onOpenInstallModal}
              aria-label={t.installMobile}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 transition-all transform active:scale-95 border border-sky-400/40"
              title={
                language === 'hi'
                  ? 'मोबाइल में ऐप की तरह इंस्टॉल करें'
                  : 'Install as app on your phone'
              }
            >
              <Smartphone className="w-4 h-4 text-sky-200" />
              <span className="hidden md:inline">{t.installMobile}</span>
              <span className="md:hidden">{language === 'hi' ? 'ऐप इंस्टॉल' : 'Install'}</span>
            </button>

            {/* Language Switcher Selector */}
            <div className="bg-slate-950 border border-slate-700/80 p-0.5 rounded-xl flex items-center shadow-inner">
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  language === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="हिंदी में देखें"
              >
                <span>🇮🇳</span>
                <span className="hidden sm:inline">हिंदी</span>
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            {/* Desktop Action Buttons */}
            <button
              onClick={onToggleMap}
              aria-label={t.shopMap}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isMapOpen
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.shopMap}</span>
            </button>

            <button
              onClick={onOpenPetiInward}
              aria-label={t.petiInward}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>{t.petiInward}</span>
            </button>

            <button
              onClick={onOpenAdd}
              aria-label={t.addManual}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.addManual}</span>
            </button>

            <button
              onClick={onOpenScan}
              aria-label={t.aiScan}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.aiScan}</span>
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              aria-label={language === 'hi' ? 'कम स्टॉक नोटिफिकेशन' : 'Low Stock Notifications'}
              className="relative w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-amber-400 hover:text-white transition-all shadow-sm"
              title={
                language === 'hi'
                  ? `कम स्टॉक अलर्ट्स (${lowStockCount} सामान)`
                  : `Low stock alerts (${lowStockCount} items)`
              }
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  {lowStockCount > 9 ? '9+' : lowStockCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              aria-label={language === 'hi' ? 'प्रोफाइल खोलें' : 'Open Profile'}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sky-400 hover:text-white transition-all shadow-sm"
              title={language === 'hi' ? 'दुकानदार प्रोफाइल' : 'Shopkeeper Profile'}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
