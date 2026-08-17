import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

// Generic version of the technique from ColorAssist's pixelSampler.js:
// crop a region of the frame, shrink it to 1x1 (free box-filter average),
// decode the resulting pixel. Here `region` defaults to the WHOLE frame
// (for light-meter style "average everything" tools) instead of a small
// crosshair square.
//
// Also pulls EXIF exposure metadata (aperture, shutter speed, ISO) when
// available, which the lux/EV formulas need.
export async function captureFrame(cameraRef, region = null) {
  if (!cameraRef?.current) return null;

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.3,
    skipProcessing: true,
    exif: true,
    base64: false,
    shutterSound: false,
  });

  if (!photo?.uri || !photo.width || !photo.height) return null;

  let crop;
  if (region) {
    crop = {
      originX: Math.round(region.x * photo.width),
      originY: Math.round(region.y * photo.height),
      width: Math.max(1, Math.round(region.w * photo.width)),
      height: Math.max(1, Math.round(region.h * photo.height)),
    };
  } else {
    crop = { originX: 0, originY: 0, width: photo.width, height: photo.height };
  }

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ crop }, { resize: { width: 1, height: 1 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
  );

  let rgb = null;
  if (result?.base64) {
    const buffer = Buffer.from(result.base64, 'base64');
    const png = PNG.sync.read(buffer);
    rgb = { r: png.data[0], g: png.data[1], b: png.data[2] };
  }

  const exif = photo.exif || {};
  // Different platforms/devices populate slightly different EXIF keys -
  // check the common variants for each value.
  const aperture =
    exif.ApertureValue || exif.FNumber || exif.ApertureFNumber || null;
  const shutterSpeed =
    exif.ExposureTime ||
    (exif.ShutterSpeedValue ? 1 / Math.pow(2, exif.ShutterSpeedValue) : null);
  const iso =
    (Array.isArray(exif.ISOSpeedRatings) ? exif.ISOSpeedRatings[0] : exif.ISOSpeedRatings) ||
    exif.ISO ||
    exif.PhotographicSensitivity ||
    null;

  return { rgb, aperture, shutterSpeed, iso, width: photo.width, height: photo.height };
}
