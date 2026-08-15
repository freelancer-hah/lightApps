export function detrend(samples, windowSize = 15) {
  const n = samples.length;
  const result = new Array(n);
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < n) {
        sum += samples[j];
        count++;
      }
    }
    const mean = sum / count;
    result[i] = samples[i] - mean;
  }
  return result;
}

export function computeFlickerPercent(samples, calibrationFactor = 1.0) {
  if (!samples || samples.length === 0) return 0;
  const detrended = detrend(samples);
  const maxD = Math.max(...detrended);
  const minD = Math.min(...detrended);
  
  const sumRaw = samples.reduce((a, b) => a + b, 0);
  const meanRaw = sumRaw / samples.length;
  if (meanRaw <= 1) return 0;
  
  const estMax = meanRaw + maxD;
  if (estMax <= 0) return 0;
  
  const rawPercent = ((maxD - minD) / estMax) * 100;
  const calibrated = rawPercent * calibrationFactor;
  return Math.min(100, Math.max(0, calibrated));
}

export function findDominantCycleCount(samples, minK = 1.0, maxK = 15.0, step = 0.05) {
  const detrended = detrend(samples);
  const n = detrended.length;
  if (n < 20) return null;

  let bestK = minK;
  let bestMag = -1;

  for (let k = minK; k <= maxK; k += step) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * k * i) / n;
      re += detrended[i] * Math.cos(angle);
      im -= detrended[i] * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im);
    if (mag > bestMag) {
      bestMag = mag;
      bestK = k;
    }
  }

  let refinedK = bestK;
  let refinedMag = bestMag;
  const startK = Math.max(minK, bestK - step);
  const endK = Math.min(maxK, bestK + step);
  for (let k = startK; k <= endK; k += 0.005) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * k * i) / n;
      re += detrended[i] * Math.cos(angle);
      im -= detrended[i] * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im);
    if (mag > refinedMag) {
      refinedMag = mag;
      refinedK = k;
    }
  }

  return { bestK: refinedK, bestMag: refinedMag };
}

export function estimateFrequency(samples, calibrationHz = 120, calibrationRate = 8500) {
  const percent = computeFlickerPercent(samples);
  if (percent < 3.0) return null;

  const expectedK = (samples.length * calibrationHz) / calibrationRate;
  const minK = Math.max(0.5, expectedK - 1.5);
  const maxK = expectedK + 1.5;

  const result = findDominantCycleCount(samples, minK, maxK, 0.05);
  if (!result || result.bestMag < 2.0) return null;

  return (result.bestK * calibrationRate) / samples.length;
}

export function flickerRiskLabel(percent) {
  if (percent == null) return { label: '—', message: '' };
  if (percent < 15) {
    return {
      label: 'Low',
      message: `Light varies between full intensity and full intensity minus ${percent.toFixed(0)}%. This is low flickering that is unlikely to cause problems.`,
    };
  }
  if (percent < 40) {
    return {
      label: 'Moderate',
      message: `Light varies between full intensity and full intensity minus ${percent.toFixed(0)}%. This is moderate flickering that may cause discomfort for sensitive users.`,
    };
  }
  return {
    label: 'High',
    message: `Light varies between full intensity and full intensity minus ${percent.toFixed(0)}%. This is high flickering that is likely to cause eye strain or headaches.`,
  };
}
