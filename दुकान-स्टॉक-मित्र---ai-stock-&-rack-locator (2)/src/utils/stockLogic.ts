import { ShopZone, ShopZoneId, StockFilterOptions, StockItem, StockStatus } from '../types/stock';

export const STOCK_CATEGORIES = [
  'सभी (All)',
  'कॉपियां व रजिस्टर (Notebooks & Registers)',
  'पेंसिल (Pencils)',
  'पेन (Pens)',
  'आर्ट व कलर्स (Art & Stationery)',
  'दफ्तर का सामान (Office Supplies)',
  'किराना / जनरल स्टोर (General Store)',
  'अन्य (Other)',
] as const;

export const SHOP_ZONES: ShopZone[] = [
  {
    id: 'rack-a',
    name: 'रैक A (पेंसिल व पेन)',
    nameEnglish: 'Rack A (Pencils & Pens)',
    iconName: 'Pencil',
    color: 'emerald',
    totalShelves: 4,
    shelfNames: [
      'शेल्फ 1 (टॉप - इरेज़र व शार्पनर)',
      'शेल्फ 2 (मध्य - पेंसिल डिस्प्ले बॉक्स)',
      'शेल्फ 3 (मध्य - बॉल व जेल पेन)',
      'शेल्फ 4 (निचला - पेन पैकेट्स व रिफिल)',
    ],
    defaultCategories: ['पेंसिल (Pencils)', 'पेन (Pens)'],
    description: 'दुकान के सामने, काउंटर के ठीक पास वाला स्टील रैक। पेंसिल्स, इरेज़र, शार्पनर और बॉलबॉक्स।',
    mapCoords: { x: 6, y: 10, w: 27, h: 25 },
  },
  {
    id: 'rack-b',
    name: 'रैक B (कॉपियां व रजिस्टर)',
    nameEnglish: 'Rack B (Notebooks & Registers)',
    iconName: 'BookOpen',
    color: 'amber',
    totalShelves: 4,
    shelfNames: [
      'शेल्फ 1 (टॉप - 2 व 4 लाइन हिंदी/इंग्लिश कॉपी)',
      'शेल्फ 2 (मध्य - वन साइड रूल व मैथ्स कॉपी)',
      'शेल्फ 3 (मध्य - क्लासमेट व सादी कॉपियां)',
      'शेल्फ 4 (निचला - भारी रजिस्टर व अकाउंट बही)',
    ],
    defaultCategories: ['कॉपियां व रजिस्टर (Notebooks & Registers)'],
    description: 'बाएं हाथ की दीवार पर बड़ा रैक। हिंदी, इंग्लिश, मैथ्स कॉपी, लॉन्ग रजिस्टर और प्रैक्टिकल बुक।',
    mapCoords: { x: 36.5, y: 10, w: 27, h: 25 },
  },
  {
    id: 'rack-c',
    name: 'रैक C (ड्राइंग व आर्ट)',
    nameEnglish: 'Rack C (Art & Craft)',
    iconName: 'Palette',
    color: 'rose',
    totalShelves: 4,
    shelfNames: [
      'शेल्फ 1 (टॉप - वॉटर कलर, ब्रुश व पैलेट)',
      'शेल्फ 2 (मध्य - ऑयल पेस्टल व वैक्स क्रेयॉन)',
      'शेल्फ 3 (मध्य - फेविकोल, गोंद व क्राफ्ट टेप)',
      'शेल्फ 4 (निचला - ड्राइंग बुक, चार्ट व शीट्स)',
    ],
    defaultCategories: ['आर्ट व कलर्स (Art & Stationery)'],
    description: 'रैक B के बगल में। वॉटर कलर, स्केच पेन, ड्राइंग शीट, फेविकोल, क्ले और चार्ट पेपर।',
    mapCoords: { x: 67, y: 10, w: 27, h: 25 },
  },
  {
    id: 'rack-d',
    name: 'रैक D (ऑफिस स्टेशनरी)',
    nameEnglish: 'Rack D (Office Supplies)',
    iconName: 'Briefcase',
    color: 'sky',
    totalShelves: 3,
    shelfNames: [
      'शेल्फ 1 (टॉप - स्टेपलर, पंच व पिन)',
      'शेल्फ 2 (मध्य - कोबरा फाइल्स व फोल्डर)',
      'शेल्फ 3 (निचला - ब्राउन पैकिंग टेप व डिस्पेंसर)',
    ],
    defaultCategories: ['दफ्तर का सामान (Office Supplies)'],
    description: 'फाइल्स, फोल्डर, स्टेपलर, पंचिंग मशीन, ब्राउन टेप और कैलकुलेटर।',
    mapCoords: { x: 67, y: 41, w: 27, h: 25 },
  },
  {
    id: 'counter',
    name: 'काउंटर व बिलिंग डेस्क',
    nameEnglish: 'Counter & Billing Desk',
    iconName: 'Store',
    color: 'indigo',
    totalShelves: 2,
    shelfNames: [
      'शेल्फ 1 (काउंटर टॉप - रनिंग ₹5/10 पेन स्टैंड)',
      'शेल्फ 2 (काउंटर दराज - बिल बुक, स्टैम्प व कैश)',
    ],
    defaultCategories: ['पेन (Pens)', 'अन्य (Other)'],
    description: 'दुकानदार का बैठने का स्थान। तुरंत बिकने वाले ₹5/₹10 वाले पेन, टॉफी व बिल बुक।',
    mapCoords: { x: 6, y: 41, w: 27, h: 25 },
  },
  {
    id: 'godown',
    name: 'गोदाम / बैकस्टोर (थोक पेटी)',
    nameEnglish: 'Godown / Storage (Bulk Petis)',
    iconName: 'Package',
    color: 'orange',
    totalShelves: 5,
    shelfNames: [
      'शेल्फ 1 (ऊपरी रैक - हल्की खाली पेटियां)',
      'शेल्फ 2 (मध्य 1 - कॉपियों की सीलबंद पेटियां)',
      'शेल्फ 3 (मध्य 2 - पेंसिल्स व कलर्स के कार्टन)',
      'शेल्फ 4 (निचला 1 - ए4 पेपर रिम व भारी बंडल)',
      'शेल्फ 5 (फ्लोर - नया आया थोक माल)',
    ],
    defaultCategories: ['कॉपियां व रजिस्टर (Notebooks & Registers)', 'पेंसिल (Pencils)'],
    description: 'पीछे का कमरा जहां नई आई सीलबंद पेटियां (Cartons) और कॉपियों के बंडल रखे जाते हैं।',
    mapCoords: { x: 36.5, y: 41, w: 27, h: 25 },
  },
  {
    id: 'showcase',
    name: 'ग्लास शोकेस (प्रीमियम)',
    nameEnglish: 'Glass Showcase',
    iconName: 'Sparkles',
    color: 'purple',
    totalShelves: 3,
    shelfNames: [
      'शेल्फ 1 (टॉप - पार्कर व लग्जरी पेन सेट)',
      'शेल्फ 2 (मध्य - ज्योमेट्री बॉक्स व कैलकुलेटर)',
      'शेल्फ 3 (निचला - स्टेशनरी गिफ्ट पैक)',
    ],
    defaultCategories: ['पेन (Pens)', 'आर्ट व कलर्स (Art & Stationery)'],
    description: 'काउंटर के ठीक सामने शीशे की अलमारी। पार्कर पेन, ज्योमेट्री बॉक्स और गिफ्ट सेट।',
    mapCoords: { x: 6, y: 72, w: 27, h: 20 },
  },
];

