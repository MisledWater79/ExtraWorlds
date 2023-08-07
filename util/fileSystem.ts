import * as fs from "fs";
import { join } from "path";
import { cwd } from "process";

const DEFAULT_DAT_FILE = join(cwd(), '../plugins/ExtraWorlds/data/DEFAULT.dat');

export enum FileType {
    SERVER_PROPERTIES = 0,
    WORLD_DATA = 1,
    PLAYER_DATA = 2
}

export function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
    obj[key] = value;
}

async function loadFile(fileType: FileType,) {
    switch(fileType) {
        case 0:
            if(fs.existsSync('ExtraWorlds'))
            fs.readFileSync(join(cwd(), ))
    }
}

async function saveFile(fileType: FileType,){}