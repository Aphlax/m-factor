import {ITEMS, I} from './item-definitions.js';

export const TYPE = {
  mine: 1,
  chest: 2,
  belt: 3,
  inserter: 4,
  furnace: 5,
  assembler: 6,
  lab: 7,
  offshorePump: 8,
  pipe: 9,
  boiler: 10,
  generator: 11,
  electricPole: 12,
  undergroundBelt: 14,
  pipeToGround: 15,
  splitter: 16,
};

export const NAME = {
  burnerDrill: 1,
  woodenChest: 2,
  transportBelt: 3,
  inserter: 4,
  stoneFurnace: 5,
  assemblingMachine1: 6,
  lab: 7,
  offshorePump: 8,
  pipe: 9,
  boiler: 10,
  steamEngine: 11,
  smallElectricPole: 12,
  electricFurnace: 13,
  undergroundBelt: 14,
  pipeToGround: 15,
  electricMiningDrill: 16,
  splitter: 17,
  burnerInserter: 18,
  fastInserter: 19,
  longHandedInserter: 20,
};

/** Never value for next update. 285 years from now. */
export const NEVER = Math.floor(Number.MAX_SAFE_INTEGER / 1000);

/** Maximal width/length of any entity. */
export const MAX_SIZE = 5;

/** Maximal length of inserter arm. */
export const MAX_LOGISTIC_CONNECTION = 2;

/** Maximal length of underground belts and pipes. */
export const MAX_UNDERGROUND_CONNECTION = 10;

/** Longest extra length of any shadow. */
export const MAX_SHADOW = 3;

/** Maximal wire reach of any pole. */
export const MAX_WIRE_REACH = 7;

/** Maximal reach of electric supply areas. */
export const MAX_ELECTRIC_SUPPLY = 2;

/** Minimal electric satisfaction for an entiry to make progress. */
export const MIN_SATISFACTION = 0.005;

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
  idle: 15, // No work todo for other reason
  multipleGrids: 16,
};

export const DIRECTION = {
  north: 0,
  east: 1,
  south: 2,
  west: 3,
}

export const DIRECTIONS = [
  {dx: 0, dy: -1},
  {dx: 1, dy: 0},
  {dx: 0, dy: 1},
  {dx: -1, dy: 0},
];

export const COLOR = {
  greenHighlight: "#33EE00",
  greenHighlightBorder: "#44AA00",
  yellowHighlight: "#EEEE00",
  yellowHighlightBorder: "#FFAA00",
  redHighlight: "#AA2222",
  redHighlightBorder: "#FF2222",
  blueHighlight: "#0000AA",
  blueHighlightBorder: "#0000FF",
  wire: "#EEAA22",
  shadow: "#000000",
  powerSupplyArea: "#88AAFF40",
  mineDrillArea: "#AADDFF30",
};

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
  [2]: [{x: 1, y: 0}, {x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}],
  [4]: [{x: 2, y: -1}, {x: 1, y: 2}, {x: 0, y: -1}, {x: -1, y: -1}, {x: 1, y: 1}, {x: 1, y: 0}, {x: -1, y: 2}, {x: 2, y: 1}, {x: -1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: -1, y: 1}, {x: 2, y: 2}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 2, y: 0}],
  [5]: [{x: 1, y: 2}, {x: 0, y: 3}, {x: 1, y: -1}, {x: -1, y: 2}, {x: 2, y: 3}, {x: 0, y: 1}, {x: 3, y: 2}, {x: 2, y: 2}, {x: -1, y: 0}, {x: 2, y: 0}, {x: 3, y: 3}, {x: 0, y: -1}, {x: 0, y: 2}, {x: 3, y: -1}, {x: 2, y: 1}, {x: 3, y: 0}, {x: 1, y: 1}, {x: 2, y: -1}, {x: 3, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: -1, y: -1}, {x: -1, y: 1}, {x: -1, y: 3}, {x: 1, y: 3}],
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


export const ENERGY = {
  none: 0,
  burner: 1,
  windUp: 2,
  electric: 3,
};

export const FUEL_FILTERS =
    [...ITEMS.entries().filter(([i, {fuelValue}]) => fuelValue)
    .map(([item]) => ({item, amount: 1}))];


function rectOverlap(x, y, width, height, entity) {
  return x + width > entity.x && x < entity.x + entity.width &&
      y + height > entity.y && y < entity.y + entity.height;
}
function rectOverlap2(entity, other) {
  return entity.x + entity.width > other.x &&
      entity.x < other.x + other.width &&
      entity.y + entity.height > other.y &&
      entity.y < other.y + other.height;
}
