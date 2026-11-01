import React, { useState } from 'react';
import {
  X,
  User,
  Store,
  Camera,
  PlusCircle,
  MapPin,
  Package,
  Smartphone,
  Globe,
  RotateCcw,
  Boxes,
  AlertTriangle,
  Mail,
  Check,
  Edit2,
  Save,
  ChevronRight,
  Sparkles,
  Bell,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  totalItems: number;
  totalPetis: number;
  lowStockCount: number;
  onOpenScan: () => void;
  onOpenAdd: () => void;
  onOpenPetiInward: () => void;
  onToggleMap: () => void;
  onOpenInstallModal: () => void;
  onResetDemo: () => void;
  onOpenNotifications: () => void;
}

export type UserRole = 'owner' | 'developer' | 'manager';

interface UserProfile {
  name: string;
  role: UserRole;
  companyName: string;
  shopName: string;
  contact: string;
}

const PROFILE_STORAGE_KEY = 'dukaan_user_profile_v2';

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  totalItems,
  totalPetis,
  lowStockCount,
  onOpenScan,
  onOpenAdd,
  onOpenPetiInward,
  onToggleMap,
  onOpenInstallModal,
  onResetDemo,
  onOpenNotifications,
}) => {
  const t = TRANSLATIONS[language];

  // Persistent customizable profile state
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      name: 'लव रुहेला',
      role: 'owner',
      companyName: 'loveTech',
      shopName: 'रुहेला स्टेशनरी व बुक डिपो',
      contact: '',
    };
  });

  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(tempProfile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
    setIsEditing(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'developer':
        return {
          icon: '💻',
          textHi: 'डेवलपर (Developer)',
          textEn: 'Developer',
          classes: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'manager':
        return {
          icon: '🏪',
          textHi: 'प्रबंधक (Manager)',
          textEn: 'Store Manager',
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          icon: '👑',
          textHi: 'मालिक (Owner)',
          textEn: 'Store Owner',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
    }
  };

  const roleInfo = getRoleBadge(profile.role);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Hind'] flex items-center gap-2">
                <span>{language === 'hi' ? 'यूजर प्रोफाइल व कंट्रोल' : 'User Profile & Controls'}</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-mono">
                  {profile.companyName || 'loveTech'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hi' ? 'व्यक्तिगत विवरण व दुकान कंट्रोल' : 'Personal info & store controls'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Profile Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'L'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-['Hind'] flex items-center gap-1.5 flex-wrap">
                    <span>{profile.name}</span>
                    <span
                      className={`text-[10px] border px-2 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1 ${roleInfo.classes}`}
                    >
                      <span>{roleInfo.icon}</span>
                      <span>{language === 'hi' ? roleInfo.textHi : roleInfo.textEn}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">{profile.shopName}</p>
                  <p className="text-[11px] text-sky-400 font-medium">
                    🏢 {profile.companyName || 'loveTech'}
                  </p>
                </div>
              </div>

              <button
                onClick={isEditing ? handleSaveProfile : handleStartEdit}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 shrink-0 border border-slate-700 transition-all"
                title={isEditing ? 'सुरक्षित करें' : 'एडिट करें'}
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px] font-bold">सेव</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">{language === 'hi' ? 'बदलें' : 'Edit'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Editable Form */}
            {isEditing ? (
              <div className="pt-2 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'पद / रोल चुनें (Select Role):' : 'Select Your Role:'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTempProfile({ ...tempProfile, role: 'owner' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        tempProfile.role === 'owner'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      👑 {language === 'hi' ? 'मालिक' : 'Owner'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempProfile({ ...tempProfile, role: 'developer' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        tempProfile.role === 'developer'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      💻 {language === 'hi' ? 'डेवलपर' : 'Developer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempProfile({ ...tempProfile, role: 'manager' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        tempProfile.role === 'manager'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🏪 {language === 'hi' ? 'मैनेजर' : 'Manager'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    {language === 'hi' ? 'आपका नाम (Your Name):' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-white font-semibold focus:outline-none focus:border-sky-500"
                    placeholder="उदा. लव रुहेला"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    {language === 'hi' ? 'कंपनी का नाम (Company / Org):' : 'Company Name:'}
                  </label>
                  <input
                    type="text"
                    value={tempProfile.companyName}
                    onChange={(e) => setTempProfile({ ...tempProfile, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-sky-300 font-semibold focus:outline-none focus:border-sky-500"
                    placeholder="loveTech"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    {language === 'hi' ? 'दुकान / स्टोर का नाम:' : 'Store / Shop Name:'}
                  </label>
                  <input
                    type="text"
                    value={tempProfile.shopName}
                    onChange={(e) => setTempProfile({ ...tempProfile, shopName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-amber-300 font-semibold focus:outline-none focus:border-sky-500"
                    placeholder="उदा. रुहेला स्टेशनरी स्टोर"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    {language === 'hi' ? 'संपर्क / फोन / ईमेल (वैकल्पिक):' : 'Contact / Phone (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={tempProfile.contact}
                    onChange={(e) => setTempProfile({ ...tempProfile, contact: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                    placeholder="फोन नंबर या संपर्क"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'प्रोफ़ाइल सुरक्षित करें' : 'Save Profile'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>
                    कंपनी: <strong className="text-slate-200">{profile.companyName || 'loveTech'}</strong>
                  </span>
                </span>
                {profile.contact ? (
                  <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                    📞 {profile.contact}
                  </span>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    + {language === 'hi' ? 'संपर्क जोड़ें' : 'Add contact'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block">{t.totalItems}</span>
              <span className="text-base font-bold text-white">{totalItems}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block">{t.sealedPetis}</span>
              <span className="text-base font-bold text-amber-400">{totalPetis}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2.5 text-center transition-all cursor-pointer group"
              title={language === 'hi' ? 'कम स्टॉक अलर्ट देखें' : 'View Low Stock Alerts'}
            >
              <span className="text-[10px] text-slate-400 group-hover:text-amber-300 block">{t.lowStockAlert}</span>
              <span className={`text-base font-bold ${lowStockCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                {lowStockCount}
              </span>
            </button>
          </div>

          {/* All Actions Present Inside Profile Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {language === 'hi' ? 'त्वरित टूल्स व शॉर्टकट्स (Quick Tools)' : 'Quick Action Shortcuts'}
            </span>

            {/* Notification Center & Push Alerts */}
            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="w-full p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 hover:from-amber-950/70 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-['Hind'] flex items-center gap-2">
                    <span>
                      {language === 'hi'
                        ? 'कम स्टॉक अलर्ट व पुश नोटिफिकेशन'
                        : 'Low Stock Alerts & Notifications'}
                    </span>
                    {lowStockCount > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                        {lowStockCount}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi'
                      ? 'अलर्ट ध्वनि, सीमा पार लिस्ट व पुश सेटिंग्स'
                      : 'Audio chime, breached items & push controls'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>

            {/* 1. AI Photo Scan */}
            <button
              onClick={() => {
                onClose();
                onOpenScan();
              }}
              className="w-full p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 hover:from-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 font-['Hind']">
                    {t.aiScan}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'फोटो खींचें, सामान व पेटी पहचानें' : 'Snap photo to auto-detect carton & shelf'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>

            {/* 2. Add Item Manual */}
            <button
              onClick={() => {
                onClose();
                onOpenAdd();
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Hind']">
                    {t.addManual}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'हाथ से नया सामान, पेटी व रैक दर्ज करें' : 'Manual stock entry & rack assignment'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* 3. Shop Floor Map */}
            <button
              onClick={() => {
                onClose();
                onToggleMap();
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Hind']">
                    {t.shopMap}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'दुकान का नक्शा व रैक लोकेटर' : 'Visual rack & shelf locator map'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* 4. Peti Inward */}
            <button
              onClick={() => {
                onClose();
                onOpenPetiInward();
              }}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Hind']">
                    {t.petiInward}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'नई पेटी/कार्टन की आवक दर्ज करें' : 'Record received bulk cartons'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* 5. Mobile App Installation */}
            <button
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="w-full p-3 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 hover:from-sky-950/60 border border-sky-500/40 rounded-xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-sky-300 font-['Hind'] flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'मोबाइल में इंस्टॉल व APK डाउनलोड' : 'Mobile Install & APK Download'}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-sans font-bold">
                      APK
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'एंड्रॉइड APK पैकेज व 1-क्लिक ऐप' : 'Android APK package & 1-click app'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Language Selection Bar inside Profile */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'hi' ? 'भाषा चुनें (Language):' : 'Select Language:'}</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLanguageChange('hi')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  language === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🇮🇳</span>
                <span>हिंदी (Hindi)</span>
              </button>

              <button
                onClick={() => onLanguageChange('en')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onResetDemo();
              }}
              className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDemoBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
