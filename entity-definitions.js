import {S} from './sprite-pool.js';
import {DIRECTION, TYPE} from './entity-properties.js';


export const NAME = {
  burnerDrill: 1,
  woodenChest: 2,
};

export const ENTITIES = new Map([
  [NAME.burnerDrill,
  {
    name: 'Burner drill',
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
  }],
  [NAME.woodenChest,
  {
    name: 'WoodenChest',
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
]);
