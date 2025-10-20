import {NAME} from './entity-definitions.js';
import {I} from './item-definitions.js';
import {PROTO_TO_RECIPE} from './recipe-definitions.js';

export function scenario(gameMap, time) {
  return productionTest(gameMap, time);
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
  gameMap.view.x = 750;
  gameMap.view.y = 480;
  
  const e = (n, x, y, d) => gameMap.createEntity(n, x, y, d, time);
  const l = (x, y, d, l) => createLane(gameMap, x, y, d, l, time);
  const p = (x, y, d, l) => createPipe(gameMap, x, y, d, l, time);
  
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
  l(-15, -17, 2, 26);
  const lane = l(-15, 9, 3, 2);
  lane.minusItem = I.coal;
  lane.minusFlow = new Array(140).fill(0.81);
  lane.minusFlow[0] = 7;
  lane.plusItem = I.coal;
  lane.plusFlow = new Array(135).fill(0.81);
  lane.plusFlow[0] = 6.4;
  
  e(NAME.inserter, -16, 10, 2);
  e(NAME.inserter, -15, 10, 2);
  
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
  for (let i = 0; i < 6; i++) {
    e(NAME.assemblingMachine1, 3 * i, 41, 0)
        .setRecipe(PROTO_TO_RECIPE.get("automation-science-pack"), time);
    e(NAME.inserter, 1 + 3 * i, 40, 2);
    e(NAME.inserter, 1 + 3 * i, 44, 0);
    e(NAME.inserter, 2 + 3 * i, 40, 0);
  }
  
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
  lane2.plusItem = I.coal;
  lane2.plusFlow = new Array(4 * 85 - 7).fill(0);
  e(NAME.inserter, 34, 21, 1);
  e(NAME.inserter, 34, 24, 1);
  
  e(NAME.offshorePump, 41, 35, 3);
  p(40, 35, 3, 5);
  p(35, 35, 0, 10);
  e(NAME.boiler, 35, 23, 1);
  e(NAME.boiler, 35, 20, 1);
  
  p(37, 24, 0, 1);
  p(37, 21, 0, 1);
  p(38, 24, 0, 6);
  
  e(NAME.steamEngine, 39, 18, 1);
  e(NAME.steamEngine, 44, 18, 1);
  e(NAME.steamEngine, 49, 18, 1);
  e(NAME.steamEngine, 54, 18, 1);
  e(NAME.smallElectricPole, 41, 17, 0);
  e(NAME.smallElectricPole, 47, 17, 0);
  e(NAME.smallElectricPole, 53, 17, 0);
};

