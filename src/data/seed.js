const CATEGORY_META = {
  Electronics: { hue: 190, prefix: 'ELC' },
  Fasteners: { hue: 28, prefix: 'FST' },
  Packaging: { hue: 42, prefix: 'PKG' },
  Apparel: { hue: 312, prefix: 'APL' },
  Automotive: { hue: 8, prefix: 'AUT' },
  Pharma: { hue: 152, prefix: 'PHR' },
  FMCG: { hue: 78, prefix: 'FMC' },
  Industrial: { hue: 220, prefix: 'IND' },
}

export const categories = Object.keys(CATEGORY_META)
export const categoryMeta = CATEGORY_META

export const warehouses = [
  { id: 'WH-HYD', name: 'Hyderabad Hub', city: 'Hyderabad', demand: 4200, color: '#2ec4d6' },
  { id: 'WH-BOM', name: 'Mumbai West', city: 'Mumbai', demand: 5100, color: '#d4893a' },
  { id: 'WH-MAA', name: 'Chennai Port', city: 'Chennai', demand: 2800, color: '#7bc67e' },
  { id: 'WH-DEL', name: 'Delhi NCR', city: 'Gurugram', demand: 3600, color: '#c97bff' },
  { id: 'WH-BLR', name: 'Bengaluru DC', city: 'Bengaluru', demand: 2400, color: '#f5d76e' },
]

export const suppliers = [
  { id: 'SUP-01', name: 'Apex Components', region: 'Pune', capacity: 4800, leadDays: 3, reliability: 0.97, categories: ['Electronics', 'Industrial'] },
  { id: 'SUP-02', name: 'Northline Metals', region: 'Jamshedpur', capacity: 2600, leadDays: 6, reliability: 0.91, categories: ['Fasteners', 'Industrial'] },
  { id: 'SUP-03', name: 'Coastal Pack Co.', region: 'Chennai', capacity: 1900, leadDays: 4, reliability: 0.94, categories: ['Packaging', 'FMCG'] },
  { id: 'SUP-04', name: 'Helio Parts Asia', region: 'Shenzhen', capacity: 3600, leadDays: 12, reliability: 0.88, categories: ['Electronics', 'Automotive'] },
  { id: 'SUP-05', name: 'Deccan Pharma Dist.', region: 'Hyderabad', capacity: 1200, leadDays: 2, reliability: 0.99, categories: ['Pharma'] },
  { id: 'SUP-06', name: 'Kaveri Apparel Mills', region: 'Tiruppur', capacity: 2200, leadDays: 5, reliability: 0.93, categories: ['Apparel', 'FMCG'] },
]

export const pickers = [
  { id: 'PK-01', name: 'Dock A1', speed: 1.25 },
  { id: 'PK-02', name: 'Dock A2', speed: 1.0 },
  { id: 'PK-03', name: 'Dock B1', speed: 1.0 },
  { id: 'PK-04', name: 'Dock B2', speed: 0.8 },
]

