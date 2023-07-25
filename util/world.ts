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

// TODO: Stop at port 19200 as to not have so many

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
        if(world.info.LevelName == name && world.running) val = true;
    })
    return val;
}

export class World {
    bat: ChildProcessWithoutNullStreams;
    info: WorldData = new WorldData(); //properties and also nbt data
    running: boolean = false;
    interval: ReturnType<typeof setInterval>;
    skip: boolean = false;

    //constructor(levelName: string, )

    async startWorld(): Promise<void> {
        if(this.bat || this.info.LevelName == serverProperties['level-name'] || isWorldRunning(this.info.LevelName)) {
            SystemLog(`Cannot start world ${this.info.LevelName} because world is already running.`);
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
                    SystemLog(`[${this.info.LevelName.magenta}] ` + str, SystemLogType.OTHER);
                });
            });
            //bds
            this.bat.stdout.on("data", (data) => {
                data = data.toString().split('\n');
                data.pop();
                data.forEach((str: string) => {
                    SystemLog(`[${this.info.LevelName.magenta}] ` + str, SystemLogType.OTHER);
                });
            });

            await this.waitForStart();
        }
    }

    async stopWorld(): Promise<void> {
        if(!this.running) {
            SystemLog(`Cannot stop world ${this.info.LevelName} because world is not running.`);
        } else {
            this.bat.stdin.write(`stop\n`);
            await this.waitForStop();
        }
    }

    private waitForStop(): Promise<void> {
        return new Promise((resolve) => {
            this.bat.on('close', (code) => {
                SystemLog(`[${this.info.LevelName.magenta}] World closed with exit code ` + code);
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
                    SystemLog(`Started world ${this.info.LevelName}`, SystemLogType.LOG);
                    this.running = true;
                    runningWorlds++;
                    resolve();
                }
            })
        })
    }

    setWorldData() {
        let data = readFileSync('ExtraWorlds/serverPropBackup.properties').toString();
        data = data.replace(`level-name=${serverProperties["level-name"]}`, `level-name=${this.info.LevelName}`);
        data = data.replace(`server-port=${serverProperties["server-port"]}`, `server-port=${this.info.portv4}`);
        data = data.replace(`server-portv6=${serverProperties["server-portv6"]}`, `server-portv6=${this.info.portv6}`);
        data += `level-type=FLAT`;
        return data;
    }
}

export class WorldData {
    //WORLD INFO
    LevelName: string = "";
    GameType: number = 1; //0=LEGACY 1=DEFAULT 2=FLAT
    RandomSeed: number = 0;
    levelIP: string; //Not needed since it will run on whatever ip specified in propeties
    portv4: number = 19132; //set to our default port +2*WorldProccesses
    portv6: number = 19133;
    FlatWorldLayers: WorldLayers;

    //CHEATS
    cheatsEnabled: boolean = true;
    commandblockoutput: boolean = true;
    commandblocksenabled: boolean = true;
    commandsEnabled: boolean = true;
    sendCommandfeedback: boolean = true;

    //WORLD
    dodaylightcycle: boolean = true;
    dofiretick: boolean = true;
    doweathercycle: boolean = true;
    randomtickspeed: number = 0;
    serverChunkTickRange: number = 4;
    spawnradius: number = 5;
    SpawnX: number = 0;
    SpawnY: number = 32767;
    SpawnZ: number = 0;
    NetherScale: number = 8;

    //BLOCKS
    dotiledrops: boolean = true;
    respawnblocksexplode: boolean = true;
    showbordereffect: boolean = true;
    tntexplodes: boolean = true;

    //MOBS
    domobloot: boolean = true;
    domobspawning: boolean = true;
    doentitydrops: boolean = true;
    mobgriefing: boolean = true;
    spawnMobs: boolean = true;

    //PLAYERS
    doinsomnia: boolean = true;
    doimmediaterespawn: boolean = false;
    drowningdamage: boolean = true;
    falldamage: boolean = true;
    firedamage: boolean = true;
    freezedamage: boolean = true;
    keepinventory: boolean = false;
    natruralregeneration: boolean = true;
    playerPermissionLevel: number = 1; //0=VISITOR 1=MEMBER 2=OP
    pvp: boolean = true;
    showcoordinates: boolean = false;
    showdeathmessage: boolean = true;
    showtags: boolean = true;
    startWithMapEnabled: boolean = false;
    useMsaGamertagsOnly: boolean = false;

    //EXPERIMENTS
    short_sneaking: boolean = false;
    recipe_unlocking: boolean = false;
    data_driven_items: boolean = false;
    data_driven_biomes: boolean = false;
    upcoming_creator_features: boolean = false;
    gametest: boolean = false;
    experimental_molang_features: boolean = false;
    cameras: boolean = false;
    educationFeaturesEnabled: boolean = false;
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