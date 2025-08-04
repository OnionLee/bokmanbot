// 봇 설정 상수
const BOT_NAME = 'BokmanBot';

// 명령어 상수
const COMMANDS = {
  HELLO: '안녕',
  HELP: '도움말',
  TIME: '시간'
};

// 슬래시 명령어
const SLASH_COMMANDS = {
  HELLO: '/hello',
  REGISTER_THERMOMETER: '/register-thermometer',
  UNREGISTER_THERMOMETER: '/unregister-thermometer',
  LIST_THERMOMETERS: '/list-thermometers'
};

// 메시지 템플릿
const MESSAGES = {
  WELCOME: (user) => `안녕하세요! <@${user}>님, 저는 ${BOT_NAME}입니다! 👋`,
  GREETING: (user) => `안녕하세요! <@${user}>님! 😊`,
  TIME_INFO: (time) => `현재 한국 시간: ${time} ⏰`,
  SLASH_HELLO: (user) => `안녕하세요! <@${user}>님! 슬래시 명령어로 호출하셨네요! 🎉`
};

// 도움말 메시지
const HELP_MESSAGE = {
  title: '🤖 BokmanBot 도움말',
  commands: [
    '`안녕` - 봇과 인사하기',
    '`도움말` - 이 도움말 보기', 
    '`시간` - 현재 시간 확인'
  ]
};

module.exports = {
  BOT_NAME,
  COMMANDS,
  SLASH_COMMANDS,
  MESSAGES,
  HELP_MESSAGE
}; 