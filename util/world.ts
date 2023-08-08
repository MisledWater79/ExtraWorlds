import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { SystemLog, SystemLogType } from "./system";
import { join } from "path";
import { cwd } from "process";
import { events } from "bdsx/event";
import { isMainFile } from "..";
import { readFileSync, writeFileSync } from "fs";
import { serverProperties } from "bdsx/serverproperties";
import { bedrockServer } from "bdsx/launcher";
import { WorldNBT } from "./worldNBT";
import { DEFAULT_DAT_FILE, addPort, removePort } from "./fileSystem";

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
            if(takenPortv4.includes(this.info.serverProperties.portv4)) {
                let newPort = getNextPortv4();
                SystemLog(`Port ${this.info.serverProperties.portv4} is taken changing to ${newPort}`, SystemLogType.ERROR);
                this.info.serverProperties.portv4 = newPort;
                this.info.serverProperties.portv6 = newPort + 1;
                takenPortv4.push(newPort);
            }

            await this.setWorldData();

            this.bat = spawn('cmd.exe', ['/c',`${join(cwd(), '..')}/bdsx.bat`]);

            let callback = (data: any) => {
                data = data.toString().split('\n');
                data.pop();
                data.forEach((str: string) => {
                    str = str.replace('NO LOG FILE! - ', '');
                    SystemLog(`[${this.info.LevelName.magenta}] ` + str, SystemLogType.OTHER);
                });
            };

            this.bat.stderr.on("data", callback);
            this.bat.stdout.on("data", callback);

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
                removePort(this.info.serverProperties.portv4);
                resolve();
            });
        });
    }

    private waitForStart(): Promise<void> {
        return new Promise((resolve) => {
            this.bat.stdout.on('data', (data) => {
                if(data.toString().includes('Server started')) {
                    SystemLog(`Started world ${this.info.LevelName}`, SystemLogType.LOG);
                    writeFileSync('server.properties', readFileSync('ExtraWorlds/serverPropBackup.properties'));
                    this.running = true;
                    runningWorlds++;
                    addPort(this.info.LevelName, this.info.serverProperties.portv4);
                    resolve();
                }
            })
        })
    }

    async setWorldData() {
        const worldNBT = new WorldNBT(readFileSync(DEFAULT_DAT_FILE));

        let data = worldNBT.worldDat[""].data;

        for(const key in this.info.experiments) {
            data.experiments.data[key].data = this.info.experiments[key];
        }

        for(const key in this.info) {
            if(typeof this.info[key] == "object") continue;
            if(data[key] == undefined) continue;
            switch(typeof this.info[key]){
                case 'boolean':
                    data[key].data = Number(this.info[key]);
                    break;
                default:
                    data[key].data = this.info[key];
                    break;
            }
        }

        console.log(worldNBT.worldDat[""].data.FlatWorldLayers)

        worldNBT.writeWorld();

        let properties = readFileSync('ExtraWorlds/serverPropBackup.properties').toString();
        //add gamemode/difficulty
        properties = properties.replace(`allow-cheats=${serverProperties["allow-cheats"]}`, `allow-cheats=${this.info.cheatsEnabled}`);
        properties = properties.replace(`level-name=${serverProperties["level-name"]}`, `level-name=${this.info.LevelName}`);
        properties = properties.replace(`server-port=${serverProperties["server-port"]}`, `server-port=${this.info.serverProperties.portv4}`);
        properties = properties.replace(`server-portv6=${serverProperties["server-portv6"]}`, `server-portv6=${this.info.serverProperties.portv6}`);
        let generator = this.info.Generator;
        properties += `level-type=${generator == 0 ? 'LEGACY' : generator == 1 ? 'DEFAULT' : 'FLAT'}`;

        writeFileSync(`server.properties`, properties);
    }
}

export class WorldData {
    [index: string]: any;
    //WORLD INFO
    LevelName: string = "";
    Generator: number = 1; //0=LEGACY 1=DEFAULT 2=FLAT
    RandomSeed: string = "0";
    serverProperties: Properties = {
        portv4: 19132, //set to our default port +2*WorldProccesses
        portv6: 19133
    };
    FlatWorldLayers: string = new WorldLayers().toString();

    //CHEATS
    cheatsEnabled: boolean = false;
    commandblockoutput: boolean = true;
    commandblocksenabled: boolean = true;
    commandsEnabled: boolean = true;
    sendcommandfeedback: boolean = true;

    //WORLD,
    educationFeaturesEnabled: boolean = false;
    dodaylightcycle: boolean = true;
    dofiretick: boolean = true;
    doweathercycle: boolean = true;
    randomtickspeed: number = 1;
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
    naturalregeneration: boolean = true;
    playerPermissionLevel: number = 1; //0=VISITOR 1=MEMBER 2=OP
    pvp: boolean = true;
    showcoordinates: boolean = false;
    showdeathmessage: boolean = true;
    showtags: boolean = true;
    startWithMapEnabled: boolean = false;
    useMsaGamertagsOnly: boolean = false;

    //EXPERIMENTS
    experiments: Experiments = {
        short_sneaking: false,
        recipe_unlocking: false,
        data_driven_items: false,
        data_driven_biomes: false,
        upcoming_creator_features: false,
        gametest: false,
        experimental_molang_features: false,
        cameras: false
    };
}

export interface Experiments {
    [index: string]: boolean;
    short_sneaking: boolean;
    recipe_unlocking: boolean;
    data_driven_items: boolean;
    data_driven_biomes: boolean;
    upcoming_creator_features: boolean;
    gametest: boolean;
    experimental_molang_features: boolean;
    cameras: boolean;
}

export interface Properties {
    portv4: number;
    portv6: number;
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

    toString() {
        let str = '';
        this.blocks.forEach((val)=>str += `{"block_name":"${val.blockID}","count":${val.count}}`);
        return `{"biome_id:1","block_layers":[${str}],"encoding_version":6,"structure_options":null,"world_version":"version.post_1_18"}`
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