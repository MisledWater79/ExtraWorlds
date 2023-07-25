import { CustomForm, Form, FormButton, FormData, FormDropdown, FormInput, FormStepSlider, FormToggle, SimpleForm } from "bdsx/bds/form";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";

export async function getFormData(form: Form<FormData>, player: NetworkIdentifier): Promise<any> {
    return new Promise((resolve) => {
        form.sendTo(player, (data) => {
            resolve(data.response);
        })
    })
}

export const CREATEWORLD_FORM = new SimpleForm("Create New World");
CREATEWORLD_FORM.addButton(new FormButton("New Default World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/grass.png"), "d");
CREATEWORLD_FORM.addButton(new FormButton("New Flat World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/dirt.png"), "f");
CREATEWORLD_FORM.addButton(new FormButton("New Void World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/bedrock.png"), "v");
CREATEWORLD_FORM.addButton(new FormButton("New Legacy World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/bedrock.png"), "l");

// FOR EVERY WORLD
export const WORLDINFO_FORM = new CustomForm("World Info");
WORLDINFO_FORM.addComponent(new FormInput("World Name", "World Name", "New World"), "LevelName");
WORLDINFO_FORM.addComponent(new FormInput("World Port v4", "Port v4", "19132"), "portv4");
WORLDINFO_FORM.addComponent(new FormInput("World Port v6", "Port v6", "19133"), "portv6");

// ADD SUPERFLAT MENU IF IT IS ONE
// WORLD SETTINGS MENU
export const WORLDMENU_FORM = new SimpleForm();
WORLDMENU_FORM.addButton(new FormButton("World Settings"), "w");
WORLDMENU_FORM.addButton(new FormButton("Cheats Settings"), "c");
WORLDMENU_FORM.addButton(new FormButton("Block Settings"), "b");
WORLDMENU_FORM.addButton(new FormButton("Mob Settings"), "m");
WORLDMENU_FORM.addButton(new FormButton("Player Settings"), "p");
WORLDMENU_FORM.addButton(new FormButton("Experiment Settings"), "e");
WORLDMENU_FORM.addButton(new FormButton("§l§bCreate World"), "x");

export const WORLDSETTINGS_FORM = new CustomForm("World Settings");
WORLDSETTINGS_FORM.addComponent(new FormInput("Seed", "World Seed"), "levelSeed");
WORLDSETTINGS_FORM.addComponent(new FormToggle("Do Daylight Cycle"), "dodaylightcycle");
WORLDSETTINGS_FORM.addComponent(new FormToggle("Fire Spreads"), "dofiretick");
WORLDSETTINGS_FORM.addComponent(new FormToggle("Weather Cycle"), "doweathercycle");
WORLDSETTINGS_FORM.addComponent(new FormInput("Random Tick Speed", "Tick Speed"), "randomtickspeed");
WORLDSETTINGS_FORM.addComponent(new FormStepSlider("Simulation Distance", ["4 Chunks", "6 Chunks", "8 Chunks", "10 Chunks", "12 Chunks"]), "serverChunkTickRange");
WORLDSETTINGS_FORM.addComponent(new FormInput("Spawn Radius", "Radius"), "spawnradius");
WORLDSETTINGS_FORM.addComponent(new FormInput("Spawn X", "X Cord"), "SpawnX");
WORLDSETTINGS_FORM.addComponent(new FormInput("Spawn Y", "Y Cord"), "SpawnY");
WORLDSETTINGS_FORM.addComponent(new FormInput("Spawn Z", "Z Cord"), "SpawnZ");
WORLDSETTINGS_FORM.addComponent(new FormInput("Nether Scale", "Nether Scale"), "NetherScale");

export const WORLDCHEATS_FORM = new CustomForm("World Cheats");
WORLDCHEATS_FORM.addComponent(new FormToggle("Cheats Enabled"), "cheatsEnabled");
WORLDCHEATS_FORM.addComponent(new FormToggle("Command Block Output"), "commandblockoutput");
WORLDCHEATS_FORM.addComponent(new FormToggle("Command Blocks Enabled"), "commandblocksenabled");
WORLDCHEATS_FORM.addComponent(new FormToggle("Commands Enabled"), "commandsEnabled");
WORLDCHEATS_FORM.addComponent(new FormToggle("Send Command Feedback"), "sendCommandfeedback");

