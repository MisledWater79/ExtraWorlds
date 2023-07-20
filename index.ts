
import { events } from "bdsx/event";
import { command } from "bdsx/command"
import { Player, ServerPlayer } from "bdsx/bds/player";
import { SystemLog, SystemLogType } from "./util/system";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { serverProperties } from "bdsx/serverproperties";
import { World, WorldData, WorldType, levels, runningWorlds, takenPortv4 } from "./util/world";
import { bedrockServer } from "bdsx/launcher";

export let isMainFile: boolean;
export let ServerData = {};

declare module 'bdsx/bds/player' {
    interface Player {
        m(): string;
    }
}

Player.prototype.m = function()  {
    return "test"
}

SystemLog("Plugin Allocated", SystemLogType.LOG);

events.serverOpen.on(()=>{
    SystemLog("Plugin Starting", SystemLogType.WARN);

    //Load plugin data
    if(!existsSync('ExtraWorlds/extraworlds.properties')) {
        mkdirSync('ExtraWorlds');
        writeFileSync('ExtraWorlds/extraworlds.properties','#Tells the plugin if it\'s a main plugin or a non-main plugin\nmainInstanceRunning=true');
        isMainFile = true;
    } else {
        let data = readFileSync('ExtraWorlds/extraworlds.properties');
        if(data.includes('mainInstanceRunning=true')) isMainFile = false;
        else if(data.includes('mainInstanceRunning=false')) {
            isMainFile = true;
            writeFileSync('ExtraWorlds/extraworlds.properties', data.toString().replace('mainInstanceRunning=false', 'mainInstanceRunning=true'))
        } else {
            SystemLog('Extraworld.properties file has no "mainInstanceRunning" property. Contact developer about this error.', SystemLogType.ERROR);
        }
    }

    //Save backup server data
    if(isMainFile) {
        let data = readFileSync('server.properties');
        writeFileSync('ExtraWorlds/serverPropBackup.properties', data);
        takenPortv4.push(Number(serverProperties["server-port"]));
        const w = new World();
        w.running = true;
        w.skip = true;
        w.info = new WorldData(serverProperties['level-name'], WorldType.INFINITE);
        levels.push(w);
    }

    SystemLog(`Plugin is main: ${isMainFile}`, SystemLogType.WARN);

    require('./commands/commandRegistry');
    command.register("transfer","ee").overload((param, origin, output) => {
        if(origin.isServerCommandOrigin()) return;
        const player: ServerPlayer = <ServerPlayer>origin.getEntity();
        player.transferServer("127.0.0.1", 19134);
    },{})
});

events.serverClose.on(()=>{
    SystemLog("Plugin Stopped", SystemLogType.LOG);
});