const RAW_PRODUCTS = [
  ['ELC-18650', 'Lithium Ion Battery 18650', 'Electronics', 42, 120, 48, 0.05, 8, 'A12-R04-B2', 'SUP-01'],
  ['ELC-21700', 'Lithium Ion Battery 21700', 'Electronics', 18, 80, 62, 0.07, 7, 'A12-R04-B3', 'SUP-01'],
  ['ELC-MOUSE', 'Wireless Optical Mouse', 'Electronics', 210, 80, 390, 0.12, 5, 'A04-R01-B1', 'SUP-04'],
  ['ELC-KB87', 'Mechanical Keyboard MK-87', 'Electronics', 64, 40, 2890, 0.9, 4, 'A04-R02-B1', 'SUP-04'],
  ['ELC-SSD1T', 'NVMe SSD 1TB', 'Electronics', 9, 36, 6200, 0.08, 9, 'A01-R01-B4', 'SUP-01'],
  ['ELC-SSD2T', 'NVMe SSD 2TB', 'Electronics', 4, 20, 9800, 0.09, 6, 'A01-R01-B5', 'SUP-01'],
  ['ELC-HDMI2', 'HDMI 2.1 Cable 2m', 'Electronics', 340, 100, 180, 0.15, 3, 'A05-R03-B2', 'SUP-04'],
  ['ELC-RPI5', 'Single Board Computer RPi5', 'Electronics', 22, 50, 5400, 0.2, 8, 'A01-R02-B1', 'SUP-01'],
  ['ELC-CAM4K', '4K Action Camera', 'Electronics', 11, 24, 7600, 0.35, 4, 'A03-R02-B6', 'SUP-04'],
  ['ELC-USBHUB', 'USB-C Hub 7-Port', 'Electronics', 73, 40, 1450, 0.22, 5, 'A05-R01-B3', 'SUP-04'],
  ['FST-M8X20', 'Hex Bolt M8×20', 'Fasteners', 4200, 2000, 4, 0.02, 6, 'C02-R08-B1', 'SUP-02'],
  ['FST-M8X40', 'Hex Bolt M8×40', 'Fasteners', 1800, 2000, 5, 0.03, 6, 'C02-R08-B2', 'SUP-02'],
  ['FST-M10X30', 'Hex Bolt M10×30', 'Fasteners', 960, 1500, 7, 0.04, 5, 'C02-R09-B1', 'SUP-02'],
  ['FST-NUTM8', 'Nylon Lock Nut M8', 'Fasteners', 6400, 2500, 2, 0.008, 4, 'C03-R01-B1', 'SUP-02'],
  ['FST-WASH8', 'Spring Washer M8', 'Fasteners', 8900, 3000, 1, 0.004, 3, 'C03-R01-B4', 'SUP-02'],
  ['FST-ANCH', 'Wedge Anchor M12', 'Fasteners', 240, 400, 18, 0.08, 5, 'C04-R02-B2', 'SUP-02'],
  ['PKG-TAPE48', 'Packaging Tape 48mm', 'Packaging', 86, 200, 42, 0.18, 9, 'D01-R01-B1', 'SUP-03'],
  ['PKG-WRAP50', 'Bubble Wrap Roll 50m', 'Packaging', 14, 60, 320, 2.4, 7, 'D01-R04-B2', 'SUP-03'],
  ['PKG-BOX12', 'Corrugated Box 12×12×8', 'Packaging', 310, 250, 28, 0.35, 8, 'D02-R01-B1', 'SUP-03'],
  ['PKG-BOX24', 'Corrugated Box 24×18×12', 'Packaging', 55, 120, 64, 0.7, 6, 'D02-R01-B3', 'SUP-03'],
  ['PKG-FILL', 'Paper Void Fill 5kg', 'Packaging', 8, 40, 210, 5.1, 5, 'D03-R02-B1', 'SUP-03'],
  ['PKG-STRP', 'PP Strapping Roll', 'Packaging', 27, 50, 480, 4.2, 4, 'D03-R03-B2', 'SUP-03'],
  ['APL-TS01', 'Cotton T-Shirt Pack (10)', 'Apparel', 120, 80, 890, 1.6, 5, 'E01-R02-B1', 'SUP-06'],
  ['APL-HD01', 'Fleece Hoodie Pack (6)', 'Apparel', 18, 40, 2100, 3.2, 4, 'E01-R03-B2', 'SUP-06'],
  ['APL-DENIM', 'Denim Jeans Pack (8)', 'Apparel', 33, 36, 3400, 4.8, 3, 'E02-R01-B1', 'SUP-06'],
  ['APL-SOCK', 'Ankle Socks Carton', 'Apparel', 210, 100, 260, 2.1, 4, 'E03-R01-B4', 'SUP-06'],
  ['APL-CAP', 'Embroidered Cap Case', 'Apparel', 64, 50, 540, 1.4, 2, 'E03-R02-B1', 'SUP-06'],
  ['AUT-OIL5', 'Engine Oil 5W-30 1L', 'Automotive', 48, 90, 420, 0.95, 7, 'F01-R01-B1', 'SUP-04'],
  ['AUT-OIL0', 'Engine Oil 0W-20 1L', 'Automotive', 12, 40, 510, 0.95, 6, 'F01-R01-B2', 'SUP-04'],
  ['AUT-FILT', 'Oil Filter Spin-On', 'Automotive', 77, 60, 280, 0.32, 6, 'F02-R02-B1', 'SUP-04'],
  ['AUT-PAD', 'Ceramic Brake Pad Set', 'Automotive', 19, 30, 1680, 1.8, 5, 'F03-R01-B3', 'SUP-04'],
  ['AUT-WIPER', 'Wiper Blade 24in Pair', 'Automotive', 140, 50, 390, 0.4, 3, 'F04-R01-B1', 'SUP-04'],
  ['PHR-GLV', 'Nitrile Gloves Box 100', 'Pharma', 26, 80, 210, 0.45, 9, 'G01-R01-B1', 'SUP-05'],
  ['PHR-MASK', 'Surgical Mask Box 50', 'Pharma', 8, 60, 90, 0.22, 8, 'G01-R01-B2', 'SUP-05'],
  ['PHR-SAN500', 'Hand Sanitizer 500ml', 'Pharma', 54, 70, 145, 0.52, 7, 'G02-R01-B1', 'SUP-05'],
  ['PHR-ALCO', 'Isopropyl Alcohol 5L', 'Pharma', 6, 24, 680, 4.8, 8, 'G02-R02-B4', 'SUP-05'],
  ['PHR-THERM', 'Infrared Thermometer', 'Pharma', 15, 20, 1250, 0.18, 4, 'G03-R01-B1', 'SUP-05'],
  ['FMC-RICE', 'Basmati Rice 25kg', 'FMCG', 22, 40, 2100, 25, 8, 'H01-R01-B1', 'SUP-06'],
  ['FMC-OIL5', 'Sunflower Oil 5L', 'FMCG', 41, 50, 780, 4.7, 7, 'H01-R02-B1', 'SUP-03'],
  ['FMC-SUGAR', 'Refined Sugar 50kg', 'FMCG', 9, 20, 1950, 50, 6, 'H02-R01-B1', 'SUP-03'],
  ['FMC-TEA', 'CTC Tea Carton 10kg', 'FMCG', 28, 24, 1420, 10.2, 5, 'H03-R01-B2', 'SUP-06'],
  ['FMC-SALT', 'Iodized Salt 1kg Case', 'FMCG', 160, 80, 320, 12, 3, 'H04-R01-B1', 'SUP-03'],
  ['IND-BELT', 'Conveyor Belt 10m', 'Industrial', 3, 8, 12400, 18, 7, 'I01-R01-B1', 'SUP-02'],
  ['IND-BRG', 'Ball Bearing 6204-2RS', 'Industrial', 88, 60, 95, 0.11, 6, 'I02-R01-B2', 'SUP-02'],
  ['IND-MOTOR', '3-Phase Motor 2HP', 'Industrial', 5, 12, 18600, 22, 5, 'I03-R01-B1', 'SUP-01'],
  ['IND-PUMP', 'Centrifugal Pump 1.5HP', 'Industrial', 2, 8, 21400, 16, 6, 'I03-R02-B1', 'SUP-01'],
  ['IND-CABLE', 'Armoured Cable 50m', 'Industrial', 11, 16, 5400, 9.5, 4, 'I04-R01-B3', 'SUP-01'],
  ['IND-VALVE', 'Gate Valve 2in Brass', 'Industrial', 17, 24, 2100, 1.9, 4, 'I05-R01-B1', 'SUP-02'],
]

