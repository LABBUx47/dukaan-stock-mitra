import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalUnits,
  formatPetiBreakdown,
  getStockStatus,
  deductStock,
  addPetiStock,
  adjustLooseStock,
  filterAndSortStock,
} from './stockLogic';
import { StockItem } from '../types/stock';

test('calculateTotalUnits correctly computes peti * unitsPerPeti + looseUnits', () => {
  assert.equal(calculateTotalUnits(0, 10, 5), 5);
  assert.equal(calculateTotalUnits(2, 12, 4), 28);
  assert.equal(calculateTotalUnits(5, 100, 20), 520);
  assert.equal(calculateTotalUnits(0, 0, 0), 0);
});

test('formatPetiBreakdown displays clear Hindi peti count and loose breakdown', () => {
  const result1 = formatPetiBreakdown(1, 12, 4, 'कॉपी');
  assert.ok(result1.includes('1 पेटी (12 कॉपी) + 4 खुले = 16 कॉपी'));

  const result2 = formatPetiBreakdown(2, 50, 0, 'पीस');
  assert.ok(result2.includes('2 पेटी (100 पीस)'));

  const result3 = formatPetiBreakdown(0, 10, 8, 'पीस');
  assert.equal(result3, '8 पीस');
});

test('getStockStatus returns accurate inventory threshold status', () => {
  assert.equal(getStockStatus(0, 10), 'out_of_stock');
  assert.equal(getStockStatus(5, 10), 'low_stock');
  assert.equal(getStockStatus(10, 10), 'low_stock');
  assert.equal(getStockStatus(15, 10), 'in_stock');
});

test('deductStock reduces loose units first without touching unopened petis', () => {
  const mockItem: StockItem = {
    id: 'item-1',
    name: 'Classmate Hindi Copy',
    nameHindi: 'क्लासमेट हिंदी कॉपी',
    category: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
    brand: 'Classmate',
    sku: 'NBK-101',
    isPeti: true,
    petiCount: 2,
    unitsPerPeti: 12,
    looseUnits: 6,
    totalUnits: 30, // 2*12 + 6 = 30
    unitName: 'कॉपी',
    costPrice: 30,
    sellingPrice: 40,
    location: {
      zoneId: 'rack-b',
      zoneName: 'रैक B',
      shelf: 'शेल्फ 3',
      details: 'रैक B के तीसरे खाने में',
    },
    minStockThreshold: 5,
    lastUpdated: new Date().toISOString(),
  };

  const { updatedItem, openedPeti } = deductStock(mockItem, 2);
  assert.equal(openedPeti, false);
  assert.equal(updatedItem.petiCount, 2);
  assert.equal(updatedItem.looseUnits, 4);
  assert.equal(updatedItem.totalUnits, 28);
});

test('deductStock opens 1 unopened peti if loose units are insufficient', () => {
  const mockItem: StockItem = {
    id: 'item-2',
    name: 'Apsara Pencils',
    nameHindi: 'अप्सरा पेंसिल',
    category: 'पेंसिल (Pencils)',
    brand: 'Apsara',
    sku: 'PCL-202',
    isPeti: true,
    petiCount: 2,
    unitsPerPeti: 10,
    looseUnits: 2,
    totalUnits: 22,
    unitName: 'पीस',
    costPrice: 5,
    sellingPrice: 7,
    location: {
      zoneId: 'rack-a',
      zoneName: 'रैक A',
      shelf: 'शेल्फ 2',
      details: 'रैक A में',
    },
    minStockThreshold: 5,
    lastUpdated: new Date().toISOString(),
  };

  // User buys 5 pencils. Loose is only 2, so 1 peti (10 pcs) is opened.
  // 2 + 10 - 5 = 7 loose units left, 1 peti left. Total = 17.
  const { updatedItem, openedPeti } = deductStock(mockItem, 5);
  assert.equal(openedPeti, true);
  assert.equal(updatedItem.petiCount, 1);
  assert.equal(updatedItem.looseUnits, 7);
  assert.equal(updatedItem.totalUnits, 17);
});

test('addPetiStock adds new cartons and calculates updated totals', () => {
  const mockItem: StockItem = {
    id: 'item-3',
    name: 'Hindi Copies',
    nameHindi: 'हिंदी कॉपियां',
    category: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
    brand: 'Navneet',
    sku: 'NBK-303',
    isPeti: true,
    petiCount: 1,
    unitsPerPeti: 12,
    looseUnits: 3,
    totalUnits: 15,
    unitName: 'कॉपी',
    costPrice: 25,
    sellingPrice: 35,
    location: {
      zoneId: 'rack-b',
      zoneName: 'रैक B',
      shelf: 'शेल्फ 3',
      details: 'रैक B शेल्फ 3',
    },
    minStockThreshold: 5,
    lastUpdated: new Date().toISOString(),
  };

  // Arrived 2 new petis of 12 copies each (24 copies)
  const { updatedItem } = addPetiStock(mockItem, 2);
  assert.equal(updatedItem.petiCount, 3);
  assert.equal(updatedItem.totalUnits, 39); // 3*12 + 3 = 39
});

test('filterAndSortStock filters by search query and category and rack', () => {
  const items: StockItem[] = [
    {
      id: '1',
      name: 'Classmate Hindi Copy',
      nameHindi: 'क्लासमेट हिंदी कॉपी',
      category: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
      brand: 'Classmate',
      sku: 'NBK-101',
      isPeti: true,
      petiCount: 1,
      unitsPerPeti: 12,
      looseUnits: 0,
      totalUnits: 12,
      unitName: 'कॉपी',
      costPrice: 30,
      sellingPrice: 40,
      location: {
        zoneId: 'rack-b',
        zoneName: 'रैक B',
        shelf: 'शेल्फ 3',
        details: 'रैक B तीसरा खाना',
      },
      minStockThreshold: 5,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Apsara Platinum Pencils',
      nameHindi: 'अप्सरा प्लैटिनम पेंसिल',
      category: 'पेंसिल (Pencils)',
      brand: 'Apsara',
      sku: 'PCL-102',
      isPeti: true,
      petiCount: 1,
      unitsPerPeti: 100,
      looseUnits: 10,
      totalUnits: 110,
      unitName: 'पीस',
      costPrice: 6,
      sellingPrice: 10,
      location: {
        zoneId: 'rack-a',
        zoneName: 'रैक A',
        shelf: 'शेल्फ 2',
        details: 'रैक A दूसरा खाना',
      },
      minStockThreshold: 20,
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Search by Hindi name
  const filteredHindi = filterAndSortStock(items, {
    searchQuery: 'हिंदी',
    selectedCategory: 'सभी (All)',
    selectedZone: 'all',
    statusFilter: 'all',
    sortBy: 'name',
  });
  assert.equal(filteredHindi.length, 1);
  assert.equal(filteredHindi[0].id, '1');

  // Filter by Zone 'rack-a'
  const filteredZone = filterAndSortStock(items, {
    searchQuery: '',
    selectedCategory: 'सभी (All)',
    selectedZone: 'rack-a',
    statusFilter: 'all',
    sortBy: 'name',
  });
  assert.equal(filteredZone.length, 1);
  assert.equal(filteredZone[0].id, '2');
});
