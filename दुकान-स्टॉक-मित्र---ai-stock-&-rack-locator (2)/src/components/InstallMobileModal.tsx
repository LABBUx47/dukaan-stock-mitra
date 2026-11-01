import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface InstallMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  onInstall: () => Promise<boolean>;
}

export const InstallMobileModal: React.FC<InstallMobileModalProps> = ({
  isOpen,
  onClose,
  language,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
  onInstall,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'android' | 'ios'>('android');
  const [installError, setInstallError] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  if (!isOpen) return null;

  // Use the canonical production shared URL or current origin
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ais-pre-5pus6tr5zcaibdotowyw6h-401191956172.asia-southeast1.run.app';

  // Generate SVG QR Code URL using standard Google Chart / QR service API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=020617&color=38bdf8&margin=1`;

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(appUrl).catch(() => {
          fallbackCopy(appUrl);
        });
      } else {
        fallbackCopy(appUrl);
      }
    } catch {
      fallbackCopy(appUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.warn('Fallback copy failed', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'hi' ? 'दुकान स्टॉक मित्र' : 'Dukaan Stock Mitra',
          text:
            language === 'hi'
              ? 'दुकान का सारा स्टॉक, पेटी हिसाब व रैक लोकेशन अपने मोबाइल में चलाएं:'
              : 'Manage shop inventory, cartons and rack locations directly on your mobile:',
          url: appUrl,
        });
      } catch (e) {
        console.warn('Share cancelled', e);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    setInstallError(null);
    try {
      const success = await onInstall();
      if (success) {
        onClose();
      } else {
        setInstallError(
          language === 'hi'
            ? 'ब्राउज़र ने इंस्टॉलेशन रोक दिया ("App cannot be installed")। कृपया लिंक को सीधे Google Chrome के मुख्य टैब में खोलें या ऊपर "APK फ़ाइल" टैब से सीधा APK पैकेज लें।'
            : 'Browser blocked installation ("App cannot be installed"). Please open the link directly in Chrome browser or download the APK package from the APK tab.'
        );
        setShowTroubleshoot(true);
      }
    } catch {
      setInstallError(
        language === 'hi'
          ? 'इंस्टॉलेशन में रुकावट आई। कृपया नीचे दिए गए 3 समाधान देखें या सीधा APK डाउनलोड करें।'
          : 'Installation failed. Please see the solutions below or download the direct APK.'
      );
      setShowTroubleshoot(true);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
                {language === 'hi'
                  ? 'मोबाइल में इंस्टॉल करें (Install App)'
                  : 'Install on Your Mobile'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'बिना प्ले-स्टोर डाउनलोड के, सीधे होम स्क्रीन पर असली ऐप की तरह चलाएं'
                  : 'Run as a full native app on your phone home screen with offline support'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Direct 1-Tap Install Button if Browser triggers beforeinstallprompt */}
          {isInstallable && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="font-bold text-emerald-400 text-sm flex items-center justify-center sm:justify-start gap-1.5 font-['Hind']">
                  <Sparkles className="w-4 h-4" />
                  {language === 'hi' ? '1-क्लिक डायरेक्ट इंस्टाल उपलब्ध है!' : '1-Click Install Ready!'}
                </span>
                <p className="text-xs text-slate-300">
                  {language === 'hi'
                    ? 'नीचे दिए बटन पर टैप करके तुरंत अपने फोन में इंस्टॉल करें'
                    : 'Tap below to add the icon directly to your home screen'}
                </p>
              </div>
              <button
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 text-sm shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isInstalling
                    ? (language === 'hi' ? 'प्रोसेसिंग...' : 'Processing...')
                    : (language === 'hi' ? 'अभी इनस्टॉल करें' : 'Install Now')}
                </span>
              </button>
            </div>
          )}

          {/* Error Notice Banner if install failed or was blocked */}
          {installError && (
            <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3.5 space-y-2 text-rose-200 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white font-bold block">
                    {language === 'hi' ? 'इंस्टॉलेशन रुकावट (Installation Notice)' : 'Installation Notice'}
                  </strong>
                  <p className="text-slate-200 leading-relaxed">{installError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveTab('apk');
                    setInstallError(null);
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  📦 {language === 'hi' ? 'सीधा APK डाउनलोड करें' : 'Get Direct APK'}
                </button>
                <button
                  onClick={() => setShowTroubleshoot(true)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  {language === 'hi' ? 'समाधान देखें' : 'View Fix'}
                </button>
              </div>
            </div>
          )}

          {/* Permanent Troubleshooting Accordion */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
            <button
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200 font-['Hind']">
                  {language === 'hi'
                    ? '💡 "This app cannot be installed" क्यों आता है और कैसे ठीक करें?'
                    : '💡 Why does "This app cannot be installed" happen & how to fix it?'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {showTroubleshoot ? '▲ छिपाएं' : '▼ 3 समाधान देखें'}
              </span>
            </button>

            {showTroubleshoot && (
              <div className="space-y-2.5 pt-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-bold text-sky-400 block text-[11px]">
                    1. लिंक इन-ऐप ब्राउज़र (In-App Browser) में खुला होना:
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    यदि आपने लिंक को व्हाट्सएप, जीमेल, या किसी ऐप के अंदर खोला है, तो गूगल क्रोम WebAPK नहीं बना पाता और &quot;Cannot be installed&quot; दिखाता है।
                    <br />
                    <strong className="text-emerald-400">हल:</strong> ऊपर दाईं ओर 3 बिंदु (⋮) दबाकर <strong>&quot;Open in Chrome&quot; (क्रोम में खोलें)</strong> चुनें।
                  </p>
                </div>

                <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-bold text-sky-400 block text-[11px]">
                    2. इनकॉग्निटो / प्राइवेट मोड (Incognito Mode):
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Google Chrome इनकॉग्निटो मोड में किसी भी ऐप को इंस्टॉल करने की अनुमति नहीं देता।
                    <br />
                    <strong className="text-emerald-400">हल:</strong> सामान्य (Normal) क्रोम टैब में लिंक खोलें।
                  </p>
                </div>

                <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-bold text-amber-400 block text-[11px]">
                    3. बिना किसी झंझट के सीधा APK पैकेज डाउनलोड करें:
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    अगर आपके ब्राउज़र में कोई भी समस्या आ रही है, तो ऊपर दिए गए <strong>&quot;APK फ़ाइल&quot;</strong> टैब पर क्लिक करें और PWABuilder से तैयार `.apk` फाइल अपने फोन या लैपटॉप में सीधे डाउनलोड कर लें!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section for scanning directly with mobile phone camera */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-36 h-36 bg-slate-950 rounded-xl p-2 border-2 border-sky-500/40 shadow-inner flex items-center justify-center shrink-0">
              <img
                src={qrCodeUrl}
                alt="Scan QR code to install on mobile"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                📷 {language === 'hi' ? 'कैमरे से QR कोड स्कैन करें' : 'Scan QR with Camera'}
              </span>
              <h3 className="text-sm font-bold text-white font-['Hind']">
                {language === 'hi'
                  ? 'अपने मोबाइल कैमरे से यह QR स्कैन करें'
                  : 'Point your mobile camera at this QR Code'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'कैमरा लिंक डिटेक्ट करेगा और सीधे आपकी दुकान का स्टॉक ऐप मोबाइल में खुल जाएगा।'
                  : 'Your phone will automatically detect the link and open the store app in your mobile browser.'}
              </p>

              {/* Copy & Share Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">
                        {language === 'hi' ? 'कॉपी हो गया!' : 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNativeShare}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === 'hi' ? 'व्हाट्सएप / शेयर करें' : 'Share Link'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* OS & APK Switcher Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === 'hi' ? 'इंस्टॉलेशन या APK विधि चुनें:' : 'Select Install / APK Method:'}
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab('apk')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'apk'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📦 {language === 'hi' ? 'APK फ़ाइल (Android APK)' : 'APK Package'}
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'android'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🤖 {language === 'hi' ? 'Android (Chrome WebAPK)' : 'Android (Chrome)'}
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'ios'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🍎 iPhone (Safari)
                </button>
              </div>
            </div>

            {/* APK Guide Tab */}
            {activeTab === 'apk' && (
              <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-['Hind']">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? 'Android APK फ़ाइल प्राप्त करने के 2 सबसे आसान तरीके:'
                      : 'Two Simple Ways to Get the Android APK:'}
                  </span>
                </div>

                {/* Option A: Direct PWABuilder 1-click generator */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                        तरीका 1 (Method 1)
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {language === 'hi'
                          ? 'PWABuilder से 1-क्लिक में APK डाउनलोड करें'
                          : 'Download APK file via PWABuilder (1-Click)'}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        {language === 'hi'
                          ? 'PWABuilder (Google व Microsoft समर्थित) आपकी ऐप का सीधा .APK पैकेज बनाकर देता है जिसे आप अपने फोन या लैपटॉप में डाउनलोड कर सकते हैं।'
                          : 'PWABuilder generates a ready-to-install signed/unsigned .apk package for your live app in seconds.'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95"
                  >
                    <span>{language === 'hi' ? 'PWABuilder पर APK जनरेट करें' : 'Generate APK Package on PWABuilder'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[10px] text-slate-500 text-center">
                    {language === 'hi'
                      ? 'स्टेप: लिंक खोलें → "Package for Stores" या "Android" पर क्लिक करें → .apk डाउनलोड करें।'
                      : 'Steps: Click link → Tap "Package for Android" → Download your ready .apk file.'}
                  </p>
                </div>

                {/* Option B: Android Native WebAPK Explanation */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                    तरीका 2 (सिफारिश / Recommended)
                  </span>
                  <h4 className="text-xs font-bold text-emerald-300">
                    {language === 'hi'
                      ? 'बिना झंझट: Chrome से डायरेक्ट WebAPK ऑटो-इंस्टॉल'
                      : 'Zero-Fuss: Direct Chrome WebAPK Auto-Install'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? 'जब आप Android फोन में क्रोम पर "Install app" दबाते हैं, तो Google Play Services खुद आपके फोन में आधिकारिक APK (WebAPK) बना कर इंस्टॉल कर देता है! आपको "Unknown Sources" चालू करने या अलग से फाइल ढूंढने की जरूरत नहीं होती।'
                      : 'When you tap "Install App" on Android Chrome, Google Play Services compiles and registers a native WebAPK directly onto your device.'}
                  </p>
                </div>

                {/* USB Laptop Transfer Steps */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs text-slate-400">
                  <strong className="text-slate-200 block text-[11px]">
                    💻 {language === 'hi' ? 'लैपटॉप से फोन में APK कैसे डालें:' : 'Transferring APK from Laptop to Phone via USB:'}
                  </strong>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>{language === 'hi' ? 'PWABuilder से .apk फाइल अपने लैपटॉप में डाउनलोड करें।' : 'Download the .apk file on your laptop via PWABuilder.'}</li>
                    <li>{language === 'hi' ? 'फोन को USB केबल से लैपटॉप में जोड़ें और फोन में "File Transfer" चुनें।' : 'Connect your phone to laptop with USB cable and select "File Transfer".'}</li>
                    <li>{language === 'hi' ? '.apk फाइल को फोन के "Downloads" फोल्डर में कॉपी करें।' : 'Copy the .apk file into your phone\'s Downloads folder.'}</li>
                    <li>{language === 'hi' ? 'फोन में "Files" ऐप खोलें और APK पर टैप करके इंस्टॉल कर लें।' : 'Open the Files app on phone and tap the APK to install.'}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Android Guide */}
            {activeTab === 'android' && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong>
                      {language === 'hi'
                        ? 'मोबाइल में Chrome खोलें'
                        : 'Open in Chrome on Android'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'लिंक को क्रोम ब्राउज़र में खोलें।'
                        : 'Open the store link inside Google Chrome.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong>
                      {language === 'hi'
                        ? 'ऊपर 3 बिन्दुओं (⋮) पर टैप करें'
                        : 'Tap the 3 dots (⋮) menu icon'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'ब्राउज़र के ऊपर दाईं ओर 3 बिन्दु मेन्यू खोलें।'
                        : 'At top-right of your Chrome screen.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-emerald-400">
                      {language === 'hi'
                        ? '"Install app" या "Add to Home screen" चुनें'
                        : 'Select "Install app" or "Add to Home Screen"'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'फिर "Install" दबाएं। ऐप का आधिकारिक WebAPK आपके फोन के होम स्क्रीन पर आ जाएगा।'
                        : 'Tap Install. The official WebAPK will be created and added to your launcher.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Safari Guide */}
            {activeTab === 'ios' && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong>
                      {language === 'hi'
                        ? 'Safari ब्राउज़र में खोलें'
                        : 'Open in Safari Browser'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'iPhone पर यह लिंक केवल Safari में खुलना चाहिए।'
                        : 'Make sure the link is opened in Apple Safari.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong>
                      {language === 'hi'
                        ? 'नीचे Share बटन (⎋) दबाएं'
                        : 'Tap the Share icon (⎋)'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'सफारी के नीचे बीच में शेयर (डिब्बे से तीर) का आइकन है।'
                        : 'Located in the bottom navigation bar of Safari.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-sky-400">
                      {language === 'hi'
                        ? '"Add to Home Screen (➕)" चुनें'
                        : 'Select "Add to Home Screen (➕)"'}
                    </strong>
                    <p className="text-slate-400 mt-0.5">
                      {language === 'hi'
                        ? 'सूची में नीचे स्क्रॉल करके "Add to Home Screen" दबाएं और ऊपर "Add" करें।'
                        : 'Scroll down the share sheet, tap "Add to Home Screen" and tap "Add" in top-right.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Benefits summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-emerald-400 font-bold block mb-0.5">⚡ सुपर फास्ट</span>
              <span>सीधे फुल स्क्रीन</span>
            </div>
            <div>
              <span className="text-sky-400 font-bold block mb-0.5">📷 कैमरा रेडी</span>
              <span>फोटो से तुरंत स्टॉक</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block mb-0.5">📶 ऑफलाइन</span>
              <span>नेटवर्क धीमा हो तब भी</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            दुकान स्टॉक मित्र • PWA Progressive Web App
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
