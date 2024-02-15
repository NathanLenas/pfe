const colorNumberMap = {
    "#ffffff":0,
    "#d4d7d9":1,
    "#898d90":2,
    "#515252":3,
    "#000000":4,
    "#ffb470":5,
    "#9c6926":6,
    "#6d482f":7,
    "#ff99aa":8,
    "#ff3881":9,
    "#de107f":10,
    "#e4abff":11,
    "#b44ac0":12,
    "#811e9f":13,
    "#94b3ff":14,
    "#6a5cff":15,
    "#493ac1":16,
    "#51e9f4":17,
    "#3690ea":18,
    "#2450a4":19,
    "#00ccc0":20,
    "#009eaa":21,
    "#00756f":22,
    "#7eed56":23,
    "#00cc78":24,
    "#00a368":25,
    "#fff8b8":26,
    "#ffd635":27,
    "#ffa800":28,
    "#ff4500":29,
    "#be0039":30,
    "#6d001a":31,

  };
  
  const numberColorMap = {};
  Object.entries(colorNumberMap).forEach(([key, value]) => {
    numberColorMap[value] = key;
  });
  
  export function translatecolorToNumber(str) {
    return colorNumberMap[str] !== undefined ? colorNumberMap[str] : -1;
  }
  
  export function translateNumberTocolor(num) {
    return numberColorMap[num] !== undefined ? numberColorMap[num] : "Unknown";
  }
  