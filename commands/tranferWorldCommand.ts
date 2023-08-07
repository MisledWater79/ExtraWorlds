import { CommandPermissionLevel } from "bdsx/bds/command"
import { FormButton, SimpleForm } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command"
import { CxxString } from "bdsx/nativetype";
import { readFileSync } from "fs";
import { getFormData } from "../forms/worldForms";
import { SystemLog, SystemLogType } from "../util/system";
import { levels } from "../util/world";

command.register("transfer", "Creates a brand new world!", CommandPermissionLevel.Normal)
.overload(async (param, origin, output) => {
    const player = <ServerPlayer>origin.getEntity();
    const dat = readFileSync('ExtraWorlds/extraworlds.properties').toString();

    if(param.name !== undefined) {
        //Find world name
    }

    //Show world form
    const lists = dat.match(/".*?"(?=]|$)/g);
    if(lists == undefined) return SystemLog('No world data in extraWorlds.properties', SystemLogType.ERROR);

    const worldList = lists[0].split('"').join('').split(',');
    const indexList = lists[1].split('"').join('').split(',').map((val)=>Number(val));
    const portList = lists[2].split('"').join('').split(',').map((val)=>Number(val));

    const form = new SimpleForm('Worlds');
    worldList?.forEach((world, i)=>form.addButton(new FormButton(`${world} §f[${indexList.indexOf(i) == -1 ? '§cNot Active' : '§aActive'}§f]`)));

    let index = await getFormData(form, player.getNetworkIdentifier());
    if(index == null) return;

    //TODO: run world?
    if(indexList.indexOf(index) == -1) return player.sendMessage('World is not active');

    let port = portList[indexList.indexOf(index)];

    player.transferServer('127.0.0.1', port);
}, {
    name: [CxxString, true]
});