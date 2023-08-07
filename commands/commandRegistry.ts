//World Commands
import { isMainFile } from "../index.js";
import { SystemLog, SystemLogType } from "../util/system.js";
SystemLog(`Registering Commands...`, SystemLogType.WARN);

if(isMainFile) {
    require("./createWorldCommand");
}

require("./tranferWorldCommand")