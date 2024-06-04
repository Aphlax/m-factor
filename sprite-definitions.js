/*
  terrain sprites y coordinate:
  32: 0
  64: 64
  128: 160
*/

export const S = {
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
  burnerDrillShadowN: 38*16,
  burnerDrillE: 40*16,
  burnerDrillShadowE: 42*16,
  burnerDrillS: 44*16,
  burnerDrillShadowS: 46*16,
  burnerDrillW: 48*16,
  burnerDrillShadowW: 50*16,
  transportBeltE: 52*16,
  transportBeltW: 53*16,
  transportBeltN: 54*16,
  transportBeltS: 55*16,
  transportBeltEN: 56*16,
  transportBeltNE: 57*16,
  transportBeltWN: 58*16,
  transportBeltNW: 59*16,
  transportBeltSE: 60*16,
  transportBeltES: 61*16,
  transportBeltSW: 62*16,
  transportBeltWS: 63*16,
  transportBeltBeginN: 64*16,
  transportBeltEndS: 65*16,
  transportBeltBeginE: 66*16,
  transportBeltEndW: 67*16,
  transportBeltBeginS: 68*16,
  transportBeltEndN: 69*16,
  transportBeltBeginW: 70*16,
  transportBeltEndE: 71*16,
  stoneFurnaceFire: 72*16, // 48
  
  woodenChest: 1600,
  woodenChestShadow: 1601,
  inserter: 1602,
  inserterHand: 1606,
  stoneFurnace: 1609,
  stoneFurnaceWorking: 1610, // 48
  
  ironOreItem: 1000*16,
  copperOreItem: 1000*16 + 1,
  coalItem: 1000*16 + 2,
  stoneItem: 1000*16 + 3,
  ironPlateItem: 16000 + 4,
};

