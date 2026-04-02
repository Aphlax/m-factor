import {S} from './sprite-pool.js';

export const I = {
  ironOre: 1,
  copperOre: 2,
  coal: 3,
  stone: 4,
  ironPlate: 5,
  copperPlate: 6,
  ironGear: 7,
  copperCable: 8,
  electronicCircuit: 9,
  wood: 11,
  steelPlate: 12,
  plasticBar: 13,
  advancedCircuit: 14,
  sulfur: 15,
  solidFuel: 16,
  battery: 17,
  explosives: 18,
  engineUnit: 19,
  stoneBrick: 20,
  ironStick: 21,
  processingUnit: 22,
  electricEngineUnit: 23,
  flyingRobotFrame: 24,
  lowDensityStructure: 25,
  rocketFuel: 26,
  
  automationScience: 27,
  logisticScience: 28,
  militaryScience: 29,
  chemicalScience: 30,
  productionScience: 31,
  utilityScience: 32,
  spaceScience: 33,
  
  water: 50, // Fluid.
  steam: 51, // Fluid.
  crudeOil: 52, // Fluid.
  petroleumGas: 53, // Fluid.
  heavyOil: 54, // Fluid.
  lightOil: 55, // Fluid.
  sulfuricAcid: 56, // Fluid.
  lubricant: 57, // Fluid.
  
  transportBelt: 100,
  inserter: 101,
  woodenChest: 102,
  burnerDrill: 103,
  stoneFurnace: 104,
  assemblingMachine1: 105,
  lab: 106,
  offshorePump: 107,
  pipe: 108,
  boiler: 109,
  steamEngine: 110,
  smallElectricPole: 111,
  electricFurnace: 112,
  undergroundBelt: 113,
  pipeToGround: 114,
  splitter: 115,
  burnerInserter: 116,
  fastInserter: 117,
  longHandedInserter: 118,
  pumpjack: 119,
  oilRefinery: 120,
  chemicalPlant: 121,
  pump: 122,
  mediumElectricPole: 123,
  bigElectricPole: 124,
  substation: 125,
  ironChest: 126,
  steelChest: 127,
  storageTank: 128,
  steelFurnace: 129,
  wall: 130,
  beacon: 131,
  rail: 132,
  assemblingMachine2: 133,
  assemblingMachine3: 134,
  fastTransportBelt: 135,
  fastUndergroundBelt: 136,
  fastSplitter: 137,
  expressTransportBelt: 138,
  expressUndergroundBelt: 139,
  expressSplitter: 140,
  
  speedModule: 200,
  speedModule2: 201,
  speedModule3: 202,
  efficiencyModule: 203,
  efficiencyModule2: 204,
  efficiencyModule3: 205,
  productivityModule: 206,
  productivityModule2: 207,
  productivityModule3: 208,
  firearmMagazine: 209,
  piercingRoundsMagazine: 210,
  grenade: 211,
};

export const FLUID_START = 50;
export const FLUID_END = 100;