export const BLOCKSETTINGS_FORM = new CustomForm("Block Settings");
BLOCKSETTINGS_FORM.addComponent(new FormToggle("Tile Drops"), "dotiledrops");
BLOCKSETTINGS_FORM.addComponent(new FormToggle("Respawn Blocks Explode"), "respawnblocksexplode");
BLOCKSETTINGS_FORM.addComponent(new FormToggle("Show Border Effect"), "showbordereffect");
BLOCKSETTINGS_FORM.addComponent(new FormToggle("TNT Explodes"), "tntexplodes");

export const MOBSETTINGS_FORM = new CustomForm("Mob Settings");
MOBSETTINGS_FORM.addComponent(new FormToggle("Mobs Loot"), "domobloot");
MOBSETTINGS_FORM.addComponent(new FormToggle("Mob Spawning"), "domobspawning");
MOBSETTINGS_FORM.addComponent(new FormToggle("Entities Drop Loot"), "doentitydrops");
MOBSETTINGS_FORM.addComponent(new FormToggle("Mob Griefing"), "mobgriefing");
MOBSETTINGS_FORM.addComponent(new FormToggle("Spawn Mobs"), "spawnMobs");

export const PLAYERSETTINGS_FORM = new CustomForm("Player Settings");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Do Insomnia"), "doinsomnia");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Immediate Respawn"), "doimmediaterespawn");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Drowning Damage"), "drowningdamage");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Fall Damage"), "falldamage");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Fire Damage"), "firedamage");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Freeze Damage"), "freezedamage");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Keep Inventory"), "keepinventory");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Natrural Regeneration"), "natruralregeneration");
PLAYERSETTINGS_FORM.addComponent(new FormDropdown("Default Player Permission", ["Visitor", "Member", "Operator"]), "playerPermissionLevel");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Friendly Fire"), "pvp");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Show Coordinates"), "showcoordinates");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Show Death Messages"), "showdeathmessage");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Show Name Tags"), "showtags");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Starting Map"), "startWithMapEnabled");
PLAYERSETTINGS_FORM.addComponent(new FormToggle("Verified Account Only"), "useMsaGamertagsOnly");

// TODO: Add warn that changing these may effect addons and or plugins
export const EXPERIMENTS_FORM = new CustomForm("Experiments");
EXPERIMENTS_FORM.addComponent(new FormToggle("Crawling"), "short_sneaking");
EXPERIMENTS_FORM.addComponent(new FormToggle("Recipe Unlocking"), "recipe_unlocking");
EXPERIMENTS_FORM.addComponent(new FormToggle("Holiday Creator Features"), "data_driven_items");
EXPERIMENTS_FORM.addComponent(new FormToggle("Custom Biomes"), "data_driven_biomes");
EXPERIMENTS_FORM.addComponent(new FormToggle("Upcoming Creator Features"), "upcoming_creator_features");
EXPERIMENTS_FORM.addComponent(new FormToggle("Beta APIs"), "gametest");
EXPERIMENTS_FORM.addComponent(new FormToggle("Molang Features"), "experimental_molang_features");
EXPERIMENTS_FORM.addComponent(new FormToggle("Experimental Cameras"), "cameras");
EXPERIMENTS_FORM.addComponent(new FormToggle("Education Edition"), "educationFeaturesEnabled");

// FOR SUPERFLAT
export const FLATSETTINGS_FORM = new CustomForm("SuperFlat Settings");

/*
SERVER PROPERTIES
allow-cheats
allow-list?
default-player-permission-level
difficulty
force-gamemode
gamemode
level-name
level-seed
level-type
max-players
online-mode
server-port
server-portv6
tick-distance[4-12]
view-distance[>=5]


*/