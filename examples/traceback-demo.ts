import { Console } from '../src';

const console = new Console();

function level3() {
    throw new Error("Something went terribly wrong!");
}

function level2() {
    level3();
}

function level1() {
    level2();
}

try {
    level1();
} catch (e) {
    console.printException(e as Error);
}
