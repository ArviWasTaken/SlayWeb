import {Vector} from "./vector.js";
import {ZoomLevels} from "./enums.js";

export class DisplayDriver {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    a: number = 2 * Math.PI / 6;

    // dragging map around vars
    dragging: boolean;
    camOffset: Vector;
    lastReceivedPoint: Vector;

    // zoom vars
    zoomLevel: ZoomLevels;
    lastScrollTop: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.dragging = false;
        this.camOffset = new Vector(0, 0);
        this.lastReceivedPoint = new Vector(0, 0);

        this.zoomLevel = ZoomLevels.Normal
        this.lastScrollTop = 0;

        this.setElementToScreenSize();
        this.initEventListeners();
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
        this.drawGrid(new Vector(50, 50));
        requestAnimationFrame(() => this.draw())
    }

    drawGrid(size: Vector) {
        let rowNumber = 0;
        for (let y = this.zoomLevel * Math.sin(this.a); rowNumber< size.y; y += this.zoomLevel * (2 * Math.sin(this.a))) {
            let columnNumber = 0;
            for (let x = this.zoomLevel;
                 columnNumber < size.x;
                 x += this.zoomLevel * (1 + Math.cos(this.a)),
                     y += (-1) ** columnNumber++ * this.zoomLevel * Math.sin(this.a)
            ) {
                if (columnNumber == 0 || columnNumber == size.x - 1 || rowNumber == 0 || rowNumber == size.y - 1)
                {
                    this.hex(new Vector(x, y));
                }
            }
            rowNumber++;
        }
    }

    hex(centre: Vector) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            this.ctx.lineTo(
                this.camOffset.x + centre.x + this.zoomLevel * Math.cos(this.a * i),
                this.camOffset.y + centre.y + this.zoomLevel * Math.sin(this.a * i))
            ;
        }
        this.ctx.closePath();
        this.ctx.fillStyle = "green";
        this.ctx.fill();
        this.ctx.stroke();
    }
}