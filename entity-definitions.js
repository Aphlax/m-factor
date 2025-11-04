import {S} from './sprite-pool.js';
import {DIRECTION, TYPE, ENERGY} from './entity-properties.js';


export const NAME = {
  burnerDrill: 1,
  woodenChest: 2,
  transportBelt: 3,
  inserter: 4,
  stoneFurnace: 5,
  assemblingMachine1: 6,
  lab: 7,
  offshorePump: 8,
  pipe: 9,
  boiler: 10,
  steamEngine: 11,
  smallElectricPole: 12,
};

const {north, east, south, west} = DIRECTION;

export const ENTITIES = new Map([
  [NAME.burnerDrill,
  {
    label: 'Wind up drill',
    prototypeName: "burner-mining-drill",
    type: TYPE.mine,
    width: 2,
    height: 2,
    rotatable: true,
    icon: S.burnerDrillIcon,
    sprites: {
      [north]: [S.burnerDrillN, S.burnerDrillShadowN],
      [east]: [S.burnerDrillE, S.burnerDrillShadowE],
      [south]: [S.burnerDrillS, S.burnerDrillShadowS],
      [west]: [S.burnerDrillW, S.burnerDrillShadowW],
    },
    animationLength: 32,
    energySource: ENERGY.windUp,
    energyConsumption: 1 / 8, // 8 ops/wind.
    
    taskDuration: 4000,
    mineOutput: {
      [north]: {x: 0, y: -1},
      [east]: {x: 2, y: 0},
      [south]: {x: 1, y: 2},
      [west]: {x: -1, y: 1},
    },
  }],
  [NAME.woodenChest,
  {
    label: 'Wooden chest',
    prototypeName: "wooden-chest",
    type: TYPE.chest,
    width: 1,
    height: 1,
    rotatable: false,
    icon: S.woodenChestIcon,
    sprites: {
      [north]: [S.woodenChest, S.woodenChestShadow],
      [east]: [S.woodenChest, S.woodenChestShadow],
      [south]: [S.woodenChest, S.woodenChestShadow],
      [west]: [S.woodenChest, S.woodenChestShadow],
    },
    animationLength: 0,
    
    capacity: 8,
  }],
  [NAME.transportBelt,
  {
    label: 'Belt',
    prototypeName: "transport-belt",
    type: TYPE.belt,
    width: 1,
    height: 1,
    rotatable: true,
    icon: S.transportBeltIcon,
    sprites: {
      [north]: [S.transportBeltN],
      [east]: [S.transportBeltE],
      [south]: [S.transportBeltS],
      [west]: [S.transportBeltW],
    },
    animationLength: 16,
    animationSpeed: 1.925,
    
    beltSpeed: 1.875, // 15 = 1.875 * 8
    beltSprites: {
      [north]: [S.transportBeltN, S.transportBeltEN, S.transportBeltWN],
      [east]: [S.transportBeltE, S.transportBeltSE, S.transportBeltNE],
      [south]: [S.transportBeltS, S.transportBeltWS, S.transportBeltES],
      [west]: [S.transportBeltW, S.transportBeltNW, S.transportBeltSW],
    },
    beltEndSprites: {
      [north]: [S.transportBeltBeginN, S.transportBeltEndN, S.transportBeltEndW, S.transportBeltEndE],
      [east]: [S.transportBeltBeginE, S.transportBeltEndE, S.transportBeltEndN, S.transportBeltEndS],
      [south]: [S.transportBeltBeginS, S.transportBeltEndS, S.transportBeltEndE, S.transportBeltEndW],
      [west]: [S.transportBeltBeginW, S.transportBeltEndW, S.transportBeltEndS, S.transportBeltEndN],
    },
  }],
  [NAME.inserter,
  {
    label: 'Inserter',
    prototypeName: "burner-inserter",
    type: TYPE.inserter,
    width: 1,
    height: 1,
    rotatable: true,
    icon: S.inserterIcon,
    sprites: {
      [north]: [S.inserter],
      [east]: [S.inserter + 1],
      [south]: [S.inserter + 2],
      [west]: [S.inserter + 3],
    },
    animationLength: 0,
    
    inserterHandSprites: S.inserterHand,
    taskDuration: 400,
  }],
  [NAME.stoneFurnace,
  {
    label: "Stone Furnace",
    prototypeName: "stone-furnace",
    type: TYPE.furnace,
    width: 2,
    height: 2,
    rotatable: false,
    icon: S.stoneFurnaceIcon,
    sprites: {
      [north]: [S.stoneFurnaceWorking],
      [east]: [S.stoneFurnaceWorking],
      [south]: [S.stoneFurnaceWorking],
      [west]: [S.stoneFurnaceWorking],
    },
    animationLength: 48,
    animationSpeed: 0.6,
    energySource: ENERGY.burner,
    energyConsumption: 90, // kW
    
    processingSpeed: 1, // inverse.
    idleAnimation: {
      [north]: [S.stoneFurnace],
      [east]: [S.stoneFurnace],
      [south]: [S.stoneFurnace],
      [west]: [S.stoneFurnace],
    },
  }],
  [NAME.assemblingMachine1,
  {
    label: "Assembler 1",
    prototypeName: "assembling-machine-1",
    type: TYPE.assembler,
    width: 3,
    height: 3,
    rotatable: false,
    icon: S.assemblingMachine1Icon,
    sprites: {
      [north]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [east]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [south]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [west]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
    },
    animationLength: 32,
    animationSpeed: 1,
    
    processingSpeed: 2, // inverse.
  }],
  [NAME.lab,
  {
    label: "Laboratory",
    prototypeName: "lab",
    type: TYPE.lab,
    width: 3,
    height: 3,
    rotatable: false,
    icon: S.labIcon,
    sprites: {
      [north]: [S.lab, S.labShadow],
      [east]: [S.lab, S.labShadow],
      [south]: [S.lab, S.labShadow],
      [west]: [S.lab, S.labShadow],
    },
    animationLength: 33,
    noShadowAnimation: true,
    
    taskDuration: 9800,
    energyConsumption: 60, // kW
  }],
  [NAME.offshorePump,
  {
    label: "Wind up pump",
    prototypeName: "offshore-pump",
    type: TYPE.offshorePump,
    size: {
      [north]: {width: 1, height: 2},
      [east]: {width: 2, height: 1},
      [south]: {width: 1, height: 2},
      [west]: {width: 2, height: 1},
    },
    rotatable: false,
    icon: S.offshorePumpIcon,
    sprites: {
      [north]: [S.offshorePumpN, S.offshorePumpShadowN],
      [east]: [S.offshorePumpE, S.offshorePumpShadowE],
      [south]: [S.offshorePumpS, S.offshorePumpShadowS],
      [west]: [S.offshorePumpW, S.offshorePumpShadowW],
    },
    animationLength: 32,
    animationSpeed: 0.5,
    
    fluidOutputs: {
      [north]: [{x: 0, y: -1}],
      [east]: [{x: 2, y: 0}],
      [south]: [{x: 0, y: 2}],
      [west]: [{x: -1, y: 0}],
    },
  }],
  [NAME.pipe,
  {
    label: "Pipe",
    prototypeName: "pipe",
    type: TYPE.pipe,
    width: 1,
    height: 1,
    rotatable: false,
    icon: S.pipeIcon,
    sprites: {
      [north]: [S.pipeSingle],
    },
    pipeSprites: [
      S.pipeSingle,
      S.pipeEndUp,
      S.pipeEndRight,
      S.pipeEndDown,
      S.pipeEndLeft,
      S.pipeStraightVertical,
      S.pipeStraightHorizontal,
      S.pipeCornerUpLeft,
      S.pipeCornerUpRight,
      S.pipeCornerDownRight,
      S.pipeCornerDownLeft,
      S.pipeTUp,
      S.pipeTRight,
      S.pipeTDown,
      S.pipeTLeft,
      S.pipeCross,
    ],
    animationLength: 0,
    
    pipeConnections: {
      [north]: [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}],
    },
    capacity: 100,
  }],
  [NAME.boiler,
  {
    label: "Boiler",
    prototypeName: "boiler",
    type: TYPE.boiler,
    size: {
      [north]: {width: 3, height: 2},
      [east]: {width: 2, height: 3},
      [south]: {width: 3, height: 2},
      [west]: {width: 2, height: 3},
    },
    rotatable: true,
    icon: S.boilerIcon,
    sprites: {
      [north]: [S.boilerWorkingN, S.boilerShadowN],
      [east]: [S.boilerWorkingE, S.boilerShadowE],
      [south]: [S.boilerWorkingS, S.boilerShadowS],
      [west]: [S.boilerWorkingW, S.boilerShadowW],
    },
    idleAnimation: {
      [north]: [S.boilerN],
      [east]: [S.boilerE],
      [south]: [S.boilerS],
      [west]: [S.boilerW],
    },
    animationLength: 32,
    noShadowAnimation: true,
    animationSpeed: 0.6,
    energySource: ENERGY.burner,
    energyConsumption: 1800, // kW
    processingSpeed: 1,
    
    pipeConnections: {
      [north]: [{x: -1, y: 1}, {x: 3, y: 1}],
      [east]: [{x: 0, y: -1}, {x: 0, y: 3}],
      [south]: [{x: 3, y: 0}, {x: -1, y: 0}],
      [west]: [{x: 1, y: 3}, {x: 1, y: -1}],
    },
    capacity: 100,
    fluidOutputs: {
      [north]: [{x: 1, y: -1}],
      [east]: [{x: 2, y: 1}],
      [south]: [{x: 1, y: 2}],
      [west]: [{x: -1, y: 1}],
    },
  }],
  [NAME.steamEngine,
  {
    label: "Steam Engine",
    prototypeName: "steam-engine",
    type: TYPE.generator,
    size: {
      [north]: {width: 3, height: 5},
      [east]: {width: 5, height: 3},
      [south]: {width: 3, height: 5},
      [west]: {width: 5, height: 3},
    },
    rotatable: true,
    icon: S.steamEngineIcon,
    sprites: {
      [north]: [S.steamEngineV, S.steamEngineShadowV],
      [east]: [S.steamEngineH, S.steamEngineShadowH],
      [south]: [S.steamEngineV, S.steamEngineShadowV],
      [west]: [S.steamEngineH, S.steamEngineShadowH],
    },
    animationLength: 32,
    animationSpeed: 1,
    
    pipeConnections: {
      [north]: [{x: 1, y: -1}, {x: 1, y: 5}],
      [east]: [{x: -1, y: 1}, {x: 5, y: 1}],
      [south]: [{x: 1, y: -1}, {x: 1, y: 5}],
      [west]: [{x: -1, y: 1}, {x: 5, y: 1}],
    },
    capacity: 500,
    fluidConsumption: 30,
    powerOutput: 900, // kW
  }],
  [NAME.smallElectricPole,
  {
    label: "Small Pole",
    prototypeName: "small-electric-pole",
    type: TYPE.electricPole,
    width: 1,
    height: 1,
    rotatable: false,
    icon: S.smallElectricPoleIcon,
    sprites: {
      [north]: [S.smallElectricPole, S.smallElectricPoleShadow],
      [east]: [S.smallElectricPole, S.smallElectricPoleShadow],
      [south]: [S.smallElectricPole, S.smallElectricPoleShadow],
      [west]: [S.smallElectricPole, S.smallElectricPoleShadow],
    },
    animationLength: 0,
    
    wireReach: 7,
    powerSupplyArea: 2,
    wireConnectionPoint: {x: 0.5, y: -2},
    wireConnectionPointShadow: {x: 3.68, y: 0.59},
  }],
]);

ENTITIES.keys().forEach(name =>
    ENTITIES.get(name).name = name);

export const PROTO_TO_NAME = new Map(
    ENTITIES.values().map(def =>
    [def.prototypeName, def.name]));
