

export const S = {
  dirt1: 0,
  dirt2: 1*16,
  dirt3: 2*16,
  dirt4: 3*16,
  dirt5: 4*16,
  dirt6: 5*16,
  dirt7: 6*16,
  dryDirt: 7*16,
  grass1: 8*16,
  grass2: 9*16,
  grass3: 10*16,
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
  stoneFurnaceWorking: 75*16, // 48
  assemblingMachine1: 78*16,
  assemblingMachine1Shadow: 80*16,
  offshorePumpN: 82*16,
  offshorePumpShadowN: 84*16,
  offshorePumpE: 86*16,
  offshorePumpShadowE: 88*16,
  offshorePumpS: 90*16,
  offshorePumpShadowS: 92*16,
  offshorePumpW: 94*16,
  offshorePumpShadowW: 96*16,
  
  woodenChest: 15000,
  woodenChestShadow: 15001,
  inserter: 15002,
  inserterHand: 15006,
  stoneFurnace: 15009,
  lab: 15010,
  labShadow: 15043,
  
  ironOreItem: 16000,
  copperOreItem: 16000 + 1,
  coalItem: 16000 + 2,
  stoneItem: 16000 + 3,
  ironPlateItem: 16000 + 4,
  copperPlateItem: 16000 + 5,
  ironGearItem: 16000 + 6,
  redScienceItem: 16000 + 7,
  
  burnerDrillItem: 16000 + 8,
  woodenChestItem: 16000 + 9,
  transportBeltItem: 16000 + 10,
  inserterItem: 16000 + 11,
  stoneFurnaceItem: 16000 + 12,
  assemblingMachine1Item: 16000 + 13,
  labItem: 16000 + 14,
  
  gearIcon: 16500,
  burnerDrillIcon: 16500 + 1,
  woodenChestIcon: 16500 + 2,
  transportBeltIcon: 16500 + 3,
  inserterIcon: 16500 + 4,
  stoneFurnaceIcon: 16500 + 5,
  assemblingMachine1Icon: 16500 + 6,
  labIcon: 16500 + 7,
  crossIcon: 16500 + 8,
  menuIcon: 16500 + 9,
  windUpIcon: 16500 + 10,
  
  smoke: 17000,
  
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
    sprites: entitySprites(S.stoneFurnaceFire, 20, 49, 8, 6, -22, -23, -13, -2),
  },
  {
    path: "graphics/entities/stone-furnace/stone-furnace-working.png",
    sprites: entitySprites(S.stoneFurnaceWorking, 80, 64, 8, 6, -6, 22, 0, 0),
  },
  {
    path: "graphics/entities/assembling-machine-1/assembling-machine-1.png",
    sprites: entitySprites(S.assemblingMachine1, 108, 114, 8, 4, 6, 6, 6, 12, true),
  },
  {
    path: "graphics/entities/assembling-machine-1/assembling-machine-1-shadow.png",
    sprites: entitySprites(S.assemblingMachine1Shadow, 95, 83, 8, 4, -6, 5, -13, 0, true),
  },
  {
    path: "graphics/entities/lab/lab.png",
    sprites: entitySprites(S.lab, 98, 87, 11, 3, 1, 1, -6, -3, true),
  },
  {
    path: "graphics/entities/lab/lab-shadow.png",
    sprites: entitySprites(S.labShadow, 122, 68, 1, 1, 1, 25, -25, -3, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_North.png",
    sprites: entitySprites(S.offshorePumpN, 60, 84, 8, 4, 17, 11, 12, 8, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_North-shadow.png",
    sprites: entitySprites(S.offshorePumpShadowN, 78, 70, 8, 4, 12, 34, 0, 6, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_East.png",
    sprites: entitySprites(S.offshorePumpE, 69, 56, 8, 4, 6, -1, 12, 12, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_East-shadow.png",
    sprites: entitySprites(S.offshorePumpShadowE, 88, 34, 8, 4, 1, 23, 0, 2, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_West.png",
    sprites: entitySprites(S.offshorePumpW, 69, 56, 8, 4, -1, 6, 8, 16, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_West-shadow.png",
    sprites: entitySprites(S.offshorePumpShadowW, 88, 34, 8, 4, -1, 25, -10, 12, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_South.png",
    sprites: entitySprites(S.offshorePumpS, 56, 78, 8, 4, 14, 10, 4, 10, true),
  },
  {
    path: "graphics/entities/offshore-pump/offshore-pump_South-shadow.png",
    sprites: entitySprites(S.offshorePumpShadowS, 80, 66, 8, 4, 8, 40, -8, 10, true),
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
  {
    path: "graphics/items/copper-plate.png",
    sprites: itemSprites(S.copperPlateItem),
  },
  {
    path: "graphics/items/iron-gear-wheel.png",
    sprites: itemSprites(S.ironGearItem),
  },
  {
    path: "graphics/items/automation-science-pack.png",
    sprites: itemSprites(S.redScienceItem),
  },
  {
    path: "graphics/items/burner-mining-drill.png",
    sprites: itemSprites(S.burnerDrillItem, S.burnerDrillIcon),
  },
  {
    path: "graphics/items/wooden-chest.png",
    sprites: itemSprites(S.woodenChestItem, S.woodenChestIcon),
  },
  {
    path: "graphics/items/transport-belt.png",
    sprites: itemSprites(S.transportBeltItem, S.transportBeltIcon),
  },
  {
    path: "graphics/items/inserter.png",
    sprites: itemSprites(S.inserterItem, S.inserterIcon),
  },
  {
    path: "graphics/items/stone-furnace.png",
    sprites: itemSprites(S.stoneFurnaceItem, S.stoneFurnaceIcon),
  },
  {
    path: "graphics/items/assembling-machine-1.png",
    sprites: itemSprites(S.assemblingMachine1Item, S.assemblingMachine1Icon),
  },
  {
    path: "graphics/items/lab.png",
    sprites: itemSprites(S.labItem, S.labIcon),
  },
  {
    path: "graphics/decoratives/smoke.png",
    sprites: sprites(S.smoke, 152, 120, 5, 12),
  },
  {
    path: "graphics/icons/gear.png",
    sprites: sprites(S.gearIcon, 32, 32, 1, 1),
  },
  {
    path: "graphics/icons/cross.png",
    sprites: sprites(S.crossIcon, 32, 32, 1, 1),
  },
  {
    path: "graphics/icons/menu.png",
    sprites: sprites(S.menuIcon, 32, 32, 1, 1),
  },
  {
    path: "graphics/icons/windUp.png",
    sprites: sprites(S.windUpIcon, 32, 32, 1, 1),
  },
];

function sprites(id, width, height, xCount, yCount) {
  const res = [];
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      res.push({
        id: id + i + j * xCount,
        ...rect(i * width, j * height, width, height),
      });
    }
  }
  return res;
}

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

function itemSprites(id, iconId) {
  return [
    {id, ...rect(64)},
    ...(iconId ? [{id: iconId, ...rect(0, 0, 64, 64)}] : []),
  ];
}

/*
  terrain sprites y coordinate:
  32: 0
  64: 64
  128: 160
*/
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
