export type ShopZoneId =
  | 'rack-a'
  | 'rack-b'
  | 'rack-c'
  | 'rack-d'
  | 'counter'
  | 'godown'
  | 'showcase';

export interface ShopZone {
  id: ShopZoneId;
  name: string;
  nameEnglish: string;
  iconName: string;
  color: string;
  defaultCategories: string[];
  totalShelves: number;
  shelfNames?: string[];
  description: string;
  // Percentage coordinates for 2D visual shop map
  mapCoords: {
    x: number; // 0-100%
    y: number; // 0-100%
    w: number;
    h: number;
  };
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockHistoryEntry {
  id: string;
  timestamp: string;
  type: 'inward_peti' | 'manual_add' | 'sale' | 'adjustment' | 'transfer';
  quantityChange: number;
  note: string;
}

export interface StockItem {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  brand: string;
  sku: string;
  barcode?: string;
  
  // Peti & Packaging Logic
  isPeti: boolean;
  petiCount: number; // e.g. 2 cartons
  unitsPerPeti: number; // e.g. 12 copies per carton or 100 pencils per carton
  looseUnits: number; // e.g. 4 loose pieces
  totalUnits: number; // total available single units
  unitName: string; // 'पीस (Pieces)' | 'दर्जन (Dozen)' | 'पैकेट (Packets)' | 'कॉपी (Copies)'
  
  // Pricing
  costPrice: number; // ₹ per unit
  sellingPrice: number; // ₹ MRP or sale price per unit
  
  // Shop location
  location: {
    zoneId: ShopZoneId;
    zoneName: string;
    shelf: string; // e.g. "शेल्फ 3 (तीसरा खाना)"
    details: string; // e.g. "हिंदी कॉपियों के रैक B के 3rd शेल्फ में"
  };

  minStockThreshold: number;
  notes?: string;
  imageUrl?: string;
  lastUpdated: string;
  history?: StockHistoryEntry[];
}

export interface StockFilterOptions {
  searchQuery: string;
  selectedCategory: string;
  selectedZone: string;
  statusFilter: 'all' | 'low_stock' | 'out_of_stock' | 'peti_only';
  sortBy: 'name' | 'quantity_asc' | 'quantity_desc' | 'location' | 'price';
}
