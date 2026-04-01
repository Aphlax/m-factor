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
    entities: [NAME.stoneFurnace, NAME.steelFurnace, NAME.electricFurnace],
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
    entities: [NAME.stoneFurnace, NAME.steelFurnace, NAME.electricFurnace],
    duration: 3200,
  },
  {
    prototypeName: "stone-brick",
    inputs: [
      {item: I.stone, amount: 2},
    ],
    outputs: [
      {item: I.stoneBrick, amount: 1},
    ],
    entities: [NAME.stoneFurnace, NAME.steelFurnace, NAME.electricFurnace],
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
    entities: [NAME.stoneFurnace, NAME.steelFurnace, NAME.electricFurnace],
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
      {item: I.automationScience, amount: 1},
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
    prototypeName: "iron-stick",
    inputs: [
      {item: I.ironPlate, amount: 1},
    ],
    outputs: [
      {item: I.ironStick, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "processing-unit",
    inputs: [
      {item: I.advancedCircuit, amount: 2},
      {item: I.electronicCircuit, amount: 20},
      {item: I.sulfur, amount: 5},
    ],
    outputs: [
      {item: I.processingUnit, amount: 1},
    ],
    entities: [NAME.assemblingMachine2],
    duration: 10000,
  },
  {
    prototypeName: "electric-engine-unit",
    inputs: [
      {item: I.electronicCircuit, amount: 2},
      {item: I.engineUnit, amount: 1},
      {item: I.lubricant, amount: 15},
    ],
    outputs: [
      {item: I.electricEngineUnit, amount: 1},
    ],
    entities: [NAME.assemblingMachine2],
    duration: 10000,
  },
  {
    prototypeName: "flying-robot-frame",
    inputs: [
      {item: I.battery, amount: 2},
      {item: I.electricEngineUnit, amount: 1},
      {item: I.electronicCircuit, amount: 3},
      {item: I.steelPlate, amount: 1},
    ],
    outputs: [
      {item: I.flyingRobotFrame, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 20000,
  },
  {
    prototypeName: "low-density-structure",
    inputs: [
      {item: I.copperPlate, amount: 20},
      {item: I.plasticBar, amount: 5},
      {item: I.steelPlate, amount: 2},
    ],
    outputs: [
      {item: I.lowDensityStructure, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 15000,
  },
  {
    prototypeName: "rocket-fuel",
    inputs: [
      {item: I.lightOil, amount: 10},
      {item: I.solidFuel, amount: 10},
    ],
    outputs: [
      {item: I.rocketFuel, amount: 1},
    ],
    entities: [NAME.assemblingMachine2],
    duration: 15000,
  },
  {
    prototypeName: "logistic-science-pack",
    inputs: [
      {item: I.inserter, amount: 1},
      {item: I.transportBelt, amount: 1},
    ],
    outputs: [
      {item: I.logisticScience, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 6000,
  },
  {
    prototypeName: "military-science-pack",
    inputs: [
      {item: I.grenade, amount: 1},
      {item: I.piercingRoundsMagazine, amount: 1},
      {item: I.wall, amount: 2},
    ],
    outputs: [
      {item: I.militaryScience, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 10000,
  },
  {
    prototypeName: "chemical-science-pack",
    inputs: [
      {item: I.advancedCircuit, amount: 3},
      {item: I.engineUnit, amount: 2},
      {item: I.sulfur, amount: 1},
    ],
    outputs: [
      {item: I.chemicalScience, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 24000,
  },
  {
    prototypeName: "production-science-pack",
    inputs: [
      {item: I.electricFurnace, amount: 1},
      {item: I.productivityModule, amount: 1},
      {item: I.rail, amount: 30},
    ],
    outputs: [
      {item: I.productionScience, amount: 3},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 21000,
  },
  {
    prototypeName: "utility-science-pack",
    inputs: [
      {item: I.flyingRobotFrame, amount: 1},
      {item: I.lowDensityStructure, amount: 3},
      {item: I.processingUnit, amount: 2},
    ],
    outputs: [
      {item: I.utilityScience, amount: 3},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 21000,
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
    prototypeName: "chemical-plant",
    inputs: [
      {item: I.electronicCircuit, amount: 5},
      {item: I.ironGear, amount: 5},
      {item: I.pipe, amount: 5},
      {item: I.steelPlate, amount: 5},
    ],
    outputs: [
      {item: I.chemicalPlant, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 5000,
  },
  {
    prototypeName: "pump",
    inputs: [
      {item: I.engineUnit, amount: 1},
      {item: I.pipe, amount: 1},
      {item: I.steelPlate, amount: 1},
    ],
    outputs: [
      {item: I.pump, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 2000,
  },
  {
    prototypeName: "electric-furnace",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.steelPlate, amount: 10},
      {item: I.stoneBrick, amount: 10},
    ],
    outputs: [
      {item: I.electricFurnace, amount: 1},
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
  {
    prototypeName: "medium-electric-pole",
    inputs: [
      {item: I.copperCable, amount: 2},
      {item: I.ironStick, amount: 4},
      {item: I.steelPlate, amount: 2},
    ],
    outputs: [
      {item: I.mediumElectricPole, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "big-electric-pole",
    inputs: [
      {item: I.copperCable, amount: 4},
      {item: I.ironStick, amount: 8},
      {item: I.steelPlate, amount: 5},
    ],
    outputs: [
      {item: I.bigElectricPole, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "substation",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.copperCable, amount: 6},
      {item: I.steelPlate, amount: 10},
    ],
    outputs: [
      {item: I.substation, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "iron-chest",
    inputs: [
      {item: I.ironPlate, amount: 8},
    ],
    outputs: [
      {item: I.ironChest, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "steel-chest",
    inputs: [
      {item: I.steelPlate, amount: 8},
    ],
    outputs: [
      {item: I.steelChest, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "storage-tank",
    inputs: [
      {item: I.ironPlate, amount: 20},
      {item: I.steelPlate, amount: 5},
    ],
    outputs: [
      {item: I.storageTank, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 3000,
  },
  {
    prototypeName: "steel-furnace",
    inputs: [
      {item: I.steelPlate, amount: 6},
      {item: I.stoneBrick, amount: 10},
    ],
    outputs: [
      {item: I.steelFurnace, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 3000,
  },
  {
    prototypeName: "wall",
    inputs: [
      {item: I.stoneBrick, amount: 5},
    ],
    outputs: [
      {item: I.wall, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  {
    prototypeName: "beacon",
    inputs: [
      {item: I.advancedCircuit, amount: 20},
      {item: I.copperCable, amount: 10},
      {item: I.electronicCircuit, amount: 20},
      {item: I.steelPlate, amount: 10},
    ],
    outputs: [
      {item: I.beacon, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 15000,
  },
  {
    prototypeName: "rail",
    inputs: [
      {item: I.ironStick, amount: 1},
      {item: I.steelPlate, amount: 1},
      {item: I.stone, amount: 1},
    ],
    outputs: [
      {item: I.rail, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 500,
  },
  
  
  
  {
    prototypeName: "speed-module",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.electronicCircuit, amount: 5},
    ],
    outputs: [
      {item: I.speedModule, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 15000,
  },
  {
    prototypeName: "speed-module-2",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.speedModule, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.speedModule2, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 30000,
  },
  {
    prototypeName: "speed-module-3",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.speedModule2, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.speedModule3, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 60000,
  },
  {
    prototypeName: "efficiency-module",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.electronicCircuit, amount: 5},
    ],
    outputs: [
      {item: I.efficiencyModule, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 15000,
  },
  {
    prototypeName: "efficiency-module-2",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.efficiencyModule, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.efficiencyModule2, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 30000,
  },
  {
    prototypeName: "efficiency-module-3",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.efficiencyModule2, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.efficiencyModule3, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 60000,
  },
  {
    prototypeName: "productivity-module",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.electronicCircuit, amount: 5},
    ],
    outputs: [
      {item: I.productivityModule, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 15000,
  },
  {
    prototypeName: "productivity-module-2",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.productivityModule, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.productivityModule2, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 30000,
  },
  {
    prototypeName: "productivity-module-3",
    inputs: [
      {item: I.advancedCircuit, amount: 5},
      {item: I.productivityModule2, amount: 4},
      {item: I.processingUnit, amount: 5},
    ],
    outputs: [
      {item: I.productivityModule3, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 60000,
  },
  {
    prototypeName: "firearm-magazine",
    inputs: [
      {item: I.ironPlate, amount: 4},
    ],
    outputs: [
      {item: I.firearmMagazine, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 1000,
  },
  {
    prototypeName: "piercing-rounds-magazine",
    inputs: [
      {item: I.copperPlate, amount: 2},
      {item: I.firearmMagazine, amount: 2},
      {item: I.steelPlate, amount: 1},
    ],
    outputs: [
      {item: I.piercingRoundsMagazine, amount: 2},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 6000,
  },
  {
    prototypeName: "grenade",
    inputs: [
      {item: I.coal, amount: 10},
      {item: I.ironPlate, amount: 5},
    ],
    outputs: [
      {item: I.grenade, amount: 1},
    ],
    entities: [NAME.assemblingMachine1],
    duration: 8000,
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