export const ITEMS = new Map([
  [I.ironOre,
  {
    sprite: S.ironOreItem,
    stackSize: 50,
    prototypeName: "iron-ore",
  }],
  [I.copperOre,
  {
    sprite: S.copperOreItem,
    stackSize: 50,
    prototypeName: "copper-ore",
  }],
  [I.coal,
  {
    sprite: S.coalItem,
    stackSize: 50,
    fuelValue: 4000, // kJ
    prototypeName: "coal",
  }],
  [I.stone,
  {
    sprite: S.stoneItem,
    stackSize: 50,
    prototypeName: "stone",
  }],
  [I.wood,
  {
    sprite: S.woodItem,
    stackSize: 100,
    fuelValue: 2000, // kJ
    prototypeName: "wood",
  }],
  [I.ironPlate,
  {
    sprite: S.ironPlateItem,
    stackSize: 100,
    prototypeName: "iron-plate",
  }],
  [I.copperPlate,
  {
    sprite: S.copperPlateItem,
    stackSize: 100,
    prototypeName: "iron-plate",
  }],
  [I.ironGear,
  {
    sprite: S.ironGearItem,
    stackSize: 100,
    prototypeName: "iron-gear-wheel",
  }],
  [I.copperCable,
  {
    sprite: S.copperCableItem,
    stackSize: 200,
    prototypeName: "copper-cable",
  }],
  [I.electronicCircuit,
  {
    sprite: S.electronicCircuitItem,
    stackSize: 200,
    prototypeName: "electronic-circuit",
  }],
  [I.automationScience,
  {
    sprite: S.automationScienceItem,
    stackSize: 200,
    prototypeName: "automation-science-pack",
  }],
  [I.steelPlate,
  {
    sprite: S.steelPlateItem,
    stackSize: 100,
    prototypeName: "steel-plate",
  }],
  [I.plasticBar,
  {
    sprite: S.plasticBarItem,
    stackSize: 100,
    prototypeName: "plastic-bar",
  }],
  [I.advancedCircuit,
  {
    sprite: S.advancedCircuitItem,
    stackSize: 200,
    prototypeName: "advanced-circuit",
  }],
  [I.sulfur,
  {
    sprite: S.sulfurItem,
    stackSize: 50,
    prototypeName: "sulfur",
  }],
  [I.solidFuel,
  {
    sprite: S.solidFuelItem,
    stackSize: 50,
    prototypeName: "solid-fuel",
  }],
  [I.battery,
  {
    sprite: S.batteryItem,
    stackSize: 200,
    prototypeName: "battery",
  }],
  [I.explosives,
  {
    sprite: S.explosivesItem,
    stackSize: 50,
    prototypeName: "explosives",
  }],
  [I.engineUnit,
  {
    sprite: S.engineUnitItem,
    stackSize: 50,
    prototypeName: "engine-unit",
  }],
  [I.stoneBrick,
  {
    sprite: S.stoneBrickItem,
    stackSize: 100,
    prototypeName: "stone-brick",
  }],
  [I.ironStick,
  {
    sprite: S.ironStickItem,
    stackSize: 100,
    prototypeName: "iron-stick",
  }],
  [I.processingUnit,
  {
    sprite: S.processingUnitItem,
    stackSize: 100,
    prototypeName: "processing-unit",
  }],
  [I.electricEngineUnit,
  {
    sprite: S.electricEngineUnitItem,
    stackSize: 50,
    prototypeName: "electric-engine-unit",
  }],
  [I.flyingRobotFrame,
  {
    sprite: S.flyingRobotFrameItem,
    stackSize: 50,
    prototypeName: "flying-robot-frame",
  }],
  [I.lowDensityStructure,
  {
    sprite: S.lowDensityStructureItem,
    stackSize: 50,
    prototypeName: "low-density-structure",
  }],
  [I.rocketFuel,
  {
    sprite: S.rocketFuelItem,
    stackSize: 20,
    prototypeName: "rocket-fuel",
  }],
  [I.logisticScience,
  {
    sprite: S.logisticScienceItem,
    stackSize: 200,
    prototypeName: "logistic-science-pack",
  }],
  [I.militaryScience,
  {
    sprite: S.militaryScienceItem,
    stackSize: 200,
    prototypeName: "military-science-pack",
  }],
  [I.chemicalScience,
  {
    sprite: S.chemicalScienceItem,
    stackSize: 200,
    prototypeName: "chemical-science-pack",
  }],
  [I.productionScience,
  {
    sprite: S.productionScienceItem,
    stackSize: 200,
    prototypeName: "production-science-pack",
  }],
  [I.utilityScience,
  {
    sprite: S.utilityScienceItem,
    stackSize: 200,
    prototypeName: "utility-science-pack",
  }],
  [I.spaceScience,
  {
    sprite: S.spaceScienceItem,
    stackSize: 200,
    prototypeName: "space-science-pack",
  }],
  
  
  
  // Placeable
  
  [I.transportBelt,
  {
    sprite: S.transportBeltItem,
    stackSize: 100,
    prototypeName: "transport-belt",
  }],
  [I.inserter,
  {
    sprite: S.inserterItem,
    stackSize: 50,
    prototypeName: "inserter",
  }],
  [I.woodenChest,
  {
    sprite: S.woodenChestItem,
    stacksize: 50,
    prototypeName: "wooden-chest",
  }],
  [I.burnerDrill,
  {
    sprite: S.burnerDrillItem,
    stacksize: 50,
    prototypeName: "burner-drill",
  }],
  [I.stoneFurnace,
  {
    sprite: S.stoneFurnaceItem,
    stacksize: 50,
    prototypeName: "stone-furnace",
  }],
  [I.assemblingMachine1,
  {
    sprite: S.assemblingMachine1Item,
    stacksize: 50,
    prototypeName: "assembling-machine-1",
  }],
  [I.lab,
  {
    sprite: S.labItem,
    stacksize: 10,
    prototypeName: "lab",
  }],
  [I.offshorePump,
  {
    sprite: S.offshorePumpItem,
    stacksize: 20,
    prototypeName: "offshore-pump",
  }],
  [I.pipe,
  {
    sprite: S.pipeItem,
    stacksize: 100,
    prototypeName: "pipe",
  }],
  [I.boiler,
  {
    sprite: S.boilerItem,
    stacksize: 50,
    prototypeName: "boiler",
  }],
  [I.steamEngine,
  {
    sprite: S.steamEngineItem,
    stacksize: 10,
    prototypeName: "steam-engine",
  }],
  [I.smallElectricPole,
  {
    sprite: S.smallElectricPoleItem,
    stacksize: 50,
    prototypeName: "small-electric-pole",
  }],
  [I.electricFurnace,
  {
    sprite: S.electricFurnaceItem,
    stacksize: 50,
    prototypeName: "electric-furnace",
  }],
  [I.undergroundBelt,
  {
    sprite: S.undergroundBeltItem,
    stacksize: 50,
    prototypeName: "underground-belt",
  }],
  [I.pipeToGround,
  {
    sprite: S.pipeToGroundItem,
    stacksize: 50,
    prototypeName: "pipe-to-ground",
  }],
  [I.splitter,
  {
    sprite: S.splitterItem,
    stacksize: 50,
    prototypeName: "splitter",
  }],
  [I.burnerInserter,
  {
    sprite: S.burnerInserterItem,
    stacksize: 50,
    prototypeName: "burner-inserter",
  }],
  [I.fastInserter,
  {
    sprite: S.fastInserterItem,
    stacksize: 50,
    prototypeName: "fast-inserter",
  }],
  [I.longHandedInserter,
  {
    sprite: S.longHandedInserterItem,
    stacksize: 50,
    prototypeName: "long-handed-inserter",
  }],
  [I.pumpjack,
  {
    sprite: S.pumpjackItem,
    stacksize: 20,
    prototypeName: "pumpjack",
  }],
  [I.oilRefinery,
  {
    sprite: S.oilRefineryItem,
    stacksize: 10,
    prototypeName: "oil-refinery",
  }],
  [I.chemicalPlant,
  {
    sprite: S.chemicalPlantItem,
    stacksize: 10,
    prototypeName: "chemical-plant",
  }],
  [I.pump,
  {
    sprite: S.pumpItem,
    stacksize: 50,
    prototypeName: "pump",
  }],
  [I.mediumElectricPole,
  {
    sprite: S.mediumElectricPoleItem,
    stacksize: 50,
    prototypeName: "medium-electric-pole",
  }],
  [I.bigElectricPole,
  {
    sprite: S.bigElectricPoleItem,
    stacksize: 50,
    prototypeName: "big-electric-pole",
  }],
  [I.substation,
  {
    sprite: S.substationItem,
    stacksize: 50,
    prototypeName: "substation",
  }],
  [I.ironChest,
  {
    sprite: S.ironChestItem,
    stacksize: 50,
    prototypeName: "iron-chest",
  }],
  [I.steelChest,
  {
    sprite: S.steelChestItem,
    stacksize: 50,
    prototypeName: "steel-chest",
  }],
  [I.storageTank,
  {
    sprite: S.storageTankItem,
    stacksize: 50,
    prototypeName: "storage-tank",
  }],
  [I.steelFurnace,
  {
    sprite: S.steelFurnaceItem,
    stacksize: 50,
    prototypeName: "steel-furnace",
  }],
  [I.wall,
  {
    sprite: S.wallItem,
    stacksize: 100,
    prototypeName: "wall",
  }],
  [I.beacon,
  {
    sprite: S.beaconItem,
    stacksize: 20,
    prototypeName: "beacon",
  }],
  [I.rail,
  {
    sprite: S.railItem,
    stacksize: 100,
    prototypeName: "rail",
  }],
  [I.assemblingMachine2,
  {
    sprite: S.assemblingMachine2Item,
    stacksize: 50,
    prototypeName: "assembling-machine-2",
  }],
  [I.assemblingMachine3,
  {
    sprite: S.assemblingMachine3Item,
    stacksize: 50,
    prototypeName: "assembling-machine-3",
  }],
  [I.fastTransportBelt,
  {
    sprite: S.fastTransportBeltItem,
    stacksize: 100,
    prototypeName: "fast-transport-belt",
  }],
  [I.fastUndergroundBelt,
  {
    sprite: S.fastUndergroundBeltItem,
    stacksize: 50,
    prototypeName: "fast-undetground-belt",
  }],
  [I.fastSplitter,
  {
    sprite: S.fastSplitterItem,
    stacksize: 50,
    prototypeName: "fast-splitter",
  }],
  [I.expressTransportBelt,
  {
    sprite: S.expressTransportBeltItem,
    stacksize: 100,
    prototypeName: "express-transport-belt",
  }],
  [I.expressUndergroundBelt,
  {
    sprite: S.expressUndergroundBeltItem,
    stacksize: 50,
    prototypeName: "express-undetground-belt",
  }],
  [I.expressSplitter,
  {
    sprite: S.expressSplitterItem,
    stacksize: 50,
    prototypeName: "express-splitter",
  }],
  
  
  
  
  
  [I.speedModule,
  {
    sprite: S.speedModuleItem,
    stacksize: 50,
    prototypeName: "speed-module",
  }],
  [I.speedModule2,
  {
    sprite: S.speedModule2Item,
    stacksize: 50,
    prototypeName: "speed-module-2",
  }],
  [I.speedModule3,
  {
    sprite: S.speedModule3Item,
    stacksize: 50,
    prototypeName: "speed-module-3",
  }],
  [I.efficiencyModule,
  {
    sprite: S.efficiencyModuleItem,
    stacksize: 50,
    prototypeName: "efficiency-module",
  }],
  [I.efficiencyModule2,
  {
    sprite: S.efficiencyModule2Item,
    stacksize: 50,
    prototypeName: "efficiency-module-2",
  }],
  [I.efficiencyModule3,
  {
    sprite: S.efficiencyModule3Item,
    stacksize: 50,
    prototypeName: "efficiency-module-3",
  }],
  [I.productivityModule,
  {
    sprite: S.productivityModuleItem,
    stacksize: 50,
    prototypeName: "productivity-module",
  }],
  [I.productivityModule2,
  {
    sprite: S.productivityModule2Item,
    stacksize: 50,
    prototypeName: "productivity-module-2",
  }],
  [I.productivityModule3,
  {
    sprite: S.productivityModule3Item,
    stacksize: 50,
    prototypeName: "productivity-module-3",
  }],
  [I.productivityModule3,
  {
    sprite: S.productivityModule3Item,
    stacksize: 50,
    prototypeName: "productivity-module-3",
  }],
  [I.firearmMagazine,
  {
    sprite: S.firearmMagazineItem,
    stacksize: 100,
    prototypeName: "firearm-magazine",
  }],
  [I.piercingRoundsMagazine,
  {
    sprite: S.piercingRoundsMagazineItem,
    stacksize: 100,
    prototypeName: "piercing-rounds-magazine",
  }],
  [I.grenade,
  {
    sprite: S.grenadeItem,
    stacksize: 100,
    prototypeName: "grenade",
  }],
]);

