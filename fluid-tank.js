

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

function Tanklet(fluid) {
  this.fluid = fluid;
  this.amount = 0;
  this.capacity = 200;
}

export {FluidTank};
