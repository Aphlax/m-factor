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
  {
    inputs: [
      {item: I.copperOre, amount: 1},
    ],
    outputs: [
      {item: I.copperPlate, amount: 1},
    ],
    entity: TYPE.furnace,
    duration: 3200,
  },
  {
    inputs: [
      {item: I.ironPlate, amount: 2},
    ],
    outputs: [
      {item: I.ironGear, amount: 1},
    ],
    entity: TYPE.assembler,
    duration: 500,
  },
];

export const FURNACE_FILTERS = RECIPES
    .filter(r => r.entity == TYPE.furnace)
    .map(r => r.inputs[0])
    .sort((a, b) => b - a);
