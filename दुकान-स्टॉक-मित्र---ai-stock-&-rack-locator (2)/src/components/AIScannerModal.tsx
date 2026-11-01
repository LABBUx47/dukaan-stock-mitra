import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  Tag,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { SHOP_ZONES, STOCK_CATEGORIES, calculateTotalUnits, generateSku } from '../utils/stockLogic';
import { ShopZoneId, StockItem } from '../types/stock';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface AIScannerModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onAddStockItem: (item: StockItem) => void;
}

// Demo image presets for quick testing
const DEMO_PRESETS = [
  {
    id: 'hindi-copies',
    titleHi: 'हिंदी कॉपियां (Hindi Copies)',
    titleEn: 'Hindi Notebooks (1 Dozen Pack)',
    labelHi: '1 पेटी (12 प्रतियां / कॉपी)',
    labelEn: '1 Carton (12 Copies)',
    categoryHint: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
    hint: 'क्लासमेट हिंदी कॉपी 172 पेज, 1 दर्जन (12 पीस) पेटी पैक, रैक B',
    color: 'from-amber-600 to-orange-700',
    icon: '📚',
  },
  {
    id: 'pencils-carton',
    titleHi: 'अप्सरा पेंसिल पेटी (Pencils)',
    titleEn: 'Apsara Pencils Carton (200 Pcs)',
    labelHi: '1 पेटी (200 पेंसिल कार्टन)',
    labelEn: '1 Carton (200 Pencils)',
    categoryHint: 'पेंसिल (Pencils)',
    hint: 'अप्सरा प्लैटिनम पेंसिल थोक पेटी, 20 पैकेट = 200 पेंसिल, रैक A',
    color: 'from-emerald-600 to-teal-700',
    icon: '✏️',
  },
  {
    id: 'pens-box',
    titleHi: 'नटराज पेन बॉक्स (Pens)',
    titleEn: 'Nataraj Ball Pens (50 Pcs Box)',
    labelHi: '1 डिब्बा (50 पीस बॉल पेन)',
    labelEn: '1 Box (50 Pcs Pens)',
    categoryHint: 'पेन (Pens)',
    hint: 'नटराज सुपरएक्स पेन 50 पीस डिब्बा, काउंटर शेल्फ 1',
    color: 'from-blue-600 to-indigo-700',
    icon: '🖊️',
  },
  {
    id: 'colors-craft',
    titleHi: 'डोम्स कलर्स / क्राफ्ट (Colors)',
    titleEn: 'DOMS Art & Colors (12 Sets Box)',
    labelHi: '12 सेट वॉटर कलर बॉक्स',
    labelEn: '12 Sets Color Box',
    categoryHint: 'आर्ट व कलर्स (Art & Stationery)',
    hint: 'डोम्स वॉटर कलर 24 शेड्स सेट, रैक C शेल्फ 2',
    color: 'from-pink-600 to-rose-700',
    icon: '🎨',
  },
];

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  language,
  onClose,
  onAddStockItem,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userHint, setUserHint] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Review step state after AI analyzes image
  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [detectedData, setDetectedData] = useState<{
    itemName: string;
    itemNameHindi: string;
    category: string;
    brand: string;
    isPetiOrCarton: boolean;
    petiCount: number;
    unitsPerPeti: number;
    looseUnits: number;
    unitType: string;
    locationZoneId: ShopZoneId;
    locationShelf: string;
    locationDetails: string;
    estimatedCostPrice: number;
    mrp: number;
    barcodeOrBatch: string;
    description: string;
    confidence: number;
  }>({
    itemName: '',
    itemNameHindi: '',
    category: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
    brand: '',
    isPetiOrCarton: true,
    petiCount: 1,
    unitsPerPeti: 12,
    looseUnits: 0,
    unitType: 'कॉपी (Copies)',
    locationZoneId: 'rack-b',
    locationShelf: 'शेल्फ 3 (तीसरा खाना)',
    locationDetails: 'रैक B के तीसरे खाने में',
    estimatedCostPrice: 32,
    mrp: 45,
    barcodeOrBatch: '',
    description: '',
    confidence: 0.95,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedImage(null);
      setStep('capture');
      setAnalysisError(null);
      setCameraError(null);
    }
  }, [isOpen]);

  // Resizes & compresses huge 12MB+ phone camera images to ~250KB for fast, reliable AI scanning
  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processAndSetImage = async (file: File) => {
    setIsCompressing(true);
    setAnalysisError(null);
    try {
      const compressedDataUrl = await compressAndResizeImage(file);
      setSelectedImage(compressedDataUrl);
      stopCamera();
      setCameraError(null);
    } catch (err) {
      console.warn('Compression fallback to raw reader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
    // reset input value so user can take another photo if needed
    e.target.value = '';
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
    e.target.value = '';
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      let stream: MediaStream | null = null;
      try {
        // Try back-facing environment camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // Fallback to basic video stream without strict constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream permission error:', err);
      setCameraError(
        language === 'hi'
          ? 'ब्राउज़र में लाइव कैमरा परमिशन बंद है। कृपया नीचे दिए "📸 मोबाइल कैमरा से फोटो लें" बटन पर टैप करें (यह बिना ब्राउज़र परमिशन के सीधे फोन कैमरा खोलता है)।'
          : 'Browser camera stream permission not allowed. Please tap "📸 Take Photo with Phone Camera" below (it directly opens your native camera without browser blocks).'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUri);
      stopCamera();
    }
  };

  const selectDemoPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setUserHint(preset.hint);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 560, 360);

      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${preset.icon} ${language === 'hi' ? preset.titleHi : preset.titleEn}`,
        300,
        150
      );

      ctx.font = '22px Arial';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(
        language === 'hi' ? preset.labelHi : preset.labelEn,
        300,
        210
      );

      ctx.font = '16px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Ready for AI Scanner • AI डिटेक्शन रेडी', 300, 280);

      setSelectedImage(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/scan-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          userHint: userHint,
        }),
      });

      const result = await response.json();
      if (!result.success && !result.data) {
        throw new Error(result.error || 'स्कैन में त्रुटि हुई');
      }

      const d = result.data;

      let validZoneId: ShopZoneId = 'rack-b';
      if (
        [
          'rack-a',
          'rack-b',
          'rack-c',
          'rack-d',
          'counter',
          'godown',
          'showcase',
        ].includes(d.locationZoneId)
      ) {
        validZoneId = d.locationZoneId as ShopZoneId;
      } else if (d.category?.includes('पेंसिल') || d.category?.includes('पेन')) {
        validZoneId = 'rack-a';
      } else if (d.category?.includes('कॉपी') || d.category?.includes('रजिस्टर')) {
        validZoneId = 'rack-b';
      } else if (d.category?.includes('आर्ट') || d.category?.includes('कलर')) {
        validZoneId = 'rack-c';
      } else if (d.category?.includes('दफ्तर') || d.category?.includes('ऑफिस')) {
        validZoneId = 'rack-d';
      }

      setDetectedData({
        itemName: d.itemName || 'New Stationery Item',
        itemNameHindi: d.itemNameHindi || d.itemName || 'स्टॉक आइटम',
        category: d.category || 'कॉपियां व रजिस्टर (Notebooks & Registers)',
        brand: d.brand || 'Local/Standard',
        isPetiOrCarton: d.isPetiOrCarton !== false,
        petiCount: Number(d.petiCount) || 1,
        unitsPerPeti: Number(d.unitsPerPeti) || 12,
        looseUnits: Number(d.looseUnits) || 0,
        unitType: d.unitType || 'पीस (Pieces)',
        locationZoneId: validZoneId,
        locationShelf: d.locationShelf || 'शेल्फ 2 (मध्य खाना)',
        locationDetails:
          d.locationDetails ||
          `${validZoneId.toUpperCase()} के शेल्फ में सुरक्षित रखा गया`,
        estimatedCostPrice: Number(d.estimatedCostPrice) || 20,
        mrp: Number(d.mrp) || 30,
        barcodeOrBatch: d.barcodeOrBatch || '',
        description: d.description || '',
        confidence: Number(d.confidence) || 0.95,
      });

      setStep('review');
    } catch (err: any) {
      console.error('Scan error:', err);
      setAnalysisError(
        err.message || 'फोटो विश्लेषण में समस्या आई। कृपया पुनः प्रयास करें।'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAdd = () => {
    const total = calculateTotalUnits(
      detectedData.isPetiOrCarton ? detectedData.petiCount : 0,
      detectedData.unitsPerPeti,
      detectedData.looseUnits
    );

    const targetZone =
      SHOP_ZONES.find((z) => z.id === detectedData.locationZoneId) ||
      SHOP_ZONES[1];

    const newItem: StockItem = {
      id: 'item-' + Date.now(),
      name: detectedData.itemName,
      nameHindi: detectedData.itemNameHindi || detectedData.itemName,
      category: detectedData.category,
      brand: detectedData.brand,
      sku: generateSku(detectedData.category, detectedData.itemName),
      barcode: detectedData.barcodeOrBatch,
      isPeti: detectedData.isPetiOrCarton,
      petiCount: detectedData.isPetiOrCarton ? detectedData.petiCount : 0,
      unitsPerPeti: detectedData.unitsPerPeti,
      looseUnits: detectedData.looseUnits,
      totalUnits: total,
      unitName: detectedData.unitType,
      costPrice: detectedData.estimatedCostPrice,
      sellingPrice: detectedData.mrp,
      location: {
        zoneId: detectedData.locationZoneId,
        zoneName: targetZone.name,
        shelf: detectedData.locationShelf,
        details: detectedData.locationDetails,
      },
      minStockThreshold: Math.max(5, Math.floor(total * 0.2)),
      notes: detectedData.description,
      imageUrl: selectedImage || undefined,
      lastUpdated: new Date().toISOString(),
      history: [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          type: 'manual_add',
          quantityChange: total,
          note: `AI Photo Scan: ${
            detectedData.isPetiOrCarton
              ? `${detectedData.petiCount} Cartons (${total} ${detectedData.unitType})`
              : `${total} ${detectedData.unitType}`
          } • Location: ${targetZone.name}`,
        },
      ],
    };

    onAddStockItem(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Hind'] flex items-center gap-2">
                {t.scannerTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.scannerSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.scannerCancel}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {step === 'capture' ? (
            <>
              {/* Camera / Upload Viewport */}
              <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden group">
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-emerald-400/50 pointer-events-none rounded-xl m-4 animate-pulse flex items-center justify-center">
                      <span className="bg-slate-900/80 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/40">
                        {language === 'hi'
                          ? 'सामान या पेटी को बीच में रखें'
                          : 'Position item or carton in the center'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={capturePhoto}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{t.scannerTakePic}</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700"
                      >
                        {t.scannerCancel}
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <img
                      src={selectedImage}
                      alt="चयनित फोटो"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition-colors border border-slate-700"
                        title={language === 'hi' ? 'हटाएं' : 'Remove'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 font-['Hind']">
                        {language === 'hi'
                          ? 'दुकान के सामान, पेटी या बिल की फोटो खींचें'
                          : 'Snap photo of product, bulk carton, or bill'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'hi'
                          ? 'AI अपने आप नाम, पेटी मात्रा, कैटेगरी व दुकान की रैक पहचान लेगा'
                          : 'AI auto-detects name, carton units, category and rack placement'}
                      </p>
                    </div>

                    {/* Hidden Native File Inputs */}
                    <input
                      ref={nativeCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleNativeCameraCapture}
                      className="hidden"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      {/* 1. Direct Native Phone Camera (100% reliable on phones, bypasses permission blocks) */}
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{language === 'hi' ? '📸 फोन कैमरे से फोटो लें' : '📸 Take Photo (Native Camera)'}</span>
                      </button>

                      {/* 2. Live Viewfinder Stream */}
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition-colors"
                      >
                        <Video className="w-4 h-4 text-sky-400" />
                        <span>{language === 'hi' ? '🎥 लाइव व्यूफाइंडर' : '🎥 Live Stream'}</span>
                      </button>

                      {/* 3. Gallery / File Upload */}
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>{language === 'hi' ? '📁 गैलरी / बिल' : '📁 Gallery / File'}</span>
                      </button>
                    </div>

                    {/* Compression indicator */}
                    {isCompressing && (
                      <p className="text-xs text-sky-400 flex items-center justify-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'hi' ? 'फोटो ऑप्टिमाइज़ हो रही है...' : 'Optimizing photo for AI scan...'}</span>
                      </p>
                    )}

                    {/* Camera Permission Alert & Fix Guide */}
                    {cameraError && (
                      <div className="text-left bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{language === 'hi' ? 'लाइव कैमरा परमिशन सूचना' : 'Camera Permission Notice'}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {cameraError}
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => nativeCameraInputRef.current?.click()}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                          >
                            📸 {language === 'hi' ? 'फोन कैमरे से फोटो खींचें' : 'Use Phone Camera Directly'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instant 1-Click Demo Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t.scannerDemoLabel}
                  </span>
                  <span className="text-[11px] text-emerald-400">{t.scannerDemoReady}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => selectDemoPreset(preset)}
                      className="p-2.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
                    >
                      <div className="text-xl mb-1">{preset.icon}</div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                        {language === 'hi' ? preset.titleHi : preset.titleEn}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {language === 'hi' ? preset.labelHi : preset.labelEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Shopkeeper Voice/Text Hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{t.scannerHintLabel}</span>
                  <span className="text-[11px] text-slate-400">
                    {t.scannerHintPlaceholder}
                  </span>
                </label>
                <input
                  type="text"
                  value={userHint}
                  onChange={(e) => setUserHint(e.target.value)}
                  placeholder={t.scannerHintPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>

              {analysisError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
                >
                  {t.scannerCancel}
                </button>
                <button
                  type="button"
                  disabled={!selectedImage || isAnalyzing}
                  onClick={handleAnalyzeWithAI}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all ${
                    !selectedImage || isAnalyzing
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.scannerScanningBtn}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.scannerDetectBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Review & Confirmation Step */
            <div className="space-y-5">
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300">
                    {t.scannerSuccessAlert}
                  </span>
                  <p className="text-slate-300 mt-0.5">
                    {t.scannerSuccessSub}
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Hindi Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.scannerItemNameHi}
                  </label>
                  <input
                    type="text"
                    value={detectedData.itemNameHindi}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        itemNameHindi: e.target.value,
                        itemName: detectedData.itemName || e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.scannerCategory}</span>
                  </label>
                  <select
                    value={detectedData.category}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        category: e.target.value,
                      })
                    }
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
                    {t.scannerBrand}
                  </label>
                  <input
                    type="text"
                    value={detectedData.brand}
                    onChange={(e) =>
                      setDetectedData({ ...detectedData, brand: e.target.value })
                    }
                    placeholder="e.g. Classmate, Apsara, Navneet"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Peti / Carton Section Highlight */}
                <div className="sm:col-span-2 bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detectedData.isPetiOrCarton}
                        onChange={(e) =>
                          setDetectedData({
                            ...detectedData,
                            isPetiOrCarton: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        {t.scannerIsPeti}
                      </span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {calculateTotalUnits(
                        detectedData.isPetiOrCarton ? detectedData.petiCount : 0,
                        detectedData.unitsPerPeti,
                        detectedData.looseUnits
                      )}{' '}
                      {detectedData.unitType}
                    </span>
                  </div>

                  {detectedData.isPetiOrCarton ? (
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          {t.scannerPetiCount}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={detectedData.petiCount}
                          onChange={(e) =>
                            setDetectedData({
                              ...detectedData,
                              petiCount: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          {t.scannerUnitsPerPeti}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={detectedData.unitsPerPeti}
                          onChange={(e) =>
                            setDetectedData({
                              ...detectedData,
                              unitsPerPeti: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          {t.scannerExtraLoose}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={detectedData.looseUnits}
                          onChange={(e) =>
                            setDetectedData({
                              ...detectedData,
                              looseUnits: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        {t.scannerDirectQty}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={detectedData.looseUnits || detectedData.unitsPerPeti}
                        onChange={(e) =>
                          setDetectedData({
                            ...detectedData,
                            looseUnits: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Packaging Formula Explanation */}
                  <div className="text-[11px] text-amber-200/80 bg-amber-950/40 p-2 rounded-lg border border-amber-900/40">
                    💡 {t.scannerFormulaMath} {detectedData.isPetiOrCarton ? (
                      <>
                        <strong>{detectedData.petiCount} {language === 'hi' ? 'पेटी' : 'Carton'}</strong> x {detectedData.unitsPerPeti} + {detectedData.looseUnits} {t.loosePieces} ={' '}
                        <strong>
                          {calculateTotalUnits(
                            detectedData.petiCount,
                            detectedData.unitsPerPeti,
                            detectedData.looseUnits
                          )}{' '}
                          {detectedData.unitType}
                        </strong>
                      </>
                    ) : (
                      <>{detectedData.looseUnits} {detectedData.unitType}</>
                    )}
                  </div>
                </div>

                {/* Shop Location (रैक व शेल्फ) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t.scannerShopZone}</span>
                  </label>
                  <select
                    value={detectedData.locationZoneId}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        locationZoneId: e.target.value as ShopZoneId,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {SHOP_ZONES.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {language === 'hi' ? zone.name : zone.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shelf Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.scannerShelf}
                  </label>
                  <input
                    type="text"
                    value={detectedData.locationShelf}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        locationShelf: e.target.value,
                      })
                    }
                    placeholder="e.g. Shelf 3 (Third Row)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Exact Location Directions */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.scannerDirections}
                  </label>
                  <input
                    type="text"
                    value={detectedData.locationDetails}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        locationDetails: e.target.value,
                      })
                    }
                    placeholder="e.g. In front of counter, Rack B, 3rd shelf bundle"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Cost and MRP */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.scannerCostPrice}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={detectedData.estimatedCostPrice}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        estimatedCostPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.scannerMrp}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={detectedData.mrp}
                    onChange={(e) =>
                      setDetectedData({
                        ...detectedData,
                        mrp: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Review Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('capture')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.scannerBackToPhoto}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    {t.scannerCancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAdd}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.scannerConfirmAdd}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
