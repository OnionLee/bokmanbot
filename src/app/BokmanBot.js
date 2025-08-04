const { App } = require('@slack/bolt');
const Database = require('../config/database');
const ThermometerService = require('../services/thermometerService');
const CronMonitorService = require('../services/cronMonitorService');
const Logger = require('../utils/logger');

class BokmanBot {
  constructor() {
    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
    
    this.cronMonitor = CronMonitorService;
    this.isInitialized = false;
  }

  // 환경 변수 검증
  validateEnvironmentVariables() {
    const EnvValidator = require('../utils/envValidator');
    return EnvValidator.validate();
  }

  // 핸들러 등록
  registerHandlers() {
    const MessageHandlers = require('../handlers/messageHandlers');
    const MentionHandlers = require('../handlers/mentionHandlers');
    const CommandHandlers = require('../handlers/commandHandlers');
    const ThermometerHandlers = require('../handlers/thermometerHandlers');
    const { COMMANDS, SLASH_COMMANDS } = require('../config/constants');

    // 이벤트 핸들러 등록
    this.app.event('app_mention', MentionHandlers.handleAppMention);

    // 메시지 핸들러 등록
    this.app.message(COMMANDS.HELLO, MessageHandlers.handleHelloMessage);
    this.app.message(COMMANDS.HELP, MessageHandlers.handleHelpMessage);
    this.app.message(COMMANDS.TIME, MessageHandlers.handleTimeMessage);

    // 슬래시 명령어 핸들러 등록
    this.app.command(SLASH_COMMANDS.HELLO, CommandHandlers.handleHelloCommand);

    // 온도계 관련 슬래시 명령어 핸들러 등록
    this.app.command(SLASH_COMMANDS.REGISTER_THERMOMETER, ThermometerHandlers.handleRegisterThermometer);
    this.app.command(SLASH_COMMANDS.UNREGISTER_THERMOMETER, ThermometerHandlers.handleUnregisterThermometer);
    this.app.command(SLASH_COMMANDS.LIST_THERMOMETERS, ThermometerHandlers.handleListThermometers);

    Logger.info('✅ 모든 핸들러가 등록되었습니다.');
  }

  // 모니터링 서비스 초기화
  async initializeMonitoring() {
    // Cron 모니터링 서비스에 Slack 클라이언트 설정
    this.cronMonitor.setSlackClient(this.app.client);

    // 앱 시작 시 등록된 온도계가 있으면 모니터링 자동 시작
    const activeThermometers = await ThermometerService.getAllActiveThermometers();
    if (activeThermometers.length > 0) {
      Logger.info('등록된 온도계 발견 - Cron 모니터링 자동 시작', { count: activeThermometers.length });
      await this.cronMonitor.onThermometerRegistered();
    }

    Logger.info('✅ 모니터링 서비스가 초기화되었습니다.');
  }

  // 앱 시작
  async start(port = 3000) {
    try {
      Logger.info('BokmanBot 서버 시작 중...', { port, socketMode: true });

      // 데이터베이스 연결
      await Database.connect();

      // 핸들러 등록
      this.registerHandlers();

      // 앱 시작
      await this.app.start(port);

      // 모니터링 서비스 초기화
      await this.initializeMonitoring();

      this.isInitialized = true;
      Logger.success('BokmanBot이 성공적으로 실행되었습니다!');
      Logger.info('온도계 등록 시 자동으로 Cron 모니터링이 시작됩니다.');

    } catch (error) {
      Logger.error('서버 시작 중 오류 발생', error);
      Logger.error('확인사항:');
      Logger.error('1. Slack 앱 설정이 올바른지 확인');
      Logger.error('2. 토큰이 유효한지 확인');
      Logger.error('3. Socket Mode가 활성화되어 있는지 확인');
      throw error;
    }
  }

  // 앱 종료
  async stop() {
    try {
      if (this.cronMonitor) {
        this.cronMonitor.stopMonitoring();
      }
      
      if (this.app) {
        await this.app.stop();
      }
      
      await Database.disconnect();
      
      Logger.info('BokmanBot이 정상적으로 종료되었습니다.');
    } catch (error) {
      Logger.error('앱 종료 중 오류 발생', error);
    }
  }

  // 앱 상태 확인
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isMonitoring: this.cronMonitor ? this.cronMonitor.getMonitoringStatus() : null
    };
  }
}

module.exports = BokmanBot; 