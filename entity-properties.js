

export const RESOURCE_NAMES = {
  iron: 1,
  copper: 2,
  coal: 3,
  stone: 4,
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
  x4: [],
  y4: [],
};

export const MINE_PRODUCTS = {
  [RESOURCE_NAMES.iron]: I.ironOre,
  [RESOURCE_NAMES.copper]: I.copperOre,
  [RESOURCE_NAMES.coal]: I.coal,
  [RESOURCE_NAMES.stone]: I.stone,
};
