const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedData = {
  config_version: 3,
  business: { name: "Northline Roofing & Exteriors", region: "Columbus, OH", currency: "USD" },
  questions: [
    { key: "roof_area", label: "Roughly how big is your roof?", type: "number",
      unit: "sq ft", required: true, min: 300, max: 12000, active: true, order: 1 },
    { key: "material", label: "What material do you want?", type: "select",
      required: true, active: true, order: 2, options: [
        { value: "asphalt_3tab", label: "Asphalt shingle - 3-tab", rate_per_sqft: 4.25, order: 1 },
        { value: "asphalt_arch", label: "Asphalt shingle - architectural", rate_per_sqft: 5.90, order: 2 },
        { value: "metal_standing", label: "Standing seam metal", rate_per_sqft: 12.40, order: 3 },
        { value: "cedar_shake", label: "Cedar shake", rate_per_sqft: 11.10, order: 4 } ] },
    { key: "pitch", label: "How steep is the roof?", type: "select",
      required: true, active: true, order: 3, options: [
        { value: "low", label: "Low - you could walk on it", multiplier: 1.0, order: 1 },
        { value: "medium", label: "Medium", multiplier: 1.12, order: 2 },
        { value: "steep", label: "Steep - not walkable", multiplier: 1.30, order: 3 } ] },
    { key: "layers", label: "How many layers of old roofing are on there now?", type: "select",
      required: true, active: true, order: 4, options: [
        { value: "0", label: "None - new build", tear_off_per_sqft: 0, order: 1 },
        { value: "1", label: "One layer", tear_off_per_sqft: 1.15, order: 2 },
        { value: "2", label: "Two or more layers", tear_off_per_sqft: 2.05, order: 3 } ] },
    { key: "stories", label: "How many stories is the house?", type: "select",
      required: true, active: true, order: 5, options: [
        { value: "1", label: "Single storey", multiplier: 1.0, order: 1 },
        { value: "2", label: "Two storeys", multiplier: 1.08, order: 2 },
        { value: "3", label: "Three or more", multiplier: 1.18, order: 3 } ] }
  ],
  modifiers: { waste_factor: 0.10, permit_flat_fee: 350, range_spread_pct: 12 }
};

const leads = [
  { id: "ld_1041", captured_at: new Date("2026-06-02T14:20:11Z"), config_version: 3,
    name: "Ana Ruiz", phone: "+1-614-555-0148", email: "aruiz@example.com",
    answers: JSON.stringify({ roof_area: 2100, material: "asphalt_arch", pitch: "medium", layers: "1", stories: "2" }),
    estimate_low: 21480, estimate_high: 27260 },
  { id: "ld_0917", captured_at: new Date("2026-03-18T09:02:44Z"), config_version: 1,
    name: "Bill Tanner", phone: "+1-614-555-0192", email: "btanner@example.com",
    answers: JSON.stringify({ roof_area: 1450, material: "slate_natural", pitch: "steep", chimney_count: 2, gutter_replace: "yes" }),
    estimate_low: 38900, estimate_high: 44100 },
  { id: "ld_1102", captured_at: new Date("2026-07-11T18:47:03Z"), config_version: 3,
    name: "Priya Nair", phone: "+1-614-555-0177", email: "pnair@example.com",
    answers: JSON.stringify({ roof_area: 900, material: "metal_standing", pitch: "low", layers: "0", stories: "1" }),
    estimate_low: 12240, estimate_high: 15530 }
];

async function main() {
  console.log("Seeding Database...");
  
  // Clear existing
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.config.deleteMany();
  await prisma.lead.deleteMany();

  // Create Config
  const config = await prisma.config.create({
    data: {
      id: 1,
      config_version: seedData.config_version,
      business_name: seedData.business.name,
      business_region: seedData.business.region,
      business_currency: seedData.business.currency,
      waste_factor: seedData.modifiers.waste_factor,
      permit_flat_fee: seedData.modifiers.permit_flat_fee,
      range_spread_pct: seedData.modifiers.range_spread_pct,
      questions: {
        create: seedData.questions.map(q => ({
          key: q.key,
          label: q.label,
          type: q.type,
          unit: q.unit || null,
          required: q.required,
          min: q.min || null,
          max: q.max || null,
          active: q.active,
          order: q.order,
          options: {
            create: q.options ? q.options.map(opt => ({
              value: opt.value,
              label: opt.label,
              rate_per_sqft: opt.rate_per_sqft || null,
              multiplier: opt.multiplier || null,
              tear_off_per_sqft: opt.tear_off_per_sqft || null,
              order: opt.order
            })) : []
          }
        }))
      }
    }
  });

  console.log("Config seeded");

  // Create Leads
  for (const lead of leads) {
    await prisma.lead.create({
      data: lead
    });
  }
  
  console.log("Leads seeded");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
