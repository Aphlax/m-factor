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
};

export const ITEMS = new Map([
  [I.ironOre,
  {
    sprite: S.ironOreItem,
    stackSize: 50,
  }],
  [I.copperOre,
  {
    sprite: S.copperOreItem,
    stackSize: 50,
  }],
  [I.coal,
  {
    sprite: S.coalItem,
    stackSize: 50,
    fuelValue: 4000, // kJ
  }],
  [I.stone,
  {
    sprite: S.stoneItem,
    stackSize: 50,
  }],
  [I.wood,
  {
    sprite: S.woodItem,
    stackSize: 100,
    fuelValue: 2000, // kJ
  }],
  [I.ironPlate,
  {
    sprite: S.ironPlateItem,
    stackSize: 100,
  }],
  [I.copperPlate,
  {
    sprite: S.copperPlateItem,
    stackSize: 100,
  }],
  [I.ironGear,
  {
    sprite: S.ironGearItem,
    stackSize: 100,
  }],
  [I.copperCable,
  {
    sprite: S.copperCableItem,
    stackSize: 200,
  }],
  [I.electronicCircuit,
  {
    sprite: S.electronicCircuitItem,
    stackSize: 200,
  }],
  [I.redScience,
  {
    sprite: S.redScienceItem,
    stackSize: 200,
  }],
  [I.transportBelt,
  {
    sprite: S.transportBeltItem,
    stackSize: 100,
  }],
  [I.inserter,
  {
    sprite: S.inserterItem,
    stackSize: 50,
  }],
  [I.woodenChest,
  {
    sprite: S.woodenChestItem,
    stacksize: 50,
  }],
  [I.burnerDrill,
  {
    sprite: S.burnerDrillItem,
    stacksize: 50,
  }],
  [I.stoneFurnace,
  {
    sprite: S.stoneFurnaceItem,
    stacksize: 50,
  }],
  [I.assemblingMachine1,
  {
    sprite: S.assemblingMachine1Item,
    stacksize: 50,
  }],
  [I.lab,
  {
    sprite: S.labItem,
    stacksize: 10,
  }],
  [I.offshorePump,
  {
    sprite: S.offshorePumpItem,
    stacksize: 20,
  }],
  [I.pipe,
  {
    sprite: S.pipeItem,
    stacksize: 100,
  }],
  [I.boiler,
  {
    sprite: S.boilerItem,
    stacksize: 50,
  }],
  [I.steamEngine,
  {
    sprite: S.steamEngineItem,
    stacksize: 10,
  }],
  [I.smallElectricPole,
  {
    sprite: S.smallElectricPoleItem,
    stacksize: 50,
  }],
  
]);

export const FLUIDS = new Map([
  [I.water,
  {
    sprite: S.waterFluid,
  }],
  [I.steam,
  {
    sprite: S.steamFluid,
  }],
]);
