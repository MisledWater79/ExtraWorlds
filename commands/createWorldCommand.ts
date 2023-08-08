import { CommandPermissionLevel } from "bdsx/bds/command";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { SystemLog, SystemLogType } from "../util/system";
import { BlockLayer, Experiments, World, WorldData, WorldLayers, levels } from "../util/world";
import { BLOCKSETTINGS_FORM, CREATEWORLD_FORM, EXPERIMENTS_FORM, MOBSETTINGS_FORM, PLAYERSETTINGS_FORM, WORLDCHEATS_FORM, WORLDINFO_FORM, WORLDMENU_FORM, WORLDSETTINGS_FORM, getFormData } from "../forms/worldForms";
import { CustomForm, FormDropdown, FormInput, FormStepSlider, FormToggle, SimpleForm } from "bdsx/bds/form";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { setProperty } from "../util/fileSystem";

SystemLog(`Registering createworld command`, SystemLogType.DEBUG);

command.register("createworld", "Creates a brand new world!", CommandPermissionLevel.Operator)
.overload(async (param, origin, output) => {
    if(origin.isServerCommandOrigin() || origin !instanceof ServerPlayer) return false;
    const player: ServerPlayer = <ServerPlayer>origin.getEntity();

    CREATEWORLD_FORM.sendTo(player.getNetworkIdentifier(), async (form, net) => {
        let world = new World();

        // Set game type (what kind of world)
        switch(form.response) {
            case "f":
                world.info.Generator = 2;
                break;
            case "v":
                let layers = new WorldLayers();
                layers.blocks = [];
                layers.blocks[0] = new BlockLayer('minecraft:air',1);
                world.info.FlatWorldLayers = layers.toString();
                world.info.Generator = 2;
                break;
            case "d":
                world.info.Generator = 1;
                break;
            case "l":
                world.info.Generator = 0;
                break;
        };

        // Get world info and set it
        const worldInfo = await getFormData(WORLDINFO_FORM, net);

        world.info.LevelName = worldInfo[0];
        world.info.serverProperties.portv4 = Number(worldInfo[1]);
        world.info.serverProperties.portv6 = Number(worldInfo[2]);

        const newWorld = await worldMenu(world, net);
        if(!newWorld) return console.log('canceled');

        console.log(newWorld.info.FlatWorldLayers)

        await newWorld.startWorld();
        levels.push(newWorld);

        net.getActor()?.transferServer('127.0.0.1', newWorld.info.serverProperties.portv4);
    })
},{})

