const Logger = require('./logger');

class EnvValidator {
  static validate() {
    Logger.info('🔍 환경 변수 설정 확인 중...');

    const requiredVars = {
      'SLACK_BOT_TOKEN': process.env.SLACK_BOT_TOKEN,
      'SLACK_SIGNING_SECRET': process.env.SLACK_SIGNING_SECRET,
      'SLACK_APP_TOKEN': process.env.SLACK_APP_TOKEN,
      'MONGODB_URI': process.env.MONGODB_URI,
      'TUYA_ACCESS_KEY': process.env.TUYA_ACCESS_KEY,
      'TUYA_SECRET_KEY': process.env.TUYA_SECRET_KEY
    };

    const missingVars = [];
    const validVars = [];

    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        missingVars.push(key);
      } else {
        let isValid = this.validateVariable(key, value);
        if (isValid) {
          validVars.push(`${key}: ✅ 설정됨`);
        } else {
          missingVars.push(`${key}: ❌ (잘못된 형식)`);
        }
      }
    }

    Logger.info('📋 환경 변수 상태:');
    validVars.forEach(varInfo => Logger.info(`  ${varInfo}`));

    if (missingVars.length > 0) {
      Logger.error('❌ 누락된 환경 변수:');
      missingVars.forEach(varName => Logger.error(`  ${varName}`));
      this.showHelpMessage();
      return false;
    }

    Logger.info('✅ 모든 필수 환경 변수가 올바르게 설정되었습니다!');
    return true;
  }

  static validateVariable(key, value) {
    switch (key) {
      case 'SLACK_BOT_TOKEN':
        return value.startsWith('xoxb-');
      case 'SLACK_APP_TOKEN':
        return value.startsWith('xapp-');
      case 'SLACK_SIGNING_SECRET':
        return value.length > 0;
      case 'MONGODB_URI':
        return value.startsWith('mongodb');
      case 'TUYA_ACCESS_KEY':
      case 'TUYA_SECRET_KEY':
        return value.length > 0;
      default:
        return false;
    }
  }

  static showHelpMessage() {
    Logger.error('💡 해결 방법:');
    Logger.error('  1. .env 파일이 프로젝트 루트에 있는지 확인하세요');
    Logger.error('  2. .env 파일에 다음 내용이 포함되어 있는지 확인하세요:');
    Logger.error('     SLACK_BOT_TOKEN=xoxb-your-bot-token');
    Logger.error('     SLACK_SIGNING_SECRET=your-signing-secret');
    Logger.error('     SLACK_APP_TOKEN=xapp-your-app-token');
    Logger.error('     MONGODB_URI=mongodb://your-mongodb-uri');
    Logger.error('     TUYA_ACCESS_KEY=your-tuya-access-key');
    Logger.error('     TUYA_SECRET_KEY=your-tuya-secret-key');
    Logger.error('  3. Slack API 웹사이트에서 올바른 토큰을 복사했는지 확인하세요');
  }
}

module.exports = EnvValidator; 