

export function scenario(gameMap, time) {
  const s = {};
  gameMap.createEntity(2, 4, -9, 0, time);
  gameMap.createEntity(1, 5, -10, 3, time);
  s.chest = gameMap.createEntity(2, -18, -9, 0, time);
  gameMap.createEntity(1, -17, -10, 3, time);
  
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
  ].map(b => [b[0] - 5, b[1] - 2, (b[2] + 0) % 4, b[3] ?? 1]);
  belts.forEach(b => {
    for (let i = 0; i < b[3]; i++) {
      const dx = -((b[2] - 2) % 2) * i;
      const dy = ((b[2] - 1) % 2) * i;
      gameMap.createEntity(3, b[0] + dx, b[1] + dy, b[2], time);
    }
  });
  
  return s;
}
