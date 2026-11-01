import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  BookOpen,
  Pencil,
  Store,
  Palette,
  Briefcase,
  Sparkles,
  Package,
  X,
  Grid,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SHOP_ZONES } from '../utils/stockLogic';
import { ShopZone, StockItem } from '../types/stock';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ShopFloorMapProps {
  items: StockItem[];
  selectedZone: string;
  language: Language;
  onSelectZone: (zoneId: string) => void;
  highlightedItem?: StockItem | null;
  onClearHighlight?: () => void;
  onSelectItemForLocate?: (item: StockItem) => void;
}

export const ShopFloorMap: React.FC<ShopFloorMapProps> = ({
  items,
  selectedZone,
  language,
  onSelectZone,
  highlightedItem,
  onClearHighlight,
  onSelectItemForLocate,
}) => {
  const t = TRANSLATIONS[language];
  // View mode: 'shelves' (Visual Rack & Shelf Compartments) or 'floorplan' (2D Layout)
  const [viewMode, setViewMode] = useState<'shelves' | 'floorplan'>('shelves');
  const [activeZoneDetail, setActiveZoneDetail] = useState<ShopZone | null>(
    highlightedItem
      ? SHOP_ZONES.find((z) => z.id === highlightedItem.location.zoneId) || null
      : null
  );
  const [expandedRacks, setExpandedRacks] = useState<Record<string, boolean>>({
    'rack-a': true,
    'rack-b': true,
    'rack-c': true,
    'rack-d': true,
    'counter': true,
    'godown': true,
    'showcase': true,
  });

  const highlightedRef = useRef<HTMLDivElement | null>(null);

  // Update active zone when highlightedItem changes
  useEffect(() => {
    if (highlightedItem) {
      const match = SHOP_ZONES.find((z) => z.id === highlightedItem.location.zoneId);
      if (match) {
        setActiveZoneDetail(match);
        setExpandedRacks((prev) => ({ ...prev, [match.id]: true }));
      }
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  }, [highlightedItem]);

  // Group items by zone
  const itemsByZone = items.reduce<Record<string, StockItem[]>>((acc, item) => {
    const zid = item.location.zoneId;
    if (!acc[zid]) acc[zid] = [];
    acc[zid].push(item);
    return acc;
  }, {});

  const currentZone = activeZoneDetail || SHOP_ZONES.find((z) => z.id === selectedZone);
  const zoneItems = currentZone ? itemsByZone[currentZone.id] || [] : [];

  const toggleRackExpand = (rackId: string) => {
    setExpandedRacks((prev) => ({ ...prev, [rackId]: !prev[rackId] }));
  };

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Pencil':
        return <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Palette':
        return <Palette className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Store':
        return <Store className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Package':
        return <Package className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Layers className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-850 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base font-['Hind'] flex items-center gap-2">
              {t.mapTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {t.mapSubtitle}
            </p>
          </div>
        </div>

        {/* View Switcher: Shelves Box vs 2D Floor Plan */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('shelves')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'shelves'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रैक व शेल्फ बॉक्स' : 'Shelf Boxes'}</span>
          </button>

          <button
            onClick={() => setViewMode('floorplan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'floorplan'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '2D फ्लोर मैप' : '2D Floor Plan'}</span>
          </button>
        </div>
      </div>

      {/* Quick highlight banner if an item was located */}
      {highlightedItem && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-bold text-amber-300">
              {language === 'hi' ? highlightedItem.nameHindi : highlightedItem.name}:
            </span>
            <span className="text-slate-200">
              📍 {highlightedItem.location.zoneName} • {highlightedItem.location.shelf}
            </span>
          </div>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-slate-400 hover:text-white p-1"
              title="हटाएं"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* MODE 1: VISUAL SHELF BOXES (Shelves perfectly fit inside each rack box) */}
      {viewMode === 'shelves' && (
        <div className="p-3.5 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'hi'
                  ? 'सभी रैक के अंदर उनके शेल्फ (खाने) व रखा सामान देखें:'
                  : 'Inspect all racks with physical shelf tiers inside:'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allExpanded = Object.keys(expandedRacks).reduce(
                    (acc, k) => ({ ...acc, [k]: true }),
                    {}
                  );
                  setExpandedRacks(allExpanded);
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline"
              >
                {language === 'hi' ? 'सभी शेल्फ खोलें' : 'Expand All'}
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  const allCollapsed = Object.keys(expandedRacks).reduce(
                    (acc, k) => ({ ...acc, [k]: false }),
                    {}
                  );
                  setExpandedRacks(allCollapsed);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-300 underline"
              >
                {language === 'hi' ? 'सभी बंद करें' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Grid of Racks — on mobile 1 column, on tablet/desktop 2 or 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {SHOP_ZONES.map((zone) => {
              const zoneItemsList = itemsByZone[zone.id] || [];
              const isCurrent = currentZone?.id === zone.id;
              const hasHighlightedItem = highlightedItem?.location.zoneId === zone.id;
              const isExpanded = expandedRacks[zone.id] ?? true;

              // Generate shelves array based on zone.shelfNames or totalShelves
              const shelfNames =
                zone.shelfNames && zone.shelfNames.length > 0
                  ? zone.shelfNames
                  : Array.from(
                      { length: zone.totalShelves },
                      (_, idx) => `शेल्फ ${idx + 1}`
                    );

              return (
                <div
                  key={zone.id}
                  className={`bg-slate-950/70 border rounded-2xl overflow-hidden transition-all shadow-md flex flex-col justify-between ${
                    hasHighlightedItem
                      ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-amber-500/20'
                      : isCurrent
                      ? 'border-sky-500/60 ring-1 ring-sky-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Rack Header */}
                  <div
                    onClick={() => {
                      setActiveZoneDetail(zone);
                      toggleRackExpand(zone.id);
                    }}
                    className={`p-3 sm:p-3.5 flex items-center justify-between cursor-pointer border-b select-none transition-colors ${
                      hasHighlightedItem
                        ? 'bg-amber-500/20 border-amber-500/40'
                        : isCurrent
                        ? 'bg-sky-950/40 border-sky-800/60'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          hasHighlightedItem
                            ? 'bg-amber-400 text-slate-950'
                            : isCurrent
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {getZoneIcon(zone.iconName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-white text-xs sm:text-sm font-['Hind'] leading-tight">
                            {language === 'hi' ? zone.name : zone.nameEnglish}
                          </h4>
                          {hasHighlightedItem && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 shrink-0">
                              📍 {language === 'hi' ? 'यहाँ है!' : 'Here!'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {zone.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-700">
                        {zoneItemsList.length} {language === 'hi' ? 'सामान' : 'items'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Physical Shelves Compartments inside the Rack Box */}
                  {isExpanded && (
                    <div className="p-2.5 sm:p-3 space-y-2 bg-slate-950/40 flex-1">
                      {shelfNames.map((shelfName, shelfIdx) => {
                        // Find items that belong to this shelf
                        const itemsInThisShelf = zoneItemsList.filter((item) => {
                          const s = item.location.shelf.toLowerCase();
                          const idxStr = `${shelfIdx + 1}`;
                          return s.includes(idxStr) || s.includes(shelfName.toLowerCase());
                        });

                        const isShelfHighlighted =
                          highlightedItem &&
                          highlightedItem.location.zoneId === zone.id &&
                          (highlightedItem.location.shelf.includes(`${shelfIdx + 1}`) ||
                            highlightedItem.location.shelf.includes(shelfName));

                        return (
                          <div
                            key={shelfIdx}
                            ref={isShelfHighlighted ? highlightedRef : null}
                            className={`rounded-xl p-2 sm:p-2.5 border transition-all ${
                              isShelfHighlighted
                                ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 shadow-md'
                                : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                            }`}
                          >
                            {/* Shelf Compartment Header */}
                            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-800/80 mb-1.5">
                              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 truncate">
                                <Layers className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span className="truncate">{shelfName}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                {itemsInThisShelf.length > 0
                                  ? `${itemsInThisShelf.length} ${language === 'hi' ? 'सामान' : 'items'}`
                                  : language === 'hi'
                                  ? 'खाली शेल्फ'
                                  : 'Empty'}
                              </span>
                            </div>

                            {/* Items inside this shelf */}
                            {itemsInThisShelf.length === 0 ? (
                              <div className="py-1 text-[11px] text-slate-500 italic pl-1">
                                {language === 'hi'
                                  ? 'यह खाना अभी खाली है (कोई सामान नहीं)'
                                  : 'This shelf compartment is currently empty'}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {itemsInThisShelf.map((it) => {
                                  const isItHighlighted = highlightedItem?.id === it.id;
                                  return (
                                    <div
                                      key={it.id}
                                      onClick={() => onSelectItemForLocate && onSelectItemForLocate(it)}
                                      className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg cursor-pointer transition-colors ${
                                        isItHighlighted
                                          ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400'
                                          : 'text-slate-300 hover:bg-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate min-w-0 pr-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                        <span className="font-['Hind'] truncate text-[11px] sm:text-xs">
                                          {language === 'hi' ? it.nameHindi : it.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-semibold text-emerald-400 shrink-0 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                        {it.totalUnits} {it.unitName.split('(')[0].trim()}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rack Footer Action */}
                  <div className="p-2 sm:p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onSelectZone(zone.id)}
                      className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <span>{t.mapFilterThisRack}</span>
                      <span>→</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {zone.totalShelves} {language === 'hi' ? 'खाने' : 'Shelves'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: 2D FLOOR PLAN (Responsive, with zoom/scroll so nothing is cut off) */}
      {viewMode === 'floorplan' && (
        <div className="p-3.5 sm:p-5 bg-slate-950/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.mapFloorPlanLabel}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'hi' ? 'रैक पर क्लिक करके शेल्फ देखें' : 'Click rack to view shelves'}
            </span>
          </div>

          {/* Blueprint Canvas with horizontal scroll wrapper for mobile screens */}
          <div className="overflow-x-auto pb-2">
            <div className="relative min-w-[500px] h-[400px] bg-slate-900/90 rounded-2xl border-2 border-slate-800 p-3 shadow-inner overflow-hidden">
              {/* Grid background effect */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Render all Shop Zones with non-overlapping coordinates */}
              {SHOP_ZONES.map((zone) => {
                const zoneItemCount = (itemsByZone[zone.id] || []).length;
                const isSelected = selectedZone === zone.id || activeZoneDetail?.id === zone.id;
                const isHighlighted = highlightedItem?.location.zoneId === zone.id;

                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setActiveZoneDetail(zone);
                      onSelectZone(zone.id);
                    }}
                    style={{
                      left: `${zone.mapCoords.x}%`,
                      top: `${zone.mapCoords.y}%`,
                      width: `${zone.mapCoords.w}%`,
                      height: `${zone.mapCoords.h}%`,
                    }}
                    className={`absolute rounded-xl p-2.5 text-left transition-all flex flex-col justify-between border cursor-pointer ${
                      isHighlighted
                        ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/30 animate-pulse z-20'
                        : isSelected
                        ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/50 shadow-md z-10'
                        : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {/* Pin if highlighted */}
                    {isHighlighted && (
                      <div className="absolute -top-2.5 -right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 fill-current" />
                        {language === 'hi' ? 'यहाँ है!' : 'Located Here!'}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isHighlighted
                            ? 'bg-amber-400 text-slate-950'
                            : isSelected
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {getZoneIcon(zone.iconName)}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700">
                        {zoneItemCount} {language === 'hi' ? 'सामान' : 'items'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white font-['Hind'] leading-tight truncate">
                        {language === 'hi' ? zone.name : zone.nameEnglish}
                      </h4>
                      {/* Mini Shelf Compartment Lines inside 2D box */}
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: zone.totalShelves }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded bg-slate-700 border border-slate-600"
                            title={`शेल्फ ${i + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {zone.totalShelves} {language === 'hi' ? 'शेल्फ (खाने)' : 'Shelves'}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Entrance / Main Shutter at bottom right without overlapping Showcase */}
              <div
                style={{
                  left: '36.5%',
                  top: '76%',
                  width: '57.5%',
                  height: '16%',
                }}
                className="absolute flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 border border-dashed border-slate-600 text-slate-400 text-xs font-semibold"
              >
                <span>{t.mapEntrance}</span>
              </div>
            </div>
          </div>

          {/* Selected Rack Details & Shelves Breakdown in 2D mode */}
          {currentZone && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    {getZoneIcon(currentZone.iconName)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm font-['Hind']">
                      {language === 'hi' ? currentZone.name : currentZone.nameEnglish}
                    </h4>
                    <p className="text-[11px] text-slate-400">{currentZone.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectZone(currentZone.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700"
                >
                  {t.mapFilterThisRack}
                </button>
              </div>

              {/* Shelves list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(currentZone.shelfNames || Array.from({ length: currentZone.totalShelves }, (_, idx) => `शेल्फ ${idx + 1}`)).map(
                  (shelf, idx) => {
                    const shelfItems = zoneItems.filter((it) =>
                      it.location.shelf.includes(`${idx + 1}`) || it.location.shelf.includes(shelf)
                    );
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-xs"
                      >
                        <div className="font-bold text-amber-400 flex items-center justify-between mb-1">
                          <span>{shelf}</span>
                          <span className="text-[10px] text-slate-400">
                            {shelfItems.length} {language === 'hi' ? 'सामान' : 'items'}
                          </span>
                        </div>
                        {shelfItems.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic">
                            {language === 'hi' ? 'खाली शेल्फ' : 'Empty'}
                          </span>
                        ) : (
                          shelfItems.map((it) => (
                            <div key={it.id} className="text-slate-300 py-0.5 truncate">
                              • {language === 'hi' ? it.nameHindi : it.name} ({it.totalUnits} {it.unitName})
                            </div>
                          ))
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Hindi Copy Callout Footer */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-300 font-['Hind']">
          {t.mapSamplePrompt}
        </span>
        <button
          onClick={() => {
            const hindiCopy = items.find((i) => i.nameHindi.includes('हिंदी कॉपी'));
            if (hindiCopy && onSelectItemForLocate) {
              onSelectItemForLocate(hindiCopy);
              const bZone = SHOP_ZONES.find((z) => z.id === 'rack-b');
              if (bZone) {
                setActiveZoneDetail(bZone);
                setExpandedRacks((prev) => ({ ...prev, 'rack-b': true }));
              }
            }
          }}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/40"
        >
          {t.mapViewBtn}
        </button>
      </div>
    </div>
  );
};
