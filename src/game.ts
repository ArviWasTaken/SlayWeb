import {DisplayDriver} from "./displayDriver";
import {Hex} from "./hex";
import {Vector} from "./vector";
import {DefaultColors} from "./enums";
import {Player} from "./player";

export class Game {
    debug: boolean;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    displayDriver: DisplayDriver;
    hexes: Array<Hex>
    players: Array<Player>;
    worldSize: Vector;

    constructor(canvas : HTMLCanvasElement, ctx: CanvasRenderingContext2D, debug: boolean) {
        this.worldSize = new Vector(20, 20)
        this.canvas = canvas;
        this.ctx = ctx;
        this.displayDriver = new DisplayDriver(canvas, ctx, this.worldSize);
        this.debug = debug;
        this.hexes = new Array<Hex>();
        this.players = new Array<Player>();

        this.players.push(
           new Player(DefaultColors.One),
           new Player(DefaultColors.Two),
           new Player(DefaultColors.Three),
           new Player(DefaultColors.Four),
           new Player(DefaultColors.Five),
           new Player(DefaultColors.Six),
        );

        for (let y = 0; y < this.worldSize.y; y++) {
            for (let x = 0; x < this.worldSize.x; x++) {
                this.hexes.push(new Hex(new Vector(x, y), this.randomPlayer()))
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.displayDriver.drawBackground();
        this.displayDriver.drawGrid(this.hexes);

        if (this.debug) {
            this.displayDriver.drawDebug();
        }

        requestAnimationFrame(() => this.draw())
    }

    randomPlayer() {
        const r = Math.random();
        return r < 0.16 ? this.players[0] :
         r < 0.33 ? this.players[1] :
         r < 0.5 ? this.players[2] :
         r < 0.66 ? this.players[3] :
         r < 0.83 ? this.players[4] :
         this.players[5];
    }
}