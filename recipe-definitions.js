import {I} from './item-definitions.js';
import {TYPE} from './entity-properties.js';

export const RECIPES = [
  {
    inputs: [
      {item: I.ironOre, amount: 1},
    ],
    outputs: [
      {item: I.ironPlate, amount: 1},
    ],
    entity: TYPE.furnace,
    duration: 3200,
  },
];

export const FURNACE_FILTERS = RECIPES
    .filter(r => r.entity == TYPE.furnace)
    .map(r => r.inputs[0])
    .sort((a, b) => b - a);
