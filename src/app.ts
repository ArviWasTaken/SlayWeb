import {DisplayDriver} from "./displayDriver.js";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const dd = new DisplayDriver(canvas);

dd.draw();
