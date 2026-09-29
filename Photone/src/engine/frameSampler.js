import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

export async function captureFrame(cameraRef, region = null) {
  if (!cameraRef?.current) return null;

  try {
    let photo = null;

    try {
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.05,
        skipProcessing: false,
        exif: true,
        base64: false,
        shutterSound: false,
      });
    } catch (e1) {
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.05,
        exif: true,
      });
    }

    if (!photo?.uri || !photo.width || !photo.height) return null;

    const photoW = photo.width;
    const photoH = photo.height;

    // Use 40% center reticle box region by default
    const activeRegion = region || { x: 0.30, y: 0.30, w: 0.40, h: 0.40 };

    const originX = Math.max(0, Math.min(photoW - 2, Math.round(activeRegion.x * photoW)));
    const originY = Math.max(0, Math.min(photoH - 2, Math.round(activeRegion.y * photoH)));
    const cropW = Math.max(1, Math.min(photoW - originX, Math.round(activeRegion.w * photoW)));
    const cropH = Math.max(1, Math.min(photoH - originY, Math.round(activeRegion.h * photoH)));

    const result = await ImageManipulator.manipulateAsync(
      photo.uri,
      [
        { crop: { originX, originY, width: cropW, height: cropH } },
        { resize: { width: 1, height: 1 } },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
    );

    let rgb = null;
    if (result?.base64) {
      const buffer = Buffer.from(result.base64, 'base64');
      const png = PNG.sync.read(buffer);
      rgb = { r: png.data[0], g: png.data[1], b: png.data[2] };
    }

    const exif = photo.exif || {};
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

    return { rgb, aperture, shutterSpeed, iso, width: photoW, height: photoH };
  } catch (err) {
    return null;
  }
}
