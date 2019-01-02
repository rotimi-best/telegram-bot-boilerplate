const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;
const { addUser, findUser } = require("../db/user");
const {
  sendToAdmin,
  len,
  emojis: { wave, thumbsUp, thumbsDown, ok }
} = require("../modules");
const { COMMANDS } = require("../helpers/constants");
const Bot = require("../helpers/botConnection");
const bot = Bot.get();

class StartController extends TelegramBaseController {
  constructor($) {
    super($);
    this.nameOfUser = "";
  }

  /**
   * Scope of the message
   * @param {Scope} $
   */
  async startHandler($) {
    const telegramId = $.message.chat.id;
    let userName = $.message.chat.firstName
      ? $.message.chat.firstName
      : $.message.chat.lastName;

    const user = await findUser({ telegramId });

    if (len(user)) {
      this.nameOfUser = user[0].name;
      sendToAdmin(`User came back ${this.nameOfUser}`);

      $.sendMessage(`Welcome back ${this.nameOfUser}`);

      return;
    }

    sendToAdmin(`You have a new user, Name: ${userName}`);

    $.sendMessage(`Hi there! ${wave} Can I call you ${userName}?`, {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: `Yes ${thumbsUp}` }],
          [{ text: `No ${thumbsDown}` }]
        ],
        one_time_keyboard: true
      })
    });

    $.waitForRequest.then(async $ => {
      if ($.message.text === `Yes ${thumbsUp}`) {
        sendToAdmin(`User choose Yes ${userName}`);

        $.sendMessage(`Okay, Thanks ${userName} ${ok}.${COMMANDS}`, {
          reply_markup: JSON.stringify({
            remove_keyboard: true
          })
        });

        await this.saveNewUser(userName, telegramId);
      } else if ($.message.text === `No ${thumbsDown}`) {
        $.sendMessage(`What should I then call you?`);

        $.waitForRequest.then(async $ => {
          userName = $.message.text;

          sendToAdmin(`User choose No ${userName}`);

          $.sendMessage(`Okay, Thanks ${userName} ${ok}.${COMMANDS}`, {
            reply_markup: JSON.stringify({
              remove_keyboard: true
            })
          });

          await this.saveNewUser(userName, telegramId);
        });
      }
    });
  }

  /**
   * @param {String} userName Name of the user
   * @param {Number} telegramId Telegram ID of user
   */
  async saveNewUser(userName, telegramId) {
    console.log("A new user was added");

    await addUser({
      name: userName,
      telegramId
    });

    this.nameOfUser = userName;
  }

  get routes() {
    return {
      startCommand: "startHandler"
    };
  }
}

module.exports = StartController;
