

function FluidTank() {
  this.tanklets = [];
  this.pipeConnections = undefined;
  this.internalInlet = false;
}

FluidTank.prototype.setPipeConnections = function(points) {
  this.pipeConnections = points;
  return this;
};

FluidTank.prototype.setInternalInlet = function(internalInlet) {
  this.internalInlet = internalInlet;
  return this;
};

FluidTank.prototype.setTanklets = function(fluids) {
  this.tanklets.length = 0;
  for (let fluid of fluids) {
    this.tanklets.push(new Tanklet(fluid));
  }
  return this;
};

/** For use with recipes. */
FluidTank.prototype.setFilters = function(filters) {
  this.tanklets.length = 0;
  if (!filters) return;
  for (let filter of filters) {
    const tanklet = new Tanklet(filter.item);
    tanklet.capacity = filter.amount * 2;
    this.tanklets.push(tanklet);
  }
  return this;
};

function Tanklet(fluid) {
  this.fluid = fluid;
  this.amount = 0;
  this.capacity = 200;
}

export {FluidTank};
