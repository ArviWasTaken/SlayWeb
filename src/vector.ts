import {randomInteger} from "./util.js";

export class Vector {
    readonly x: number
    readonly y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    subtract(other: Vector) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    add(other: Vector) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    multiply(multiplier: number): Vector {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

    findAngleTowards(other: Vector) {
        return Math.atan2(other.y - this.y, other.x - this.x) * 180 / Math.PI;
    }

    findDistanceBetween(other: Vector) {
        return Math.sqrt(Math.pow(other.x - this.x, 2) - Math.pow(other.y + this.y, 2));
    }

    findPointInDirection(angle: number, distance: number): Vector {
        const radianAngle = angle * Math.PI / 180;
        return new Vector(
            this.x + (distance * Math.cos(radianAngle)),
            this.y + (distance * Math.sin(radianAngle)),
        );
    }

    static random(xmin: number, xmax: number, ymin?: number, ymax?: number): Vector {
        if (ymin == undefined || ymax == undefined) {
            return new Vector(
                randomInteger(xmin, xmax),
                randomInteger(xmin, xmax),
            );
        } else {
            return new Vector(
                randomInteger(xmin, xmax),
                randomInteger(ymin, ymax),
            );
        }

    }

}