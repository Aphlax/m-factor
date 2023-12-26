import {S} from './sprite-pool.js';
import {DIRECTION, TYPE} from './entity-properties.js';


export const NAME = {
  burnerDrill: 1,
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
]);
