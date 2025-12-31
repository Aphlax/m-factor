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
  redScience: 10,
  wood: 11,
  
  water: 50, // Fluid.
  steam: 51, // Fluid.
  
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
  undergroundBelt: 112,
  pipeToGround: 113,
  splitter: 114,
};

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
  [I.redScience,
  {
    sprite: S.redScienceItem,
    stackSize: 200,
    prototypeName: "automation-science-pack",
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
]);

FLUIDS.entries()
    .forEach(([name, def]) => def.name = name);

export const PROTO_TO_FLUID = new Map(
    FLUIDS.values().map(def => [def.prototypeName, def]));
