import {ITEMS} from './item-definitions.js';

function Inventory(capacity) {
  this.capacity = capacity;
  this.items = [];
  this.amounts = [];
}

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
