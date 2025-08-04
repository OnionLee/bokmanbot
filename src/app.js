const { App } = require('@slack/bolt');
require('dotenv').config();

// 환경 변수 검증 함수
function validateEnvironmentVariables() {
  console.log('🔍 환경 변수 설정 확인 중...');
  
  const requiredVars = {
    'SLACK_BOT_TOKEN': process.env.SLACK_BOT_TOKEN,
    'SLACK_SIGNING_SECRET': process.env.SLACK_SIGNING_SECRET,
    'SLACK_APP_TOKEN': process.env.SLACK_APP_TOKEN
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
      }
      
      if (isValid) {
        validVars.push(`${key}: ✅ (${value.substring(0, 10)}...)`);
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

// 봇이 채널에 초대되었을 때
app.event('app_mention', async ({ event, say }) => {
  console.log('🔔 app_mention 이벤트 수신:', event);
  try {
    await say({
      text: `안녕하세요! <@${event.user}>님, 저는 BokmanBot입니다! 👋`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `안녕하세요! <@${event.user}>님, 저는 BokmanBot입니다! 👋`
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
    });
  } catch (error) {
    console.error('Error responding to app_mention:', error);
  }
});

// 메시지 이벤트 처리
app.message('안녕', async ({ message, say }) => {
  console.log('💬 "안녕" 메시지 수신:', message);
  try {
    await say({
      text: `안녕하세요! <@${message.user}>님! 😊`,
      thread_ts: message.ts
    });
  } catch (error) {
    console.error('Error responding to hello message:', error);
  }
});

// 도움말 명령어
app.message('도움말', async ({ message, say }) => {
  try {
    await say({
      text: 'BokmanBot 도움말',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🤖 BokmanBot 도움말'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*사용 가능한 명령어:*\n\n• `안녕` - 봇과 인사하기\n• `도움말` - 이 도움말 보기\n• `시간` - 현재 시간 확인'
          }
        }
      ],
      thread_ts: message.ts
    });
  } catch (error) {
    console.error('Error responding to help command:', error);
  }
});

// 시간 확인 명령어
app.message('시간', async ({ message, say }) => {
  try {
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
    
    await say({
      text: `현재 한국 시간: ${koreanTime} ⏰`,
      thread_ts: message.ts
    });
  } catch (error) {
    console.error('Error responding to time command:', error);
  }
});

// 슬래시 명령어 예시
app.command('/hello', async ({ command, ack, say }) => {
  console.log('⚡ /hello 슬래시 명령어 수신:', command);
  try {
    await ack();
    await say({
      text: `안녕하세요! <@${command.user_id}>님! 슬래시 명령어로 호출하셨네요! 🎉`
    });
  } catch (error) {
    console.error('Error handling slash command:', error);
  }
});

// 앱 시작
(async () => {
  try {
    const port = process.env.PORT || 3000;
    console.log(`\n🚀 BokmanBot 서버 시작 중...`);
    console.log(`📍 포트: ${port}`);
    console.log(`🌐 Socket Mode: 활성화`);
    
    await app.start(port);
    
    console.log('\n✅ BokmanBot이 성공적으로 실행되었습니다!');
    console.log('📱 Slack 워크스페이스에서 봇을 테스트해보세요:');
    console.log('   • 봇을 채널에 초대하고 @BokmanBot으로 멘션');
    console.log('   • "안녕", "도움말", "시간" 메시지 전송');
    console.log('   • /hello 슬래시 명령어 사용');
    console.log('\n🛑 서버를 중지하려면 Ctrl+C를 누르세요\n');
    
  } catch (error) {
    console.error('\n❌ 서버 시작 중 오류 발생:', error.message);
    console.error('💡 확인사항:');
    console.error('   1. Slack 앱 설정이 올바른지 확인');
    console.error('   2. 토큰이 유효한지 확인');
    console.error('   3. Socket Mode가 활성화되어 있는지 확인');
    process.exit(1);
  }
})(); 