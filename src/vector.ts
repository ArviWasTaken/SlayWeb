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

    static Zero() {
        return new Vector(0,0);
    }

    static Value(x: number) {
        return new Vector(x,x);
    }
}