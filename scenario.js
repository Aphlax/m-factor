

export function scenario(gameMap, time) {
  const s = {};
  gameMap.createEntity(2, 4, -7, 0, time);
  gameMap.createEntity(1, 5, -8, 3, time);
  s.chest = gameMap.createEntity(2, -18, -9, 0, time);
  gameMap.createEntity(1, -17, -10, 3, time);
  
  const belts = [
    [0, 0, 0],
    [0, -1, 0],
    [0, -2, 1],
  ];
  belts.forEach(b => gameMap.createEntity(3, ...b, time));
  
  return s;
}