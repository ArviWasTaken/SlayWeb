export function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomOrientation() {
    return randomInteger(0, 360);
}

export function pythagoras(a: number, b: number): number {
    return Math.sqrt(a * a + b * b);
}