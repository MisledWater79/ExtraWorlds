export const config = require('../config.json')

export enum SystemLogType {
    LOG = 0,     //For basic logging
    WARN = 1,    //For logs before potentally game breaking bug
    ERROR = 2,   //For errors that accorr
    INFO = 3,    //For info on the plugin given to the console on startup
    DEBUG = 4    //For debugging
}

export function SystemLog(message: string, messageType: SystemLogType = SystemLogType.LOG): boolean {
    switch(messageType) {
        case SystemLogType.LOG:
            console.log(`[${config.PluginName.green}] ` + message);
            return true;
        case SystemLogType.WARN:
            console.warn(`[${config.PluginName.green}] ` + message.yellow);
            return true;
        case SystemLogType.ERROR:
            console.error(`[${config.PluginName.green}] ` + message.red);
            return false;
        case SystemLogType.INFO:
            console.info(`[${config.PluginName.green}] ` + message.cyan);
            return true;
        case SystemLogType.DEBUG:
            console.debug(`[` + config.PluginName.green + `] ` + message.grey);
            return true;
    }
}