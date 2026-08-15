import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

// Takes a still frame from the camera, crops a small square around the
// crosshair (the "spatial sample aperture"), then shrinks that square down
// to a single pixel. The shrink step acts as a box-filter average across
// the aperture, which is the same effect ColorAssist's spatial slider has.
//
// cameraRef: ref to the expo-camera <CameraView>
// aperture: side length in px of the square region to average (e.g. 3-50)
// targetPos: { x, y } in 0..1 normalized screen-space, default center
export async function sampleFramePixel(cameraRef, aperture = 3, targetPos = { x: 0.5, y: 0.5 }, cameraSize = null) {
  if (!cameraRef?.current) return null;

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.1,
    skipProcessing: false,
    base64: false,
    shutterSound: false,
  });

  if (!photo?.uri || !photo.width || !photo.height) return null;

  let rx = targetPos.x;
  let ry = targetPos.y;

  if (cameraSize) {
    const screenW = cameraSize.width;
    const screenH = cameraSize.height;
    const photoW = photo.width;
    const photoH = photo.height;

    // Cover mode scaling math: maps screen touch coordinates to photo coordinates
    const scale = Math.max(screenW / photoW, screenH / photoH);
    const scaledW = photoW * scale;
    const scaledH = photoH * scale;

    rx = 0.5 + (targetPos.x - 0.5) * (screenW / scaledW);
    ry = 0.5 + (targetPos.y - 0.5) * (screenH / scaledH);

    // Clamp coordinates to 0..1
    rx = Math.min(1, Math.max(0, rx));
    ry = Math.min(1, Math.max(0, ry));
  }

  const cx = Math.round(photo.width * rx);
  const cy = Math.round(photo.height * ry);
  const half = Math.max(1, Math.round(aperture / 2));

  const originX = Math.max(0, cx - half);
  const originY = Math.max(0, cy - half);
  const cropW = Math.min(aperture, photo.width - originX);
  const cropH = Math.min(aperture, photo.height - originY);

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [
      { crop: { originX, originY, width: cropW, height: cropH } },
      { resize: { width: 1, height: 1 } },
    ],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
  );

  if (!result?.base64) return null;

  const buffer = Buffer.from(result.base64, 'base64');
  const png = PNG.sync.read(buffer);
  const r = png.data[0];
  const g = png.data[1];
  const b = png.data[2];

  return { r, g, b };
}

// Rolling average across recent samples - mirrors the "Temporal Sample
// Aperture" (N frames) setting in ColorAssist's Options screen.
export class TemporalBuffer {
  constructor(maxFrames = 10) {
    this.maxFrames = maxFrames;
    this.frames = [];
  }

  setMaxFrames(n) {
    this.maxFrames = n;
    if (this.frames.length > n) {
      this.frames = this.frames.slice(this.frames.length - n);
    }
  }

  push(sample) {
    if (!sample) return this.average();
    this.frames.push(sample);
    if (this.frames.length > this.maxFrames) this.frames.shift();
    return this.average();
  }

  average() {
    if (this.frames.length === 0) return null;
    const sum = this.frames.reduce(
      (acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }),
      { r: 0, g: 0, b: 0 }
    );
    const n = this.frames.length;
    return {
      r: Math.round(sum.r / n),
      g: Math.round(sum.g / n),
      b: Math.round(sum.b / n),
    };
  }

  reset() {
    this.frames = [];
  }
}
