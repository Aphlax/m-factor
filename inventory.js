import {ITEMS} from './item-definitions.js';

function Inventory(capacity) {
  this.capacity = capacity;
  this.items = [];
  this.amounts = [];
  this.filters = undefined;
}

/**
 * Which items can be put in here by inserter.
 * -1 for all, otherwise an array.
 */
Inventory.prototype.insertWants = function() {
  if (this.filters && this.filters.length > this.capacity) {
    if (this.items.length < this.capacity) {
      return this.filters.map(f => f.item);
    }
    const result = []; // oh no.
    for (let i = 0, j = 0; j < this.filters.length; j++) {
      while (i < this.items.length &&
          this.items[i] < this.filters[j]) {
        i++;
      }
      if (i == this.items.length) return result;
      if (this.items[i] != this.filters[j].item ||
          this.amounts[i] >= this.filters[j].amount * 2)
        continue;
      result.push(this.items[i]);
    }
    return result;
  }
  if (this.filters) {
    const result = []; // oh no.
    for (let i = 0; i < this.filters.length; i++) {
      if (!this.items[i] ||
          this.amounts[i] < this.filters[i].amount * 2) {
        result.push(this.filters[i].item);
      }
    }
    return result;
  }
  if (this.items.length < this.capacity) {
    return -1;
  }
  const result = []; // oh no.
  let stackSize = 0;
  for (let i = 0; i < this.items.length; i++) {
    if (!i || this.items[i] == this.items[i - 1]) {
      stackSize = ITEMS.get(this.items[i]).stackSize;
    }
    if (this.amounts[i] < stackSize) {
      result.push(this.items[i]);
    }
  }
  return result;
};

Inventory.prototype.insert = function(item, amount) {
  if (this.filters && this.filters.length == this.capacity) {
    for (let i = 0; i < this.filters.length; i++) {
      if (this.filters[i].item != item) continue;
      const stackSize = ITEMS.get(item).stackSize;
      const limit = Math.max(stackSize,
          Math.floor((this.filters[i].amount ?? 0) * 2.2));
      if (!this.items[i]) {
        this.items[i] = item;
        this.amounts[i] = Math.min(amount, limit);
        return this.amounts[i];
      }
      if (this.amounts[i] >= limit) return 0;
      const transfer = Math.min(amount, limit - this.amounts[i]);
      this.amounts[i] += transfer;
      return transfer;
    }
    return 0;
  }
  if (this.filters && !this.filters.some(f => f.item == item)) {
    return 0;
  }
  let count = 0, insertIndex = this.items.length;
  const stackSize = ITEMS.get(item).stackSize;
  for (let i = 0; i < this.items.length; i++) {
    if (this.items[i] == item && this.amounts[i] < stackSize) {
      const transfer = Math.min(amount - count, stackSize - this.amounts[i]);
      this.amounts[i] += transfer;
      count += transfer;
      if (count == amount) break;
    }
    if (this.items[i] > item && i < insertIndex) {
      insertIndex = i;
    }
  }
  while (count != amount && this.items.length < this.capacity) {
    this.items.splice(insertIndex, 0, item);
    const transfer = Math.min(amount - count, stackSize);
    this.amounts.splice(insertIndex, 0, transfer);
    count += transfer;
    insertIndex++;
  }
  return count;
};

Inventory.prototype.extract = function(item, amount, onlyFullAmount) {
  let count = 0;
  for (let i = this.items.length - 1; i >= 0; i--) {
    if (this.items[i] != item) continue;
    if (onlyFullAmount && this.amounts[i] < amount) {
      return 0;
    }
    const transfer = Math.min(amount - count, this.amounts[i]);
    if (transfer == this.amounts[i] && (!this.filter ||
        this.filter.length > this.capacity)) {
      this.items.splice(i, 1);
      this.amounts.splice(i, 1);
    } else {
      this.amounts[i] -= transfer;
    }
    count += transfer;
    if (count >= amount) return count;
  }
  return count;
}

/**
 * If filters.length > capacity, each slot
 * can take any filter value (for furnace).
 * Otherwise each slot can take the item in
 * the corresponding filter.
 */
Inventory.prototype.setFilters = function(filters) {
  if (filters.length < this.capacity)
    throw new Error("Not implemented!");
  this.filters = filters;
  return this;
};

/** Extracts exactly the filters from this inventory. */
Inventory.prototype.extractFilters = function() {
  if (this.filters.length != this.capacity) return false;
  for (let i = 0; i < this.filters.length; i++) {
    if ((this.amounts[i] ?? 0) < this.filters[i].amount) {
      return false;
    }
  }
  for (let i = 0; i < this.filters.length; i++) {
    this.amounts[i] -= this.filters[i].amount;
    if (!this.amounts[i]) {
      this.items[i] = undefined;
      this.amounts[i] = undefined;
    }
  }
  return true;
};

/** Inserts exactly the filters into this inventory. */
Inventory.prototype.insertFilters = function() {
  if (this.filters.length != this.capacity) return false;
  for (let i = 0; i < this.filters.length; i++) {
    const stackSize = ITEMS.get(this.filters[i].item).stackSize;
    if ((this.amounts[i] ?? 0) >= Math.max(stackSize, Math.floor(this.filters[i].amount * 2.2))) {
      return false;
    }
  }
  for (let i = 0; i < this.filters.length; i++) {
    if (!this.items[i]) {
      this.items[i] = this.filters[i].item;
    }
    this.amounts[i] = (this.amounts[i] ?? 0) + this.filters[i].amount;
  }
  return true;
};

export {Inventory};
