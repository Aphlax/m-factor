import {I} from './item-definitions.js';

export const TYPE = {
  mine: 1,
  chest: 2,
  belt: 3,
  inserter: 4,
};

export const MAX_SIZE = 3;

export const STATE = {
  running: 0,
  idle: 1,
  missingItem: 1,
  outputFull: 2,
  noEnergy: 3,
  mineNoOutput: 10,
  mineEmpty: 11,
};

export const DIRECTION = {
  north: 0,
  east: 1,
  south: 2,
  west: 3,
}

export const RESOURCE_NAMES = {
  iron: 1,
  copper: 2,
  coal: 3,
  stone: 4,
};

export const RESOURCE_LABELS = {
  [RESOURCE_NAMES.iron]: "Iron ore",
  [RESOURCE_NAMES.copper]: "Copper ore",
  [RESOURCE_NAMES.coal]: "Coal",
  [RESOURCE_NAMES.stone]: "Stone",
};

export function resourceSprite(amount) {
  return amount <= 25 ? 0 :
      amount <= 100 ? 1 :
      amount <= 500 ? 2 :
      amount <= 2500 ? 3 :
      amount <= 10000 ? 4 :
      amount <= 50000 ? 5 :
      amount <= 250000 ? 6 : 7;
}

export const MINE_PATTERN = {
  x4: [2, 1, 0, -1, 1, 1, -1, 2, -1, 1, 0, -1, 2, 0, 0, 2],
  y4: [-1, 2, -1, -1, 1, 0, 2, 1, 0, -1, 2, 1, 2, 0, 1, 0],
};

export const MINE_PRODUCTS = {
  [RESOURCE_NAMES.iron]: I.ironOre,
  [RESOURCE_NAMES.copper]: I.copperOre,
  [RESOURCE_NAMES.coal]: I.coal,
  [RESOURCE_NAMES.stone]: I.stone,
};



export function rectOverlap(x, y, width, height, entity) {
  return x + width > entity.x && x < entity.x + entity.width &&
      y + height > entity.y && y < entity.y + entity.height;
}
