import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rgbToHex, rgbToHsl, rgbToRyb, rgbToCmyk, rgbToRainbow7 } from '../utils/colorConversions';
import {
  nearestHtmlColorName,
  nearestColorName,
  nearestCrayonName,
  nearestSimpleColorName,
} from '../utils/colorNames';

// rgb: { r, g, b } | null   outputs: settings.outputs toggle map
export default function ColorInfoPanel({ rgb, outputs }) {
  if (!rgb) return null;
  const { r, g, b } = rgb;
  const hsl = rgbToHsl(r, g, b);
  const ryb = rgbToRyb(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const hex = rgbToHex(r, g, b);
  const rb = rgbToRainbow7(r, g, b);

  return (
    <View style={styles.row}>
      {outputs.swatch && <View style={[styles.swatch, { backgroundColor: hex }]} />}
      <View style={styles.textBlock}>
        {outputs.rgb && <Text style={styles.line}>RGB   {r}   {g}   {b}</Text>}
        {outputs.hsl && <Text style={styles.line}>HSL   {hsl.h}°  {hsl.s}%  {hsl.l}%</Text>}
        {outputs.ryb && <Text style={styles.line}>RYB   {ryb.r}%  {ryb.y}%  {ryb.b}%</Text>}
        {outputs.cmyk && <Text style={styles.line}>CMYK  {cmyk.c}  {cmyk.m}  {cmyk.y}  {cmyk.k}</Text>}
        {outputs.htmlHex && <Text style={styles.line}>HTML: {hex}</Text>}
        {outputs.htmlName && <Text style={styles.nameLine}>{nearestHtmlColorName(r, g, b)}</Text>}
        {outputs.colorName && <Text style={styles.nameLine}>{nearestColorName(r, g, b)}</Text>}
        {outputs.crayonName && <Text style={styles.nameLine}>{nearestCrayonName(r, g, b)}</Text>}
        {outputs.simpleName && <Text style={styles.nameLine}>{nearestSimpleColorName(r, g, b)}</Text>}
        {outputs.rainbow7 && (
          <Text style={styles.line}>
            R{rb.r}% O{rb.o}% Y{rb.y}% G{rb.g}% B{rb.b}% I{rb.i}% V{rb.v}%
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  swatch: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  textBlock: { flex: 1 },
  line: {
    color: '#FFFFFF',
    fontFamily: 'Menlo, Courier',
    fontSize: 15,
    lineHeight: 20,
  },
  nameLine: {
    color: '#FFFFFF',
    fontFamily: 'Menlo, Courier',
    fontSize: 15,
    lineHeight: 20,
  },
});
