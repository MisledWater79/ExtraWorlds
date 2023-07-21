//anything for generating worlds
//world class with everything to generate it and run it, then will be saved to a list here
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { SystemLog, SystemLogType } from "./system";
import { join } from "path";
import { cwd } from "process";
import { events } from "bdsx/event";
import { isMainFile } from "..";
import { readFileSync, writeFileSync } from "fs";
import { serverProperties } from "bdsx/serverproperties";
import { bedrockServer } from "bdsx/launcher";

async function stopWorlds(): Promise<void> {
    for(let i = 0; i < levels.length; i++){
        if(!levels[i].running || levels[i].skip) continue;
        await levels[i].stopWorld();
    }
}

//Overrides the stop command to wait till all instances are closed
events.command.on((command, originName, ctx)=>{
    if(!isMainFile) return;
    if(command == '/stop') {
        stopWorlds().then(()=>{
            let data = readFileSync('ExtraWorlds/extraworlds.properties');
            writeFileSync('ExtraWorlds/extraworlds.properties', data.toString().replace('mainInstanceRunning=true', 'mainInstanceRunning=false'))
            data = readFileSync('ExtraWorlds/serverPropBackup.properties');
            writeFileSync('server.properties', data);
            bedrockServer.stop();
        });
        return -1;
    }
});

export let levels: World[] = [];
export let takenPortv4: number[] = [];
export let runningWorlds: number = 1;

export function getNextPortv4(): number {
    let found = false;
    let port = 19132;
    while(!found) {
        if(takenPortv4.includes(port)) port += 2;
        else found = true;
    };
    return port;
}

export function isWorldRunning(name: string): boolean {
    let val = false;
    levels.forEach((world) => {
        if(world.info.levelName == name && world.running) val = true;
    })
    return val;
}

export class World {
    bat: ChildProcessWithoutNullStreams;
    info: WorldData; //properties and also nbt data
    running: boolean = false;
    interval: ReturnType<typeof setInterval>;
    skip: boolean = false;

    //constructor(levelName: string, )

    async startWorld(): Promise<void> {
        if(this.bat || this.info.levelName == serverProperties['level-name'] || isWorldRunning(this.info.levelName)) {
            SystemLog(`Cannot start world ${this.info.levelName} because world is already running.`);
        } else {
            if(takenPortv4.includes(this.info.portv4)) {
                let newPort = getNextPortv4();
                SystemLog(`Port ${this.info.portv4} is taken changing to ${newPort}`, SystemLogType.ERROR);
                this.info.portv4 = newPort;
                this.info.portv6 = newPort++;
                takenPortv4.push(newPort);
            }

            writeFileSync('server.properties', this.setWorldData());

            this.bat = spawn('cmd.exe', ['/c',`${join(cwd(), '..')}/bdsx.bat`]);

            //plugins
            this.bat.stderr.on("data", (data) => {
                data = data.toString().split('\n');
                data.pop();
                data.forEach((str: string, index: number) => {
                    SystemLog(`[${this.info.levelName.magenta}] ` + str, SystemLogType.OTHER);
                });
            });
            //bds
            this.bat.stdout.on("data", (data) => {
                data = data.toString().split('\n');
                data.pop();
                data.forEach((str: string) => {
                    SystemLog(`[${this.info.levelName.magenta}] ` + str, SystemLogType.OTHER);
                });
            });

            await this.waitForStart();
        }
    }

    async stopWorld(): Promise<void> {
        if(!this.running) {
            SystemLog(`Cannot stop world ${this.info.levelName} because world is not running.`);
        } else {
            this.bat.stdin.write(`stop\n`);
            await this.waitForStop();
        }
    }

    private waitForStop(): Promise<void> {
        return new Promise((resolve) => {
            this.bat.on('close', (code) => {
                SystemLog(`[${this.info.levelName.magenta}] World closed with exit code ` + code);
                this.running = false;
                runningWorlds--;
                resolve();
            });
        });
    }

    private waitForStart(): Promise<void> {
        return new Promise((resolve) => {
            this.bat.stdout.on('data', (data) => {
                if(data.toString().includes('Server started')) {
                    SystemLog(`Started world ${this.info.levelName}`, SystemLogType.LOG);
                    this.running = true;
                    runningWorlds++;
                    resolve();
                }
            })
        })
    }

    setWorldData() {
        let data = readFileSync('ExtraWorlds/serverPropBackup.properties').toString();
        data = data.replace(`level-name=${serverProperties["level-name"]}`, `level-name=${this.info.levelName}`);
        data = data.replace(`server-port=${serverProperties["server-port"]}`, `server-port=${this.info.portv4}`);
        data = data.replace(`server-portv6=${serverProperties["server-portv6"]}`, `server-portv6=${this.info.portv6}`);
        data += `level-type=FLAT`;
        return data;
    }
}

export class WorldData {
    //WORLD INFO
    levelName: string = "";
    levelType: string = WorldType[1]; //0=LEGACY 1=DEFAULT 2=FLAT
    levelSeed: number;
    levelIP: string; //Not needed since it will run on whatever ip specified in propeties
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

    constructor(levelName: string, levelType: WorldType, levelSeed: number = 0, levelLayers: WorldLayers = new WorldLayers(), levelIP: string = '', portv4: number = getNextPortv4(), portv6: number = getNextPortv4() + 1) {
        this.levelName = levelName;
        this.levelType = WorldType[levelType];
        this.levelSeed = levelSeed;
        this.levelLayers = levelLayers;
        this.levelIP = levelIP;
        this.portv4 = portv4;
        this.portv6 = portv6;
    }
}

export enum WorldType {
    LEGACY = 0,
    DEFAULT = 1,
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