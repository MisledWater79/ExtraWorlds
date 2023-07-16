
import { events } from "bdsx/event";
import { command } from "bdsx/command"
import { Player, ServerPlayer } from "bdsx/bds/player";
import { ChildProcessWithoutNullStreams } from "child_process"
import { SystemLog, SystemLogType } from "./util/system";
import { bedrockServer } from "bdsx/launcher";

declare module 'bdsx/bds/player' {
    interface Player {
        m(): string;
    }
}

Player.prototype.m = function()  {
    return "test"
}

SystemLog("Plugin Allocated", SystemLogType.LOG);

let bat: ChildProcessWithoutNullStreams;

events.serverOpen.on(()=>{
    SystemLog("Plugin Starting", SystemLogType.WARN);

    require('./commands/commandRegistry');
    command.register("transfer","ee").overload((param, origin, output) => {
        if(origin.isServerCommandOrigin()) return;
        const player: ServerPlayer = <ServerPlayer>origin.getEntity();
        player.transferServer("127.0.0.1", 19134);
    },{})
    command.register("worldstop","ee").overload((param, origin, output) => {
        bedrockServer.stop();
    },{})
});

events.serverClose.on(()=>{
    SystemLog("Plugin Stopped", SystemLogType.LOG);
});

