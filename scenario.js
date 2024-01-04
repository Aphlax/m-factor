

export function scenario(gameMap, time) {
  const s = {};
  gameMap.createEntity(2, 4, -7, 0, time);
  gameMap.createEntity(1, 5, -8, 3, time);
  s.chest = gameMap.createEntity(2, -18, -9, 0, time);
  gameMap.createEntity(1, -17, -10, 3, time);
  
  const belts = [
    [10, 0, 0],
    [10, -1, 0],
    [10, -2, 1],
    
    [12, -3, 0],
    [12, -1, 1],
    [12, 1, 2],
    [12, 3, 3],
    
    [14, -1, 1],
    [15, -1, 1],
    [16, 0, 0],
    [16, -1, 0],
    [17, -2, 3],
    [16, -2, 3],
    [15, -3, 2],
    [15, -2, 2],
    
    [14, 1, 2],
    [14, 2, 1],
    [15, 2, 0],
    [15, 1, 3],
    
    [15, 4, 1],
    [16, 4, 0],
    [17, 4, 3],
  ];
  belts.forEach(b => gameMap.createEntity(3, ...b, time));
  
  return s;
}
