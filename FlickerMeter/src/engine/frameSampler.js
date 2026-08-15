import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

export async function sampleBrightness(cameraRef, regionSize = 0.35) {
  if (!cameraRef?.current) return null;

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.1,
    skipProcessing: false,
    base64: false,
  });
  if (!photo?.uri || !photo.width || !photo.height) return null;

  const w = Math.round(photo.width * regionSize);
  const h = Math.round(photo.height * regionSize);
  const originX = Math.round((photo.width - w) / 2);
  const originY = Math.round((photo.height - h) / 2);

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ crop: { originX, originY, width: w, height: h } }, { resize: { width: 10, height: 100 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
  );
  if (!result?.base64) return null;

  const buffer = Buffer.from(result.base64, 'base64');
  const png = PNG.sync.read(buffer);
  
  const samples = [];
  for (let y = 0; y < 100; y++) {
    let rowSum = 0;
    for (let x = 0; x < 10; x++) {
      const idx = (y * 10 + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      rowSum += 0.299 * r + 0.587 * g + 0.114 * b;
    }
    samples.push(rowSum / 10);
  }
  return samples;
}
