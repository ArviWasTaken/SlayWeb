import {Vector} from "./vector.js";
import {ZoomLevels} from "./enums.js";

export class DisplayDriver {
    debug: boolean = false;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    a: number = 2 * Math.PI / 6;

    // dragging map around vars
    dragging: boolean;
    camOffset: Vector;
    lastReceivedPoint: Vector;

    // zoom vars
    zoomLevel: ZoomLevels;

    gridData = Vector.Value(10);

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.setElementToScreenSize();
        this.initEventListeners();

        this.dragging = false;
        this.zoomLevel = ZoomLevels.In
        this.lastReceivedPoint = Vector.Zero();

        this.camOffset = new Vector(
            canvas.width / 2 - this.gridData.x / 2 * this.hexWidth(),
            canvas.height / 2 - this.gridData.y / 2 * this.hexHeight()
        );
    }

    setElementToScreenSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }

    initEventListeners() {
        addEventListener("pointermove", (e: PointerEvent) => {
            const worldCoord = new Vector(e.offsetX, e.offsetY);
            if (this.dragging) {
                this.camOffset = this.camOffset.add(worldCoord.subtract(this.lastReceivedPoint));
            }
            this.lastReceivedPoint = worldCoord;
        } );
        addEventListener("resize", this.setElementToScreenSize);
        addEventListener("pointerup", () => this.dragging = false);
        addEventListener("pointerdown", () => this.dragging = true);
        addEventListener("wheel", (e) => {
            const location = new Vector(e.offsetX, e.offsetY);
            const hexesLeftLocation = location.subtract(this.camOffset).x / this.hexWidth();
            const hexesAboveLocation = location.subtract(this.camOffset).y / this.hexHeight();
            if (e.deltaY > 0) {
                switch (this.zoomLevel) {
                    case ZoomLevels.In:
                        this.zoomLevel = ZoomLevels.Normal
                        break;
                    case ZoomLevels.Normal:
                        this.zoomLevel = ZoomLevels.Out
                        break;
                    case ZoomLevels.Out:
                        break;
                }
            } else if (e.deltaY < 0) {
                switch (this.zoomLevel) {
                    case ZoomLevels.Out:
                        this.zoomLevel = ZoomLevels.Normal
                        break;
                    case ZoomLevels.Normal:
                        this.zoomLevel = ZoomLevels.In
                        break;
                    case ZoomLevels.In:
                        break;
                }
            }
            this.camOffset = new Vector(
                location.x - hexesLeftLocation * this.hexWidth(),
                location.y - hexesAboveLocation * this.hexHeight()
            );
        });
    }

    drawBackground() {
        const patternCanvas = document.createElement("canvas") as HTMLCanvasElement;
        const patternContext = patternCanvas.getContext("2d") as CanvasRenderingContext2D;

        patternCanvas.width = 50;
        patternCanvas.height = 50;

        patternContext.fillStyle = "#1395A1";
        patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
        this.wave(patternContext, 5);
        this.wave(patternContext, 30);
        patternContext.stroke();

        this.ctx.save();
        this.ctx.fillStyle =  this.ctx.createPattern(patternCanvas, "repeat") as CanvasPattern;

        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    wave(ctx: CanvasRenderingContext2D, y: number) {
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(13, y, 13, y + 15, 25, y + 15);
        ctx.bezierCurveTo(38, y + 15, 38, y, 50, y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawGrid();

        if (this.debug) {
            // Draw cross lines
            this.ctx.beginPath();
            this.ctx.lineTo(this.canvas.width / 2, 0);
            this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.lineTo(0, this.canvas.height / 2);
            this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.draw())
    }

    drawGrid() {
        for (let y = 0; y < this.gridData.y; y++) {
            for (let x = 0; x < this.gridData.x; x++) {
                this.hex(new Vector(x, y))
            }
        }
    }

    hex(fieldGridCoords: Vector) {
        const centre = new Vector(
            this.camOffset.x +                                              // x cam offset
              this.zoomLevel +                                              // centre of first column
              fieldGridCoords.x * this.hexWidth(),                          // amount of columns * the width of a hex

            this.camOffset.y +                                              // y cam offset
              this.zoomLevel * Math.sin(this.a) +                           // centre of first row
              fieldGridCoords.y * this.hexHeight() +                        // amount of rows * the height of a hex
              ((-1) ** fieldGridCoords.x > 0 ? this.hexHeight() * 0.5 : 0 ) // if row is even offset by half a hex
        );

        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            this.ctx.lineTo(
               centre.x + this.zoomLevel * Math.cos(this.a * i),
               centre.y + this.zoomLevel * Math.sin(this.a * i))
            ;
        }
        this.ctx.closePath();
        this.ctx.fillStyle = "green";
        this.ctx.fill();
        this.ctx.stroke();
    }

    hexWidth() {
        return (this.zoomLevel * (1 + Math.cos(this.a)));
    }

    hexHeight() {
        return (this.zoomLevel * 2 * Math.sin(this.a));
    }
}