ITEMS.entries()
    .forEach(([name, def]) => def.name = name);

export const PROTO_TO_ITEM = new Map(
    ITEMS.values().map(def => [def.prototypeName, def]));


export const FLUIDS = new Map([
  [I.water,
  {
    sprite: S.waterFluid,
    prototypeName: "water",
  }],
  [I.steam,
  {
    sprite: S.steamFluid,
    prototypeName: "steam",
  }],
  [I.crudeOil,
  {
    sprite: S.crudeOilFluid,
    prototypeName: "crude-oil",
  }],
  [I.petroleumGas,
  {
    sprite: S.petroleumGasFluid,
    prototypeName: "petroleum-gas",
  }],
  [I.heavyOil,
  {
    sprite: S.heavyOilFluid,
    prototypeName: "heavy-oil",
  }],
  [I.lightOil,
  {
    sprite: S.lightOilFluid,
    prototypeName: "light-oil",
  }],
  [I.sulfuricAcid,
  {
    sprite: S.sulfuricAcidFluid,
    prototypeName: "sulfuric-acid",
  }],
  [I.lubricant,
  {
    sprite: S.lubricantFluid,
    prototypeName: "lubricant",
  }],
]);

FLUIDS.entries()
    .forEach(([name, def]) => def.name = name);

export const PROTO_TO_FLUID = new Map(
    FLUIDS.values().map(def => [def.prototypeName, def]));
