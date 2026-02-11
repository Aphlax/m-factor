import {I} from './item-definitions.js';
import {NAME} from './entity-properties.js';

export const RECIPES = [
  {
    prototypeName: "iron-plate",
    inputs: [
      {item: I.ironOre, amount: 1},
    ],
    outputs: [
      {item: I.ironPlate, amount: 1},
    ],
    entities: [NAME.stoneFurnace, NAME.electricFurnace],
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
    entities: [NAME.stoneFurnace, NAME.electricFurnace],
    duration: 3200,
  },
  {
    prototypeName: "steel-plate",
    inputs: [
      {item: I.ironPlate, amount: 5},
    ],
    outputs: [
      {item: I.steelPlate, amount: 1},
    ],
    entities: [NAME.stoneFurnace, NAME.electricFurnace],
    duration: 16000,
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
  {
    prototypeName: "boiler",
    inputs: [
      {item: I.pipe, amount: 4},
      {item: I.stoneFurnace, amount: 1},
    ],
    outputs: [
      {item: I.boiler, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "steam-engine",
    inputs: [
      {item: I.ironGear, amount: 8},
      {item: I.ironPlate, amount: 10},
      {item: I.pipe, amount: 5},
    ],
    outputs: [
      {item: I.steamEngine, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "small-electric-pole",
    inputs: [
      {item: I.copperCable, amount: 2},
      {item: I.wood, amount: 1},
    ],
    outputs: [
      {item: I.smallElectricPole, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "underground-belt",
    inputs: [
      {item: I.transportBelt, amount: 5},
      {item: I.ironPlate, amount: 10},
    ],
    outputs: [
      {item: I.undergroundBelt, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 1000,
  },
  {
    prototypeName: "pipe-to-ground",
    inputs: [
      {item: I.pipe, amount: 10},
      {item: I.ironPlate, amount: 5},
    ],
    outputs: [
      {item: I.pipeToGround, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "splitter",
    inputs: [
      {item: I.electronicCircuit, amount: 5},
      {item: I.ironPlate, amount: 5},
      {item: I.transportBelt, amount: 4},
    ],
    outputs: [
      {item: I.splitter, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 1000,
  },
  {
    prototypeName: "burner-inserter",
    inputs: [
      {item: I.ironGear, amount: 1},
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.burnerInserter, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "fast-inserter",
    inputs: [
      {item: I.electronicCircuit, amount: 2},
      {item: I.inserter, amount: 1},
      {item: I.ironPlate, amount: 2},
    ],
    outputs: [
      {item: I.fastInserter, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "long-handed-inserter",
    inputs: [
      {item: I.inserter, amount: 1},
      {item: I.ironGear, amount: 1},
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.longHandedInserter, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "pumpjack",
    inputs: [
      {item: I.electronicCircuit, amount: 5},
      {item: I.ironGear, amount: 10},
      {item: I.pipe, amount: 10},
      {item: I.steelPlate, amount: 5},
    ],
    outputs: [
      {item: I.pumpjack, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 5000,
  },
  
  
  {
    prototypeName: "water-pumping",
    inputs: [],
    outputs: [
      {item: I.water, amount: 1200 / 6},
    ],
    entities: [NAME.offshorePump],
    duration: 1000 / 6,
  },
  {
    prototypeName: "steam",
    inputs: [
      {item: I.water, amount: 6 / 6},
    ],
    outputs: [
      {item: I.steam, amount: 60 / 6},
    ],
    entities: [NAME.boiler],
    duration: 1000 / 6,
  },
];

export const FURNACE_FILTERS = RECIPES
    .filter(r => r.entities.includes(NAME.stoneFurnace))
    .map(r => r.inputs[0])
    .sort((a, b) => b - a);

export const WATER_PUMPING_RECIPE = RECIPES
    .find(r => r.entities.includes(NAME.offshorePump));
export const BOILER_RECIPE = RECIPES
    .find(r => r.entities.includes(NAME.boiler));

export const PROTO_TO_RECIPE = new Map(
    RECIPES.map(r => [r.prototypeName, r]));
