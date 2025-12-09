import {S} from './sprite-pool.js';
import {DIRECTION, TYPE, ENERGY, NAME} from './entity-properties.js';
import {WATER_PUMPING_RECIPE, BOILER_RECIPE} from './recipe-definitions.js';

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
    drillArea: 2,
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
    animationLength: 0,
    
    beltSpeed: 1.875, // 15 = 1.875 * 8
    beltAnimation: 16,
    beltAnimationSpeed: 1.925 * 1.875,
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
    prototypeName: "inserter",
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
    energySource: ENERGY.electric,
    energyDrain: 0.4, // kW
    energyConsumption: 4.6, // kW
    
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
    
    processingSpeed: 1,
    idleAnimation: {
      [north]: [S.stoneFurnace],
      [east]: [S.stoneFurnace],
      [south]: [S.stoneFurnace],
      [west]: [S.stoneFurnace],
    },
    smokePosition: {x: 0.97, y: 0},
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
    energySource: ENERGY.electric,
    energyDrain: 2.5, // kW
    energyConsumption: 78.5, // kW
    
    processingSpeed: 0.5,
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
    
    recipe: WATER_PUMPING_RECIPE,
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
    
    recipe: BOILER_RECIPE,
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
    smokePosition: {x: 0.7, y: 0.3},
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
  [NAME.electricFurnace,
  {
    label: "Electric Furnace",
    prototypeName: "electric-furnace",
    type: TYPE.furnace,
    width: 3,
    height: 3,
    rotatable: false,
    icon: S.electricFurnaceIcon,
    sprites: {
      [north]: [S.electricFurnaceWorking],
      [east]: [S.electricFurnaceWorking],
      [south]: [S.electricFurnaceWorking],
      [west]: [S.electricFurnaceWorking],
    },
    animationLength: 12,
    animationSpeed: 1,
    energySource: ENERGY.electric,
    energyConsumption: 186, // kW
    energyDrain: 6, // kW
    
    processingSpeed: 2,
    idleAnimation: {
      [north]: [S.electricFurnaceIdle],
      [east]: [S.electricFurnaceIdle],
      [south]: [S.electricFurnaceIdle],
      [west]: [S.electricFurnaceIdle],
    },
    smokePosition: {x: 0.85, y: 0},
  }],
  [NAME.undergroundBelt,
  {
    label: "Underground Belt",
    prototypeName: "underground-belt",
    type: TYPE.undergroundBelt,
    width: 1,
    height: 1,
    rotatable: true,
    icon: S.undergroundBeltIcon,
    sprites: {
      [north]: [S.undergroundBeltNI],
      [east]: [S.undergroundBeltEI],
      [south]: [S.undergroundBeltSI],
      [west]: [S.undergroundBeltWI],
    },
    
    beltSpeed: 1.875, // 15 = 1.875 * 8
    beltAnimation: 16,
    beltAnimationSpeed: 1.925 * 1.875,
    maxUndergroundGap: 4,
    beltSprites: {
      [north]: [S.undergroundEnterBeltN, S.undergroundExitBeltN, S.undergroundBeltNI, S.undergroundBeltNO, S.undergroundBeltNI, S.undergroundBeltNO],
      [east]: [S.undergroundEnterBeltE, S.undergroundExitBeltE, S.undergroundBeltEI, S.undergroundBeltEO, S.undergroundBeltEISideLoaded, S.undergroundBeltEOSideLoaded],
      [south]: [S.undergroundEnterBeltS, S.undergroundExitBeltS, S.undergroundBeltSI, S.undergroundBeltSO, S.undergroundBeltSI, S.undergroundBeltSO],
      [west]: [S.undergroundEnterBeltW, S.undergroundExitBeltW, S.undergroundBeltWI, S.undergroundBeltWO, S.undergroundBeltWISideLoaded, S.undergroundBeltWOSideLoaded],
    },
    beltEndSprites: {
      [north]: [S.transportBeltBeginN, S.transportBeltEndN, S.transportBeltEndW, S.transportBeltEndE],
      [east]: [S.transportBeltBeginE, S.transportBeltEndE, S.transportBeltEndN, S.transportBeltEndS],
      [south]: [S.transportBeltBeginS, S.transportBeltEndS, S.transportBeltEndE, S.transportBeltEndW],
      [west]: [S.transportBeltBeginW, S.transportBeltEndW, S.transportBeltEndS, S.transportBeltEndN],
    },
  }],
  [NAME.pipeToGround,
  {
    label: "Underground Pipe",
    prototypeName: "pipe-to-ground",
    type: TYPE.pipeToGround,
    width: 1,
    height: 1,
    rotatable: true,
    icon: S.pipeToGroundIcon,
    sprites: {
      [north]: [S.pipeToGroundN],
      [east]: [S.pipeToGroundE],
      [south]: [S.pipeToGroundS],
      [west]: [S.pipeToGroundW],
    },
    animationLength: 0,
    
    pipeConnections: {
      [north]: [{x: 0, y: -1}, {x: 0, y: Infinity}],
      [east]: [{x: 1, y: 0}, {x: -Infinity, y: 0}],
      [south]: [{x: 0, y: 1}, {x: 0, y: -Infinity}],
      [west]: [{x: -1, y: 0}, {x: Infinity, y: 0}],
    },
    capacity: 100,
    maxUndergroundGap: 9,
  }],
  [NAME.electricMiningDrill,
  {
    label: 'Electric drill',
    prototypeName: "electric-mining-drill",
    type: TYPE.mine,
    width: 3,
    height: 3,
    rotatable: true,
    icon: S.electricMiningDrillIcon,
    sprites: {
      [north]: [S.electricMiningDrillN, S.electricMiningDrillShadowN],
      [east]: [S.electricMiningDrillE, S.electricMiningDrillShadowE],
      [south]: [S.electricMiningDrillS, S.electricMiningDrillShadowS],
      [west]: [S.electricMiningDrillW, S.electricMiningDrillShadowW],
    },
    animationLength: 10,
    energySource: ENERGY.electric,
    energyConsumption: 90, // kW
    energyDrain: 0, // kW
    
    taskDuration: 2000,
    mineOutput: {
      [north]: {x: 1, y: -1},
      [east]: {x: 3, y: 1},
      [south]: {x: 1, y: 3},
      [west]: {x: -1, y: 1},
    },
    drillArea: 5,
  }],
]);

ENTITIES.keys().forEach(name =>
    ENTITIES.get(name).name = name);

export const PROTO_TO_NAME = new Map(
    ENTITIES.values().map(def =>
    [def.prototypeName, def.name]));

export const ENTITY_ELECTRIC_CONSUMPTIONS =
    new Set(ENTITIES.values().flatMap(def => [
    ...(def.energyConsumption ? [def.energyConsumption] : []),
    ...(def.energyDrain ? [def.energyDrain] : []),
    ]));
ENTITY_ELECTRIC_CONSUMPTIONS.add(0);
