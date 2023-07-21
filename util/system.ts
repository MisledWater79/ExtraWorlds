export const config = require('../config.json')

export enum SystemLogType {
    LOG = 0,     //For basic logging
    WARN = 1,    //For logs before potentally game breaking bug
    ERROR = 2,   //For errors that accorr
    INFO = 3,    //For info on the plugin given to the console on startup
    DEBUG = 4,    //For debugging
    OTHER = 5
}

export function SystemLog(message: string, messageType: SystemLogType = SystemLogType.LOG): boolean {
    switch(messageType) {
        case 0:
            console.log(``.reset + `[${config.PluginName.green}] ` + message);
            return true;
        case 1:
            console.warn(``.reset + `[${config.PluginName.green}] ` + message.yellow);
            return true;
        case 2:
            console.error(``.reset + `[${config.PluginName.green}] ` + message.red);
            return false;
        case 3:
            console.info(``.reset + `[${config.PluginName.green}] ` + message.cyan);
            return true;
        case 4:
            console.debug(``.reset + `[` + config.PluginName.green + `] ` + message.grey);
            return true;
        case 5:
            console.log(``.reset + `${message}`);
            return true;
    }
    return false;
}