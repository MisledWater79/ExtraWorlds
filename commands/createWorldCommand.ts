import { CommandPermissionLevel } from "bdsx/bds/command";
import { FormButton, SimpleForm } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { SystemLog, SystemLogType } from "../util/system";

SystemLog(`Registering createworld command`, SystemLogType.DEBUG);

command.register("createworld", "Creates a brand new world!", CommandPermissionLevel.Operator)
.alias("cw")
.overload((param, origin, output) => {
    if(origin.isServerCommandOrigin() || origin !instanceof ServerPlayer) return false;
    const player: ServerPlayer = <ServerPlayer>origin.getEntity();
    const form = new SimpleForm("CreateWorld");
    form.addButton(new FormButton("New World", "path", "../data/grass.png"), "w")
    form.addButton(new FormButton("New Super Flat World", "path", "../data/grass.png"), "sfw")
    form.addButton(new FormButton("New Void World", "path", "../data/grass.png"), "vw")
    form.sendTo(player.getNetworkIdentifier(), (form, net) => {
        switch(form.response) {
            case "w":
                break;
            case "sfw":
                break;
            case "vw":
                break;
        }
    })
},{})