import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

async function takeShot(cameraRef) {
  if (!cameraRef?.current) return null;
  const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true, exif: true, base64: false, shutterSound: false });
  if (!photo?.uri || !photo.width || !photo.height) return null;
  return photo;
}

function extractExposure(photo) {
  const exif = photo?.exif || {};
  const aperture = exif.ApertureValue || exif.FNumber || exif.ApertureFNumber || null;
  const shutterSpeed =
    exif.ExposureTime || (exif.ShutterSpeedValue ? 1 / Math.pow(2, exif.ShutterSpeedValue) : null);
  const iso =
    (Array.isArray(exif.ISOSpeedRatings) ? exif.ISOSpeedRatings[0] : exif.ISOSpeedRatings) ||
    exif.ISO || exif.PhotographicSensitivity || null;
  return { aperture, shutterSpeed, iso };
}

async function manipulate(uri, actions) {
  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: 1,
    format: ImageManipulator.SaveFormat.PNG,
    base64: true,
  });
  if (!result?.base64) return null;
  return PNG.sync.read(Buffer.from(result.base64, 'base64'));
}

// ESTIMATE MODE: average a centered region down to one RGB pixel (same
// box-filter-via-resize trick as the other apps).
export async function sampleAveragedRegion(cameraRef, regionSize = 0.3) {
  const photo = await takeShot(cameraRef);
  if (!photo) return null;
  const w = Math.round(photo.width * regionSize);
  const h = Math.round(photo.height * regionSize);
  const originX = Math.round((photo.width - w) / 2);
  const originY = Math.round((photo.height - h) / 2);
  const png = await manipulate(photo.uri, [
    { crop: { originX, originY, width: w, height: h } },
    { resize: { width: 1, height: 1 } },
  ]);
  if (!png) return null;
  return { r: png.data[0], g: png.data[1], b: png.data[2], ...extractExposure(photo) };
}

// DIFFRACTION MODE: crop the horizontal band where the CD grating spreads
// the light into a rainbow, and shrink it down to N samples across its
// width x 1 tall. Each output pixel is a box-filtered average of the
// pixels that fell into that column - i.e. resizing IS the wavelength
// binning step, same "shrink = free average" trick used everywhere else
// in these apps, just applied along a strip instead of down to one pixel.
//
// bandRegion: { x, y, w, h } in 0..1 normalized frame coordinates,
// describing where on screen the diffracted band appears (set during
// calibration, since this depends on your physical CD/slit setup).
export async function sampleBandStrip(cameraRef, bandRegion, numSamples = 120) {
  const photo = await takeShot(cameraRef);
  if (!photo) return null;
  const originX = Math.round(bandRegion.x * photo.width);
  const originY = Math.round(bandRegion.y * photo.height);
  const w = Math.max(numSamples, Math.round(bandRegion.w * photo.width));
  const h = Math.max(1, Math.round(bandRegion.h * photo.height));
  const png = await manipulate(photo.uri, [
    { crop: { originX, originY, width: w, height: h } },
    { resize: { width: numSamples, height: 1 } },
  ]);
  if (!png) return null;

  const pixels = [];
  for (let i = 0; i < numSamples; i++) {
    const off = i * 4; // RGBA
    pixels.push({ r: png.data[off], g: png.data[off + 1], b: png.data[off + 2] });
  }
  return pixels;
}

// HISTOGRAM: a small thumbnail (e.g. 32x32) gives us enough real pixels to
// build an honest RGB histogram without transferring/decoding a full-res
// frame every tick.
export async function sampleThumbnail(cameraRef, thumbSize = 32) {
  const photo = await takeShot(cameraRef);
  if (!photo) return null;
  const png = await manipulate(photo.uri, [{ resize: { width: thumbSize, height: thumbSize } }]);
  if (!png) return null;

  const pixels = [];
  for (let i = 0; i < thumbSize * thumbSize; i++) {
    const off = i * 4;
    pixels.push({ r: png.data[off], g: png.data[off + 1], b: png.data[off + 2] });
  }
  return pixels;
}
