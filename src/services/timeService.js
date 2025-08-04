const { MESSAGES } = require('../config/constants');
const Logger = require('../utils/logger');

class TimeService {
  // 한국 시간 가져오기
  static getKoreanTime() {
    const now = new Date();
    const koreanTime = now.toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    Logger.info('한국 시간 조회', { time: koreanTime });
    return koreanTime;
  }

  // 시간 메시지 생성
  static createTimeMessage() {
    const koreanTime = this.getKoreanTime();
    Logger.event('시간 메시지 생성', { time: koreanTime });
    return MESSAGES.TIME_INFO(koreanTime);
  }
}

module.exports = TimeService; 