import {S} from './sprite-pool.js';
import {DIRECTION, TYPE} from './entity-properties.js';


export const NAME = {
  burnerDrill: 1,
  woodenChest: 2,
  transportBelt: 3,
  inserter: 4,
  stoneFurnace: 5,
  assemblingMachine1: 6,
};

export const ENTITIES = new Map([
  [NAME.burnerDrill,
  {
    label: 'Wind up drill',
    type: TYPE.mine,
    width: 2,
    height: 2,
    sprites: {
      [DIRECTION.north]: [S.burnerDrillN, S.burnerDrillShadowN],
      [DIRECTION.east]: [S.burnerDrillE, S.burnerDrillShadowE],
      [DIRECTION.south]: [S.burnerDrillS, S.burnerDrillShadowS],
      [DIRECTION.west]: [S.burnerDrillW, S.burnerDrillShadowW],
    },
    animationLength: 32,
    
    taskDuration: 1250,
    mineOutput: {
      [DIRECTION.north]: {x: 0, y: -1},
      [DIRECTION.east]: {x: 2, y: 0},
      [DIRECTION.south]: {x: 1, y: 2},
      [DIRECTION.west]: {x: -1, y: 1},
    },
  }],
  [NAME.woodenChest,
  {
    label: 'Wooden chest',
    type: TYPE.chest,
    width: 1,
    height: 1,
    sprites: {
      [DIRECTION.north]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.east]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.south]: [S.woodenChest, S.woodenChestShadow],
      [DIRECTION.west]: [S.woodenChest, S.woodenChestShadow],
    },
    animationLength: 0,
    
    capacity: 8,
  }],
  [NAME.transportBelt,
  {
    label: 'Belt',
    type: TYPE.belt,
    width: 1,
    height: 1,
    sprites: {
      [DIRECTION.north]: [S.transportBeltN],
      [DIRECTION.east]: [S.transportBeltE],
      [DIRECTION.south]: [S.transportBeltS],
      [DIRECTION.west]: [S.transportBeltW],
    },
    animationLength: 16,
    animationSpeed: 1.925,
    
    beltSpeed: 1.875, // 15 = 1.875 * 8
    beltSprites: {
      [DIRECTION.north]: [S.transportBeltN, S.transportBeltEN, S.transportBeltWN],
      [DIRECTION.east]: [S.transportBeltE, S.transportBeltSE, S.transportBeltNE],
      [DIRECTION.south]: [S.transportBeltS, S.transportBeltWS, S.transportBeltES],
      [DIRECTION.west]: [S.transportBeltW, S.transportBeltNW, S.transportBeltSW],
    },
    beltEndSprites: {
      [DIRECTION.north]: [S.transportBeltBeginN, S.transportBeltEndN, S.transportBeltEndW, S.transportBeltEndE],
      [DIRECTION.east]: [S.transportBeltBeginE, S.transportBeltEndE, S.transportBeltEndN, S.transportBeltEndS],
      [DIRECTION.south]: [S.transportBeltBeginS, S.transportBeltEndS, S.transportBeltEndE, S.transportBeltEndW],
      [DIRECTION.west]: [S.transportBeltBeginW, S.transportBeltEndW, S.transportBeltEndS, S.transportBeltEndN],
    },
  }],
  [NAME.inserter,
  {
    label: 'Inserter',
    type: TYPE.inserter,
    width: 1,
    height: 1,
    sprites: {
      [DIRECTION.north]: [S.inserter],
      [DIRECTION.east]: [S.inserter + 1],
      [DIRECTION.south]: [S.inserter + 2],
      [DIRECTION.west]: [S.inserter + 3],
    },
    animationLength: 0,
    
    inserterHandSprites: S.inserterHand,
    taskDuration: 400,
  }],
  [NAME.stoneFurnace,
  {
    label: "Stone Furnace",
    type: TYPE.furnace,
    width: 2,
    height: 2,
    sprites: {
      [DIRECTION.north]: [S.stoneFurnaceWorking],
      [DIRECTION.east]: [S.stoneFurnaceWorking],
      [DIRECTION.south]: [S.stoneFurnaceWorking],
      [DIRECTION.west]: [S.stoneFurnaceWorking],
    },
    animationLength: 48,
    animationSpeed: 0.6,
    
    processingSpeed: 1,
    idleAnimation: S.stoneFurnace,
  }],
  [NAME.assemblingMachine1,
  {
    label: "Assembler 1",
    type: TYPE.assembler,
    width: 3,
    height: 3,
    sprites: {
      [DIRECTION.north]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [DIRECTION.east]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [DIRECTION.south]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
      [DIRECTION.west]: [S.assemblingMachine1, S.assemblingMachine1Shadow],
    },
    animationLength: 32,
    animationSpeed: 1,
    
    processingSpeed: 2,
  }],
  [NAME.lab,
  {
    label: "Wind up lab",
    type: TYPE.lab,
    width: 3,
    height: 3,
    sprites: {
      [DIRECTION.north]: [S.lab, S.labShadow],
      [DIRECTION.east]: [S.lab, S.labShadow],
      [DIRECTION.south]: [S.lab, S.labShadow],
      [DIRECTION.west]: [S.lab, S.labShadow],
    },
    animationLength: 33,
    noShadowAnimation: true,
  }],
]);
