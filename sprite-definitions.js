/*
  terrain sprites y coordinate:
  32: 0
  64: 64
  128: 160
*/

export const NAMES = {
  dirt1: 0,
  dirt2: 16,
  dirt3: 32,
  dirt4: 48,
  dirt5: 64,
  dirt6: 80,
  dirt7: 96,
  dryDirt: 112,
  grass1: 128,
  grass2: 144,
  grass3: 160,
  grass4: 11*16,
  sand1: 12*16,
  sand2: 13*16,
  sand3: 14*16,
  redDesert0: 15*16,
  redDesert1: 16*16,
  redDesert2: 17*16,
  redDesert3: 18*16,
  water: 19*16,
  deepWater: 19.5*16,
  ironOre: 20*16,
  copperOre: 24*16,
  coal: 28*16,
  stone: 32*16,
  burnerDrillN: 36*16,
  burnerDrillE: 38*16,
  burnerDrillS: 40*16,
  burnerDrillW: 42*16,
};

export const SPRITES = [
  {
    path: "graphics/terrain/dirt-1.png",
    sprites: terrainSprites(0, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-2.png",
    sprites: terrainSprites(16, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-3.png",
    sprites: terrainSprites(32, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-4.png",
    sprites: terrainSprites(48, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-5.png",
    sprites: terrainSprites(64, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-6.png",
    sprites: terrainSprites(80, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dirt-7.png",
    sprites: terrainSprites(96, 16), mips: 3,
  },
  {
    path: "graphics/terrain/dry-dirt.png",
    sprites: terrainSprites(112, 16), mips: 3,
  },
  {
    path: "graphics/terrain/grass-1.png",
    sprites: terrainSprites(128, 16), mips: 3,
  },
  {
    path: "graphics/terrain/grass-2.png",
    sprites: terrainSprites(144, 16), mips: 3,
  },
  {
    path: "graphics/terrain/grass-3.png",
    sprites: terrainSprites(160, 16), mips: 3,
  },
  {
    path: "graphics/terrain/grass-4.png",
    sprites: terrainSprites(176, 16), mips: 3,
  },
  {
    path: "graphics/terrain/sand-1.png",
    sprites: terrainSprites(192, 16), mips: 3,
  },
  {
    path: "graphics/terrain/sand-2.png",
    sprites: terrainSprites(208, 16), mips: 3,
  },
  {
    path: "graphics/terrain/sand-3.png",
    sprites: terrainSprites(224, 16), mips: 3,
  },
  {
    path: "graphics/terrain/red-desert-0.png",
    sprites: terrainSprites(240, 16), mips: 3,
  },
  {
    path: "graphics/terrain/red-desert-1.png",
    sprites: terrainSprites(256, 16), mips: 3,
  },
  {
    path: "graphics/terrain/red-desert-2.png",
    sprites: terrainSprites(17 * 16, 16), mips: 3,
  },
  {
    path: "graphics/terrain/red-desert-3.png",
    sprites: terrainSprites(18 * 16, 16), mips: 3,
  },
  {
    path: "graphics/terrain/water1.png",
    sprites: waterSprites(19 * 16, 8), mips: 3,
  },
  {
    path: "graphics/terrain/deepwater1.png",
    sprites: waterSprites(19.5 * 16, 8), mips: 3,
  },
  {
    path: "graphics/resources/iron-ore.png",
    sprites: resourceSprites(20 * 16, 8, 8), mips: 1,
  },
  {
    path: "graphics/resources/copper-ore.png",
    sprites: resourceSprites(24 * 16, 8, 8), mips: 1,
  },
  {
    path: "graphics/resources/coal.png",
    sprites: resourceSprites(28 * 16, 8, 8), mips: 1,
  },
  {
    path: "graphics/resources/stone.png",
    sprites: resourceSprites(32 * 16, 8, 8), mips: 1,
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-N.png",
    sprites: entitySprites(36 * 16, 87, 95, 4, 8, 4, 4, 4, 6), mips: 1,
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-E.png",
    sprites: entitySprites(38 * 16, 93, 84, 4, 8, 7, 7, 0, 6), mips: 1,
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-S.png",
    sprites: entitySprites(40 * 16, 87, 87, 4, 8, 3, 3, 2, 4), mips: 1,
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-W.png",
    sprites: entitySprites(42 * 16, 91, 88, 4, 8, 6, 6, 2, 6), mips: 1,
  },
];

function entitySprites(id, width, height, xCount, yCount,
                       trimLeft, trimRight, trimTop, trimBottom) {
  const res = [];
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      res.push({
        id: id + i * yCount + j,
        rect: rect(i * width + (trimLeft ?? 0),
            j* height + (trimTop ?? 0),
            width - (trimLeft ?? 0) - (trimRight ?? 0),
            height - (trimTop ?? 0) - (trimBottom ?? 0)),
      });
    }
  }
  return res;
}

function terrainSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, rect: rect(i * 32)});
  }
  return res;
}

function waterSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, rect: rect(i * 32)});
  }
  return res;
}

function resourceSprites(id, variations, count) {
  const res = [];
  for (let i = 0; i < variations; i++) {
    for (let j = 0; j < count; j++) {
      res.push({
        id: id + i * count + j,
        rect: {
          x: 8 + i * 64,
          y: 8 + 64 * (count - 1) - j * 64,
          width: 48,
          height: 48,
        }
      });
    }
  }
  return res;
}

function rect(x, y, width, height) {
  return {
      x: x ?? 0,
      y: y ?? 0,
      width: width ?? 32,
      height: height ?? 32,
    };
}
