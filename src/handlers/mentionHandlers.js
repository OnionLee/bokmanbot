const ChatService = require('../services/chatService');
const Logger = require('../utils/logger');

class MentionHandlers {
  // 앱 멘션 핸들러
  static async handleAppMention({ event, say }) {
    try {
      Logger.event('앱 멘션 수신', { 
        user: event.user, 
        channel: event.channel 
      });
      
      const response = ChatService.createWelcomeMessage(event.user);
      await say(response);
      
      Logger.success('멘션 응답 완료');
    } catch (error) {
      Logger.error('멘션 응답 중 오류', error);
    }
  }
}

module.exports = MentionHandlers; 