/**
 * Calculates total available single units given peti count, units per peti, and loose units.
 */
export function calculateTotalUnits(
  petiCount: number,
  unitsPerPeti: number,
  looseUnits: number
): number {
  const safePeti = Math.max(0, Number(petiCount) || 0);
  const safeUnitsPerPeti = Math.max(0, Number(unitsPerPeti) || 0);
  const safeLoose = Math.max(0, Number(looseUnits) || 0);

  return safePeti * safeUnitsPerPeti + safeLoose;
}

/**
 * Formats a clear Hindi & English breakdown of peti and loose units.
 * e.g., "1 पेटी (12 पीस) + 4 खुले = 16 कॉपी"
 */
export function formatPetiBreakdown(
  petiCount: number,
  unitsPerPeti: number,
  looseUnits: number,
  unitName = 'पीस'
): string {
  const safePeti = Math.max(0, Number(petiCount) || 0);
  const safeUnitsPerPeti = Math.max(0, Number(unitsPerPeti) || 0);
  const safeLoose = Math.max(0, Number(looseUnits) || 0);
  const total = calculateTotalUnits(safePeti, safeUnitsPerPeti, safeLoose);

  if (safePeti > 0 && safeUnitsPerPeti > 0) {
    if (safeLoose > 0) {
      return `${safePeti} पेटी (${safePeti * safeUnitsPerPeti} ${unitName}) + ${safeLoose} खुले = ${total} ${unitName}`;
    }
    return `${safePeti} पेटी (${total} ${unitName})`;
  }

  return `${total} ${unitName}`;
}