export const SPRITES = [
  {
    path: "graphics/terrain/dirt-1.png",
    sprites: terrainSprites(S.dirt1, 16),
  },
  {
    path: "graphics/terrain/dirt-2.png",
    sprites: terrainSprites(16, 16),
  },
  {
    path: "graphics/terrain/dirt-3.png",
    sprites: terrainSprites(32, 16),
  },
  {
    path: "graphics/terrain/dirt-4.png",
    sprites: terrainSprites(48, 16),
  },
  {
    path: "graphics/terrain/dirt-5.png",
    sprites: terrainSprites(64, 16),
  },
  {
    path: "graphics/terrain/dirt-6.png",
    sprites: terrainSprites(80, 16),
  },
  {
    path: "graphics/terrain/dirt-7.png",
    sprites: terrainSprites(96, 16),
  },
  {
    path: "graphics/terrain/dry-dirt.png",
    sprites: terrainSprites(112, 16),
  },
  {
    path: "graphics/terrain/grass-1.png",
    sprites: terrainSprites(128, 16),
  },
  {
    path: "graphics/terrain/grass-2.png",
    sprites: terrainSprites(144, 16),
  },
  {
    path: "graphics/terrain/grass-3.png",
    sprites: terrainSprites(160, 16),
  },
  {
    path: "graphics/terrain/grass-4.png",
    sprites: terrainSprites(176, 16),
  },
  {
    path: "graphics/terrain/sand-1.png",
    sprites: terrainSprites(192, 16),
  },
  {
    path: "graphics/terrain/sand-2.png",
    sprites: terrainSprites(208, 16),
  },
  {
    path: "graphics/terrain/sand-3.png",
    sprites: terrainSprites(224, 16),
  },
  {
    path: "graphics/terrain/red-desert-0.png",
    sprites: terrainSprites(240, 16),
  },
  {
    path: "graphics/terrain/red-desert-1.png",
    sprites: terrainSprites(256, 16),
  },
  {
    path: "graphics/terrain/red-desert-2.png",
    sprites: terrainSprites(17 * 16, 16),
  },
  {
    path: "graphics/terrain/red-desert-3.png",
    sprites: terrainSprites(18 * 16, 16),
  },
  {
    path: "graphics/terrain/water1.png",
    sprites: waterSprites(19 * 16, 8),
  },
  {
    path: "graphics/terrain/deepwater1.png",
    sprites: waterSprites(19.5 * 16, 8),
  },
  {
    path: "graphics/resources/iron-ore.png",
    sprites: resourceSprites(20 * 16, 8, 8),
  },
  {
    path: "graphics/resources/copper-ore.png",
    sprites: resourceSprites(24 * 16, 8, 8),
  },
  {
    path: "graphics/resources/coal.png",
    sprites: resourceSprites(28 * 16, 8, 8),
  },
  {
    path: "graphics/resources/stone.png",
    sprites: resourceSprites(32 * 16, 8, 8),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-N.png",
    sprites: entitySprites(36 * 16, 87, 95, 4, 8, 12, 11, 18, 13),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-N-shadow.png",
    sprites: entitySprites(38 * 16, 109, 76, 4, 8, 0, 45, 11, 1),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-E.png",
    sprites: entitySprites(40 * 16, 93, 84, 4, 8, 12, 17, 9, 11),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-E-shadow.png",
    sprites: entitySprites(42 * 16, 93, 65, 4, 8, 3, 26, 0, 1),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-S.png",
    sprites: entitySprites(44 * 16, 87, 87, 4, 8, 11, 12, 12, 11),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-S-shadow.png",
    sprites: entitySprites(46 * 16, 88, 69, 4, 8, 3, 21, 1, 4),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-W.png",
    sprites: entitySprites(48 * 16, 91, 88, 4, 8, 15, 12, 12, 12),
  },
  {
    path: "graphics/entities/burner-mining-drill/burner-mining-drill-W-shadow.png",
    sprites: entitySprites(50 * 16, 89, 66, 4, 8, 5, 20, 0, 2),
  },
  {
    path: "graphics/entities/transport-belt/transport-belt.png",
    sprites: entitySprites(S.transportBeltE, 64, 64, 16, 20, 16, 16, 16, 16, true),
  },
  {
    path: "graphics/entities/wooden-chest/wooden-chest.png",
    sprites: entitySprites(S.woodenChest, 32, 37, 1, 1, 0, 0, 4, 1),
  },
  {
    path: "graphics/entities/wooden-chest/wooden-chest-shadow.png",
    sprites: entitySprites(S.woodenChestShadow, 52, 20, 1, 1, 0, 20, -13, 1),
  },
  {
    path: "graphics/entities/inserter/inserter-platform.png",
    sprites: entitySprites(S.inserter, 46, 46, 4, 1, 5, 9, 5, 9),
  },
  {
    path: "graphics/entities/inserter/inserter-hand-base.png",
    sprites: entitySprites(S.inserterHand, 8, 32, 1, 1, -12, -12, 0, 0),
  },
  {
    path: "graphics/entities/inserter/inserter-hand-open.png",
    sprites: entitySprites(S.inserterHand + 1, 18, 44, 1, 1, -7, -7, 0, 12),
  },
  {
    path: "graphics/entities/inserter/inserter-hand-closed.png",
    sprites: entitySprites(S.inserterHand + 2, 18, 44, 1, 1, -7, -7, 0, 12),
  },
  {
    path: "graphics/entities/stone-furnace/stone-furnace.png",
    sprites: entitySprites(S.stoneFurnace, 80, 64, 1, 1, -6, 22, 0, 0),
  },
  {
    path: "graphics/entities/stone-furnace/stone-furnace-fire.png",
    sprites: entitySprites(S.stoneFurnaceFire, 20, 49, 8, 6, -22, -23, -7, -8),
  },
  {
    path: "graphics/entities/stone-furnace/stone-furnace-working.png",
    sprites: entitySprites(S.stoneFurnaceWorking, 80, 64, 8, 6, -6, 22, 0, 0),
  },
  {
    path: "graphics/items/iron-ore.png",
    sprites: itemSprites(S.ironOreItem),
  },
  {
    path: "graphics/items/copper-ore.png",
    sprites: itemSprites(S.copperOreItem),
  },
  {
    path: "graphics/items/coal.png",
    sprites: itemSprites(S.coalItem),
  },
  {
    path: "graphics/items/stone.png",
    sprites: itemSprites(S.stoneItem),
  },
  {
    path: "graphics/items/iron-plate.png",
    sprites: itemSprites(S.ironPlateItem),
  },
];

function entitySprites(id, width, height, xCount, yCount,
                       left, right, top, bottom, flipXY) {
  const res = [];
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      res.push({
        id: id + (flipXY ? j * xCount + i : i * yCount + j),
        ...rect(i * width, j * height, width, height),
        left, right, top, bottom,
      });
    }
  }
  return res;
}

function itemSprites(id) {
  return [{id: id, ...rect(64)}];
}


function terrainSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, ...rect(i * 32)});
  }
  return res;
}

function waterSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, ...rect(i * 32)});
  }
  return res;
}

function resourceSprites(id, variations, count) {
  const res = [];
  for (let i = 0; i < variations; i++) {
    for (let j = 0; j < count; j++) {
      res.push({
        id: id + i * count + j,
        x: 8 + i * 64,
        y: 8 + 64 * (count - 1) - j * 64,
        width: 48,
        height: 48,
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
