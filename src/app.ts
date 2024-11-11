import {Game} from "./game";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const game = new Game(canvas, ctx, false);

game.draw()