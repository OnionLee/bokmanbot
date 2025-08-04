// 로깅 유틸리티
class Logger {
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  ${message}`);
    if (data) {
      console.log(`   데이터:`, data);
    }
  }

  static success(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ ${message}`);
  }

  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${message}`);
    if (error) {
      console.error(`   오류:`, error);
    }
  }

  static event(eventType, details = {}) {
    const timestamp = new Date().toISOString();
    const { user, channel, ...otherDetails } = details;
    
    console.log(`[${timestamp}] 🔔 ${eventType} 이벤트`);
    if (user) console.log(`   사용자: ${user}`);
    if (channel) console.log(`   채널: ${channel}`);
    
    if (Object.keys(otherDetails).length > 0) {
      console.log(`   기타:`, otherDetails);
    }
  }
}

module.exports = Logger; 