"use strict";

const SIZE = 32;

function Chunk(cx, cy) {
	this.x = cx;
	this.y = cy;
	this.tiles = [];
}

Chunk.prototype.generate = function(mapGenerator) {
	this.tiles = mapGenerator.generateTiles(this.x, this.y);
	return this;
};

Chunk.prototype.draw = function(ctx, view) {
	if (view.x > (this.x + 1) * SIZE * 5) return;
	for (let x = 0; x < SIZE; x++) {
		for (let y = 0; y < SIZE; y++) {
			ctx.fillStyle = this.tiles[x][y];
			ctx.fillRect(view.x + (this.x * SIZE + x) * 5, view.y + (this.y * SIZE + y) * 5, 5, 5);
		}
	}
};


export {Chunk};