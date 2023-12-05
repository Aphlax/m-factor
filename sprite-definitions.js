/*
  y coordinate:
  32: 0
  64: 64
  128: 160
*/

export const SPRITES = [
  {
    path: "graphics/terrain/dirt-1.png",
    sprites: [{
      id: 0,
      mip: mips(0, 0),
    }, {
      id: 1,
      mip: mips(1, 1),
    }, {
      id: 2,
      mip: mips(2, 2),
    }, {
      id: 3,
      mip: mips(3, 3),
    }, {
      id: 4,
      mip: mips(4, 4),
    }, {
      id: 5,
      mip: mips(5, 5),
    }, {
      id: 6,
      mip: mips(6, 6),
    }, {
      id: 7,
      mip: mips(7, 7),
    }, {
      id: 8,
      mip: mips(8, 8),
    }, {
      id: 9,
      mip: mips(9, 9),
    }, {
      id: 10,
      mip: mips(10, 10),
    }, {
      id: 11,
      mip: mips(11, 11),
    }, {
      id: 12,
      mip: mips(12, 12),
    }, {
      id: 13,
      mip: mips(13, 13),
    }, {
      id: 14,
      mip: mips(14, 14),
    }, {
      id: 15,
      mip: mips(15, 15),
    }],
  }
];

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
