import { CustomForm, FormButton, FormInput, FormLabel, SimpleForm } from "bdsx/bds/form";

export const CREATEWORLD_FORM = new SimpleForm("Create New World");
CREATEWORLD_FORM.addButton(new FormButton("New Default World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/grass.png"), "d");
CREATEWORLD_FORM.addButton(new FormButton("New Flat World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/dirt.png"), "f");
CREATEWORLD_FORM.addButton(new FormButton("New Void World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/bedrock.png"), "v");
CREATEWORLD_FORM.addButton(new FormButton("New Legacy World", "url", "https://raw.githubusercontent.com/MisledWater79/ExtraWorlds/main/data/bedrock.png"), "l");

export const WORLDSETTINGS_FORM = new CustomForm("World Settings");
WORLDSETTINGS_FORM.addComponent(new FormInput("World Name", "New World", ""), "level_name");
WORLDSETTINGS_FORM.addComponent(new FormInput("World Port v4", "19132", ""), "portv4");
WORLDSETTINGS_FORM.addComponent(new FormInput("World Port v6", "19133", ""), "portv6");
