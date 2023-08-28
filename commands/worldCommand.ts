import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { CxxString } from "bdsx/nativetype";
import { WORLD_CANNOT_EDIT, WORLD_DOESNT_EXIST, WORLD_IS_ACTIVE, WORLD_IS_AL_ACTIVE, WORLD_IS_AL_DEACTIVE, WORLD_IS_DEACTIVE, tag } from "../util/texts";
import { ServerPlayer } from "bdsx/bds/player";
import { getWorldIndex, isWorldRunning, levels } from "../util/world";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { SystemLog, SystemLogType } from "../util/system";

SystemLog(`Registering world command`, SystemLogType.DEBUG);

command.register("world", "Start, Stop or Edit a world!", CommandPermissionLevel.Operator)
.overload(async (param, origin, output) => {
    const world = levels[getWorldIndex(param.name)];
    if(!world) return sendMessage(origin, WORLD_DOESNT_EXIST);
    if(world.skip) return sendMessage(origin, WORLD_CANNOT_EDIT)
    switch(param.action){
        case 'start':
            if(isWorldRunning(param.name)) return sendMessage(origin, WORLD_IS_AL_ACTIVE);
            await world.startWorld();
            sendMessage(origin, WORLD_IS_ACTIVE);
            break;
        case 'stop':
            if(!isWorldRunning(param.name)) return sendMessage(origin, WORLD_IS_AL_DEACTIVE);
            await world.stopWorld();
            sendMessage(origin, WORLD_IS_DEACTIVE);
            break;
        case 'edit':
            if(origin.getOriginType() == 7) return SystemLog('Console cannot edit worlds!', SystemLogType.INFO);

            break;
    }
},{
    action: command.enum("Action", "start", "stop", "edit"),
    name: [CxxString, false]
})

function sendMessage(origin: CommandOrigin, msg: string) {
    if(origin.getOriginType() == 7) SystemLog(msg.replace(tag,''), SystemLogType.INFO);
    if(origin.getOriginType() == 0) (<ServerPlayer> origin.getEntity()).sendMessage(msg);
}

function worldForm(player: ServerPlayer) {

}