import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Boxes,
  Layers,
} from 'lucide-react';
import { StockItem, ShopZoneId } from '../types/stock';
import { SHOP_ZONES, addPetiStock, calculateTotalUnits } from '../utils/stockLogic';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PetiInwardModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  items: StockItem[];
  initialItemId?: string;
  onUpdateItem: (updated: StockItem, notificationMsg: string) => void;
}

export const PetiInwardModal: React.FC<PetiInwardModalProps> = ({
  isOpen,
  language,
  onClose,
  items,
  initialItemId,
  onUpdateItem,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItemId || items[0]?.id || ''
  );
  const [petisAdded, setPetisAdded] = useState<number>(1);
  const [customUnitsPerPeti, setCustomUnitsPerPeti] = useState<number>(12);
  const [storeLocation, setStoreLocation] = useState<ShopZoneId>('godown');
  const [inwardNote, setInwardNote] = useState<string>(
    language === 'hi' ? 'सप्लायर से नई पेटी प्राप्त हुई' : 'Received new cartons from supplier'
  );

  React.useEffect(() => {
    if (initialItemId) {
      setSelectedItemId(initialItemId);
    }
  }, [initialItemId, isOpen]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  React.useEffect(() => {
    if (selectedItem) {
      setCustomUnitsPerPeti(selectedItem.unitsPerPeti || 12);
      setStoreLocation(selectedItem.location.zoneId || 'godown');
    }
  }, [selectedItemId]);

  if (!isOpen) return null;

  const currentTotal = selectedItem ? selectedItem.totalUnits : 0;
  const currentPetis = selectedItem ? selectedItem.petiCount : 0;
  const newUnits = petisAdded * customUnitsPerPeti;
  const expectedNewTotal = currentTotal + newUnits;
  const expectedNewPetis = currentPetis + petisAdded;

  const handleConfirmInward = () => {
    if (!selectedItem) return;

    const { updatedItem, message } = addPetiStock(
      selectedItem,
      petisAdded,
      customUnitsPerPeti
    );

    const targetZone = SHOP_ZONES.find((z) => z.id === storeLocation);
    if (targetZone && storeLocation !== selectedItem.location.zoneId) {
      updatedItem.notes = `${updatedItem.notes || ''} [${petisAdded} ${
        language === 'hi' ? 'पेटी' : 'cartons'
      } stored in ${targetZone.name}]`;
    }

    const finalMsg =
      language === 'hi'
        ? message
        : `${petisAdded} cartons (+${newUnits} ${selectedItem.unitName}) added! Total stock: ${expectedNewTotal} ${selectedItem.unitName}`;

    onUpdateItem(updatedItem, finalMsg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
                {t.petiInwardTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.petiInwardSubtitle}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Item Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {t.petiSelectPrompt}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {language === 'hi' ? it.nameHindi : it.name} (
                  {it.petiCount} {language === 'hi' ? 'पेटी' : 'cartons'} /{' '}
                  {it.totalUnits} {it.unitName})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <>
              {/* Peti Math Controls */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-amber-300 block">
                    {t.petiHowManyArrived}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={petisAdded}
                      onChange={(e) =>
                        setPetisAdded(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      {language === 'hi' ? 'पेटी' : 'Cartons'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {t.petiUnitsEach}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={customUnitsPerPeti}
                      onChange={(e) =>
                        setCustomUnitsPerPeti(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedItem.unitName || 'Units'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Calculation Preview Card */}
              <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-200">
                  <span className="font-semibold">{t.petiCalculationTitle}</span>
                  <span className="font-bold text-amber-400">
                    +{newUnits} {selectedItem.unitName}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-800/40 text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-400 block text-[11px]">{t.petiCurrentStock}</span>
                    <span className="font-bold">
                      {currentPetis} {language === 'hi' ? 'पेटी' : 'cartons'} ({currentTotal} {selectedItem.unitName})
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <div className="text-emerald-400 text-right">
                    <span className="text-slate-400 block text-[11px]">{t.petiNewTotalStock}</span>
                    <span className="font-bold text-sm">
                      {expectedNewPetis} {language === 'hi' ? 'पेटी' : 'cartons'} ({expectedNewTotal} {selectedItem.unitName})
                    </span>
                  </div>
                </div>
              </div>

              {/* Where are these petis placed? */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t.petiStorageLocation}</span>
                </label>
                <select
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value as ShopZoneId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {SHOP_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {language === 'hi' ? zone.name : zone.nameEnglish} - {zone.description.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier / Receipt Note */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  {t.petiBillNotes}
                </label>
                <input
                  type="text"
                  value={inwardNote}
                  onChange={(e) => setInwardNote(e.target.value)}
                  placeholder="e.g. Distributor Invoice #1024"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmInward}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 text-xs sm:text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t.petiConfirmBtn} (+{newUnits} {selectedItem?.unitName || ''})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
