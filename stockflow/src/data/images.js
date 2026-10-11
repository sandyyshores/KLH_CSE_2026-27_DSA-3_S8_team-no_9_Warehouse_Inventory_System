import battery from '../assets/products/battery.jpg'
import mouse from '../assets/products/mouse.jpg'
import keyboard from '../assets/products/keyboard.jpg'
import ssd from '../assets/products/ssd.jpg'
import cable from '../assets/products/cable.jpg'
import sbc from '../assets/products/sbc.jpg'
import camera from '../assets/products/camera.jpg'
import hub from '../assets/products/hub.jpg'
import bolts from '../assets/products/bolts.jpg'
import tape from '../assets/products/tape.jpg'
import wrap from '../assets/products/wrap.webp'
import box from '../assets/products/box.jpg'
import tee from '../assets/products/tee.jpg'
import hoodie from '../assets/products/hoodie.jpg'
import oil from '../assets/products/oil.jpg'
import gloves from '../assets/products/gloves.jpg'
import rice from '../assets/products/rice.jpg'
import cookingoil from '../assets/products/cookingoil.jpg'
import tea from '../assets/products/tea.jpg'
import motor from '../assets/products/motor.jpg'
import bearing from '../assets/products/bearing.jpg'
import sanitizer from '../assets/products/sanitizer.jpg'

const SKU = {
  'ELC-18650': battery,
  'ELC-21700': battery,
  'ELC-MOUSE': mouse,
  'ELC-KB87': keyboard,
  'ELC-SSD1T': ssd,
  'ELC-SSD2T': ssd,
  'ELC-HDMI2': cable,
  'ELC-RPI5': sbc,
  'ELC-CAM4K': camera,
  'ELC-USBHUB': hub,
  'FST-M8X20': bolts,
  'FST-M8X40': bolts,
  'FST-M10X30': bolts,
  'FST-NUTM8': bolts,
  'FST-WASH8': bolts,
  'FST-ANCH': bolts,
  'PKG-TAPE48': tape,
  'PKG-WRAP50': wrap,
  'PKG-BOX12': box,
  'PKG-BOX24': box,
  'PKG-FILL': box,
  'PKG-STRP': tape,
  'APL-TS01': tee,
  'APL-HD01': hoodie,
  'APL-DENIM': tee,
  'APL-SOCK': tee,
  'APL-CAP': hoodie,
  'AUT-OIL5': oil,
  'AUT-OIL0': oil,
  'AUT-FILT': oil,
  'AUT-PAD': oil,
  'AUT-WIPER': oil,
  'PHR-GLV': gloves,
  'PHR-MASK': gloves,
  'PHR-SAN500': sanitizer,
  'PHR-ALCO': sanitizer,
  'PHR-THERM': sanitizer,
  'FMC-RICE': rice,
  'FMC-OIL5': cookingoil,
  'FMC-SUGAR': rice,
  'FMC-TEA': tea,
  'FMC-SALT': rice,
  'IND-BELT': motor,
  'IND-BRG': bearing,
  'IND-MOTOR': motor,
  'IND-PUMP': motor,
  'IND-CABLE': cable,
  'IND-VALVE': bearing,
}

const CAT = {
  Electronics: ssd,
  Fasteners: bolts,
  Packaging: box,
  Apparel: tee,
  Automotive: oil,
  Pharma: gloves,
  FMCG: rice,
  Industrial: motor,
}

export function productImage(p) {
  return SKU[p.sku] || CAT[p.category] || box
}
