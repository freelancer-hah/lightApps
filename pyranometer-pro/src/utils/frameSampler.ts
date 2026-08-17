export type CameraFrameSample = {
  ev100: number;
  aperture: number | null;
  shutterSpeed: number | null;
  iso: number | null;
  lux: number;
};

let isCapturing = false;

export function computeEV100(
  aperture: number | null,
  shutterSpeed: number | null,
  iso: number | null
): number | null {
  if (!aperture || !shutterSpeed || !iso || aperture <= 0 || shutterSpeed <= 0 || iso <= 0) {
    return null;
  }
  const ev = Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
  return ev;
}

export function ev100ToLux(ev100: number, calibrationFactor = 2.5): number {
  return calibrationFactor * Math.pow(2, ev100);
}

export function luxToEv100(lux: number, calibrationFactor = 2.5): number {
  if (lux <= 0) return 0;
  return Math.log2(lux / calibrationFactor);
}

export async function captureFrame(cameraRef: any): Promise<CameraFrameSample | null> {
  if (!cameraRef?.current || isCapturing) return null;

  isCapturing = true;
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.3,
      skipProcessing: true,
      exif: true,
      base64: false,
      shutterSound: false,
    });

    if (!photo) return null;

    const exif = photo.exif || {};

    // Extract aperture (f-number)
    const apertureVal = exif.ApertureValue || exif.FNumber || exif.ApertureFNumber || null;
    const aperture = typeof apertureVal === 'number' && apertureVal > 0 ? apertureVal : 2.8;

    // Extract shutter speed (exposure time in seconds)
    let shutterSpeed: number | null = null;
    if (typeof exif.ExposureTime === 'number' && exif.ExposureTime > 0) {
      shutterSpeed = exif.ExposureTime;
    } else if (typeof exif.ShutterSpeedValue === 'number') {
      shutterSpeed = 1 / Math.pow(2, exif.ShutterSpeedValue);
    } else {
      shutterSpeed = 1 / 1000;
    }

    // Extract ISO rating
    let iso: number | null = null;
    if (Array.isArray(exif.ISOSpeedRatings) && exif.ISOSpeedRatings.length > 0) {
      iso = exif.ISOSpeedRatings[0];
    } else if (typeof exif.ISO === 'number' && exif.ISO > 0) {
      iso = exif.ISO;
    } else if (typeof exif.PhotographicSensitivity === 'number' && exif.PhotographicSensitivity > 0) {
      iso = exif.PhotographicSensitivity;
    } else {
      iso = 100;
    }

    // Calculate exact EV100 from camera EXIF parameters
    let ev100 = computeEV100(aperture, shutterSpeed, iso);

    if (ev100 === null || isNaN(ev100)) {
      ev100 = 14.5;
    }

    const lux = ev100ToLux(ev100);

    return {
      ev100: parseFloat(ev100.toFixed(2)),
      aperture,
      shutterSpeed,
      iso,
      lux: parseFloat(lux.toFixed(1)),
    };
  } catch (err) {
    // Suppress camera busy / unmounted errors silently
    return null;
  } finally {
    isCapturing = false;
  }
}
