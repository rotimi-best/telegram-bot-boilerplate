const { TextCommand } = require("telegram-node-bot");
const bot = require("./helpers/botConnection").get();

const Start = require("./controllers/Start");
const CallbackQueryController = require("./callbackQueries");

bot.router.callbackQuery(new CallbackQueryController());

bot.router
  .when(new TextCommand("/start", "startCommand"), new Start())
  .otherwise(new OtherwiseController());
