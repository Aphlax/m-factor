"use strict";

import {MapGenerator} from './map-generator.js';
import {Chunk} from './chunk.js';

function Game(canvas) {
	this.seed = 1274;
    this.mapGenerator = new MapGenerator(this.seed);
    this.mapGenerator.initialize();
    this.chunks = new Map();
    this.dragpos = {x: 0, y: 0};
    this.view = {x: 0, y: 60, width: canvas.width, height: canvas.height, scale: 1};
}

Game.prototype.update = function(time, dt, input) {
	const viewX = Math.floor(this.view.x / 160), viewY = Math.floor(this.view.y / 160);
    for (let x = 0; x <= Math.ceil(this.view.width / 160); x++) {
    	for (let y = 0; y <= Math.ceil(this.view.height / 160); y++) {
    	    const cx = viewX + x;
            const cy = viewY + y;
    	    if (!this.chunks.has(cx)) {
    	        this.chunks.set(cx, new Map());
            }
            if (!this.chunks.get(cx).has(cy)) {
            	this.chunks.get(cx).set(cy, new Chunk(cx, cy).generate(this.mapGenerator));
            }
        }
    }
};

Game.prototype.draw = function(time, dt, ctx) {
	/*
    ctx.font = "24px serif";
    ctx.fillStyle = "blue";
    ctx.fillText(1023.567 % 512, 10, 50);
    */
    for (let [x, cols] of this.chunks.entries()) {
    	if ((x + 1) * 160 <= this.view.x) continue;
        if (x * 160 > this.view.width + this.view.x) continue;
    	for (let [y, chunk] of cols.entries()) {
        	if ((y + 1) * 160 <= this.view.y) continue;
            if (y * 160 > this.view.height + this.view.y) continue;
    	    chunk.draw(ctx, this.view);
        }
    }
};

Game.prototype.touchStart = function(e) {
	this.dragpos.x = e.touches[0].clientX;
	this.dragpos.y = e.touches[0].clientY;
}
Game.prototype.touchMove = function(e) {
	this.view.x = Math.round(this.view.x - e.touches[0].clientX + this.dragpos.x);
	this.view.y = Math.round(this.view.y - e.touches[0].clientY + this.dragpos.y);
	this.dragpos.x = e.touches[0].clientX;
	this.dragpos.y = e.touches[0].clientY;
}
Game.prototype.touchEnd = function(e) {
	
}


export {Game};