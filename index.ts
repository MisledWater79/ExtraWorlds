import { events } from "bdsx/event";
import { SystemLog, SystemLogType } from "./util/system";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { serverProperties } from "bdsx/serverproperties";
import { World, levels, takenPortv4 } from "./util/world";
import { addPort, updateWorlds } from "./util/fileSystem";

export let isMainFile: boolean;
export let ServerData = {};

SystemLog("Plugin Allocated", SystemLogType.LOG);

events.serverOpen.on(()=>{
    SystemLog("Plugin Starting", SystemLogType.WARN);

    //Load plugin data
    if(!existsSync('ExtraWorlds/extraworlds.properties')) {
        try{mkdirSync('ExtraWorlds');}catch{};
        writeFileSync('ExtraWorlds/extraworlds.properties','#Tells the plugin if it\'s a main plugin or a non-main plugin\nmainInstanceRunning=true\n#List of all the worlds on the server\nworldList=[]\n#List of indexs that correspond with the port list to tell what port belongs to which world name\nindexList=[]\n#List of active ports for worlds\nportList=[]');
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

    SystemLog(`Plugin is main: ${isMainFile}`, SystemLogType.WARN);
    if(isMainFile) setupData();

    require('./commands/commandRegistry');
});

events.serverClose.on(()=>{
    SystemLog("Plugin Stopped", SystemLogType.LOG);
});


//Data setup stuff
function setupData(): void {
    SystemLog(`Setting up data...`, SystemLogType.WARN);

    //Save server properties
    let data = readFileSync('server.properties');
    writeFileSync('ExtraWorlds/serverPropBackup.properties', data);

    //Update Worlds
    updateWorlds();

    //Add a fake world
    takenPortv4.push(Number(serverProperties["server-port"]));
    const w = new World();
    w.running = true;
    w.skip = true;
    w.info.LevelName = serverProperties['level-name'];
    levels.push(w);
    addPort(w.info.LevelName, w.info.serverProperties.portv4);
}