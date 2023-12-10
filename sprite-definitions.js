/*
  y coordinate:
  32: 0
  64: 64
  128: 160
*/

export const SPRITES = [
  {
    path: "graphics/terrain/dirt-1.png",
    sprites: sprites(0, 16),
  },
  {
    path: "graphics/terrain/dirt-2.png",
    sprites: sprites(16, 16),
  },
  {
    path: "graphics/terrain/dirt-3.png",
    sprites: sprites(32, 16),
  },
  {
    path: "graphics/terrain/dirt-4.png",
    sprites: sprites(48, 16),
  },
  {
    path: "graphics/terrain/dirt-5.png",
    sprites: sprites(64, 16),
  },
  {
    path: "graphics/terrain/dirt-6.png",
    sprites: sprites(80, 16),
  },
  {
    path: "graphics/terrain/dirt-7.png",
    sprites: sprites(96, 16),
  },
  {
    path: "graphics/terrain/dry-dirt.png",
    sprites: sprites(112, 16),
  },
  {
    path: "graphics/terrain/grass-1.png",
    sprites: sprites(128, 16),
  },
  {
    path: "graphics/terrain/grass-2.png",
    sprites: sprites(144, 16),
  },
];

function sprites(id, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({id: id + i, mip: mips(i, i)});
  }
  return res;
}

function mips(a, b) {
  return [{
      x: a * 32,
      y: 0,
      width: 32,
      height: 32,
    }, {
      x: b * 64,
      y: 64,
      width: 64,
      height: 64,
    }];
}
