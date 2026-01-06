import {ITEMS} from './item-definitions.js';

function Inventory(capacity) {
  this.capacity = capacity;
  this.items = [];
  this.amounts = [];
  this.filters = undefined;
}

/**
 * Returns the itemId of an allowed item,
 * otherwise returns -1 if the inventory
 * is full or 0 if none of the items can be
 * inserted.
 */
Inventory.prototype.allowsItems = function(a, b, c) {
  if (this.filters && this.filters.length == this.capacity) {
    // Filtered slots
    let full = true;
    for (let i = 0; i < this.filters.length; i++) {
      const filter = this.filters[i].item;
      if (!this.items[i] ||
          this.amounts[i] < this.filters[i].amount * 2) {
        if (filter == a) return a;
        if (filter == b) return b;
        if (filter == c) return c;
        full = false;
      }
    }
    return full ? -1 : 0;
  }
  if (this.filters) {
    if (this.items.length < this.capacity) {
      for (let filter of this.filters) {
        if (a == filter.item) return a;
        if (b == filter.item) return b;
        if (c == filter.item) return c;
      }
      return 0;
    }
    // All slots occupied, e.g. fuel slot with one present.
    let full = true;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      for (let filter of this.filters) {
        if (item == filter.item) {
          if (this.amounts[i] < filter.amount * 2) {
            if (item == a || item == b || item == c) {
              return item;
            }
            full = false;
          }
          break;
        }
      }
    }
    return full ? -1 : 0;
  }
  if (this.items.length < this.capacity) {
    return a;
  }
  // Each spot is full, ckeck if a stack is incomplete.
  let stackSize = 0, full = true;
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i];
    if (!i || item != this.items[i - 1]) {
      stackSize = ITEMS.get(item).stackSize;
    }
    if (this.amounts[i] < stackSize) {
      if (item == a) return a;
      if (item == b) return b;
      if (item == c) return c;
      full = false;
    }
  }
  return full ? -1 : 0;
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
