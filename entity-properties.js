import {ITEMS, I} from './item-definitions.js';

export const TYPE = {
  mine: 1,
  chest: 2,
  belt: 3,
  inserter: 4,
  furnace: 5,
  assembler: 6,
  lab: 7,
};

/** Never value for next update. */
export const NEVER = Math.floor(Number.MAX_SAFE_INTEGER / 1000);

export const MAX_SIZE = 3;

export const STATE = {
  running: 0,
  missingItem: 1,
  outputFull: 2, // Inserter output does not want anything.
  itemReady: 3, // Inserter or mine ready to drop item (but output entity does not accept it). Assembler output yellow.
  outOfEnergy: 4, // Stopped mid task because there was no energy.
  noEnergy: 5, // Did not start a task because there was no energy.
  
  noOutput: 11, // Inserter or mine has no output (after item is ready to drop).
  inserterCoolDown: 12, // Inserter moving back to initial position.
  mineEmpty: 13,
  noRecipe: 14,
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

export const INSERTER_PICKUP_BEND = {
  [DIRECTION.north]: 0,
  [DIRECTION.east]: -0.22 * 0.9,
  [DIRECTION.south]: 0,
  [DIRECTION.west]: 0.22 * 0.9,
};

export const LAB_FILTERS = [
  {item: I.redScience, amount: 1},
];

export function rectOverlap(x, y, width, height, entity) {
  return x + width > entity.x && x < entity.x + entity.width &&
      y + height > entity.y && y < entity.y + entity.height;
}

export const ENERGY = {
  burner: 1,
  windUp: 2,
  electricity: 3,
};

export const FUEL_FILTERS =
    [...ITEMS.entries().filter(([i, {fuelValue}]) => fuelValue)
    .map(([item]) => ({item, amount: 1}))];
