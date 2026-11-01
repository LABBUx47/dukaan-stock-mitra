import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Boxes,
  PlusCircle,
  Camera,
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  Smartphone,
  Download,
  AlertTriangle,
  RotateCcw,
  Package,
  Layers,
  Sparkles,
  WifiOff,
  Bell,
  ChevronRight,
  Info,
} from 'lucide-react';
import { StockItem, ShopZoneId } from './types/stock';
import { INITIAL_STOCK } from './data/initialStock';
import {
  STOCK_CATEGORIES,
  SHOP_ZONES,
  calculateTotalUnits,
  adjustLooseStock,
  filterAndSortStock,
  formatPetiBreakdown,
  getStockStatus,
} from './utils/stockLogic';
import {
  StockAlert,
  evaluateStockThresholdAlert,
  playAlertChime,
  sendBrowserPushNotification,
  requestNotificationPermission,
  getNotificationPermission,
} from './utils/alertNotification';
import { Language, TRANSLATIONS } from './i18n/translations';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWAInstall';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { StockCard } from './components/StockCard';
import { ShopFloorMap } from './components/ShopFloorMap';
import { LocationQuickFinder } from './components/LocationQuickFinder';
import { AIScannerModal } from './components/AIScannerModal';
import { ManualAddEditModal } from './components/ManualAddEditModal';
import { PetiInwardModal } from './components/PetiInwardModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { InstallMobileModal } from './components/InstallMobileModal';
import { AlertToastContainer } from './components/AlertToastContainer';
import { NotificationCenterModal } from './components/NotificationCenterModal';

const STORAGE_KEY = 'dukaan_stock_inventory_v2';
const LANG_STORAGE_KEY = 'dukaan_stock_lang_v1';
const SOUND_STORAGE_KEY = 'dukaan_alert_sound_v1';

