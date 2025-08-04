const { COMMANDS } = require('../config/constants');
const ChatService = require('../services/chatService');
const TimeService = require('../services/timeService');
const HelpService = require('../services/helpService');
const Logger = require('../utils/logger');

class MessageHandlers {
  // "안녕" 메시지 핸들러
  static async handleHelloMessage({ message, say }) {
    try {
      Logger.event('"안녕" 메시지 수신', { 
        user: message.user, 
        channel: message.channel 
      });
      
      const response = ChatService.createGreetingMessage(message.user);
      await say({
        text: response,
        thread_ts: message.ts
      });
      
      Logger.success('인사 메시지 응답 완료');
    } catch (error) {
      Logger.error('인사 메시지 응답 중 오류', error);
    }
  }

  // "도움말" 메시지 핸들러
  static async handleHelpMessage({ message, say }) {
    try {
      Logger.event('"도움말" 메시지 수신', { 
        user: message.user, 
        channel: message.channel 
      });
      
      const response = HelpService.createHelpMessage();
      await say({
        ...response,
        thread_ts: message.ts
      });
      
      Logger.success('도움말 메시지 응답 완료');
    } catch (error) {
      Logger.error('도움말 메시지 응답 중 오류', error);
    }
  }

  // "시간" 메시지 핸들러
  static async handleTimeMessage({ message, say }) {
    try {
      Logger.event('"시간" 메시지 수신', { 
        user: message.user, 
        channel: message.channel 
      });
      
      const response = TimeService.createTimeMessage();
      await say({
        text: response,
        thread_ts: message.ts
      });
      
      Logger.success('시간 메시지 응답 완료');
    } catch (error) {
      Logger.error('시간 메시지 응답 중 오류', error);
    }
  }
}

module.exports = MessageHandlers; 