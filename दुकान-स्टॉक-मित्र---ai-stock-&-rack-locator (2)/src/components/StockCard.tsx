import React from 'react';
import {
  MapPin,
  Package,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { StockItem } from '../types/stock';
import { getStockStatus } from '../utils/stockLogic';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface StockCardProps {
  item: StockItem;
  language: Language;
  onLocateItem: (item: StockItem) => void;
  onAdjustStock: (item: StockItem, delta: number) => void;
  onEditItem: (item: StockItem) => void;
  onDeleteItem: (itemId: string) => void;
  isHighlighted?: boolean;
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  language,
  onLocateItem,
  onAdjustStock,
  onEditItem,
  onDeleteItem,
  isHighlighted,
}) => {
  const t = TRANSLATIONS[language];
  const status = getStockStatus(item.totalUnits, item.minStockThreshold);

  const primaryTitle = language === 'hi' ? item.nameHindi : item.name;
  const secondaryTitle = language === 'hi' ? item.name : item.nameHindi;
  const unitLabel = item.unitName.split('(')[0].trim();

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-3.5 sm:p-4.5 transition-all shadow-md hover:shadow-xl relative flex flex-col justify-between h-full ${
        isHighlighted
          ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-amber-500/20 bg-slate-900/95'
          : status === 'out_of_stock'
          ? 'border-red-900/60 bg-red-950/15'
          : status === 'low_stock'
          ? 'border-amber-700/60 bg-amber-950/15'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Top row: Category tag & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[170px]">
            {language === 'hi'
              ? item.category.split('(')[0].trim()
              : item.category.includes('(')
              ? item.category.split('(')[1].replace(')', '').trim()
              : item.category}
          </span>

          {status === 'out_of_stock' ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3" />
              {t.statusOutOfStock}
            </span>
          ) : status === 'low_stock' ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse shrink-0">
              <AlertTriangle className="w-3 h-3" />
              {t.statusLowStock} ({item.totalUnits})
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3 h-3" />
              {t.statusInStock}
            </span>
          )}
        </div>

        {/* Product Names with fixed min-height for uniform alignment */}
        <div className="min-h-[44px] flex flex-col justify-center">
          <h3 className="font-bold text-white text-sm sm:text-base font-['Hind'] leading-snug line-clamp-2">
            {primaryTitle}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{secondaryTitle}</p>
        </div>

        {/* Peti & Units Formula Card (Fixed uniform height so all cards match) */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 min-h-[58px] flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{t.availableQty}</span>
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              {item.totalUnits} {unitLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {item.isPeti && item.petiCount > 0 ? (
              <>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  📦 {item.petiCount} {language === 'hi' ? 'पेटी' : 'Petis'} ({item.petiCount * item.unitsPerPeti} {unitLabel})
                </span>
                {item.looseUnits > 0 ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    ➕ {item.looseUnits} {language === 'hi' ? 'खुले' : 'loose'}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                🟢 {language === 'hi' ? 'खुले सिंगल पीस (Loose stock)' : 'Loose single stock'}
              </span>
            )}
          </div>
        </div>

        {/* Shop Location Pill & Click-to-Locate Button */}
        <div className="mt-2.5 flex items-center justify-between gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-2 sm:p-2.5 transition-colors min-h-[52px]">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs leading-tight min-w-0 flex-1">
              <span className="font-bold text-sky-300 block truncate">
                {item.location.zoneName}
              </span>
              <span className="text-slate-300 text-[11px] block truncate">
                {item.location.shelf}
              </span>
            </div>
          </div>

          <button
            onClick={() => onLocateItem(item)}
            className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 text-xs font-bold rounded-lg border border-sky-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95"
            title={language === 'hi' ? 'दुकान के नक्शे पर देखें' : 'Locate on shop map'}
          >
            <span>{t.locateBtn}</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Price & Stock Adjustment Controls */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block leading-none">{t.sellingMrp}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-bold text-white text-sm sm:text-base">
              ₹{item.sellingPrice}
            </span>
            <span className="text-[10px] text-slate-500">
              ({t.costLabel} ₹{item.costPrice})
            </span>
          </div>
        </div>

        {/* Quick +/- Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onAdjustStock(item, -1)}
            disabled={item.totalUnits <= 0}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-700/60 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            title={language === 'hi' ? '1 पीस बेचा (-1)' : 'Sell 1 unit (-1)'}
            aria-label={`${item.nameHindi} -1`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onAdjustStock(item, 1)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-700/60 flex items-center justify-center transition-colors active:scale-95"
            title={language === 'hi' ? '1 खुला पीस जोड़ा (+1)' : 'Add 1 loose unit (+1)'}
            aria-label={`${item.nameHindi} +1`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEditItem(item)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition-colors"
            title={language === 'hi' ? 'एडिट करें' : 'Edit item'}
            aria-label={`Edit ${item.nameHindi}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteItem(item.id)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-700/60 flex items-center justify-center transition-colors"
            title={language === 'hi' ? 'हटाएं' : 'Delete item'}
            aria-label={`Delete ${item.nameHindi}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
