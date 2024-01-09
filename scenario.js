

export function scenario(gameMap, time) {
  const s = {};
  gameMap.createEntity(2, 4, -7, 0, time);
  gameMap.createEntity(1, 5, -8, 3, time);
  s.chest = gameMap.createEntity(2, -18, -9, 0, time);
  gameMap.createEntity(1, -17, -10, 3, time);
  
  const belts = [
    [10, 1, 0, 6],
    [10, 5, 0, 4],
    [10, -5, 1, 10],
    [20, -5, 2, 4],
    [19, -1, 3, 2],
    [20, 0, 2, 6],
    [20, 6, 3, 5],
    [13, 6, 3],
    [14, 6, 3],
    
    [20, -1, 2],
    
    [12, -3, 0],
    [12, -1, 1],
    [12, 1, 2],
    [12, 3, 3],
    
    [14, -1, 1, 2],
    [16, 0, 0, 2],
    [17, -2, 3, 2],
    [15, -3, 2, 2],
    
    [14, 1, 2],
    [14, 2, 1],
    [15, 2, 0],
    [15, 1, 3],
    
    [15, 4, 1],
    [16, 4, 0],
    [17, 4, 3],
    
    [18, -3, 0],
    [18, -4, 2],
    
    [17, -1, 0],
  ].map(b => [b[0] - 15, b[1] + 1, (b[2] + 0) % 4, b[3] ?? 1]);
  belts.forEach(b => {
    for (let i = 0; i < b[3]; i++) {
      const dx = -((b[2] - 2) % 2) * i;
      const dy = ((b[2] - 1) % 2) * i;
      gameMap.createEntity(3, b[0] + dx, b[1] + dy, b[2], time);
    }
  });
  
  return s;
}
