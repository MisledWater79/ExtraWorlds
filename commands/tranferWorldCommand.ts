import { CommandPermissionLevel } from "bdsx/bds/command"
import { FormButton, SimpleForm } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command"
import { CxxString } from "bdsx/nativetype";
import { readFileSync } from "fs";
import { getFormData } from "../forms/worldForms";
import { SystemLog, SystemLogType } from "../util/system";
import { serverIP } from "..";
import { NO_WORLD_DATA, WORLD_IS_DEACTIVE } from "../util/texts";

SystemLog(`Registering transfer command`, SystemLogType.DEBUG);

command.register("transfer", "Creates a brand new world!", CommandPermissionLevel.Normal)
.overload(async (param, origin, output) => {
    const player = <ServerPlayer>origin.getEntity();
    const dat = readFileSync('ExtraWorlds/extraworlds.properties').toString();

    if(param.name !== undefined) {
        //Find world name
    }

    //Show world form
    const lists = dat.match(/".*?"(?=]|$)/g);
    if(lists == undefined) return SystemLog(NO_WORLD_DATA, SystemLogType.ERROR);

    const worldList = lists[0].split('"').join('').split(',');
    const indexList = lists[1].split('"').join('').split(',').map((val)=>Number(val));
    const portList = lists[2].split('"').join('').split(',').map((val)=>Number(val));

    const form = new SimpleForm('Worlds');
    worldList?.forEach((world, i)=>form.addButton(new FormButton(`${world} §f[${indexList.indexOf(i) == -1 ? '§cNot Active' : '§aActive'}§f]`)));

    let index = await getFormData(form, player.getNetworkIdentifier());
    if(index == null) return;

    //TODO: run world?
    if(indexList.indexOf(index) == -1) return player.sendMessage(WORLD_IS_DEACTIVE);

    let port = portList[indexList.indexOf(index)];

    player.transferServer(serverIP, port);
}, {
    name: [CxxString, true]
});