/**
 * Returns inventory status ('in_stock' | 'low_stock' | 'out_of_stock')
 */
export function getStockStatus(totalUnits: number, minThreshold = 10): StockStatus {
  if (totalUnits <= 0) return 'out_of_stock';
  if (totalUnits <= minThreshold) return 'low_stock';
  return 'in_stock';
}

/**
 * Deducts units sold. Smartly reduces loose units first.
 * If loose units are insufficient and there are unopened petis,
 * it "breaks open" 1 peti into loose units and deducts the sale.
 */
export function deductStock(
  item: StockItem,
  unitsToDeduct: number
): { updatedItem: StockItem; message: string; openedPeti: boolean } {
  const qty = Math.max(1, Math.floor(unitsToDeduct));
  const currentTotal = item.totalUnits;

  if (currentTotal < qty) {
    throw new Error(
      `स्टॉक में पर्याप्त सामान नहीं है। उपलब्ध: ${currentTotal}, मांगा: ${qty}`
    );
  }

  let petiCount = item.petiCount;
  let looseUnits = item.looseUnits;
  const unitsPerPeti = Math.max(1, item.unitsPerPeti || 1);
  let openedPeti = false;

  if (looseUnits >= qty) {
    looseUnits -= qty;
  } else {
    // Need to break open petis
    let needed = qty - looseUnits;
    looseUnits = 0;

    const petisToOpen = Math.ceil(needed / unitsPerPeti);
    petiCount = Math.max(0, petiCount - petisToOpen);
    openedPeti = true;

    const totalFromOpened = petisToOpen * unitsPerPeti;
    looseUnits = totalFromOpened - needed;
  }

  const newTotal = calculateTotalUnits(petiCount, unitsPerPeti, looseUnits);

  const updatedItem: StockItem = {
    ...item,
    petiCount,
    looseUnits,
    totalUnits: newTotal,
    lastUpdated: new Date().toISOString(),
    history: [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type: 'sale',
        quantityChange: -qty,
        note: `${qty} ${item.unitName || 'पीस'} बेचे गए${
          openedPeti ? ' (1 नई पेटी खोली गई)' : ''
        }`,
      },
      ...(item.history || []),
    ],
  };

  const message = `${qty} ${item.unitName} स्टॉक से कम किए गए। नया स्टॉक: ${newTotal} ${item.unitName}`;
  return { updatedItem, message, openedPeti };
}

/**
 * Adds new Peti / Carton arrivals to stock.
 */
export function addPetiStock(
  item: StockItem,
  addedPetis: number,
  customUnitsPerPeti?: number
): { updatedItem: StockItem; message: string } {
  const safePetis = Math.max(1, Math.floor(addedPetis));
  const unitsPerPeti = customUnitsPerPeti || item.unitsPerPeti || 12;

  const newPetiCount = item.petiCount + safePetis;
  const addedTotalUnits = safePetis * unitsPerPeti;
  const newTotalUnits = calculateTotalUnits(
    newPetiCount,
    unitsPerPeti,
    item.looseUnits
  );

  const updatedItem: StockItem = {
    ...item,
    isPeti: true,
    petiCount: newPetiCount,
    unitsPerPeti,
    totalUnits: newTotalUnits,
    lastUpdated: new Date().toISOString(),
    history: [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type: 'inward_peti',
        quantityChange: addedTotalUnits,
        note: `नई आवक: ${safePetis} पेटी (${addedTotalUnits} ${item.unitName}) स्टॉक में जोड़ी गई`,
      },
      ...(item.history || []),
    ],
  };

  const message = `${safePetis} पेटी (+${addedTotalUnits} ${item.unitName}) जोड़ी गई! कुल स्टॉक: ${newTotalUnits} ${item.unitName}`;
  return { updatedItem, message };
}

