export const config = require('../config.json');

export const tag = `§f[§a${config.PluginName}§f]§r `;

//ERRORS
export const NO_WORLD_DATA: string = "No world data in extraWorlds.properties";
export const NO_MAIN_INSTANCE_PROPERTY: string = "Extraworld.properties file has no \"mainInstanceRunning\" property. Contact developer about this error.";
export const NO_SERVER_PROPERTIES: string = "Server.properties file doesn\'t exist? Can\'t get custom ip if one exists.";
//PLAYER MESSAGES
export const WORLD_IS_DEACTIVE: string = tag + "World is deactive!";
export const WORLD_IS_ACTIVE: string = tag + "World is active!";
export const WORLD_IS_AL_DEACTIVE: string = tag + "World is already deactive!";
export const WORLD_IS_AL_ACTIVE: string = tag + "World is already active!";
export const NOT_SERVER_PLAYER: string = "You must be a player in the server to run this command!";
export const WORLD_NOT_SAME_NAME: string = tag + "World cannot have same names!";
export const WORLD_DOESNT_EXIST: string = tag + "That world doesn't exist!";
export const WORLD_CANNOT_EDIT: string = tag + "This world cannot be started/stopped/edited because it's a main instance!";
//