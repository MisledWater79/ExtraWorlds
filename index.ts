
import { events } from "bdsx/event";
import { command } from "bdsx/command"
import { Player, ServerPlayer, SimulatedPlayer } from "bdsx/bds/player";
import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { SystemLog, SystemLogType } from "./util/system";

declare module 'bdsx/bds/player' {
    interface Player {
        m(): string;
    }
}

Player.prototype.m = function()  {
    return "test"
}

SystemLog("Plugin Allocated", SystemLogType.LOG)

let bat: ChildProcessWithoutNullStreams;

function func() {
    bat = spawn('cmd.exe', ['/c','C:\\Users\\misle\\Documents\\bdsx\\bdsx.bat'])
    bat.stdout.on('data', function (data) {
        console.log("OUT "+data.toString());
    });
    bat.stderr.on('data', function (data) {
        console.log("ERR "+data.toString());
    });
    bat.on('exit', function (code) {
        console.log("EXIT "+code);
    });
}

function stop() {
    if(!bat) return;
    bat.stdin.write(`stop\n`);
}

events.serverOpen.on(()=>{
    SystemLog("Plugin Starting", SystemLogType.WARN);

    require('./commands/commandRegistry')
    command.register("makenew", "e").overload((param, origin, ouput) => {
        func();
    },{})
    command.register("transfer","ee").overload((param, origin, output) => {
        if(origin.isServerCommandOrigin()) return;
        const player: ServerPlayer = <ServerPlayer>origin.getEntity();
        player.transferServer("127.0.0.1", 19134);
    },{})
});

events.serverStop.on(()=>{
    SystemLog("Plugin Stopping", SystemLogType.WARN)
    stop();
})

events.serverClose.on(()=>{
    SystemLog("Plugin Stopped", SystemLogType.LOG)
    stop();
});

