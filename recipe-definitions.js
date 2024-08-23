import {I} from './item-definitions.js';
import {NAME} from './entity-definitions.js';

export const RECIPES = [
  {
    prototypeName: "iron-plate",
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
    prototypeName: "copper-plate",
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
    prototypeName: "iron-gear-wheel",
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
    prototypeName: "electronic-circuit",
    inputs: [
      {item: I.copperCable, amount: 3},
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.electronicCircuit, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "copper-cable",
    inputs: [
      {item: I.copperPlate, amount: 1},
    ],
    outputs: [
      {item: I.copperCable, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "automation-science-pack",
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
  {
    prototypeName: "transport-belt",
    inputs: [
      {item: I.ironGear, amount: 1},
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.transportBelt, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "inserter",
    inputs: [
      {item: I.electronicCircuit, amount: 1},
      {item: I.ironGear, amount: 1},
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.inserter, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "wooden-chest",
    inputs: [
      {item: I.wood, amount: 2},
    ],
    outputs: [
      {item: I.woodenChest, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "burner-mining-drill",
    inputs: [
      {item: I.ironGear, amount: 3},
      {item: I.ironPlate, amount: 3},
      {item: I.stoneFurnace, amount: 1},
    ],
    outputs: [
      {item: I.burnerDrill, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 2000,
  },
  {
    prototypeName: "stone-furnace",
    inputs: [
      {item: I.stone, amount: 5},
    ],
    outputs: [
      {item: I.stoneFurnace, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "assembling-machine-1",
    inputs: [
      {item: I.electronicCircuit, amount: 3},
      {item: I.ironGear, amount: 5},
      {item: I.ironPlate, amount: 9},
    ],
    outputs: [
      {item: I.assemblingMachine1, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "lab",
    inputs: [
      {item: I.electronicCircuit, amount: 10},
      {item: I.ironGear, amount: 10},
      {item: I.transportBelt, amount: 4},
    ],
    outputs: [
      {item: I.lab, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 2000,
  },
  {
    prototypeName: "offshore-pump",
    inputs: [
      {item: I.electronicCircuit, amount: 2},
      {item: I.ironGear, amount: 1},
      {item: I.pipe, amount: 1},
    ],
    outputs: [
      {item: I.offshorePump, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "pipe",
    inputs: [
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.pipe, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
];

export const FURNACE_FILTERS = RECIPES
    .filter(r => r.entities.includes(NAME.stoneFurnace))
    .map(r => r.inputs[0])
    .sort((a, b) => b - a);

export const PROTO_TO_RECIPE = new Map(
    RECIPES.map(r => [r.prototypeName, r]));
