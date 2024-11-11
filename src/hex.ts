import {Vector} from "./vector";
import {Player} from "./player";

export class Hex {
    gridLocation: Vector
    owner: Player

    constructor(gridLocation: Vector, owner: Player) {
        this.gridLocation = gridLocation;
        this.owner = owner;
    }
}