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
      [DIRECTION.north]: S.burnerDrillN,
      [DIRECTION.east]: S.burnerDrillE,
      [DIRECTION.south]: S.burnerDrillS,
      [DIRECTION.west]: S.burnerDrillW,
    },
    animationLength: 32,
  }],
]);
