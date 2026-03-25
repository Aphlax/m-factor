import {I} from './item-definitions.js';
import {NAME} from './entity-properties.js';
import {S} from './sprite-pool.js';

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
    prototypeName: "basic-oil-processing",
    inputs: [
      {item: I.crudeOil, amount: 100},
    ],
    outputs: [
      {item: I.petroleumGas, amount: 45},
    ],
    entities: [NAME.oilRefinery],
    duration: 5000,
    sprite: S.basicOilProcessingRecipe,
  },
  {
    prototypeName: "plastic-bar",
    inputs: [
      {item: I.coal, amount: 1},
      {item: I.petroleumGas, amount: 20},
    ],
    outputs: [
      {item: I.plasticBar, amount: 2},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
  },
  {
    prototypeName: "advanced-circuit",
    inputs: [
      {item: I.copperCable, amount: 4},
      {item: I.electronicCircuit, amount: 2},
      {item: I.plasticBar, amount: 2},
    ],
    outputs: [
      {item: I.advancedCircuit, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 6000,
  },
  {
    prototypeName: "advanced-oil-processing",
    inputs: [
      {item: I.crudeOil, amount: 100},
      {item: I.water, amount: 50},
    ],
    outputs: [
      {item: I.heavyOil, amount: 25},
      {item: I.lightOil, amount: 45},
      {item: I.petroleumGas, amount: 55},
    ],
    entities: [NAME.oilRefinery],
    duration: 5000,
    sprite: S.advancedOilProcessingRecipe,
  },
  {
    prototypeName: "heavy-oil-cracking",
    inputs: [
      {item: I.heavyOil, amount: 40},
      {item: I.water, amount: 30},
    ],
    outputs: [
      {item: I.lightOil, amount: 30},
    ],
    entities: [NAME.chemicalPlant],
    duration: 2000,
    sprite: S.heavyOilCrackingRecipe,
  },
  {
    prototypeName: "light-oil-cracking",
    inputs: [
      {item: I.lightOil, amount: 30},
      {item: I.water, amount: 30},
    ],
    outputs: [
      {item: I.petroleumGas, amount: 20},
    ],
    entities: [NAME.chemicalPlant],
    duration: 2000,
    sprite: S.lightOilCrackingRecipe,
  },
  {
    prototypeName: "coal-liquefaction",
    inputs: [
      {item: I.coal, amount: 10},
      {item: I.heavyOil, amount: 25},
      {item: I.steam, amount: 50},
    ],
    outputs: [
      {item: I.heavyOil, amount: 90},
      {item: I.lightOil, amount: 20},
      {item: I.petroleumGas, amount: 10},
    ],
    entities: [NAME.oilRefinery],
    duration: 5000,
    sprite: S.coalLiquefactionRecipe,
  },
  {
    prototypeName: "sulfur",
    inputs: [
      {item: I.water, amount: 30},
      {item: I.petroleumGas, amount: 30},
    ],
    outputs: [
      {item: I.sulfur, amount: 2},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
  },
  {
    prototypeName: "solid-fuel-from-heavy-oil",
    inputs: [
      {item: I.heavyOil, amount: 20},
    ],
    outputs: [
      {item: I.solidFuel, amount: 1},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
    sprite: S.solidFuelFromHeavyOilRecipe,
  },
  {
    prototypeName: "solid-fuel-from-light-oil",
    inputs: [
      {item: I.lightOil, amount: 10},
    ],
    outputs: [
      {item: I.solidFuel, amount: 1},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
    sprite: S.solidFuelFromLightOilRecipe,
  },
  {
    prototypeName: "solid-fuel-from-petroleum-gas",
    inputs: [
      {item: I.petroleumGas, amount: 20},
    ],
    outputs: [
      {item: I.solidFuel, amount: 1},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
    sprite: S.solidFuelFromPetroleumGasRecipe,
  },
  {
    prototypeName: "battery",
    inputs: [
      {item: I.ironPlate, amount: 1},
      {item: I.copperPlate, amount: 1},
      {item: I.sulfuricAcid, amount: 20},
    ],
    outputs: [
      {item: I.battery, amount: 1},
    ],
    entities: [NAME.chemicalPlant],
    duration: 4000,
  },
  {
    prototypeName: "explosives",
    inputs: [
      {item: I.coal, amount: 1},
      {item: I.sulfur, amount: 1},
      {item: I.water, amount: 10},
    ],
    outputs: [
      {item: I.explosives, amount: 2},
    ],
    entities: [NAME.chemicalPlant],
    duration: 4000,
  },
  {
    prototypeName: "sulfuric-acid",
    inputs: [
      {item: I.ironPlate, amount: 1},
      {item: I.sulfur, amount: 5},
      {item: I.water, amount: 100},
    ],
    outputs: [
      {item: I.sulfuricAcid, amount: 50},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
  },
  {
    prototypeName: "lubricant",
    inputs: [
      {item: I.heavyOil, amount: 10},
    ],
    outputs: [
      {item: I.lubricant, amount: 10},
    ],
    entities: [NAME.chemicalPlant],
    duration: 1000,
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
    prototypeName: "oil-refinery",
    inputs: [
      {item: I.electronicCircuit, amount: 10},
      {item: I.ironGear, amount: 10},
      {item: I.pipe, amount: 10},
      {item: I.steelPlate, amount: 15},
    ],
    outputs: [
      {item: I.oilRefinery, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 8000,
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
