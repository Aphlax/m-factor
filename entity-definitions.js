import {S} from './sprite-pool.js';
import {DIRECTION, TYPE} from './entity-properties.js';


export const NAME = {
  burnerDrill: 1,
  woodenChest: 2,
  transportBelt: 3,
};

export const ENTITIES = new Map([
  [NAME.burnerDrill,
  {
    label: 'Wind up drill',
    type: TYPE.mine,
    width: 2,
    height: 2,
    sprites: {
      [DIRECTION.north]: [S.burnerDrillN, S.burnerDrillShadowN],
      [DIRECTION.east]: [S.burnerDrillE, S.burnerDrillShadowE],
      [DIRECTION.south]: [S.burnerDrillS, S.burnerDrillShadowS],
      [DIRECTION.west]: [S.burnerDrillW, S.burnerDrillShadowW],
    },
    animationLength: 32,
    
    mineOutput: {
      [DIRECTION.north]: {x: 0, y: -1},
      [DIRECTION.east]: {x: 2, y: 0},
      [DIRECTION.south]: {x: 1, y: 2},
      [DIRECTION.west]: {x: -1, y: 1},
    },
  }],
  [NAME.woodenChest,
  {
    label: 'Wooden chest',
    type: TYPE.chest,
    width: 1,
    height: 1,
    sprites: {
      [DIRECTION.north]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.east]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.south]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.west]: [S.woodenChest, S.woodenChestShadow],
    },
    animationLength: 0,
    
    capacity: 8,
  }],
  [NAME.transportBelt,
  {
    label: 'Transport belt',
    type: TYPE.belt,
    width: 1,
    height: 1,
    sprites: {
      [DIRECTION.north]: [S.transportBeltN],
      [DIRECTION.east]: [S.transportBeltE],
      [DIRECTION.south]: [S.transportBeltS],
      [DIRECTION.west]: [S.transportBeltW],
    },
    animationLength: 16,
    animationSpeed: 1.925,
    
    beltSpeed: 1.875,
    beltSprites: {
      [DIRECTION.north]: [S.transportBeltN, S.transportBeltEN, S.transportBeltWN],
      [DIRECTION.east]: [S.transportBeltE, S.transportBeltSE, S.transportBeltNE],
      [DIRECTION.south]: [S.transportBeltS, S.transportBeltWS, S.transportBeltES],
      [DIRECTION.west]: [S.transportBeltW, S.transportBeltNW, S.transportBeltSW],
    },
    beltEndSprites: {
      [DIRECTION.north]: [S.transportBeltBeginN, S.transportBeltEndN, S.transportBeltEndW, S.transportBeltEndE],
      [DIRECTION.east]: [S.transportBeltBeginE, S.transportBeltEndE, S.transportBeltEndN, S.transportBeltEndS],
      [DIRECTION.south]: [S.transportBeltBeginS, S.transportBeltEndS, S.transportBeltEndE, S.transportBeltEndW],
      [DIRECTION.west]: [S.transportBeltBeginW, S.transportBeltEndW, S.transportBeltEndS, S.transportBeltEndN],
    },
  }],
]);
