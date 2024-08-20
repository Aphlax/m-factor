

function FluidTank() {
  this.tanklets = [];
  this.connectionPoints = undefined;
}

FluidTank.prototype.setConnectionPoints = function(points) {
  this.connectionPoints = points;
  return this;
};

FluidTank.prototype.setConstantProduction = function(fluid, amount) {
  this.tanklets[0] = new Tanklet(fluid);
  this.tanklets[0].constantProduction = amount;
  return this;
};

function Tanklet(fluid) {
  this.fluid = fluid;
  this.amount = 0;
  this.constantProduction = 0;
}

export {FluidTank};
