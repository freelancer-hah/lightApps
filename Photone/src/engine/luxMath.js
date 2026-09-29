export const DEFAULT_FRONT_CALIB = 0.757;
export const DEFAULT_BACK_CALIB = 0.757;
export const DEFAULT_DIFFUSER_FACTOR = 2.25;

export const LIGHT_SOURCES = [
  {
    id: 'led_full_spec',
    name: 'LED Full Spectrum White',
    icon: 'sunny-outline',
    parFactor: 0.0160,
    description: 'Standard 3000K-5000K high CRI full spectrum white LED grow lights (Samsung LM301B/H, etc.).',
    cctRange: '3000K - 5000K',
  },
  {
    id: 'sunlight',
    name: 'Sunlight / Outdoor',
    icon: 'partly-sunny-outline',
    parFactor: 0.0185,
    description: 'Natural unfiltered daylight, sunrooms, and greenhouses.',
    cctRange: '5200K - 6500K',
  },
  {
    id: 'led_blurple',
    name: 'LED Red / Blue (Blurple)',
    icon: 'color-palette-outline',
    parFactor: 0.0180,
    description: 'Targeted narrow spectrum red + blue LED fixture panels.',
    cctRange: 'N/A (Monochromatic)',
  },
  {
    id: 'led_warm',
    name: 'LED Warm White (3000K)',
    icon: 'flame-outline',
    parFactor: 0.0148,
    description: 'Warm bloom-oriented LED lights and 2700K-3000K household bulbs.',
    cctRange: '2700K - 3200K',
  },
  {
    id: 'led_cool',
    name: 'LED Cool White (6500K)',
    icon: 'snow-outline',
    parFactor: 0.0155,
    description: 'Cool veg-oriented 6500K LED panels and quantum boards.',
    cctRange: '6000K - 7000K',
  },
  {
    id: 'hps',
    name: 'HPS (High Pressure Sodium)',
    icon: 'bulb-outline',
    parFactor: 0.0122,
    description: 'Traditional orange-red heavy high-intensity discharge (HID) lamps.',
    cctRange: '2000K - 2200K',
  },
  {
    id: 'mh',
    name: 'MH (Metal Halide)',
    icon: 'flash-outline',
    parFactor: 0.0142,
    description: 'Blue-rich HID lamps commonly used during vegetative growth phase.',
    cctRange: '4000K - 6000K',
  },
  {
    id: 'cmh',
    name: 'CMH / LEC (Ceramic Metal Halide)',
    icon: 'prism-outline',
    parFactor: 0.0165,
    description: 'Broad full spectrum ceramic discharge grow lights (315W/630W).',
    cctRange: '3000K - 4200K',
  },
  {
    id: 'fluorescent',
    name: 'Fluorescent / T5 / CFL',
    icon: 'options-outline',
    parFactor: 0.0135,
    description: 'High output T5 tubes, T8 shop lights, or compact fluorescent bulbs.',
    cctRange: '2700K - 6500K',
  },
];

export const PLANT_TARGET_PRESETS = [
  {
    id: 'seedling',
    name: 'Seedlings & Microgreens',
    icon: 'leaf-outline',
    targetPpfdMin: 100,
    targetPpfdMax: 200,
    targetDliMin: 6,
    targetDliMax: 12,
    defaultPhotoperiod: 18,
    description: 'Delicate young sprouts, clones, and microgreens requiring low light intensity.',
  },
  {
    id: 'veg',
    name: 'Vegetative Stage',
    icon: 'sparkles-outline',
    targetPpfdMin: 300,
    targetPpfdMax: 600,
    targetDliMin: 20,
    targetDliMax: 30,
    defaultPhotoperiod: 18,
    description: 'Rapid foliage growth for cannabis, peppers, tomatoes, and fruiting crops.',
  },
  {
    id: 'flowering',
    name: 'Flowering & Fruiting Stage',
    icon: 'flower-outline',
    targetPpfdMin: 600,
    targetPpfdMax: 1000,
    targetDliMin: 30,
    targetDliMax: 45,
    defaultPhotoperiod: 12,
    description: 'High-intensity light requirement for bloom, bud development, and heavy fruiting.',
  },
  {
    id: 'greens',
    name: 'Leafy Greens & Herbs',
    icon: 'nutrition-outline',
    targetPpfdMin: 200,
    targetPpfdMax: 350,
    targetDliMin: 14,
    targetDliMax: 18,
    defaultPhotoperiod: 16,
    description: 'Lettuce, spinach, basil, mint, and culinary herbs in indoor hydroponic setups.',
  },
  {
    id: 'houseplants',
    name: 'Houseplants (Low / Medium Light)',
    icon: 'home-outline',
    targetPpfdMin: 50,
    targetPpfdMax: 150,
    targetDliMin: 4,
    targetDliMax: 10,
    defaultPhotoperiod: 12,
    description: 'Pothos, ferns, Monstera, orchids, and indoor shade plants.',
  },
];

