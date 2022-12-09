"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BotDockingMgr_1 = require("./modules/BotDockingMgr");
const PluginLoader_1 = require("./modules/PluginLoader");
const data_1 = require("./tools/data");
const logger_1 = require("./tools/logger");
let Logo = String.raw `
  ________  _______        __ 
 /_  __/  |/  / __ )____  / /_
  / / / /|_/ / __  / __ \/ __/
 / / / /  / / /_/ / /_/ / /_  
/_/ /_/  /_/_____/\____/\__/  
                              
`;
let logger = new logger_1.Logger("TMBotMain");
let conf = new data_1.JsonConfigFileClass("./config/config.json", "{}");
process.on("uncaughtException", (err, _ori) => {
    logger.error(`程序出现未捕获的异常:`);
    logger.error(`Stack: ${err.stack}`);
});
// process.on("uncaughtExceptionMonitor", (err, _ori) => {
//     logger.error(`程序出现未捕获的异常:`);
//     logger.error(`Stack: ${err.stack}`);
// });
function delayLoadPlugins() {
    return __awaiter(this, void 0, void 0, function* () {
        yield PluginLoader_1.PluginPackage.LoadAllPackage();
    });
}
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(Logo);
        logger.info(`正在初始化TMBot...`);
        logger.info(`开始批量连接OneBot...`);
        let keys = conf.getKeys(), l = keys.length, i = 0;
        // console.log(conf.read())
        while (i < l) {
            let name = keys[i++];
            // console.log(name)
            try {
                let obj = conf.get(name);
                let ws = obj["Websocket"], reConnCount = obj["ReConnectCount"], reConnTime = obj["ReConnectTime"];
                if (ws.indexOf("ws://") != 0) {
                    throw new Error(`Websocket连接必须以 [ws://] 开头!`);
                }
                else if (typeof (reConnCount) != "number") {
                    throw new Error(`ReConnectCount(重连次数)参数必须为数字!`);
                }
                else if (typeof (reConnTime) != "number") {
                    throw new Error(`ReConnectTime(重连时间)参数必须为数字!`);
                }
                yield BotDockingMgr_1.BotDockingMgr._NewBot(name, ws, reConnCount, reConnTime);
            }
            catch (e) {
                logger.error(`连接 [${name}] 失败!`);
                logger.error(e.stack);
            }
        }
        delayLoadPlugins();
    });
}
load();
