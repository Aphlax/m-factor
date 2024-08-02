import {S} from './sprite-pool.js';

export const I = {
  ironOre: 1,
  copperOre: 2,
  coal: 3,
  stone: 4,
  ironPlate: 5,
  copperPlate: 6,
  ironGear: 7,
  redScience: 8,
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
    fuelValue: 4000, // kJ
  }],
  [I.stone,
  {
    sprite: S.stoneItem,
    stackSize: 50,
  }],
  [I.ironPlate,
  {
    sprite: S.ironPlateItem,
    stackSize: 100,
  }],
  [I.copperPlate,
  {
    sprite: S.copperPlateItem,
    stackSize: 100,
  }],
  [I.ironGear,
  {
    sprite: S.ironGearItem,
    stackSize: 100,
  }],
  [I.redScience,
  {
    sprite: S.redScienceItem,
    stackSize: 200,
  }],
]);
