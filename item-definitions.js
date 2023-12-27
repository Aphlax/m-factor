import {S} from './sprite-pool.js';

export const I = {
  ironOre: 1,
  copperOre: 2,
  coal: 3,
  stone: 4,
};

export const ITEMS = new Map([
  [I.ironOre,
  {
    sprite: S.ironOreItem,
    stackSize: 50,
  }],
  [I.copperOre,
  {
    sprite: S.copperOreItem,
    stackSize: 50,
  }],
  [I.coal,
  {
    sprite: S.coalItem,
    stackSize: 50,
  }],
  [I.stone,
  {
    sprite: S.stoneItem,
    stackSize: 50,
  }],
]);