const { App } = require('@slack/bolt');
require('dotenv').config();

// 데이터베이스 연결
const Database = require('./config/database');

// 환경 변수 검증 함수
function validateEnvironmentVariables() {
  console.log('🔍 환경 변수 설정 확인 중...');
  
  const requiredVars = {
    'SLACK_BOT_TOKEN': process.env.SLACK_BOT_TOKEN,
    'SLACK_SIGNING_SECRET': process.env.SLACK_SIGNING_SECRET,
    'SLACK_APP_TOKEN': process.env.SLACK_APP_TOKEN,
    'MONGODB_URI': process.env.MONGODB_URI
  };
  
  const missingVars = [];
  const validVars = [];
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missingVars.push(key);
    } else {
      // 토큰 형식 검증
      let isValid = false;
      if (key === 'SLACK_BOT_TOKEN' && value.startsWith('xoxb-')) {
        isValid = true;
      } else if (key === 'SLACK_APP_TOKEN' && value.startsWith('xapp-')) {
        isValid = true;
      } else if (key === 'SLACK_SIGNING_SECRET' && value.length > 0) {
        isValid = true;
      } else if (key === 'MONGODB_URI' && value.startsWith('mongodb')) {
        isValid = true;
      }
      
      if (isValid) {
        validVars.push(`${key}: ✅ 설정됨`);
      } else {
        missingVars.push(`${key}: ❌ (잘못된 형식)`);
      }
    }
  }
  
  // 결과 출력
  console.log('\n📋 환경 변수 상태:');
  validVars.forEach(varInfo => console.log(`  ${varInfo}`));
  
  if (missingVars.length > 0) {
    console.log('\n❌ 누락된 환경 변수:');
    missingVars.forEach(varName => console.log(`  ${varName}`));
    console.log('\n💡 해결 방법:');
    console.log('  1. .env 파일이 프로젝트 루트에 있는지 확인하세요');
    console.log('  2. .env 파일에 다음 내용이 포함되어 있는지 확인하세요:');
    console.log('     SLACK_BOT_TOKEN=xoxb-your-bot-token');
    console.log('     SLACK_SIGNING_SECRET=your-signing-secret');
    console.log('     SLACK_APP_TOKEN=xapp-your-app-token');
    console.log('     MONGODB_URI=mongodb://your-mongodb-uri');
    console.log('  3. Slack API 웹사이트에서 올바른 토큰을 복사했는지 확인하세요');
    return false;
  }
  
  console.log('\n✅ 모든 필수 환경 변수가 올바르게 설정되었습니다!');
  return true;
}

// 환경 변수 검증
if (!validateEnvironmentVariables()) {
  console.error('\n🚫 환경 변수 설정 오류로 인해 앱을 시작할 수 없습니다.');
  process.exit(1);
}

// Slack 앱 초기화
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// 핸들러들 import
const MessageHandlers = require('./handlers/messageHandlers');
const MentionHandlers = require('./handlers/mentionHandlers');
const CommandHandlers = require('./handlers/commandHandlers');
const ThermometerHandlers = require('./handlers/thermometerHandlers');
const { COMMANDS, SLASH_COMMANDS } = require('./config/constants');
const Logger = require('./utils/logger');

// 이벤트 핸들러 등록
app.event('app_mention', MentionHandlers.handleAppMention);

// 메시지 핸들러 등록
app.message(COMMANDS.HELLO, MessageHandlers.handleHelloMessage);
app.message(COMMANDS.HELP, MessageHandlers.handleHelpMessage);
app.message(COMMANDS.TIME, MessageHandlers.handleTimeMessage);

// 슬래시 명령어 핸들러 등록
app.command(SLASH_COMMANDS.HELLO, CommandHandlers.handleHelloCommand);

// 온도계 관련 슬래시 명령어 핸들러 등록
app.command(SLASH_COMMANDS.REGISTER_THERMOMETER, ThermometerHandlers.handleRegisterThermometer);
app.command(SLASH_COMMANDS.UNREGISTER_THERMOMETER, ThermometerHandlers.handleUnregisterThermometer);
app.command(SLASH_COMMANDS.LIST_THERMOMETERS, ThermometerHandlers.handleListThermometers);

// 앱 시작
(async () => {
  try {
    const port = process.env.PORT || 3000;
    Logger.info('BokmanBot 서버 시작 중...', { port, socketMode: true });
    
    // 데이터베이스 연결
    await Database.connect();
    
    await app.start(port);
    
    Logger.success('BokmanBot이 성공적으로 실행되었습니다!');
    
  } catch (error) {
    Logger.error('서버 시작 중 오류 발생', error);
    process.exit(1);
  }
})(); 