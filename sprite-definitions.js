/*
  terrain sprites y coordinate:
  32: 0
  64: 64
  128: 160
*/

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
];

function terrainSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, rect: rect(i)});
  }
  return res;
}

function waterSprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, rect: rect(i)});
  }
  return res;
}

function rect(a) {
  return {
      x: a * 32,
      y: 0,
      width: 32,
      height: 32,
    };
}
