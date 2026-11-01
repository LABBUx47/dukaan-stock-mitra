import { StockItem } from '../types/stock';
import { Language } from '../i18n/translations';

export type AlertType = 'low_stock' | 'out_of_stock' | 'stock_restocked' | 'info';

export interface StockAlert {
  id: string;
  type: AlertType;
  title: string;
  titleHindi: string;
  message: string;
  messageHindi: string;
  item: StockItem;
  currentUnits: number;
  minThreshold: number;
  timestamp: number;
  read?: boolean;
}

/**
 * Pure function: Detects if a stock update should trigger a threshold alert.
 * Triggers if:
 * 1. Stock dropped from above threshold to at-or-below threshold, OR
 * 2. Stock dropped to zero (out of stock), OR
 * 3. Force check for existing low stock items.
 */
export function evaluateStockThresholdAlert(
  prevUnits: number,
  updatedItem: StockItem,
  forceCheck = false
): StockAlert | null {
  const currentUnits = updatedItem.totalUnits;
  const minThreshold = updatedItem.minStockThreshold;

  // Case 1: Out of stock (0 units)
  if (currentUnits <= 0 && (prevUnits > 0 || forceCheck)) {
    return {
      id: `alert-oos-${updatedItem.id}-${Date.now()}`,
      type: 'out_of_stock',
      title: '🚨 Out of Stock Alert!',
      titleHindi: '🚨 स्टॉक खत्म! (Out of Stock)',
      message: `"${updatedItem.name}" has completely run out (0 ${updatedItem.unitName}). Restock immediately!`,
      messageHindi: `"${updatedItem.nameHindi}" का स्टॉक शून्य (0) हो गया है! तुरंत नई पेटी मंगाएं।`,
      item: updatedItem,
      currentUnits,
      minThreshold,
      timestamp: Date.now(),
    };
  }

  // Case 2: Dropped below or reached min threshold
  if (
    currentUnits <= minThreshold &&
    currentUnits > 0 &&
    (prevUnits > minThreshold || forceCheck)
  ) {
    return {
      id: `alert-low-${updatedItem.id}-${Date.now()}`,
      type: 'low_stock',
      title: '⚠️ Low Stock Alert!',
      titleHindi: '⚠️ कम स्टॉक चेतावनी! (Low Stock)',
      message: `"${updatedItem.name}" stock dropped to ${currentUnits} ${updatedItem.unitName} (Min Threshold: ${minThreshold}).`,
      messageHindi: `"${updatedItem.nameHindi}" का स्टॉक घटकर ${currentUnits} ${updatedItem.unitName} रह गया है (न्यूनतम सीमा: ${minThreshold})।`,
      item: updatedItem,
      currentUnits,
      minThreshold,
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Synthesizes a retail notification alert chime using Web Audio API.
 * Does not require external MP3 files. Works offline.
 */
export function playAlertChime(type: 'warning' | 'urgent' | 'success' = 'warning') {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'urgent') {
      // 3 rapid descending-pitch beeps
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880 - idx * 120, now + delay);
        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });
    } else if (type === 'success') {
      // Pleasant upward two-tone chime
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.22);
      });
    } else {
      // Warning double chime
      [659.25, 587.33].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.16, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    }
  } catch (e) {
    // Browsers block audio until user interaction; silent ignore
    console.warn('Audio chime playback omitted or blocked', e);
  }
}

/**
 * Checks browser Notification API permission state safely.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests native system push notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission', e);
    return 'denied';
  }
}

/**
 * Sends a native browser / device push notification if allowed.
 */
export function sendBrowserPushNotification(
  alert: StockAlert,
  language: Language
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = language === 'hi' ? alert.titleHindi : alert.title;
    const body = language === 'hi' ? alert.messageHindi : alert.message;
    const rackInfo =
      language === 'hi'
        ? `📍 दुकान स्थान: ${alert.item.location.zoneName} - ${alert.item.location.shelf}`
        : `📍 Location: ${alert.item.location.zoneName} - ${alert.item.location.shelf}`;

    const options: NotificationOptions & { renotify?: boolean } = {
      body: `${body}\n${rackInfo}`,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: `stock-${alert.item.id}`,
      renotify: true,
      silent: false,
    };

    const n = new Notification(title, options);

    n.onclick = () => {
      window.focus();
      n.close();
    };

    return true;
  } catch (e) {
    console.warn('Push notification delivery skipped:', e);
    return false;
  }
}
