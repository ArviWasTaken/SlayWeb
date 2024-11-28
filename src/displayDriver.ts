import {Vector} from "./vector";
import {ZoomLevels} from "./enums";
import {Hex} from "./hex";

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

    worldSize: Vector;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, worldSize: Vector) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.worldSize = worldSize;

        this.setElementToScreenSize();
        this.initEventListeners();

        this.dragging = false;
        this.zoomLevel = ZoomLevels.In
        this.lastReceivedPoint = Vector.Zero();

        this.camOffset = new Vector(
            canvas.width / 2 - (this.worldSize.x / 2) * this.hexWidth(),
            canvas.height / 2 - (this.worldSize.y / 2) * this.hexHeight()
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
            const hexesLeftOfLocation = location.subtract(this.camOffset).x / this.hexWidth();
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
                location.x - hexesLeftOfLocation * this.hexWidth(),
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

    drawDebug() {
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

    drawGrid(hexes: Hex[]) {
        for (let i = 0; i < hexes.length; i++) {
            this.drawHex(hexes, i)
        }
    }

    drawHex(hexes: Hex[], index: number) {
        let hex = hexes[index];
        const centre = new Vector(
            this.camOffset.x +                                               // x cam offset
              this.zoomLevel +                                               // centre of first column
              hex.gridLocation.x * this.hexWidth(),                          // amount of columns * the width of a hex

            this.camOffset.y +                                               // y cam offset
              this.zoomLevel * Math.sin(this.a) +                            // centre of first row
            hex.gridLocation.y * this.hexHeight() +                          // amount of rows * the height of a hex
              ((-1) ** hex.gridLocation.x > 0 ? this.hexHeight() * 0.5 : 0 ) // if row is even offset by half a hex
        );

        let points: Vector[] = [];
        for (let i = 0; i < 6; i++) {
            points.push(new Vector(
               centre.x + this.zoomLevel * Math.cos(this.a * i),
               centre.y + this.zoomLevel * Math.sin(this.a * i))
            );
        }
        this.drawHexFilling(points, hex.owner.color);

        const neighbours = this.getNeighbouringCellsForIndex(index)

        console.log(`${neighbours[3]} ${neighbours[4]} ${neighbours[5]}\n  ${index}  \n${neighbours[2]} ${neighbours[1]} ${neighbours[0]}`);


        // right bottom
        this.drawHexSide(points[0], points[1], false);
        // bottom
        this.drawHexSide(points[1], points[2], true);
        // left bottom
        this.drawHexSide(points[2], points[3], false);
        // left top
        this.drawHexSide(points[3], points[4], false);
        // top
        this.drawHexSide(points[4], points[5], false);
        // right top
        this.drawHexSide(points[5], points[0], false);

        this.ctx.strokeText(index.toString(), centre.x, centre.y);

    }

    // returns an array with the neighbours of the cell, null if it doesn't exist
    // [right bottom, middle bottom, left bottom, left top, middle top, right top
    getNeighbouringCellsForIndex(index: number)  {
        const neighbours: [undefined | number | null, undefined | number | null, undefined | number | null, undefined | number | null, undefined | number | null, undefined | number | null] = [undefined, undefined, undefined, undefined, undefined, undefined];
        const ws = this.worldSize
        const lastRowStartIndex = ws.y * (ws.x - 1);

        const isEven = index % 2 == 0;
        const isInFirstRow = index < ws.x;
        const isInLastRow = index >= lastRowStartIndex;
        const isInFirstCol = index % ws.x == 0;
        const isInLastCol = index != 0 && index % ws.x == ws.x - 1;

        console.log(isEven, isInFirstRow, isInLastRow, isInFirstCol, isInLastCol);

        // right bottom neighbour
        if (isInLastCol) {
            neighbours[0] = null;
        } else if (isInLastRow && isEven) {
            neighbours[0] = null;
        } else if (isEven) {
            neighbours[0] = index + 1 + ws.x;
        } else {
            neighbours[0]= index + 1;
        }

        //bottom neighbour
        if (isInLastRow) {
            neighbours[1] = null
        } else {
            neighbours[1] = index + ws.x;
        }

        // bottom left neighbour
        if (isInFirstCol) {
            neighbours[2] = null
        } else if (isInLastRow && !isEven) {
            neighbours[2] = null
        } else if (isEven) {
            neighbours[2] = index - 1 + ws.x;
        } else {
            neighbours[2] = index - 1;
        }

        // top left neighbour
        if (isInFirstCol) {
            neighbours[3] = null
        } else if (isInFirstRow && !isEven) {
            neighbours[3] = null;
        } else if (isEven) {
            neighbours[3] = index - 1;
        } else {
            neighbours[3] = index - 1 - ws.x;
        }

        // top neighbour
        if (isInFirstRow) {
            neighbours[4] = null
        } else {
            neighbours[4] = index - ws.x;
        }

        // top right neighbour
        if (isInLastCol) {
            neighbours[5] = null
        } else if (isInFirstRow && !isEven) {
            neighbours[5] = null;
        } else if (isEven) {
            neighbours[5] = index + 1;
        } else {
            neighbours[5] = index + 1 - ws.x;
        }

        return neighbours
    }

    drawHexFilling(points: Vector[], color: string) {
        this.ctx.save();
        this.ctx.beginPath();
        for (const pointsKey in points) {
            let point = points[pointsKey];
            this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.restore();
    }

    drawHexSide(begin: Vector, end: Vector, highlighted: boolean) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineTo(begin.x, begin.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.closePath();

        if (highlighted) {
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = "#cccde3";
        }
        this.ctx.stroke();
        this.ctx.restore();

    }

    hexWidth() {
        return (this.zoomLevel * (1 + Math.cos(this.a)));
    }

    hexHeight() {
        return (this.zoomLevel * 2 * Math.sin(this.a));
    }
}