export const products = RAW_PRODUCTS.map((row, i) => {
  const [sku, name, category, qty, minStock, unitCost, unitWeight, demandScore, location, supplierId] = row
  return {
    id: `P-${String(i + 1).padStart(3, '0')}`,
    sku,
    name,
    category,
    qty,
    minStock,
    unitCost,
    unitWeight,
    demandScore,
    location,
    supplierId,
    warehouseId: warehouses[i % warehouses.length].id,
    mrp: Math.round(unitCost * 1.18),
    rating: Math.min(4.9, Math.round((4.1 + demandScore * 0.08) * 10) / 10),
    reviews: 18 + i * 11 + demandScore * 6,
  }
})

export const flowEdges = [
  { from: 'SRC', to: 'SUP-01', cap: 4800 },
  { from: 'SRC', to: 'SUP-02', cap: 2600 },
  { from: 'SRC', to: 'SUP-03', cap: 1900 },
  { from: 'SRC', to: 'SUP-04', cap: 3600 },
  { from: 'SRC', to: 'SUP-05', cap: 1200 },
  { from: 'SRC', to: 'SUP-06', cap: 2200 },

  { from: 'SUP-01', to: 'WH-HYD', cap: 1800 },
  { from: 'SUP-01', to: 'WH-BLR', cap: 1400 },
  { from: 'SUP-01', to: 'WH-BOM', cap: 900 },
  { from: 'SUP-02', to: 'WH-BOM', cap: 1200 },
  { from: 'SUP-02', to: 'WH-DEL', cap: 1000 },
  { from: 'SUP-02', to: 'WH-HYD', cap: 400 },
  { from: 'SUP-03', to: 'WH-MAA', cap: 1100 },
  { from: 'SUP-03', to: 'WH-HYD', cap: 500 },
  { from: 'SUP-03', to: 'WH-BOM', cap: 400 },
  { from: 'SUP-04', to: 'WH-BLR', cap: 1000 },
  { from: 'SUP-04', to: 'WH-BOM', cap: 1500 },
  { from: 'SUP-04', to: 'WH-DEL', cap: 800 },
  { from: 'SUP-05', to: 'WH-HYD', cap: 900 },
  { from: 'SUP-05', to: 'WH-MAA', cap: 300 },
  { from: 'SUP-06', to: 'WH-MAA', cap: 800 },
  { from: 'SUP-06', to: 'WH-DEL', cap: 700 },
  { from: 'SUP-06', to: 'WH-BOM', cap: 600 },

  { from: 'WH-HYD', to: 'SNK', cap: 4200 },
  { from: 'WH-BOM', to: 'SNK', cap: 5100 },
  { from: 'WH-MAA', to: 'SNK', cap: 2800 },
  { from: 'WH-DEL', to: 'SNK', cap: 3600 },
  { from: 'WH-BLR', to: 'SNK', cap: 2400 },
]

