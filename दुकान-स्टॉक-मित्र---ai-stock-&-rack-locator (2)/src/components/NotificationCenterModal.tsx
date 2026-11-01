import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  AlertOctagon,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Package,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { StockItem } from '../types/stock';
import { Language } from '../i18n/translations';
import {
  getNotificationPermission,
  requestNotificationPermission,
  playAlertChime,
} from '../utils/alertNotification';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  language: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestockItem: (item: StockItem) => void;
  onLocateItem: (item: StockItem) => void;
  onTriggerTestAlert: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  items,
  language,
  soundEnabled,
  onToggleSound,
  onRestockItem,
  onLocateItem,
  onTriggerTestAlert,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  // Filter items that are at or below minimum threshold
  const lowStockItems = items.filter(
    (it) => it.totalUnits <= it.minStockThreshold
  );

  const outOfStockItems = lowStockItems.filter((it) => it.totalUnits <= 0);
  const warningItems = lowStockItems.filter((it) => it.totalUnits > 0);

  const handleEnablePush = async () => {
    setIsRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsRequesting(false);

    if (result === 'granted') {
      playAlertChime('success');
      onTriggerTestAlert();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              <Bell className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Hind']">
                {language === 'hi'
                  ? 'कम स्टॉक अलर्ट व पुश नोटिफिकेशन'
                  : 'Low Stock Alerts & Push Notifications'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'न्यूनतम सीमा से कम स्टॉक की त्वरित सूचना'
                  : 'Automatic alerts when items drop below threshold'}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Notification & Sound Settings Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'hi'
                  ? 'अलर्ट सेटिंग्स (Alert Controls)'
                  : 'Alert Controls'}
              </span>
            </h4>

            {/* Push Notification Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white font-['Hind']">
                    {language === 'hi'
                      ? 'मोबाइल / ब्राउज़र पुश नोटिफिकेशन'
                      : 'Browser Push Notifications'}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {permission === 'granted'
                      ? language === 'hi'
                        ? '✅ चालू है - बैकग्राउंड में भी अलर्ट आएगा'
                        : '✅ Active - Alerts show on phone screen'
                      : permission === 'denied'
                      ? language === 'hi'
                        ? '❌ अनुमति अस्वीकृत (ब्राउज़र सेटिंग्स में चालू करें)'
                        : '❌ Denied in browser settings'
                      : language === 'hi'
                      ? 'स्क्रीन बंद होने पर भी अलर्ट प्राप्त करें'
                      : 'Get alerts even when app is closed'}
                  </p>
                </div>
              </div>

              {permission === 'granted' ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                </span>
              ) : (
                <button
                  onClick={handleEnablePush}
                  disabled={isRequesting || permission === 'unsupported'}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shrink-0 transition-all shadow-md shadow-sky-500/20"
                >
                  {language === 'hi' ? 'चालू करें' : 'Enable'}
                </button>
              )}
            </div>

            {/* Sound Chime Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl gap-3">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white font-['Hind']">
                    {language === 'hi'
                      ? 'कम स्टॉक बीप अलर्ट ध्वनि'
                      : 'Retail Audio Alert Chime'}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {soundEnabled
                      ? language === 'hi'
                        ? 'दुकानदार के लिए स्पष्ट दोहरी बीप ध्वनि'
                        : 'Plays audio tone when stock drops below threshold'
                      : language === 'hi'
                      ? 'ध्वनि बंद है (Muted)'
                      : 'Alert sound muted'}
                  </p>
                </div>
              </div>

              <button
                onClick={onToggleSound}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                  soundEnabled
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled
                  ? language === 'hi'
                    ? 'ध्वनि चालू'
                    : 'Sound ON'
                  : language === 'hi'
                  ? 'ध्वनि बंद'
                  : 'Sound OFF'}
              </button>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => {
                onTriggerTestAlert();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'hi'
                  ? '🔔 टेस्ट अलर्ट चलाकर देखें (Test Toast & Sound)'
                  : '🔔 Test Alert Toast & Sound'}
              </span>
            </button>
          </div>

          {/* Current Threshold Breaches List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'hi'
                    ? `सीमा पार सामान (${lowStockItems.length})`
                    : `Threshold Breached Items (${lowStockItems.length})`}
                </span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {outOfStockItems.length > 0 && (
                  <span className="text-rose-400 font-bold mr-2">
                    {outOfStockItems.length}{' '}
                    {language === 'hi' ? 'खत्म' : 'OOS'}
                  </span>
                )}
                <span className="text-amber-400 font-semibold">
                  {warningItems.length}{' '}
                  {language === 'hi' ? 'कम' : 'Low'}
                </span>
              </span>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-white text-sm font-['Hind']">
                  {language === 'hi'
                    ? 'सभी सामान का स्टॉक सुरक्षित है!'
                    : 'All stock levels are safe!'}
                </h5>
                <p className="text-xs text-slate-400">
                  {language === 'hi'
                    ? 'कोई भी सामान अपनी न्यूनतम सीमा से नीचे नहीं है।'
                    : 'No items currently below minimum threshold.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map((item) => {
                  const isOOS = item.totalUnits <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isOOS
                          ? 'bg-rose-950/40 border-rose-800/60'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isOOS
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {isOOS ? (
                            <AlertOctagon className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-white font-['Hind']">
                            {language === 'hi' ? item.nameHindi : item.name}
                          </h5>
                          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                            <span
                              className={`font-extrabold ${
                                isOOS ? 'text-rose-400' : 'text-amber-300'
                              }`}
                            >
                              {item.totalUnits} {item.unitName}
                            </span>
                            <span className="text-slate-400">
                              (
                              {language === 'hi'
                                ? `न्यूनतम सीमा: ${item.minStockThreshold}`
                                : `Min: ${item.minStockThreshold}`}
                              )
                            </span>
                            <span className="text-sky-300 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-sky-400" />
                              <span>{item.location.zoneName}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onLocateItem(item);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-sky-400" />
                          <span>
                            {language === 'hi' ? 'रैक देखें' : 'Locate'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onRestockItem(item);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isOOS
                              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          <span>
                            {language === 'hi' ? '+ पेटी जोड़ें' : '+ Restock'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
