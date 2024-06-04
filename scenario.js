import {NAME} from './entity-definitions.js';

export function scenario(gameMap, time) {
  return inserterTest(gameMap, time);
}

function inserterTest(gameMap, time) {
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
      
  s.inserter = gameMap.createEntity(NAME.inserter,
      1, 5, 2, time);
  s.furnace = gameMap.createEntity(NAME.stoneFurnace,
      0, 6, 0, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -2, 6, 0, time);
  gameMap.createEntity(NAME.stoneFurnace,
      -4, 6, 0, time);
  
  return s;
}

function createLane(gameMap, x, y, direction, length, time) {
  for (let i = 0; i < length; i++) {
    const dx = -((direction - 2) % 2) * i;
    const dy = ((direction - 1) % 2) * i;
    gameMap.createEntity(NAME.transportBelt,
        x + dx, y + dy, direction, time);
  }
}
