import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStockThresholdAlert, StockAlert } from './alertNotification';
import { StockItem } from '../types/stock';

const mockItem: StockItem = {
  id: 'item-test-1',
  name: 'Classmate Hindi Notebook',
  nameHindi: 'क्लासमेट हिंदी कॉपी',
  category: 'कॉपियां व रजिस्टर (Notebooks & Registers)',
  brand: 'Classmate',
  sku: 'NB-HIN-172',
  isPeti: true,
  petiCount: 1,
  unitsPerPeti: 12,
  looseUnits: 4,
  totalUnits: 16,
  unitName: 'कॉपी',
  costPrice: 32,
  sellingPrice: 45,
  location: {
    zoneId: 'rack-b',
    zoneName: 'रैक B',
    shelf: 'शेल्फ 3',
    details: 'रैक B के तीसरे शेल्फ में',
  },
  minStockThreshold: 10,
  lastUpdated: new Date().toISOString(),
};

test('evaluateStockThresholdAlert: does not trigger when stock is well above threshold', () => {
  const updatedItem: StockItem = {
    ...mockItem,
    totalUnits: 15,
  };
  const alert = evaluateStockThresholdAlert(16, updatedItem);
  assert.equal(alert, null);
});

test('evaluateStockThresholdAlert: triggers low_stock alert when units drop from above to at-or-below threshold', () => {
  const updatedItem: StockItem = {
    ...mockItem,
    totalUnits: 9, // dropped from 12 to 9, threshold is 10
  };
  const alert = evaluateStockThresholdAlert(12, updatedItem);
  assert.ok(alert !== null);
  assert.equal(alert.type, 'low_stock');
  assert.equal(alert.currentUnits, 9);
  assert.equal(alert.minThreshold, 10);
  assert.ok(alert.messageHindi.includes('क्लासमेट हिंदी कॉपी'));
  assert.ok(alert.messageHindi.includes('9'));
});

test('evaluateStockThresholdAlert: does not repeat low_stock alert if already below threshold', () => {
  const updatedItem: StockItem = {
    ...mockItem,
    totalUnits: 7, // was 8, still <= 10
  };
  const alert = evaluateStockThresholdAlert(8, updatedItem, false);
  assert.equal(alert, null);
});

test('evaluateStockThresholdAlert: triggers out_of_stock alert when units drop to 0', () => {
  const updatedItem: StockItem = {
    ...mockItem,
    totalUnits: 0,
  };
  const alert = evaluateStockThresholdAlert(3, updatedItem);
  assert.ok(alert !== null);
  assert.equal(alert.type, 'out_of_stock');
  assert.equal(alert.currentUnits, 0);
  assert.ok(alert.titleHindi.includes('स्टॉक खत्म'));
});

test('evaluateStockThresholdAlert: forceCheck triggers alert for existing low stock item', () => {
  const updatedItem: StockItem = {
    ...mockItem,
    totalUnits: 5,
  };
  const alert = evaluateStockThresholdAlert(5, updatedItem, true);
  assert.ok(alert !== null);
  assert.equal(alert.type, 'low_stock');
  assert.equal(alert.currentUnits, 5);
});