/**
 * Quick loose units adjustment (+/- 1 or custom)
 */
export function adjustLooseStock(
  item: StockItem,
  delta: number,
  reason = 'मैनुअल समायोजन (Manual Adjustment)'
): StockItem {
  const currentTotal = item.totalUnits;
  const newTotal = Math.max(0, currentTotal + delta);
  const unitsPerPeti = Math.max(1, item.unitsPerPeti || 12);

  // Recalculate peti and loose
  let petiCount = item.petiCount;
  let looseUnits = item.looseUnits + delta;

  if (looseUnits < 0) {
    const borrowPetis = Math.ceil(Math.abs(looseUnits) / unitsPerPeti);
    petiCount = Math.max(0, petiCount - borrowPetis);
    looseUnits += borrowPetis * unitsPerPeti;
  }

  const actualTotal = calculateTotalUnits(petiCount, unitsPerPeti, looseUnits);

  return {
    ...item,
    petiCount,
    looseUnits,
    totalUnits: actualTotal,
    lastUpdated: new Date().toISOString(),
    history: [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type: 'adjustment',
        quantityChange: delta,
        note: `${reason} (${delta > 0 ? '+' : ''}${delta} ${item.unitName})`,
      },
      ...(item.history || []),
    ],
  };
}

/**
 * Filter and sort stock items
 */
export function filterAndSortStock(
  items: StockItem[],
  options: StockFilterOptions
): StockItem[] {
  const { searchQuery, selectedCategory, selectedZone, statusFilter, sortBy } =
    options;

  const query = (searchQuery || '').trim().toLowerCase();

  return items
    .filter((item) => {
      // Search matching across Hindi name, English name, brand, SKU, shelf location
      if (query) {
        const matchesName =
          item.name.toLowerCase().includes(query) ||
          item.nameHindi.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.location.shelf.toLowerCase().includes(query) ||
          item.location.zoneName.toLowerCase().includes(query) ||
          item.location.details.toLowerCase().includes(query);

        if (!matchesName) return false;
      }

      // Category filter
      if (
        selectedCategory &&
        selectedCategory !== 'सभी (All)' &&
        item.category !== selectedCategory
      ) {
        return false;
      }

      // Shop Zone / Rack filter
      if (selectedZone && selectedZone !== 'all' && item.location.zoneId !== selectedZone) {
        return false;
      }

      // Status filter
      if (statusFilter === 'low_stock') {
        return item.totalUnits > 0 && item.totalUnits <= item.minStockThreshold;
      }
      if (statusFilter === 'out_of_stock') {
        return item.totalUnits <= 0;
      }
      if (statusFilter === 'peti_only') {
        return item.isPeti && item.petiCount > 0;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.nameHindi.localeCompare(b.nameHindi);
      }
      if (sortBy === 'quantity_asc') {
        return a.totalUnits - b.totalUnits;
      }
      if (sortBy === 'quantity_desc') {
        return b.totalUnits - a.totalUnits;
      }
      if (sortBy === 'price') {
        return b.sellingPrice - a.sellingPrice;
      }
      if (sortBy === 'location') {
        return a.location.zoneName.localeCompare(b.location.zoneName);
      }
      return 0;
    });
}

/**
 * Generate human-friendly SKU
 */
export function generateSku(category: string, name: string): string {
  const catCode = category.includes('कॉपी')
    ? 'NBK'
    : category.includes('पेंसिल')
    ? 'PCL'
    : category.includes('पेन')
    ? 'PEN'
    : category.includes('आर्ट')
    ? 'ART'
    : category.includes('दफ्तर')
    ? 'OFF'
    : 'GEN';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${catCode}-${randNum}`;
}