export default function App() {
  // --- Persistent State ---
  const [items, setItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load stock from localStorage:', e);
    }
    return INITIAL_STOCK;
  });

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (savedLang === 'hi' || savedLang === 'en') return savedLang;
    } catch {}
    return 'hi';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      if (savedSound !== null) return savedSound === 'true';
    } catch {}
    return true;
  });

  // --- Filtering & Sorting State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('सभी (All)');
  const [selectedZone, setSelectedZone] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'peti_only' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity_asc' | 'quantity_desc' | 'price' | 'location'>('name');

  // --- UI & Modal Controls ---
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isPetiInwardOpen, setIsPetiInwardOpen] = useState(false);
  const [petiInwardItemId, setPetiInwardItemId] = useState<string | undefined>(undefined);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // --- Map Highlighting & Scroll targets ---
  const [highlightedItem, setHighlightedItem] = useState<StockItem | null>(null);
  const inventorySectionRef = useRef<HTMLDivElement | null>(null);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  // --- Alert & Notification Toast Queue ---
  const [activeAlerts, setActiveAlerts] = useState<StockAlert[]>([]);

  // --- PWA & Mobile hooks ---
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const t = TRANSLATIONS[language];

  // Save items to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [items]);

  // Save language to localStorage
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {}
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // --- Alert Dispatcher ---
  const dispatchAlert = (alert: StockAlert) => {
    // Add to toasts (deduping if same item already active)
    setActiveAlerts((prev) => {
      const filtered = prev.filter((a) => a.item.id !== alert.item.id);
      return [alert, ...filtered].slice(0, 4); // max 4 active toasts
    });

    // Play audible chime if sound enabled
    if (soundEnabled) {
      playAlertChime(alert.type === 'out_of_stock' ? 'urgent' : 'warning');
    }

    // Trigger system-level native push notification
    sendBrowserPushNotification(alert, language);
  };

  const handleDismissAlert = (alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // --- Computed Stats ---
  const totalItemsCount = items.length;
  const totalPetisCount = items.reduce(
    (sum, item) => sum + (item.isPeti ? item.petiCount : 0),
    0
  );
  const lowStockCount = items.filter(
    (item) => item.totalUnits > 0 && item.totalUnits <= item.minStockThreshold
  ).length;
  const outOfStockCount = items.filter((item) => item.totalUnits <= 0).length;

  // Filtered & Sorted stock list
  const filteredItems = useMemo(() => {
    return filterAndSortStock(items, {
      searchQuery,
      selectedCategory,
      selectedZone,
      statusFilter,
      sortBy,
    });
  }, [items, searchQuery, selectedCategory, selectedZone, statusFilter, sortBy]);

  // --- Actions ---
  const handleAdjustStock = (item: StockItem, delta: number) => {
    const previousUnits = item.totalUnits;
    const updated = adjustLooseStock(item, delta);

    // Evaluate stock threshold alert
    const alert = evaluateStockThresholdAlert(previousUnits, updated);

    if (alert) {
      dispatchAlert(alert);
    }

    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
  };

  const handleSaveItem = (savedItem: StockItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === savedItem.id);
      if (exists) {
        return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
      } else {
        return [savedItem, ...prev];
      }
    });

    // Highlight and locate
    setHighlightedItem(savedItem);
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId);
    const itemName = itemToDelete
      ? language === 'hi'
        ? itemToDelete.nameHindi
        : itemToDelete.name
      : '';
    const confirmMsg =
      language === 'hi'
        ? `क्या आप "${itemName}" को स्टॉक से हटाना चाहते हैं?`
        : `Are you sure you want to remove "${itemName}" from inventory?`;

    if (window.confirm(confirmMsg)) {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      if (highlightedItem?.id === itemId) {
        setHighlightedItem(null);
      }
    }
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  const handleOpenPetiInward = (itemId?: string) => {
    setPetiInwardItemId(itemId);
    setIsPetiInwardOpen(true);
  };

  const handleUpdateItemFromInward = (updated: StockItem) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    setHighlightedItem(updated);
  };

  const handleLocateItem = (item: StockItem) => {
    setHighlightedItem(item);
    setIsMapOpen(true);
    // Smooth scroll to map
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleScrollToStock = () => {
    setIsMapOpen(false);
    inventorySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetDemo = () => {
    const confirmMsg =
      language === 'hi'
        ? 'क्या आप पूरा स्टॉक डेमो डेटा पर रीसेट करना चाहते हैं?'
        : 'Do you want to reset all inventory to the initial demo store data?';
    if (window.confirm(confirmMsg)) {
      setItems(INITIAL_STOCK);
      setHighlightedItem(null);
      setActiveAlerts([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const handleTriggerTestAlert = () => {
    const target = items.find((it) => it.totalUnits <= it.minStockThreshold) || items[0];
    if (target) {
      const testAlert: StockAlert = {
        id: `alert-test-${Date.now()}`,
        type: 'low_stock',
        title: '⚠️ Low Stock Alert!',
        titleHindi: '⚠️ कम स्टॉक चेतावनी! (Low Stock)',
        message: `"${target.name}" stock dropped to ${target.totalUnits} ${target.unitName} (Min Threshold: ${target.minStockThreshold}).`,
        messageHindi: `"${target.nameHindi}" का स्टॉक घटकर ${target.totalUnits} ${target.unitName} रह गया है (न्यूनतम सीमा: ${target.minStockThreshold})।`,
        item: target,
        currentUnits: target.totalUnits,
        minThreshold: target.minStockThreshold,
        timestamp: Date.now(),
      };
      dispatchAlert(testAlert);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] pb-24 sm:pb-12">
      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div className="bg-amber-600/95 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        totalItems={totalItemsCount}
        totalPetis={totalPetisCount}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenAdd={handleOpenAdd}
        onOpenPetiInward={() => handleOpenPetiInward()}
        onToggleMap={() => setIsMapOpen((prev) => !prev)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isMapOpen={isMapOpen}
        isInstallable={isInstallable}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Mobile Download / Install Banner (Prominent on small screens if not standalone) */}
        {!isInstalled && (
          <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-emerald-950/80 border border-sky-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Hind']">
                  {language === 'hi'
                    ? '📲 इस ऐप को सीधे अपने मोबाइल में डाउनलोड / इंस्टॉल करें'
                    : '📲 Download & Install this app on your phone'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'hi'
                    ? 'बिना प्ले स्टोर के, सीधे होम स्क्रीन पर 1-टैप में असली ऐप की तरह चलाएं'
                    : 'Add to home screen for instant camera scanning and offline store management'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'hi' ? 'फोन में इंस्टॉल / APK पाएं' : 'Get App / APK Package'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Shelf Locator: "सामान खोजें: दुकान में कहाँ रखा है?" */}
        <LocationQuickFinder
          items={items}
          language={language}
          onLocateItem={handleLocateItem}
        />

        {/* Collapsible / Expandable Shop Floor Map */}
        <div ref={mapSectionRef}>
          {isMapOpen && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h2 className="text-base sm:text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    {t.mapTitle}
                  </h2>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
                >
                  {language === 'hi' ? 'नक्शा छिपाएं' : 'Hide Map'}
                </button>
              </div>

              <ShopFloorMap
                items={items}
                selectedZone={selectedZone}
                language={language}
                onSelectZone={(zoneId) => {
                  setSelectedZone(zoneId);
                  // also filter stock table to this zone
                }}
                highlightedItem={highlightedItem}
                onClearHighlight={() => setHighlightedItem(null)}
                onSelectItemForLocate={(item) => setHighlightedItem(item)}
              />
            </div>
          )}
        </div>

        {/* Search, Filter & View Controls */}
        <section ref={inventorySectionRef} className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Buttons (All, Peti, Low Stock) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.filterAll} ({totalItemsCount})
              </button>
              <button
                onClick={() => setStatusFilter('peti_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  statusFilter === 'peti_only'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{t.filterPetiOnly} ({totalPetisCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  statusFilter === 'low_stock'
                    ? 'bg-red-500 text-slate-950 shadow-md shadow-red-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {t.filterLowStock} ({lowStockCount + outOfStockCount})
                </span>
              </button>
            </div>
          </div>

          {/* Secondary Dropdown Filter Bar: Categories, Racks, Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl">
            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                {t.categoryLabel}
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="सभी (All)" className="bg-slate-900">
                  {language === 'hi' ? 'सभी कैटेगरी (All)' : 'All Categories'}
                </option>
                {STOCK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {language === 'hi' ? cat.split('(')[0].trim() : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop Zone / Rack Filter */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {t.rackLabel}
              </span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-slate-900">
                  {t.allRacks}
                </option>
                {SHOP_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id} className="bg-slate-900">
                    {language === 'hi' ? zone.name : zone.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                {t.sortByLabel}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="name" className="bg-slate-900">
                  {t.sortByName}
                </option>
                <option value="quantity_asc" className="bg-slate-900">
                  {t.sortByQtyAsc}
                </option>
                <option value="quantity_desc" className="bg-slate-900">
                  {t.sortByQtyDesc}
                </option>
                <option value="price" className="bg-slate-900">
                  {t.sortByPrice}
                </option>
                <option value="location" className="bg-slate-900">
                  {t.sortByLocation}
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Inventory Stock Grid Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
              <Boxes className="w-5 h-5 text-sky-400" />
              <span>{t.inventoryTitle}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {filteredItems.length} {t.itemsFound}
              </span>
            </h2>

            {/* Action Buttons: Add Item & AI Scan for Desktop/Tablet */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsScanOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{t.aiScan}</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.addManual}</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
              {filteredItems.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLocateItem={handleLocateItem}
                  onAdjustStock={handleAdjustStock}
                  onEditItem={handleOpenEdit}
                  onDeleteItem={handleDeleteItem}
                  isHighlighted={highlightedItem?.id === item.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Hind']">
                  {language === 'hi'
                    ? 'कोई सामान नहीं मिला'
                    : 'No inventory items matched your search'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {language === 'hi'
                    ? 'कृपया सर्च शब्द बदलें या नया सामान जोड़ने के लिए "AI फोटो स्कैन" या "मैनुअल जोड़ें" बटन दबाएं।'
                    : 'Try clearing your filters or add new stock items using AI Photo Scan or Manual Add.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('सभी (All)');
                    setSelectedZone('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  {language === 'hi' ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t.addManual}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        language={language}
        activeTab={isMapOpen ? 'map' : 'stock'}
        isMapOpen={isMapOpen}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenAdd={handleOpenAdd}
        onToggleMap={() => setIsMapOpen((prev) => !prev)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onScrollToStock={handleScrollToStock}
      />

      {/* --- Modals & Drawers --- */}

      {/* 1. AI Photo Scanner Modal */}
      <AIScannerModal
        isOpen={isScanOpen}
        language={language}
        onClose={() => setIsScanOpen(false)}
        onAddStockItem={handleSaveItem}
      />

      {/* 2. Manual Add / Edit Modal */}
      <ManualAddEditModal
        isOpen={isAddEditOpen}
        language={language}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingItem(null);
        }}
        onSaveItem={handleSaveItem}
        itemToEdit={editingItem}
      />

      {/* 3. Peti Inward Modal */}
      <PetiInwardModal
        isOpen={isPetiInwardOpen}
        language={language}
        onClose={() => setIsPetiInwardOpen(false)}
        items={items}
        initialItemId={petiInwardItemId}
        onUpdateItem={handleUpdateItemFromInward}
      />

      {/* 4. Profile & Store Settings Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        totalItems={totalItemsCount}
        totalPetis={totalPetisCount}
        lowStockCount={lowStockCount + outOfStockCount}
        onOpenScan={() => {
          setIsProfileOpen(false);
          setIsScanOpen(true);
        }}
        onOpenAdd={() => {
          setIsProfileOpen(false);
          handleOpenAdd();
        }}
        onOpenPetiInward={() => {
          setIsProfileOpen(false);
          handleOpenPetiInward();
        }}
        onToggleMap={() => {
          setIsProfileOpen(false);
          setIsMapOpen(true);
        }}
        onOpenInstallModal={() => {
          setIsProfileOpen(false);
          setIsInstallModalOpen(true);
        }}
        onResetDemo={handleResetDemo}
        onOpenNotifications={() => {
          setIsProfileOpen(false);
          setIsNotificationsOpen(true);
        }}
      />

      {/* 5. Mobile Phone Install & Download Modal */}
      <InstallMobileModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        language={language}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onInstall={install}
      />

      {/* 6. Notifications & Low Stock Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        items={items}
        language={language}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestockItem={(item) => {
          setIsNotificationsOpen(false);
          handleOpenPetiInward(item.id);
        }}
        onLocateItem={(item) => {
          setIsNotificationsOpen(false);
          handleLocateItem(item);
        }}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* 7. Floating Alert Toast Notification System */}
      <AlertToastContainer
        alerts={activeAlerts}
        onDismiss={handleDismissAlert}
        onLocateItem={handleLocateItem}
        onRestockItem={(item) => handleOpenPetiInward(item.id)}
        language={language}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
    </div>
  );
}
