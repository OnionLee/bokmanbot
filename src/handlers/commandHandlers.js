const ChatService = require('../services/chatService');
const Logger = require('../utils/logger');

class CommandHandlers {
  // /hello 슬래시 명령어 핸들러
  static async handleHelloCommand({ command, ack, say }) {
    try {
      Logger.event('/hello 슬래시 명령어 수신', { 
        user: command.user_id, 
        channel: command.channel_id 
      });
      
      await ack();
      
      const response = ChatService.createSlashHelloMessage(command.user_id);
      await say({
        text: response
      });
      
      Logger.success('슬래시 명령어 응답 완료');
    } catch (error) {
      Logger.error('슬래시 명령어 응답 중 오류', error);
    }
  }
}

module.exports = CommandHandlers; 