import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Package,
  MapPin,
  X,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { StockAlert } from '../utils/alertNotification';
import { StockItem } from '../types/stock';
import { Language } from '../i18n/translations';

interface AlertToastContainerProps {
  alerts: StockAlert[];
  onDismiss: (alertId: string) => void;
  onLocateItem: (item: StockItem) => void;
  onRestockItem: (item: StockItem) => void;
  language: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AlertToastContainer: React.FC<AlertToastContainerProps> = ({
  alerts,
  onDismiss,
  onLocateItem,
  onRestockItem,
  language,
  soundEnabled,
  onToggleSound,
}) => {
  if (alerts.length === 0) return null;

  return (
    <aside
      aria-label="Stock Alert Notifications"
      className="fixed top-20 right-3 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-24px)] pointer-events-none"
    >
      {alerts.map((alert) => (
        <AlertToastItem
          key={alert.id}
          alert={alert}
          onDismiss={() => onDismiss(alert.id)}
          onLocate={() => onLocateItem(alert.item)}
          onRestock={() => onRestockItem(alert.item)}
          language={language}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      ))}
    </aside>
  );
};

interface AlertToastItemProps {
  alert: StockAlert;
  onDismiss: () => void;
  onLocate: () => void;
  onRestock: () => void;
  language: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const AlertToastItem: React.FC<AlertToastItemProps> = ({
  alert,
  onDismiss,
  onLocate,
  onRestock,
  language,
  soundEnabled,
  onToggleSound,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const DURATION_MS = 9000;

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const decrement = (interval / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, onDismiss]);

  const isOOS = alert.type === 'out_of_stock';
  const itemName = language === 'hi' ? alert.item.nameHindi : alert.item.name;
  const title = language === 'hi' ? alert.titleHindi : alert.title;
  const message = language === 'hi' ? alert.messageHindi : alert.message;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden transition-all transform animate-slideLeft ${
        isOOS
          ? 'bg-gradient-to-br from-rose-950/95 via-slate-900/95 to-red-950/95 border-rose-500/80 text-rose-100 shadow-rose-950/50'
          : 'bg-gradient-to-br from-amber-950/95 via-slate-900/95 to-orange-950/95 border-amber-500/80 text-amber-100 shadow-amber-950/50'
      }`}
    >
      {/* Toast Header */}
      <div className="p-3 sm:p-4 pb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isOOS
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500 text-slate-950 animate-bounce'
            }`}
          >
            {isOOS ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm tracking-tight font-['Hind']">
                {title}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isOOS
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isOOS
                  ? language === 'hi'
                    ? 'खत्म'
                    : 'OOS'
                  : language === 'hi'
                  ? 'सीमा पार'
                  : 'LOW'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {new Date(alert.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Top Controls: Sound Toggle + Dismiss */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute alert sound' : 'Unmute alert sound'}
            title={
              soundEnabled
                ? language === 'hi'
                  ? 'अलर्ट ध्वनि बंद करें'
                  : 'Mute chime'
                : language === 'hi'
                ? 'अलर्ट ध्वनि चालू करें'
                : 'Unmute chime'
            }
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item Details Body */}
      <div className="px-3 sm:px-4 py-1 space-y-2">
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <h4 className="font-bold text-white text-xs sm:text-sm font-['Hind'] line-clamp-1">
            {itemName}
          </h4>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400">
              {language === 'hi' ? 'उपलब्ध स्टॉक:' : 'Stock left:'}
            </span>
            <span
              className={`font-black ${
                isOOS ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {alert.currentUnits} {alert.item.unitName}
              <span className="text-slate-400 font-normal ml-1">
                ({language === 'hi' ? 'सीमा' : 'Min'}: {alert.minThreshold})
              </span>
            </span>
          </div>

          {/* Location Badge */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-300 font-medium bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 shrink-0 text-sky-400" />
            <span className="truncate">
              {alert.item.location.zoneName} • {alert.item.location.shelf}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="p-3 sm:p-4 pt-2 flex items-center gap-2">
        <button
          onClick={() => {
            onRestock();
            onDismiss();
          }}
          className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md transform active:scale-95 ${
            isOOS
              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 font-black'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>
            {language === 'hi' ? '+ पेटी माल जोड़ें' : '+ Restock Peti'}
          </span>
        </button>

        <button
          onClick={() => {
            onLocate();
            onDismiss();
          }}
          className="py-1.5 sm:py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition-all"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span>{language === 'hi' ? 'दुकान में देखें' : 'Locate'}</span>
        </button>
      </div>

      {/* Auto-Dismiss Countdown Progress Bar */}
      <div className="h-1 w-full bg-slate-950/60">
        <div
          className={`h-full transition-all duration-75 ${
            isOOS ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
