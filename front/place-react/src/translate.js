const colorNumberMap = {
  "#ffffff":0,
  "#E4E4E4":1,
  "#888888":2,
  "#222222":3,
  "#FFA7D1":4,
  "#E50000":5,
  "#E59500":6,
  "#A06A42":7,
  "#E5D900":8,
  "#94E044":9,
  "#02BE01":10,
  "#00D3DD":11,
  "#0083C7":12,
  "#0000EA":13,
  "#CF6EE4":14,
  "#820080":15,
};
  
  const numberColorMap = {};
  Object.entries(colorNumberMap).forEach(([key, value]) => {
    numberColorMap[value] = key;
  });
  
  export function translatecolorToNumber(str) {
    return colorNumberMap[str] !== undefined ? colorNumberMap[str] : -1;
  }
  
  export function translateNumberTocolor(num) {
    if (numberColorMap.hasOwnProperty(num)) {
      return numberColorMap[num];
    } else {
      return undefined;
    }
  }
  