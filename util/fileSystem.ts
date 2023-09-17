import { existsSync, read, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { SystemLog, SystemLogType } from "./system";
import { World, levels } from "./world";
import { WorldNBT } from "./worldNBT";

export const DEFAULT_DAT_FILE = join(cwd(), '../node_modules/@bdsx/extraworlds/data/DEFAULT.dat');
const EXTRAWORLDS_PROPERTIES = join(cwd(), 'ExtraWorlds/extraworlds.properties');

let pwl: string[] = [];
let pil: string[] = [];
let ppl: string[] = [];

let worldList: string[] = [];
let indexList: string[] = [];
let portList: string[] = [];

export enum FileType {
    SERVER_PROPERTIES = 0,
    WORLD_DATA = 1,
    PLAYER_DATA = 2
}

/*
 * FUNCTIONS FOR EXTRAWORLDS.PROPERTIES FILE
 */

export function getPropertyData(): void {
    const dat = readFileSync(EXTRAWORLDS_PROPERTIES).toString();
    const lists = dat.match(/".*?"(?=]|$)/g) || [];

    pwl = worldList;
    pil = indexList;
    ppl = portList;

    worldList = (lists[0] ? lists[0].split('"').join('').split(',') : []);
    indexList = (lists[1] ? lists[1].split('"').join('').split(',') : []);
    portList = (lists[2] ? lists[2].split('"').join('').split(',') : []);
}

export function setPropertyData(): void {
    let dat = readFileSync(EXTRAWORLDS_PROPERTIES).toString();

    dat = dat.replace(`worldList=${stringList(pwl)}`, `worldList=${stringList(worldList)}`);
    dat = dat.replace(`indexList=${stringList(pil)}`, `indexList=${stringList(indexList)}`);
    dat = dat.replace(`portList=${stringList(ppl)}`, `portList=${stringList(portList)}`);

    writeFileSync(EXTRAWORLDS_PROPERTIES, dat);
}

function stringList(list: string[]): string {
    let str = '';
    list.every((val,i)=>{str += `${i > 0 ? ',' : ''}"${val}"`; return true;});

    return `[${str}]`;
}

export function addPort(levelName: string, port: number): void | boolean {
    getPropertyData();

    if(!worldList.includes(levelName)) worldList.push(levelName);
    const index = worldList.indexOf(levelName);

    if(indexList.includes(index.toString()) || portList.includes(port.toString())) return SystemLog("Skipping port because it's already added", SystemLogType.ERROR);

    indexList.push(index.toString());
    portList.push(port.toString());

    setPropertyData();
}

export function removePort(port: number): void | boolean {
    getPropertyData();

    const index = portList.indexOf(port.toString());

    if(index == -1) return SystemLog("Port can't be removed cause it doesnt exist!", SystemLogType.ERROR);

    indexList.splice(index, 1);
    portList.splice(index, 1);

    setPropertyData();
}

export function updateWorlds(): void {
    getPropertyData();

    pwl = worldList;

    worldList = readdirSync('worlds', { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    setPropertyData();

    //TODO: Add worlds and their data to levels
    worldList.forEach((name) => {
        const w = new World();
        w.info.LevelName = name;
        loadWorldData(w);
    })
}

export function loadWorldData(world: World) {
    if(!existsSync(`worlds/${world.info.LevelName}/level.dat`)) return SystemLog(`Level.dat not found for world: ${world.info.LevelName}`, SystemLogType.ERROR);

    const dat = new WorldNBT(readFileSync(`worlds/${world.info.LevelName}/level.dat`)).worldDat[""].data;

    for(const key in dat.experiments.data) {
        if(!world.info[key]) continue;
        world.info.experiments[key] = dat.experiments.data[key].data;
    }

    for(const key in dat){
        if(dat[key].type == 10) continue;
        if(!world.info[key]) continue;
        switch(dat[key].type) {
            case 1:
                world.info[key] = Boolean(dat[key].data);
                break;
            default:
                world.info[key] = dat[key].data;
                break;
        }
    }

    console.log(JSON.stringify(world.info));
    levels.push(world);
}

/*
 * OTHER FUNCTIONS
 */

//Need to set world info for some reason
export function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
    obj[key] = value;
}