function inserterTest(gameMap, time) {
  gameMap.generateChunk(0, 0);
  gameMap.generateChunk(0, -1);
  gameMap.generateChunk(-1, 0);
  gameMap.generateChunk(-1, -1);
  
  const s = {};
  gameMap.createEntity(NAME.burnerDrill, 6, 0, 3, time);
  s.chest = gameMap.createEntity(NAME.woodenChest, -18, -9, 0, time);
  gameMap.createEntity(NAME.burnerDrill, -17, -10, 3, time);
  
  gameMap.createEntity(NAME.burnerDrill, 6, -8, 3, time);
  gameMap.createEntity(NAME.burnerDrill, 6, -6, 3, time);
  gameMap.createEntity(NAME.burnerDrill, 0, -9, 2, time);
  gameMap.createEntity(NAME.burnerDrill, -7, 0, 1, time);
  gameMap.createEntity(NAME.burnerDrill, 3, 5, 0, time);
  
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
  
  const i = gameMap.createEntity(NAME.inserter,
      4, -11, 3, time);
  i.data.inserterItem = 2;
  gameMap.createEntity(NAME.inserter,
      4, -5, 3, time);
  gameMap.createEntity(NAME.inserter,
      4, -1, 1, time);
  gameMap.createEntity(NAME.inserter,
      4, 3, 2, time);
  gameMap.createEntity(NAME.inserter,
      0, -2, 2, time);
  gameMap.createEntity(NAME.inserter,
      -2, -1, 3, time);
  gameMap.createEntity(NAME.inserter,
      -3, -2, 0, time);
  gameMap.createEntity(NAME.inserter,
      -3, -4, 0, time);
  gameMap.createEntity(NAME.inserter,
      2, 0, 3, time);
  gameMap.createEntity(NAME.woodenChest,
      1, 0, 0, time);
  gameMap.createEntity(NAME.transportBelt,
      1, -5, 3, time);
  gameMap.createEntity(NAME.inserter,
      2, -5, 3, time);
      
  gameMap.createEntity(NAME.inserter,
      1, 5, 2, time);
  s.furnace = gameMap.createEntity(NAME.stoneFurnace,
      0, 6, 0, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -2, 6, 0, time);
  const f = gameMap.createEntity(NAME.stoneFurnace,
      -4, 6, 0, time);
  f.outputInventory.insert(I.ironPlate, 100);
  gameMap.createEntity(NAME.inserter,
      1, 8, 2, time);
  gameMap.createEntity(NAME.inserter,
      -3, 8, 2, time);
  gameMap.createEntity(NAME.inserter,
      -2, 5, 2, time);
  gameMap.createEntity(NAME.inserter,
      0, 4, 3, time);
  
  s.assembler = gameMap.createEntity(NAME.assemblingMachine1,
      -6, 11, 0, time);
  gameMap.createEntity(NAME.inserter,
      -5, 10, 2, time);
  s.inserter = gameMap.createEntity(NAME.inserter,
      -4, 10, 2, time);
  s.assembler.setRecipe(PROTO_TO_RECIPE.get("iron-gear-wheel"), time);
  gameMap.createEntity(NAME.inserter,
      -7, 12, 3, time);
  createLane(gameMap, -8, 12, 2, 2, time);
 
  gameMap.createEntity(NAME.burnerDrill, -23, -7, 1, time);
  gameMap.createEntity(NAME.burnerDrill, -23, -9, 1, time);
  gameMap.createEntity(NAME.burnerDrill, -23, -4, 1, time);
  gameMap.createEntity(NAME.burnerDrill, -22, -12, 2, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -19, 4, 0, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -19, 7, 0, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -19, 9, 0, time);
  gameMap.createEntity(NAME.inserter,
      -20, 4, 1, time);
  gameMap.createEntity(NAME.inserter,
      -20, 8, 1, time);
  gameMap.createEntity(NAME.inserter,
      -17, 4, 1, time);
  gameMap.createEntity(NAME.inserter,
      -17, 7, 1, time);
  gameMap.createEntity(NAME.inserter,
      -20, 9, 1, time);
  gameMap.createEntity(NAME.inserter,
      -17, 9, 1, time);
  
  gameMap.createEntity(NAME.assemblingMachine1,
      -12, 11, 0, time).setRecipe(PROTO_TO_RECIPE.get("automation-science-pack"), time);
  gameMap.createEntity(NAME.inserter,
      -9, 13, 3, time);
  gameMap.createEntity(NAME.inserter,
      -13, 11, 1, time);
  gameMap.createEntity(NAME.inserter,
      -11, 14, 2, time);
  createLane(gameMap, -11, 15, 2, 2, time);
  gameMap.createEntity(NAME.inserter,
      -11, 17, 2, time);
  s.lab = gameMap.createEntity(NAME.lab,
      -12, 18, 0, time);
  
  gameMap.createEntity(NAME.assemblingMachine1,
      -8, 16, 0, time);
  
  createLane(gameMap, -12, -5, 0, 1, time);
  createLane(gameMap, -12, -6, 1, 1, time);
  createLane(gameMap, -11, -6, 2, 1, time);
  const lane = createLane(gameMap, -11, -5, 3, 1, time);
  gameMap.createEntity(NAME.burnerDrill, -12, -8, 2, time);
  lane.minusItem = I.ironOre;
  lane.minusFlow = new Array(4 * 6).fill(0);
  return s;
}

function createLane(gameMap, x, y, direction, length, time) {
  for (let i = 0; i < length; i++) {
    const dx = -((direction - 2) % 2) * i;
    const dy = ((direction - 1) % 2) * i;
    const b = gameMap.createEntity(NAME.transportBelt,
        x + dx, y + dy, direction, time);
    if (i == length - 1) {
      return b?.data?.lane;
    }
  }
}

function createPipe(gameMap, x, y, direction, length, time) {
  for (let i = 0; i < length; i++) {
    const dx = -((direction - 2) % 2) * i;
    const dy = ((direction - 1) % 2) * i;
    const b = gameMap.createEntity(NAME.pipe,
        x + dx, y + dy, 0, time);
    if (i == length - 1) {
      return b?.data?.channel;
    }
  }
}
