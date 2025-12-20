import {I} from './item-definitions.js';
import {PROTO_TO_RECIPE} from './recipe-definitions.js';
import {STATE, NAME} from './entity-properties.js';

export function scenario(gameMap, time) {
  return productionTest(gameMap, time);
  return inserterTest(gameMap, time);
}

function productionTest(gameMap, time) {
  const chunks = [
      [2, -2], [2, -1], [2, 0], [2, 1],
      [1, -2], [1, -1], [1, 0], [1, 1],
      [0, -1], [0, 0], [0, 1],
      [-1, 0], [-1, -1], [-1, 1],
      [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-2, 3],
      [-3, -1], [-3, 0], [-3, 1], [-3, 2],
      [-4, -1]];
  chunks.forEach(([x, y]) => gameMap.generateChunk(x, y));
  gameMap.view.x = -550;
  gameMap.view.y = 460;
  gameMap.view.scale = 24;
  
  const e = (name, x, y, direction) => gameMap.createEntity({name, x, y, direction}, time);
  const l = (x, y, d, l) => createLane(gameMap, x, y, d, l, time);
  const p = (x, y, d, l) => createPipe(gameMap, x, y, d, l, time);
  const el = (x, y, d, l, s) => createPoles(gameMap, x, y, d, l, s, time);
  
  for (let i = 0; i < 5; i++) {
    e(NAME.burnerDrill, -10, -7 + 2 * i, 3)
        .energyStored = 150;
    e(NAME.burnerDrill, -13, -6 + 2 * i, 1)
        .energyStored = 150;
  }
  l(-11, -6, 2, 17);
  l(-11, 11, 3, 1);
  
  for (let i = 0; i < 5; i++) {
    e(NAME.burnerDrill, -20, -15 + 2 * i, 3)
        .energyStored = 150;
    e(NAME.burnerDrill, -23, -15 + 2 * i, 1)
        .energyStored = 150;
  }
  l(-21, -15, 2, 26);
  l(-21, 11, 1, 1);
  
  for (let i = 0; i < 8; i++) {
    e(NAME.burnerDrill, -80, 34 + 2 * i, 1)
        .energyStored = 150;
    e(NAME.burnerDrill, -77, 34 + 2 * i, 3)
        .energyStored = 150;
  }
  l(-78, 49, 0, 66);
  l(-78, -17, 1, 63);
  const lane = l(-15, -17, 2, 27);
  lane.minusItems = new Array(140).fill(I.coal);
  lane.minusFlow = new Array(140).fill(0);
  lane.minusFlow[0] = 7;
  lane.plusItems = new Array(135).fill(I.coal);
  lane.plusFlow = new Array(135).fill(0);
  lane.plusFlow[0] = 7;
  
  e(NAME.splitter, -16, 10, 2);
  
  l(-16, 11, 3, 4);
  l(-20, 11, 2, 16);
  l(-15, 11, 1, 3);
  l(-12, 11, 2, 16);
  
  for (let i = 0; i < 8; i++) {
    e(NAME.stoneFurnace, -23, 12 + 2 * i, 0);
    e(NAME.inserter, -21, 12 + 2 * i, 3);
    e(NAME.inserter, -24, 12 + 2 * i, 3);
    e(NAME.stoneFurnace, -10, 12 + 2 * i, 0);
    e(NAME.inserter, -11, 12 + 2 * i, 1);
    e(NAME.inserter, -8, 12 + 2 * i, 1);
  }
  l(-7, 12, 2, 30);
  l(-25, 12, 2, 18);
  l(-25, 30, 1, 16);
  l(-9, 30, 2, 15);
  
  l(-7, 42, 1, 2);l(-5, 42, 2, 2);
  l(-1, 39, 1, 24);
  l(-9, 45, 1, 26);
  l(-3, 39, 1, 1);l(-2, 39, 2, 1);
  l(-2, 40, 1, 2);l(0, 40, 0, 1);
  e(NAME.inserter, -4, 42, 1);
  e(NAME.inserter, -4, 43, 1);
  e(NAME.inserter, -3, 40, 0);
  e(NAME.assemblingMachine1, -3, 41, 0)
      .setRecipe(PROTO_TO_RECIPE.get("iron-gear-wheel"), time);
  let assembler;
  for (let i = 0; i < 6; i++) {
    assembler = e(NAME.assemblingMachine1, 3 * i, 41, 0);
    assembler.setRecipe(PROTO_TO_RECIPE.get("automation-science-pack"), time);
    e(NAME.inserter, 1 + 3 * i, 40, 2);
    e(NAME.inserter, 1 + 3 * i, 44, 0);
    e(NAME.inserter, 2 + 3 * i, 40, 0);
  }
  assembler.nextUpdate = time;
  assembler.inputInventory.insert(I.ironGear, 5);
  assembler.inputInventory.insert(I.copperPlate, 5);
  
  e(NAME.inserter, 23, 39, 1);
  for (let i = 0; i < 6; i++) {
    e(NAME.lab, 24, 38 - 4 * i, 0);
    if (i) {
      e(NAME.inserter, 25, 41 - 4 * i, 0);
    }
  }
  
  e(NAME.inserter, -14, -14, 1);
  l(-13, -14, 1, 46);
  const lane2 = l(33, -14, 2, 39);
  lane2.plusItems = new Array(4 * 85 - 55).fill(I.coal);
  lane2.plusFlow = new Array(4 * 85 - 55).fill(0);
  lane2.plusFlow[0] = 10;
  e(NAME.inserter, 34, 21, 1);
  e(NAME.inserter, 34, 24, 1);
  el(34, 22);
  
  e(NAME.offshorePump, 41, 35, 3);
  p(40, 35, 3, 5);
  p(35, 35, 0, 10);
  e(NAME.boiler, 35, 23, 1)
      .fuelInventory.insert(I.coal, 5);
  e(NAME.boiler, 35, 20, 1);
  
  p(37, 24, 0, 1);
  p(37, 21, 0, 1);
  p(38, 24, 0, 6);
  
  e(NAME.steamEngine, 39, 18, 1);
  e(NAME.steamEngine, 44, 18, 1);
  e(NAME.steamEngine, 49, 18, 1);
  e(NAME.steamEngine, 54, 18, 1);
  el(27, 17, 1, 5);
  el(27, 21, 2, 5, 4);
  el(23, 21, 2, 5, 4);
  
  el(-24, 13, 2, 4, 4);
  el(-21, 13, 2, 4, 4);
  el(-11, 13, 2, 4, 4);
  el(-8, 13, 2, 4, 4);
  
  el(-16, 12, 0, 5);
  el(-1, 17, 1, 4);
  
  el(3, 40, 1, 3, 6);
  el(-3, 44, 1, 4, 6);
  el(-4, 41, 0, 3);
  
  e(NAME.electricFurnace, -9, 8, 0);
  e(NAME.inserter, -10, 9, 1);
  e(NAME.inserter, -7, 11, 2);
  el(-10, 8);
};