export function computeEV100(aperture, shutterSpeed, iso, rgb = null) {
  const lum = rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 0.35;

  if (aperture && shutterSpeed && iso && shutterSpeed > 0 && iso > 0) {
    const baseEv = Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
    // Modulate optical EV with sampled reticle brightness ratio
    const lumFactor = Math.log2(Math.max(0.1, lum / 0.35));
    return baseEv + lumFactor;
  }

  // Dynamic EV response based on scene luminance shift
  return 4.5 + 8.0 * (lum - 0.35);
}

export function evToLux(ev100, calibrationFactor = DEFAULT_BACK_CALIB) {
  const safeEv = ev100 ?? 4.5;
  const rawLux = 2.5 * Math.pow(2, safeEv);
  return Math.max(0, calibrationFactor * rawLux);
}

export function luxToFootCandles(lux) {
  const safeLux = lux ?? 0;
  return safeLux / 10.764;
}

export function luxToPpfd(lux, sourceId = 'led_full_spec', diffuserOn = false, diffuserMultiplier = DEFAULT_DIFFUSER_FACTOR) {
  const safeLux = lux ?? 0;
  const source = LIGHT_SOURCES.find((s) => s.id === sourceId) || LIGHT_SOURCES[0];
  const effectiveLux = diffuserOn ? safeLux * diffuserMultiplier : safeLux;
  return effectiveLux * source.parFactor;
}

export function ppfdToDli(ppfd, photoperiodHours = 18) {
  const safePpfd = ppfd ?? 0;
  return (safePpfd * photoperiodHours * 3600) / 1_000_000;
}

export function evaluateDliStatus(currentDli, targetDliMin, targetDliMax) {
  const safeDli = currentDli ?? 0;
  if (safeDli < targetDliMin * 0.7) {
    return { status: 'Very Low', color: '#EF4444', label: 'Insufficient Light (Etiolation Risk)' };
  }
  if (safeDli < targetDliMin) {
    return { status: 'Low', color: '#F59E0B', label: 'Slightly Low (Increase Hours/Intensity)' };
  }
  if (safeDli <= targetDliMax) {
    return { status: 'Optimal', color: '#10B981', label: 'Optimal DLI Target' };
  }
  if (safeDli <= targetDliMax * 1.3) {
    return { status: 'High', color: '#3B82F6', label: 'High Light (Monitor Heat/CO2)' };
  }
  return { status: 'Excessive', color: '#EC4899', label: 'Excessive Light (Photoinhibition Risk)' };
}

export function calculateHangingHeightAdvice(currentPpfd, targetPpfd, currentDistanceCm = 45) {
  if (!currentPpfd || !targetPpfd || currentPpfd <= 0) return null;
  const ratio = Math.sqrt(currentPpfd / targetPpfd);
  const suggestedDistance = Math.round(currentDistanceCm * ratio);
  const dimmingRatio = Math.min(100, Math.round((targetPpfd / currentPpfd) * 100));

  let action = 'Maintain current height';
  if (suggestedDistance > currentDistanceCm + 3) {
    action = `Raise light by ${suggestedDistance - currentDistanceCm} cm`;
  } else if (suggestedDistance < currentDistanceCm - 3) {
    action = `Lower light by ${currentDistanceCm - suggestedDistance} cm`;
  }

  return {
    suggestedDistanceCm: Math.max(10, suggestedDistance),
    suggestedDistanceInches: Math.max(4, Math.round(suggestedDistance / 2.54)),
    dimmingRatio,
    action,
  };
}
