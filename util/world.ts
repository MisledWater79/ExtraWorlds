//anything for generating worlds
//world class with everything to generate it and run it, then will be saved to a list here
import { ChildProcessWithoutNullStreams } from "child_process";
import { SystemLog } from "./system";
import { BooleanLiteral } from "typescript";
//import { v4 as uuid } from "uuid";

export class World {
    bat: ChildProcessWithoutNullStreams;
    info: WorldInfo; //properties and also nbt data

    //constructor(levelName: string, )

    stop(): boolean {
        if(!this.bat) return SystemLog(`Cannot stop world ${this.info.levelName} (id of ${this.info.serverID}) because world is not running.`);
        return this.bat.stdin.write(`stop\n`);
    }
}

export class WorldInfo {
    //WORLD INFO
    levelName: string;
    serverID: string;
    levelType: number;
    levelSeed: number;
    portv4: number;
    portv6: number;
    spawnCords: WorldCords;
    worldLayers: WorldLayers;
    netherScale: number;
    creativeLoaded: boolean;

    //CHEATS
    cheatsEnabled: boolean;
    commandBlocksOutput: boolean;
    commandBlocksEnabled: boolean;
    commandsEnabled: boolean;
    sendCommandFeedback: boolean;

    //WORLD
    daylightCycle: boolean;
    fireTick: boolean;
    weatherCycle: boolean;
    randomTickSpeed: number;
    simulationDistance: number;
    spawnRadius: number;

    //BLOCKS
    tileDrops: boolean;
    respawnBlocksExplode: boolean;
    showBorderEffect: number;
    tntExplodes: boolean;

    //MOBS
    mobsDropLoot: boolean;
    mobSpawning: boolean;
    entitiesDropLoot: boolean;
    mobGreifing: boolean;
    spawnMobs: boolean;

    //PLAYERS
    insomnia: boolean;
    immediateRespawn: boolean;
    drowningDamage: boolean;
    fallDamage: boolean;
    fireDamage: boolean;
    freezeDamage: boolean;
    keepInventory: boolean;
    natruralRegeneration: boolean;
    playerPermissionLevel: number;
    pvp: boolean;
    showCords: boolean;
    showDeathMessage: boolean;
    showNameTags: boolean;
    startWithMap: boolean;
    microsoftAccountOnly: boolean;

    //EXPERIMENTS
    shortSneaking: boolean;
    holidayCreatorFeatures: boolean;
    customBiomes: boolean;
    upcomingCreatorFeatures: boolean;
    betaAPIs: boolean;
    molangFeatures: boolean;
    experimentalCameras: boolean;
    educationEdition: boolean;
}

export class WorldCords {
    x: number;
    y: number;
    z: number;
}

export class WorldLayers {
    blocks: BlockLayer[];
}

export class BlockLayer {
    blockID: string;
    count: number;
}