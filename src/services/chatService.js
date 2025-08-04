const { MESSAGES, HELP_MESSAGE } = require('../config/constants');
const Logger = require('../utils/logger');

class ChatService {
  // 인사 메시지 생성
  static createGreetingMessage(user) {
    Logger.event('인사 메시지 생성', { user });
    return MESSAGES.GREETING(user);
  }

  // 환영 메시지 생성 (멘션 시)
  static createWelcomeMessage(user) {
    Logger.event('환영 메시지 생성', { user });
    return {
      text: MESSAGES.WELCOME(user),
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: MESSAGES.WELCOME(user)
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '현재 사용 가능한 명령어:\n• `@BokmanBot 안녕` - 인사하기\n• `@BokmanBot 도움말` - 도움말 보기'
          }
        }
      ]
    };
  }

  // 슬래시 명령어 응답 메시지 생성
  static createSlashHelloMessage(user) {
    Logger.event('슬래시 명령어 응답 생성', { user });
    return MESSAGES.SLASH_HELLO(user);
  }
}

module.exports = ChatService; 