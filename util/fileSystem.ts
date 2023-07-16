import * as fs from "fs";
import { join } from "path";
import { cwd } from "process";

export enum FileType {
    SERVER_PROPERTIES = 0,
    WORLD_DATA = 1,
    PLAYER_DATA = 2
}

async function loadFile(fileType: FileType,) {
    switch(fileType) {
        case 0:
            if(fs.existsSync('ExtraWorlds'))
            fs.readFileSync(join(cwd(), ))
    }
}

async function saveFile(fileType: FileType,){}