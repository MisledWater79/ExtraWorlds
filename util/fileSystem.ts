import * as fs from "fs";
import { join } from "path";
import { cwd } from "process";

const LEVEL_DAT_PATH = join(cwd(), '../plugins/ExtraWorlds/data/level.dat');

export enum FileType {
    SERVER_PROPERTIES = 0,
    WORLD_DATA = 1,
    PLAYER_DATA = 2
}

export function addWorldHeader(file: Buffer, nbt: Buffer): Uint8Array {
    const { byteLength } = nbt;
    const data = new Uint8Array(byteLength + 8);
    const view = new DataView(data.buffer);
    const version = new DataView(file.buffer, file.byteOffset, file.byteLength).getUint32(0,true);
    console.log(version)
    view.setUint32(0,version,true);
    view.setUint32(4,byteLength,true);
    data.set(nbt,8);
    return data;
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