import * as ImageManipulator from 'expo-image-manipulator';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

export async function sampleAveragedRegion(cameraRef, regionSize = 0.35) {
  if (!cameraRef?.current) return null;

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.1,
    skipProcessing: false,
    base64: false,
    shutterSound: false,
  });
  if (!photo?.uri || !photo.width || !photo.height) return null;

  const w = Math.round(photo.width * regionSize);
  const h = Math.round(photo.height * regionSize);
  const originX = Math.round((photo.width - w) / 2);
  const originY = Math.round((photo.height - h) / 2);

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ crop: { originX, originY, width: w, height: h } }, { resize: { width: 1, height: 1 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
  );
  if (!result?.base64) return null;

  const buffer = Buffer.from(result.base64, 'base64');
  const png = PNG.sync.read(buffer);
  return { r: png.data[0], g: png.data[1], b: png.data[2] };
}
