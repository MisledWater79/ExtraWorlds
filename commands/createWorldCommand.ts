import { CommandPermissionLevel } from "bdsx/bds/command";
import { FormButton, SimpleForm } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { SystemLog, SystemLogType } from "../util/system";
import { World, WorldData, WorldType, levels } from "../util/world";

SystemLog(`Registering createworld command`, SystemLogType.DEBUG);

command.register("createworld", "Creates a brand new world!", CommandPermissionLevel.Operator)
.overload((param, origin, output) => {
    if(origin.isServerCommandOrigin() || origin !instanceof ServerPlayer) return false;
    const player: ServerPlayer = <ServerPlayer>origin.getEntity();
    SystemLog(player.m(), SystemLogType.DEBUG);
    const form = new SimpleForm("CreateWorld");
    form.addButton(new FormButton("New World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/grass.png"), "w")
    form.addButton(new FormButton("New Super Flat World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/dirt.png"), "sfw")
    form.addButton(new FormButton("New Void World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/bedrock.png"), "vw")
    form.sendTo(player.getNetworkIdentifier(), (form, net) => {
        switch(form.response) {
            case "w":
                const w = new World();
                w.info = new WorldData('HelloWorld', WorldType.FLAT);
                w.startWorld();
                levels.push(w);
                break;
            case "sfw":
                break;
            case "vw":
                break;
        }
    })
},{})