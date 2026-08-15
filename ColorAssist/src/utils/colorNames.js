import { colorDistance, hexToRgb } from './colorConversions';
import htmlColors from '../data/htmlColors.json';
import simpleColors from '../data/simpleColors.json';
import crayolaColors from '../data/crayolaColors.json';
import colorNameList from '../data/colorNameList.json';

// Pre-parse hex -> rgb once per list so lookups don't reparse every frame.
function withRgb(list) {
  return list.map((c) => ({ ...c, rgb: hexToRgb(c.hex) }));
}

const LISTS = {
  html: withRgb(htmlColors),
  simple: withRgb(simpleColors),
  crayola: withRgb(crayolaColors),
  general: withRgb(colorNameList),
};

function nearest(r, g, b, list) {
  let best = null;
  let bestDist = Infinity;
  for (const c of list) {
    const d = colorDistance(r, g, b, c.rgb.r, c.rgb.g, c.rgb.b);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best ? best.name : '';
}

export function nearestHtmlColorName(r, g, b) {
  return nearest(r, g, b, LISTS.html);
}

export function nearestSimpleColorName(r, g, b) {
  return nearest(r, g, b, LISTS.simple);
}

export function nearestCrayonName(r, g, b) {
  return nearest(r, g, b, LISTS.crayola);
}

export function nearestColorName(r, g, b) {
  return nearest(r, g, b, LISTS.general);
}