async function worldMenu(w: World, player: NetworkIdentifier): Promise<World | null> {
    let world = w;
    let val: World | null;
    let updatedForm: CustomForm | SimpleForm;

    // TODO: Fix for void worlds since we dont want settings for it
    const new_form = WORLDMENU_FORM;
    //if(w.info.Generator == 2) new_form.addButton(new FormButton("Super Flat Settings"), "f");
    const response = await getFormData(new_form, player);

    switch(response) {
        // World Settings
        case "w":
            updatedForm = WORLDSETTINGS_FORM;
            (updatedForm.getComponent(0) as FormInput).default = world.info.RandomSeed;
            (updatedForm.getComponent(1) as FormToggle).default = world.info.dodaylightcycle;
            (updatedForm.getComponent(2) as FormToggle).default = world.info.dofiretick;
            (updatedForm.getComponent(3) as FormToggle).default = world.info.doweathercycle;
            (updatedForm.getComponent(4) as FormInput).default = world.info.randomtickspeed.toString();
            let chunks = world.info.serverChunkTickRange;
            (updatedForm.getComponent(5) as FormStepSlider).default = (chunks == 4 ? 0 : chunks == 6 ? 1 : chunks == 8 ? 2 : chunks == 10 ? 3 : 4);
            (updatedForm.getComponent(6) as FormInput).default = world.info.spawnradius.toString();
            (updatedForm.getComponent(7) as FormInput).default = world.info.SpawnX.toString();
            (updatedForm.getComponent(8) as FormInput).default = world.info.SpawnY.toString();
            (updatedForm.getComponent(9) as FormInput).default = world.info.SpawnZ.toString();
            (updatedForm.getComponent(10) as FormInput).default = world.info.NetherScale.toString();

            const worldSettings = await getFormData(updatedForm, player);
            world.info.RandomSeed = worldSettings[0];
            world.info.dodaylightcycle = worldSettings[1];
            world.info.dofiretick = worldSettings[2];
            world.info.doweathercycle = worldSettings[3];
            world.info.randomtickspeed = worldSettings[4];
            chunks = worldSettings[5];
            world.info.serverChunkTickRange = (chunks == 0 ? 4 : chunks == 1 ? 6 : chunks == 2 ? 8 : chunks == 3 ? 10 : 12);
            world.info.spawnradius = worldSettings[6];
            world.info.SpawnX = worldSettings[7];
            world.info.SpawnY = worldSettings[8];
            world.info.SpawnZ = worldSettings[9];
            world.info.NetherScale = worldSettings[10];

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Cheats Settings
        case "c":
            updatedForm = WORLDCHEATS_FORM;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.cheatsEnabled;
            (updatedForm.getComponent(1) as FormToggle).default = world.info.commandblockoutput;
            (updatedForm.getComponent(2) as FormToggle).default = world.info.commandblocksenabled;
            (updatedForm.getComponent(3) as FormToggle).default = world.info.commandsEnabled;
            (updatedForm.getComponent(4) as FormToggle).default = world.info.sendCommandfeedback;

            const cheatSettings = await getFormData(updatedForm, player);
            for(let i in cheatSettings) {
                if(Number(i) >= 0) continue;
                let key = <keyof WorldData> i;
                setProperty(world.info, key, cheatSettings[i]);
            }

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Block Settings
        case "b":
            updatedForm = BLOCKSETTINGS_FORM;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.dotiledrops;
            (updatedForm.getComponent(1) as FormToggle).default = world.info.respawnblocksexplode;
            (updatedForm.getComponent(2) as FormToggle).default = world.info.showbordereffect;
            (updatedForm.getComponent(3) as FormToggle).default = world.info.tntexplodes;

            const blockSettings = await getFormData(updatedForm, player);
            for(let i in blockSettings) {
                if(Number(i) >= 0) continue;
                let key = <keyof WorldData> i;
                setProperty(world.info, key, blockSettings[i]);
            }

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Mob Settings
        case "m":
            updatedForm = MOBSETTINGS_FORM;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.domobloot;
            (updatedForm.getComponent(1) as FormToggle).default = world.info.domobspawning;
            (updatedForm.getComponent(2) as FormToggle).default = world.info.doentitydrops;
            (updatedForm.getComponent(3) as FormToggle).default = world.info.mobgriefing;
            (updatedForm.getComponent(4) as FormToggle).default = world.info.spawnMobs;

            const mobSettings = await getFormData(updatedForm, player);
            for(let i in mobSettings) {
                if(Number(i) >= 0) continue;
                let key = <keyof WorldData> i;
                setProperty(world.info, key, mobSettings[i]);
            }

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Player Settings
        case "p":
            updatedForm = PLAYERSETTINGS_FORM;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.doinsomnia;
            (updatedForm.getComponent(1) as FormToggle).default = world.info.doimmediaterespawn;
            (updatedForm.getComponent(2) as FormToggle).default = world.info.drowningdamage;
            (updatedForm.getComponent(3) as FormToggle).default = world.info.falldamage;
            (updatedForm.getComponent(4) as FormToggle).default = world.info.firedamage;
            (updatedForm.getComponent(5) as FormToggle).default = world.info.freezedamage;
            (updatedForm.getComponent(6) as FormToggle).default = world.info.keepinventory;
            (updatedForm.getComponent(7) as FormToggle).default = world.info.natruralregeneration;
            (updatedForm.getComponent(8) as FormDropdown).default = world.info.playerPermissionLevel;
            (updatedForm.getComponent(9) as FormToggle).default = world.info.pvp;
            (updatedForm.getComponent(10) as FormToggle).default = world.info.showcoordinates;
            (updatedForm.getComponent(11) as FormToggle).default = world.info.showdeathmessage;
            (updatedForm.getComponent(12) as FormToggle).default = world.info.showtags;
            (updatedForm.getComponent(13) as FormToggle).default = world.info.startWithMapEnabled;
            (updatedForm.getComponent(14) as FormToggle).default = world.info.useMsaGamertagsOnly;

            const playerSettings = await getFormData(updatedForm, player);
            world.info.doinsomnia = playerSettings[0];
            world.info.doimmediaterespawn = playerSettings[1];
            world.info.drowningdamage = playerSettings[2];
            world.info.falldamage = playerSettings[3];
            world.info.firedamage = playerSettings[4];
            world.info.freezedamage = playerSettings[5];
            world.info.keepinventory = playerSettings[6];
            world.info.natruralregeneration = playerSettings[7];
            world.info.playerPermissionLevel = playerSettings[8];
            world.info.pvp = playerSettings[9];
            world.info.showcoordinates = playerSettings[10];
            world.info.showdeathmessage = playerSettings[11];
            world.info.showtags = playerSettings[12];
            world.info.startWithMapEnabled = playerSettings[13];
            world.info.useMsaGamertagsOnly = playerSettings[14];

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Experiment Settings
        case "e":
            updatedForm = EXPERIMENTS_FORM;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.short_sneaking;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.recipe_unlocking;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.data_driven_items;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.data_driven_biomes;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.upcoming_creator_features;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.gametest;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.experimental_molang_features;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.cameras;
            (updatedForm.getComponent(0) as FormToggle).default = world.info.experiments.educationFeaturesEnabled;

            const experimentSettings = await getFormData(updatedForm, player);
            for(let i in experimentSettings) {
                if(Number(i) >= 0) continue;
                let key = <keyof Experiments> i;
                setProperty(world.info.experiments, key, experimentSettings[i]);
            }

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Super Flat Settings
        case "f":
            const layers: string = (await getFlatWorldLayers(new WorldLayers(), player)).toString();
            w.info.FlatWorldLayers = layers;

            val = await worldMenu(world, player);
            if(!val) break;
            return val;

        // Create World
        case "x":
            return w;
    }

    return null;
}

async function getFlatWorldLayers(layers: WorldLayers, player: NetworkIdentifier): Promise<WorldLayers> {
    layers.blocks = [];



    return new WorldLayers();
}