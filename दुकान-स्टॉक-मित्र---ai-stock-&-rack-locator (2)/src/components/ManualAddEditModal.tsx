import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Package,
  MapPin,
  Tag,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { StockItem, ShopZoneId } from '../types/stock';
import {
  SHOP_ZONES,
  STOCK_CATEGORIES,
  calculateTotalUnits,
  generateSku,
} from '../utils/stockLogic';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ManualAddEditModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSaveItem: (item: StockItem) => void;
  itemToEdit?: StockItem | null;
}

export const ManualAddEditModal: React.FC<ManualAddEditModalProps> = ({
  isOpen,
  language,
  onClose,
  onSaveItem,
  itemToEdit,
}) => {
  const t = TRANSLATIONS[language];
  const [nameHindi, setNameHindi] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [category, setCategory] = useState(STOCK_CATEGORIES[1]);
  const [brand, setBrand] = useState('');
  const [isPeti, setIsPeti] = useState(true);
  const [petiCount, setPetiCount] = useState(1);
  const [unitsPerPeti, setUnitsPerPeti] = useState(12);
  const [looseUnits, setLooseUnits] = useState(0);
  const [unitName, setUnitName] = useState('कॉपी (Copies)');
  const [zoneId, setZoneId] = useState<ShopZoneId>('rack-b');
  const [shelf, setShelf] = useState('शेल्फ 3 (तीसरा खाना)');
  const [details, setDetails] = useState('');
  const [costPrice, setCostPrice] = useState(30);
  const [sellingPrice, setSellingPrice] = useState(45);
  const [minThreshold, setMinThreshold] = useState(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setNameHindi(itemToEdit.nameHindi);
      setNameEnglish(itemToEdit.name);
      setCategory(itemToEdit.category as any);
      setBrand(itemToEdit.brand);
      setIsPeti(itemToEdit.isPeti);
      setPetiCount(itemToEdit.petiCount);
      setUnitsPerPeti(itemToEdit.unitsPerPeti);
      setLooseUnits(itemToEdit.looseUnits);
      setUnitName(itemToEdit.unitName);
      setZoneId(itemToEdit.location.zoneId);
      setShelf(itemToEdit.location.shelf);
      setDetails(itemToEdit.location.details);
      setCostPrice(itemToEdit.costPrice);
      setSellingPrice(itemToEdit.sellingPrice);
      setMinThreshold(itemToEdit.minStockThreshold);
      setNotes(itemToEdit.notes || '');
    } else {
      setNameHindi('');
      setNameEnglish('');
      setCategory(STOCK_CATEGORIES[1]);
      setBrand('');
      setIsPeti(true);
      setPetiCount(1);
      setUnitsPerPeti(12);
      setLooseUnits(0);
      setUnitName(language === 'hi' ? 'कॉपी (Copies)' : 'Copies');
      setZoneId('rack-b');
      setShelf(language === 'hi' ? 'शेल्फ 3 (तीसरा खाना)' : 'Shelf 3');
      setDetails('');
      setCostPrice(30);
      setSellingPrice(45);
      setMinThreshold(10);
      setNotes('');
    }
  }, [itemToEdit, isOpen, language]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat as any);
    if (newCat.includes('कॉपी') || newCat.includes('रजिस्टर')) {
      setUnitName('कॉपी (Copies)');
      setZoneId('rack-b');
      setShelf('शेल्फ 3 (तीसरा खाना)');
    } else if (newCat.includes('पेंसिल')) {
      setUnitName('पीस (Pieces)');
      setZoneId('rack-a');
      setShelf('शेल्फ 2 (मध्य खाना)');
    } else if (newCat.includes('पेन')) {
      setUnitName('पीस (Pieces)');
      setZoneId('counter');
      setShelf('शेल्फ 1 (काउंटर ट्रे)');
    } else if (newCat.includes('आर्ट') || newCat.includes('कलर')) {
      setUnitName('सेट (Sets)');
      setZoneId('rack-c');
      setShelf('शेल्फ 2 (मध्य खाना)');
    } else if (newCat.includes('दफ्तर') || newCat.includes('ऑफिस')) {
      setUnitName('पीस (Pieces)');
      setZoneId('rack-d');
      setShelf('शेल्फ 1 (पहला शेल्फ)');
    }
  };

  if (!isOpen) return null;

  const totalUnits = calculateTotalUnits(
    isPeti ? petiCount : 0,
    unitsPerPeti,
    looseUnits
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameHindi.trim() && !nameEnglish.trim()) return;

    const primaryName = nameHindi.trim() || nameEnglish.trim();
    const secName = nameEnglish.trim() || nameHindi.trim();
    const targetZone = SHOP_ZONES.find((z) => z.id === zoneId) || SHOP_ZONES[1];

    const saved: StockItem = {
      id: itemToEdit?.id || 'item-' + Date.now(),
      name: secName,
      nameHindi: primaryName,
      category,
      brand: brand || 'Standard',
      sku: itemToEdit?.sku || generateSku(category, primaryName),
      barcode: itemToEdit?.barcode,
      isPeti,
      petiCount: isPeti ? petiCount : 0,
      unitsPerPeti,
      looseUnits,
      totalUnits,
      unitName,
      costPrice,
      sellingPrice,
      location: {
        zoneId,
        zoneName: targetZone.name,
        shelf,
        details:
          details.trim() ||
          `${targetZone.name} में ${shelf} पर रखा है`,
      },
      minStockThreshold: minThreshold,
      notes,
      lastUpdated: new Date().toISOString(),
      history: itemToEdit?.history || [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          type: 'manual_add',
          quantityChange: totalUnits,
          note: `Manual Entry: ${totalUnits} ${unitName} recorded`,
        },
      ],
    };

    onSaveItem(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
                {itemToEdit ? t.manualTitleEdit : t.manualTitleAdd}
              </h2>
              <p className="text-xs text-slate-400">
                {t.manualSubtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualNameHi}
              </label>
              <input
                type="text"
                required
                value={nameHindi}
                onChange={(e) => setNameHindi(e.target.value)}
                placeholder="उदा. क्लासमेट हिंदी कॉपी 172 पेज"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualNameEn}
              </label>
              <input
                type="text"
                value={nameEnglish}
                onChange={(e) => setNameEnglish(e.target.value)}
                placeholder="e.g. Classmate Hindi Notebook 172p"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.manualCategory}</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {STOCK_CATEGORIES.filter((c) => c !== 'सभी (All)').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualBrand}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Classmate, Apsara, Nataraj"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Peti & Stock Calculations */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPeti}
                  onChange={(e) => setIsPeti(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  {t.manualIsPetiPrompt}
                </span>
              </label>
              <span className="text-xs font-bold text-emerald-400">
                {t.manualTotalStock} {totalUnits} {unitName}
              </span>
            </div>

            {isPeti ? (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {language === 'hi' ? 'पेटी संख्या (Petis)' : 'Carton Count'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={petiCount}
                    onChange={(e) =>
                      setPetiCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {language === 'hi' ? 'प्रति पेटी में कितने पीस?' : 'Units per Carton'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={unitsPerPeti}
                    onChange={(e) =>
                      setUnitsPerPeti(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {language === 'hi' ? 'खुले पीस (Loose Units)' : 'Loose Units'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={looseUnits}
                    onChange={(e) =>
                      setLooseUnits(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {language === 'hi' ? 'सीधा कुल स्टॉक संख्या' : 'Total Direct Units'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={looseUnits}
                  onChange={(e) =>
                    setLooseUnits(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2 rounded-lg border border-amber-900/40">
              💡 {petiCount} {language === 'hi' ? 'पेटी' : 'Carton(s)'} x {unitsPerPeti} + {looseUnits} {t.loosePieces} = <strong>{totalUnits} {unitName}</strong> {t.manualTotalStock}
            </div>
          </div>

          {/* Shop Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.manualRack}</span>
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value as ShopZoneId)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {SHOP_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {language === 'hi' ? zone.name : zone.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualShelf}
              </label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                placeholder="e.g. Shelf 3"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualDirections}
              </label>
              <input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Opposite billing desk, Rack B 3rd row bundle"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Pricing & Min Alert */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualCost}
              </label>
              <input
                type="number"
                step="0.5"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualMrp}
              </label>
              <input
                type="number"
                step="0.5"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t.manualMinAlert}
              </label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 5)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 text-xs sm:text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{itemToEdit ? t.manualUpdateBtn : t.manualSaveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
