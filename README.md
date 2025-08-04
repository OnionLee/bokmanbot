# BokmanBot - Slack 봇

Slack Bolt Framework를 사용한 기본적인 Slack 봇입니다.

## 🚀 기능

- 봇 멘션 시 인사 및 도움말 제공
- 메시지 기반 명령어 처리
- 슬래시 명령어 지원
- 한국 시간 표시

## 📋 사용 가능한 명령어

- `@BokmanBot` - 봇을 멘션하면 인사와 도움말을 보여줍니다
- `안녕` - 봇과 인사하기
- `도움말` - 사용 가능한 명령어 목록 보기
- `시간` - 현재 한국 시간 확인
- `/hello` - 슬래시 명령어로 봇 호출

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

### 3. Slack 앱 설정

1. [Slack API 웹사이트](https://api.slack.com/apps)에서 새 앱 생성
2. **OAuth & Permissions**에서 다음 스코프 추가:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
3. **Socket Mode** 활성화
4. **Event Subscriptions**에서 다음 이벤트 구독:
   - `app_mention`
   - `message.channels`
   - `message.groups`
   - `message.im`
   - `message.mpim`
5. **Slash Commands**에서 `/hello` 명령어 추가

### 4. 봇 실행

개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

## 📁 프로젝트 구조

```
bokmanbot/
├── src/
│   └── app.js          # 메인 봇 애플리케이션
├── package.json        # 프로젝트 의존성
├── env.example         # 환경 변수 예시
└── README.md          # 프로젝트 문서
```

## 🔧 개발

### 새로운 명령어 추가

`src/app.js`에서 새로운 메시지 핸들러를 추가할 수 있습니다:

```javascript
app.message('새명령어', async ({ message, say }) => {
  try {
    await say({
      text: '새로운 명령어 응답!',
      thread_ts: message.ts
    });
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### 새로운 슬래시 명령어 추가

```javascript
app.command('/새명령어', async ({ command, ack, say }) => {
  try {
    await ack();
    await say({
      text: '새로운 슬래시 명령어 응답!'
    });
  } catch (error) {
    console.error('Error:', error);
  }
});
```

## 📚 참고 자료

- [Slack Bolt Framework 문서](https://slack.dev/bolt-js/)
- [Slack API 문서](https://api.slack.com/)
- [Slack Block Kit](https://api.slack.com/block-kit)

## 🤝 기여

이슈나 풀 리퀘스트를 통해 기여해주세요!

## 📄 라이선스

MIT License 