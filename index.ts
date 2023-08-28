import { events } from "bdsx/event";
import { SystemLog, SystemLogType } from "./util/system";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { serverProperties } from "bdsx/serverproperties";
import { World, levels, takenPortv4 } from "./util/world";
import { addPort, updateWorlds } from "./util/fileSystem";
import { NO_MAIN_INSTANCE_PROPERTY, NO_SERVER_PROPERTIES } from "./util/texts";
import * as os from 'os';
import { version } from  './package.json';

export let isMainFile: boolean;
export let serverIP: string = '127.0.0.1';
export let localIP: string | undefined;
export let ServerData = {};

SystemLog("Plugin Allocated", SystemLogType.LOG);

events.serverOpen.on(()=>{
    SystemLog("Plugin Starting", SystemLogType.WARN);
    SystemLog(`Plugin version: ${version}`, SystemLogType.WARN);

    //Load plugin data
    if(!existsSync('ExtraWorlds/extraworlds.properties')) {
        //Make it if it don't exist
        try{mkdirSync('ExtraWorlds');}catch{};
        writeFileSync('ExtraWorlds/extraworlds.properties','#Tells the plugin if it\'s a main plugin or a non-main plugin\nmainInstanceRunning=true\n#List of all the worlds on the server\nworldList=[]\n#List of indexs that correspond with the port list to tell what port belongs to which world name\nindexList=[]\n#List of active ports for worlds\nportList=[]');
        isMainFile = true;
    } else {
        //Read plugin data and save it
        let data = readFileSync('ExtraWorlds/extraworlds.properties');
        if(data.includes('mainInstanceRunning=true')) isMainFile = false;
        else if(data.includes('mainInstanceRunning=false')) {
            isMainFile = true;
            writeFileSync('ExtraWorlds/extraworlds.properties', data.toString().replace('mainInstanceRunning=false', 'mainInstanceRunning=true'))
        } else {
            SystemLog(NO_MAIN_INSTANCE_PROPERTY, SystemLogType.ERROR);
        }
    }

    //Get custom-ip
    if(existsSync('server.properties')) serverIP = readFileSync('server.properties').toString().match(/custom-ip=(.*?)(?=$|\n)/g)?.[0].replace('custom-ip=','') || '127.0.0.1';
    else SystemLog(NO_SERVER_PROPERTIES, SystemLogType.ERROR);

    SystemLog(`Server is running with custom-ip of: ${serverIP}`, SystemLogType.WARN);

    //Get Local IP
    localIP = getLocalIpAddress();
    SystemLog(`Server is running with local IP of: ${localIP} (For LAN games without a IP)`, SystemLogType.WARN);

    SystemLog(`Plugin is main: ${isMainFile}`, SystemLogType.WARN);
    if(isMainFile) setupData();

    require('./commands/commandRegistry');

    SystemLog(`Plugin Ready`, SystemLogType.WARN);
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

//Get the server's local ip for LAN games without a ip
function getLocalIpAddress(): string | undefined {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      const interfaceInfo = interfaces[interfaceName];
      for (const info of interfaceInfo) {
        if (!info.internal && info.family === 'IPv4') {
          return info.address;
        }
      }
    }
  }
