const { HELP_MESSAGE } = require('../config/constants');
const Logger = require('../utils/logger');

class HelpService {
  // 도움말 메시지 생성
  static createHelpMessage() {
    Logger.event('도움말 메시지 생성');
    
    const commandsText = HELP_MESSAGE.commands.join('\n');
    
    return {
      text: 'BokmanBot 도움말',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: HELP_MESSAGE.title
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*사용 가능한 명령어:*\n\n${commandsText}`
          }
        }
      ]
    };
  }
}

module.exports = HelpService; 