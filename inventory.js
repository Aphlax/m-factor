import {ITEMS} from './item-definitions.js';

function Inventory(capacity) {
  this.capacity = capacity;
  this.items = [];
  this.amounts = [];
}

/**
 * Which items can be put in here.
 * -1 for all, otherwise an array.
 */
Inventory.prototype.insertWants = function() {
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

Inventory.prototype.canInsert = function(item) {
  if (this.items.length < this.capacity) {
    return true;
  }
  for (let i = 0; i < this.items.length; i++) {
    if (this.items[i] == item && this.amounts[i] < stackSize) {
      return true;
    }
  }
  return false;
};

Inventory.prototype.insert = function(item, amount) {
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

export {Inventory};