function inserterTest(gameMap, time) {
  gameMap.generateChunk(0, 0);
  gameMap.generateChunk(0, -1);
  gameMap.generateChunk(-1, 0);
  gameMap.generateChunk(-1, -1);
  
  const e = (name, x, y, direction) => gameMap.createEntity({name, x, y, direction});
  
  const s = {};
  e(NAME.burnerDrill, 6, 0, 3)
      .energyStored = 150;
  s.chest = e(NAME.woodenChest, -18, -9, 0);
  e(NAME.burnerDrill, -17, -10, 3)
      .energyStored = 150;
  
  e(NAME.burnerDrill, 6, -8, 3)
      .energyStored = 150;
  e(NAME.burnerDrill, 6, -6, 3)
      .energyStored = 150;
  e(NAME.burnerDrill, 0, -9, 2)
      .energyStored = 150;
  e(NAME.burnerDrill, -7, 0, 1)
      .energyStored = 150;
  e(NAME.burnerDrill, 3, 5, 0)
      .energyStored = 150;
  
  const belts = [
    [0, 1, 0, 6],
    [0, 5, 0, 4],
    [0, -5, 1, 10],
    [10, -5, 2, 4],
    [9, -1, 3, 2],
    [10, 0, 2, 6],
    [10, 6, 3, 5],
    [3, 6, 3],
    [4, 6, 3],
    
    [10, -1, 2],
    
    [6, 1, 1, 2],
    [8, 1, 0, 2],
    [7, 3, 1, 1],
    [8, 3, 0, 2],
    [6, 3, 1],
    
    [9, 4, 1],
    
    [2, -3, 0],
    [2, -1, 1],
    [2, 1, 2],
    [2, 3, 3],
    
    [4, -1, 1, 2],
    [6, 0, 0, 2],
    [7, -2, 3, 2],
    [5, -3, 2, 2],
    
    [4, 1, 2],
    [4, 2, 1],
    [5, 2, 0],
    [5, 1, 3],
    
    [5, 4, 1],
    [6, 4, 0],
    [7, 4, 3],
    
    [8, -3, 0],
    [8, -4, 2],
    
    [7, -1, 0],
    
    [1, 5, 1],
    [2, 6, 0, 3],
    [3, 5, 3],
    
    [7, 11, 3, 8],
    
    [-16, -8, 2, 20],
    [-11, 6, 2, 7],
    [-11, 13, 1, 3]
  ].map(([x, y, d, l]) => [x - 5, y - 2, d, l ?? 1]);
  belts.forEach(b => createLane(gameMap, ...b, time));
  
  const remove = [
    [-3, -7],
    
    //[5, 1],
    
    [2, 2],
    
    [-3, 4],
    [-3, 2],
    
    [0, 0],
    
    [1, 4],
    
    [4, 2],
    [3, 1],
  ].map(([x, y]) => 
      gameMap.deleteEntity(gameMap.getEntityAt(x, y)));
  
  createLane(gameMap, 1, 4, 0, 2, time);
  createLane(gameMap, 0, 0, 0, 1, time);
  createLane(gameMap, 0, 1, 0, 1, time);
  gameMap.deleteEntity(gameMap.getEntityAt(0, 0));
  createLane(gameMap, 3, 1, 2, 1, time);
  createLane(gameMap, 3, 2, 1, 1, time);
  createLane(gameMap, 4, 2, 0, 2, time);
  createLane(gameMap, 4, 0, 3, 1, time);
  
  createLane(gameMap, -4, -6, 1, 3, time);
  createLane(gameMap, -1, -6, 0, 1, time);
  createLane(gameMap, -3, -7, 2, 1, time);
  
  createLane(gameMap, 0, -6, 2, 1, time);
  
  const i = e(NAME.inserter, 4, -11, 3);
  i.data.inserterItem = 2;
  e(NAME.inserter, 4, -5, 3);
  e(NAME.inserter, 4, -1, 1);
  e(NAME.inserter, 4, 3, 2);
  e(NAME.inserter, 0, -2, 2);
  e(NAME.inserter, -2, -1, 3);
  e(NAME.inserter, -3, -2, 0);
  e(NAME.inserter, -3, -4, 0);
  e(NAME.inserter, 2, 0, 3);
  e(NAME.woodenChest, 1, 0, 0);
  e(NAME.transportBelt, 1, -5, 3);
  e(NAME.inserter, 2, -5, 3);
      
  e(NAME.inserter, 1, 5, 2);
  s.furnace = e(NAME.stoneFurnace, 0, 6, 0);
  e(NAME.stoneFurnace, -2, 6, 0);
  const f = e(NAME.stoneFurnace, -4, 6, 0);
  f.outputInventory.insert(I.ironPlate, 100);
  e(NAME.inserter, 1, 8, 2);
  e(NAME.inserter, -3, 8, 2);
  e(NAME.inserter, -2, 5, 2);
  e(NAME.inserter, 0, 4, 3);
  
  s.assembler = e(NAME.assemblingMachine1, -6, 11, 0);
  e(NAME.inserter, -5, 10, 2);
  s.inserter = e(NAME.inserter, -4, 10, 2);
  s.assembler.setRecipe(PROTO_TO_RECIPE.get("iron-gear-wheel"), time);
  e(NAME.inserter, -7, 12, 3);
  createLane(gameMap, -8, 12, 2, 2, time);
 
  e(NAME.burnerDrill, -23, -7, 1)
      .energyStored = 150;
  e(NAME.burnerDrill, -23, -9, 1)
      .energyStored = 150;
  e(NAME.burnerDrill, -23, -4, 1)
      .energyStored = 150;
  e(NAME.burnerDrill, -22, -12, 2)
      .energyStored = 150;
  e(NAME.stoneFurnace, -19, 4, 0)
      .energyStored = 1500;
  e(NAME.stoneFurnace, -19, 7, 0)
      .energyStored = 1500;
  e(NAME.stoneFurnace, -19, 9, 0)
      .energyStored = 1500;
  e(NAME.inserter, -20, 4, 1);
  e(NAME.inserter, -20, 8, 1);
  e(NAME.inserter, -17, 4, 1);
  e(NAME.inserter, -17, 7, 1);
  e(NAME.inserter, -20, 9, 1);
  e(NAME.inserter, -17, 9, 1);
  
  e(NAME.assemblingMachine1, -12, 11, 0)
      .setRecipe(PROTO_TO_RECIPE.get("automation-science-pack"), time);
  e(NAME.inserter, -9, 13, 3);
  e(NAME.inserter, -13, 11, 1);
  e(NAME.inserter, -11, 14, 2);
  createLane(gameMap, -11, 15, 2, 2, time);
  e(NAME.inserter, -11, 17, 2);
  s.lab = e(NAME.lab, -12, 18, 0);
  
  e(NAME.assemblingMachine1, -8, 16, 0);
  
  createLane(gameMap, -12, -5, 0, 1, time);
  createLane(gameMap, -12, -6, 1, 1, time);
  createLane(gameMap, -11, -6, 2, 1, time);
  const lane = createLane(gameMap, -11, -5, 3, 1, time);
  e(NAME.burnerDrill, -12, -8, 2)
      .energyStored = 150;
  lane.minusItems = new Array(4 * 6).fill(I.ironOre);
  lane.minusFlow = new Array(4 * 6).fill(0);
  return s;
}

