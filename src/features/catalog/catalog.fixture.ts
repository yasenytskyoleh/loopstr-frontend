import { catalogSchema, type Tool } from "./catalog.schema";

/** Deterministic placeholder gallery for a fixture tool. Real photo URLs come
 *  from the backend `photos` field; picsum keeps the demo self-contained. */
function photos(seed: string): string[] {
  return [1, 2, 3, 4].map(
    (n) => `https://picsum.photos/seed/${seed}-${n}/800/500`,
  );
}

/** PoC demo catalog (12 tools, 7 categories) mirroring the HOME-01 mocks. Served
 *  by the fixture gateway until the backend `/tools` endpoint exists. Parsed
 *  through the schema so a malformed entry fails at import, not at render. */
const catalog: Tool[] = [
  {
    id: "dewalt-dcd791-drill",
    name: "DeWalt DCD791 Cordless Drill",
    category: "Power tools",
    price_per_day_usd: 6,
    photos: photos("dewalt-drill"),
    description:
      '20V MAX brushless compact drill/driver with two batteries, charger and belt clip. Chuck accepts 1/16"–1/2" bits. Bring your own bits — the case set stays with the tool.',
    condition: "Good — serviced Jul 2026",
    brand_model: "DeWalt DCD791",
    status: "Available",
  },
  {
    id: "prusa-mk4-printer",
    name: "Prusa MK4 3D Printer",
    category: "3D printing",
    price_per_day_usd: 12,
    photos: photos("prusa-mk4"),
    description:
      "FDM printer with a 250×210×220 mm build volume and auto bed leveling. PLA and PETG spools available at the desk; supply your own for other materials.",
    condition: "Excellent — nozzle replaced Jun 2026",
    brand_model: "Prusa MK4",
    status: "Available",
  },
  {
    id: "brother-cs7000x-sewing",
    name: "Brother CS7000X Sewing Machine",
    category: "Textiles",
    price_per_day_usd: 8,
    photos: photos("brother-sewing"),
    description:
      "Computerized sewing and quilting machine with 70 built-in stitches, automatic needle threader and a wide table. Comes with a starter bobbin set.",
    condition: "Good — general wear",
    brand_model: "Brother CS7000X",
    status: "Available",
  },
  {
    id: "canon-eos-r6-studio-b",
    name: "Canon EOS R6 + 24-70mm Kit — Studio Set B",
    category: "Camera gear",
    price_per_day_usd: 25,
    photos: photos("canon-r6"),
    description:
      "Full-frame mirrorless body with a 24-70mm f/2.8 zoom, two batteries and a 128 GB card. Studio Set B includes the padded transport case.",
    condition: "Excellent",
    brand_model: "Canon EOS R6",
    status: "Available",
  },
  {
    id: "festool-ts55-track-saw",
    name: "Festool TS 55 Plunge-Cut Track Saw",
    category: "Power tools",
    price_per_day_usd: 14,
    photos: photos("festool-ts55"),
    description:
      "Plunge-cut track saw with a 1400 mm rail, splinter guard and dust port. Delivers glue-line-ready edges on sheet goods.",
    condition: "Good — blade replaced May 2026",
    brand_model: "Festool TS 55 REBQ",
    status: "Available",
  },
  {
    id: "roland-gs24-vinyl-cutter",
    name: "Roland CAMM-1 GS-24 Vinyl Cutter",
    category: "Fabrication",
    price_per_day_usd: 10,
    photos: photos("roland-gs24"),
    description:
      "Desktop vinyl cutter with a 24-inch media width, perforation cutting and USB control. Ideal for decals, stencils and heat-transfer.",
    condition: "Good",
    brand_model: "Roland CAMM-1 GS-24",
    status: "Available",
  },
  {
    id: "makita-9403-belt-sander",
    name: "Makita 9403 Belt Sander",
    category: "Power tools",
    price_per_day_usd: 7,
    photos: photos("makita-9403"),
    description:
      "4-inch belt sander with a low-noise design and large dust bag. Well suited to stock removal and levelling wide surfaces.",
    condition: "Fair — motor inspection scheduled",
    brand_model: "Makita 9403",
    status: "Under maintenance",
  },
  {
    id: "hakko-fx888d-soldering",
    name: "Hakko FX-888D Soldering Station",
    category: "Electronics",
    price_per_day_usd: 5,
    photos: photos("hakko-fx888d"),
    description:
      "Digital soldering station with adjustable temperature, ceramic heater and a spare tip. Bring your own solder for lead-free work.",
    condition: "Good",
    brand_model: "Hakko FX-888D",
    status: "Available",
  },
  {
    id: "bosch-gst160-jigsaw",
    name: "Bosch GST 160 Jigsaw",
    category: "Power tools",
    price_per_day_usd: 6,
    photos: photos("bosch-gst160"),
    description:
      "Barrel-grip jigsaw with tool-free blade change, orbital action and LED work light. Starter blade set included.",
    condition: "Good",
    brand_model: "Bosch GST 160 CE",
    status: "Available",
  },
  {
    id: "epson-f170-printer",
    name: "Epson SureColor F170 Printer",
    category: "Printing",
    price_per_day_usd: 9,
    photos: photos("epson-f170"),
    description:
      "Dye-sublimation printer for transfers onto polyester and coated blanks. Retired from the shared pool — kept visible for reference.",
    condition: "Retired — replaced by F570",
    brand_model: "Epson SureColor F170",
    status: "Retired",
  },
  {
    id: "dewalt-dcd791-drill-unit-2",
    name: "DeWalt DCD791 Cordless Drill — Unit 2",
    category: "Power tools",
    price_per_day_usd: 6,
    photos: photos("dewalt-drill-2"),
    description:
      '20V MAX brushless compact drill/driver — second unit in the pool. Ships with two batteries, charger and belt clip. Chuck accepts 1/16"–1/2" bits.',
    condition: "Good — serviced Jul 2026",
    brand_model: "DeWalt DCD791",
    status: "Available",
  },
  {
    id: "prusa-mk4-printer-unit-2",
    name: "Prusa MK4 3D Printer — Unit 2",
    category: "3D printing",
    price_per_day_usd: 12,
    photos: photos("prusa-mk4-2"),
    description:
      "FDM printer with a 250×210×220 mm build volume and auto bed leveling — second unit in the pool. PLA and PETG spools available at the desk.",
    condition: "Excellent — nozzle replaced Jun 2026",
    brand_model: "Prusa MK4",
    status: "Available",
  },
];

export const catalogFixture: Tool[] = catalogSchema.parse(catalog);
