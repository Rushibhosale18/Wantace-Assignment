function calculateEstimate(config, answers) {
  const { questions, waste_factor, permit_flat_fee, range_spread_pct } = config;

  const roofArea = Number(answers['roof_area'] || 0);

  // Helper to find selected option
  const getSelectedOption = (questionKey) => {
    const q = questions.find(item => item.key === questionKey);
    if (!q || !q.options) return null;
    const selectedValue = answers[questionKey];
    return q.options.find(opt => opt.value === selectedValue) || null;
  };

  const materialOpt = getSelectedOption('material');
  const pitchOpt = getSelectedOption('pitch');
  const layersOpt = getSelectedOption('layers');
  const storiesOpt = getSelectedOption('stories');

  // Rates and Multipliers
  const ratePerSqft = Number(materialOpt?.rate_per_sqft || 0);
  const pitchMult = Number(pitchOpt?.multiplier || 1.0);
  const tearOffPerSqft = Number(layersOpt?.tear_off_per_sqft || 0);
  const storiesMult = Number(storiesOpt?.multiplier || 1.0);

  const wasteFactor = Number(waste_factor || 0.10);
  const permitFee = Number(permit_flat_fee || 350);
  const spreadPct = Number(range_spread_pct || 12) / 100;

  // Pricing Formula
  const baseMaterialCost = roofArea * ratePerSqft * (1 + wasteFactor);
  const tearOffCost = roofArea * tearOffPerSqft;
  const subtotal = (baseMaterialCost + tearOffCost) * pitchMult * storiesMult;
  const midPointEstimate = subtotal + permitFee;

  const estimateLow = Math.round(midPointEstimate * (1 - spreadPct));
  const estimateHigh = Math.round(midPointEstimate * (1 + spreadPct));

  return {
    estimate_low: estimateLow,
    estimate_high: estimateHigh
  };
}

module.exports = { calculateEstimate };
