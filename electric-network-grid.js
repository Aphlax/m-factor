

function Grid(poles) {
  this.poles = poles;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Grid.fromPole = function(pole) {
  const grid = new Grid(new Set());
  grid.add(pole);
  return grid;
};

Grid.prototype.update = function(time, dt) {
  
};

Grid.prototype.draw = function(ctx, view) {
  
};

Grid.prototype.add = function(pole) {
  this.poles.add(pole);
  pole.data.grid = this;
};

Grid.prototype.join = function(other) {
  if (other == this) return;
  
  for (let pole of other.poles) {
    this.poles.add(pole);
    pole.data.grid = this;
  }
  other.poles.clear();
};

export {Grid};