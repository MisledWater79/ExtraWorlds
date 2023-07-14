//anything for generating worlds
//world class with everything to generate it and run it, then will be saved to a list here
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { SystemLog, SystemLogType } from "./system";
//import { v4 as uuid } from "uuid";
import { join } from "path";
import { cwd } from "process";

export class World {
    bat: ChildProcessWithoutNullStreams;
    info: WorldData; //properties and also nbt data

    //constructor(levelName: string, )

    stopWorld(): boolean {
        if(!this.bat) return SystemLog(`Cannot stop world ${this.info.levelName} (ID of ${this.info.levelID}) because world is not running.`);
        return this.bat.stdin.write(`stop\n`);
    }

    startWorld(): boolean {
        if(this.bat) return SystemLog(`Cannot start world ${this.info.levelName} (ID of ${this.info.levelID}) because world is already running.`);
        this.bat = spawn('cmd.exe', ['/c',`${join(cwd(), '..')}/bdsx.bat`]);

        this.bat.stderr.on("data", (data) => {
            SystemLog(`[${this.info.levelName.magenta}/${this.info.levelID.magenta}] ` + data.toString().red);
        })
        this.bat.stdout.on("data", (data) => {
            SystemLog(`[${this.info.levelName.magenta}/${this.info.levelID.magenta}] ` + data.toString().cyan);
        })
        this.bat.on('close', (code) => {
            SystemLog(`[${this.info.levelName.magenta}/${this.info.levelID.magenta}] World closed with exit code ` + code);
        })

        return (this.bat == null);
    }
}

export class WorldData {
    //WORLD INFO
    levelName: string = "";
    levelID: string;
    levelType: number = 1; //0=OLD 1=INFINITE 2=FLAT
    levelSeed: number;
    levelIP: string;
    portv4: number; //set to our default port +2*WorldProccesses
    portv6: number;
    levelLayers: WorldLayers = new WorldLayers();
    creativeLoaded: boolean = false; //debating wether or not to keep

    //CHEATS
    cheatsEnabled: boolean = false;
    commandBlockOutput: boolean = true;
    commandBlocksEnabled: boolean = true;
    commandsEnabled: boolean = true;
    sendCommandFeedback: boolean = true;

    //WORLD
    daylightCycle: boolean = true;
    fireTick: boolean = true;
    weatherCycle: boolean = true;
    randomTickSpeed: number = 0;
    simulationDistance: number = 4;
    spawnRadius: number = 5;
    spawnCords: WorldCords = new WorldCords();
    netherScale: number = 8;

    //BLOCKS
    tileDrops: boolean = true;
    respawnBlocksExplode: boolean = true;
    showBorderEffect: boolean = true;
    tntExplodes: boolean = true;

    //MOBS
    mobsDropLoot: boolean = true;
    mobSpawning: boolean = true;
    entitiesDropLoot: boolean = true;
    mobGreifing: boolean = true;
    spawnMobs: boolean = true;

    //PLAYERS
    insomnia: boolean = true;
    immediateRespawn: boolean = false;
    drowningDamage: boolean = true;
    fallDamage: boolean = true;
    fireDamage: boolean = true;
    freezeDamage: boolean = true;
    keepInventory: boolean = false;
    natruralRegeneration: boolean = true;
    playerPermissionLevel: number = 1; //0=VISITOR 1=MEMBER 2=OP
    pvp: boolean = true;
    showCords: boolean = true;
    showDeathMessage: boolean = true;
    showNameTags: boolean = true;
    startWithMap: boolean = false;
    microsoftAccountOnly: boolean = false;

    //EXPERIMENTS
    shortSneaking: boolean = false;
    holidayCreatorFeatures: boolean = false;
    customBiomes: boolean = false;
    upcomingCreatorFeatures: boolean = false;
    betaAPIs: boolean = false;
    molangFeatures: boolean = false;
    experimentalCameras: boolean = false;
    educationEdition: boolean = false;

    constructor(levelName: string, levelType: WorldType, levelSeed: number = 0, levelLayers: WorldLayers = new WorldLayers(), levelIP: string = '', portv4: number = 0 /*getNextPortv4()*/, portv6: number = 0 /*getNextPortv6()*/) {
        this.levelName = levelName;
        this.levelID = "1939042";
        this.levelType = levelType;
        this.levelSeed = levelSeed;
        this.levelLayers = levelLayers;
        this.levelIP = levelIP;
        this.portv4 = portv4;
        this.portv6 = portv6;
    }
}

export enum WorldType {
    OLD = 0,
    INFINITE = 1,
    FLAT = 2
}

export class WorldCords {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 32767, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class WorldLayers {
    blocks: BlockLayer[];

    constructor() {
        this.blocks = [
            new BlockLayer('minecraft:bedrock', 1),
            new BlockLayer('minecraft:dirt', 2),
            new BlockLayer('minecraft:grass', 1)
        ]
    }
}

export class BlockLayer {
    blockID: string;
    count: number;

    constructor(blockID: string, count: number) {
        this.blockID = blockID;
        this.count = count;
    }
}