export const matchingEdges = [
  { left: 'SUP-01', right: 'WH-HYD' },
  { left: 'SUP-01', right: 'WH-BLR' },
  { left: 'SUP-01', right: 'WH-BOM' },
  { left: 'SUP-02', right: 'WH-BOM' },
  { left: 'SUP-02', right: 'WH-DEL' },
  { left: 'SUP-03', right: 'WH-MAA' },
  { left: 'SUP-03', right: 'WH-HYD' },
  { left: 'SUP-04', right: 'WH-BLR' },
  { left: 'SUP-04', right: 'WH-BOM' },
  { left: 'SUP-04', right: 'WH-DEL' },
  { left: 'SUP-05', right: 'WH-HYD' },
  { left: 'SUP-05', right: 'WH-MAA' },
  { left: 'SUP-06', right: 'WH-MAA' },
  { left: 'SUP-06', right: 'WH-DEL' },
]

const CUSTOMERS = [
  'Deccan Retail', 'BlueCart India', 'Harbor Grocers', 'Nimbus Pharma',
  'Orbit Auto', 'Silk Route Apparel', 'Vertex Industrial', 'Lotus Super',
  'Metro Spares', 'Kite Electronics',
]

export const orders = [
  ['ORD-2401', 'ELC-SSD1T', 12, 48, 'high', 0],
  ['ORD-2402', 'PKG-TAPE48', 80, 22, 'med', 1],
  ['ORD-2403', 'PHR-GLV', 40, 31, 'high', 3],
  ['ORD-2404', 'IND-MOTOR', 2, 64, 'high', 6],
  ['ORD-2405', 'FMC-RICE', 16, 28, 'med', 7],
  ['ORD-2406', 'ELC-KB87', 8, 19, 'low', 2],
  ['ORD-2407', 'AUT-PAD', 10, 36, 'med', 4],
  ['ORD-2408', 'IND-PUMP', 1, 72, 'high', 6],
  ['ORD-2409', 'APL-HD01', 6, 25, 'low', 5],
  ['ORD-2410', 'PKG-WRAP50', 20, 33, 'med', 1],
  ['ORD-2411', 'ELC-RPI5', 15, 41, 'high', 9],
  ['ORD-2412', 'FST-M8X40', 400, 18, 'low', 8],
  ['ORD-2413', 'PHR-ALCO', 8, 27, 'high', 3],
  ['ORD-2414', 'AUT-OIL5', 24, 21, 'med', 4],
  ['ORD-2415', 'IND-CABLE', 4, 55, 'med', 6],
  ['ORD-2416', 'FMC-TEA', 10, 24, 'low', 7],
].map(([id, sku, qty, processingMin, priority, ci]) => ({
  id,
  sku,
  qty,
  processingMin,
  priority,
  customer: CUSTOMERS[ci],
  productName: products.find((p) => p.sku === sku)?.name || sku,
}))

export const team = [
  { name: 'Santhosh Pendyala', id: '2520030330' },
  { name: 'Haadi Hasil', id: '2520030297' },
  { name: 'Sashank Chivukula', id: '2520030405' },
]

export const course = {
  code: '25CS2103E',
  name: 'Data Structures and Algorithms - 3',
  guide: 'Dr. V Sireesha',
  title: 'Warehouse Inventory System',
}
