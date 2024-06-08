import {I} from './item-definitions.js';
import {NAME} from './entity-definitions.js';

export const RECIPES = [
  {
    inputs: [
      {item: I.ironOre, amount: 1},
    ],
    outputs: [
      {item: I.ironPlate, amount: 1},
    ],
    entities: [NAME.stoneFurnace],
    duration: 3200,
  },
  {
    inputs: [
      {item: I.copperOre, amount: 1},
    ],
    outputs: [
      {item: I.copperPlate, amount: 1},
    ],
    entities: [NAME.stoneFurnace],
    duration: 3200,
  },
  {
    inputs: [
      {item: I.ironPlate, amount: 2},
    ],
    outputs: [
      {item: I.ironGear, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    inputs: [
      {item: I.ironGear, amount: 1},
      {item: I.copperPlate, amount: 1},
    ],
    outputs: [
      {item: I.redScience, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 5000,
  },
];

export const FURNACE_FILTERS = RECIPES
    .filter(r => r.entities.includes(NAME.stoneFurnace))
    .map(r => r.inputs[0])
    .sort((a, b) => b - a);
