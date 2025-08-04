require('dotenv').config();
const BokmanBot = require('./app/BokmanBot');
const Logger = require('./utils/logger');

// 메인 실행 함수
async function main() {
  const bot = new BokmanBot();
  
  try {
    // 환경 변수 검증
    if (!bot.validateEnvironmentVariables()) {
      Logger.error('🚫 환경 변수 설정 오류로 인해 앱을 시작할 수 없습니다.');
      process.exit(1);
    }

    // 앱 시작
    const port = process.env.PORT || 3000;
    await bot.start(port);

    // 종료 시그널 처리
    process.on('SIGINT', async () => {
      Logger.info('SIGINT 신호 수신 - 앱 종료 중...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      Logger.info('SIGTERM 신호 수신 - 앱 종료 중...');
      await bot.stop();
      process.exit(0);
    });

  } catch (error) {
    Logger.error('앱 실행 중 오류 발생', error);
    process.exit(1);
  }
}

// 앱 실행
main(); 