function createLane(gameMap, x, y, direction, length, time) {
  for (let i = 0; i < length; i++) {
    const dx = -((direction - 2) % 2) * i;
    const dy = ((direction - 1) % 2) * i;
    const b = gameMap.createEntity({
        name: NAME.transportBelt,
        x: x + dx, y: y + dy,
        direction});
    if (i == length - 1) {
      return b?.data?.lane;
    }
  }
}

function createPipe(gameMap, x, y, direction, length, time) {
  for (let i = 0; i < length; i++) {
    const dx = -((direction - 2) % 2) * i;
    const dy = ((direction - 1) % 2) * i;
    const b = gameMap.createEntity({
        name: NAME.pipe,
        x: x + dx, y: y + dy,
        direction: 0});
    if (i == length - 1) {
      return b?.data?.channel;
    }
  }
}

function createPoles(gameMap, x, y, direction, length, spacing, time) {
  for (let i = 0; i < (length ?? 1); i++) {
    const dx = -(((direction ?? 0) - 2) % 2) * i * (spacing ?? 7);
    const dy = (((direction ?? 0) - 1) % 2) * i * (spacing ?? 7);
    const b = gameMap.createEntity({
        name: NAME.smallElectricPole,
        x: x + dx, y: y + dy,
        direction: 0});
    if (i == length - 1) {
      return b.data?.grid;
    }
  }
}
