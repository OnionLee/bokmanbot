const ThermometerService = require('./thermometerService');
const TuyaService = require('./tuyaService');
const Logger = require('../utils/logger');

class TemperatureMonitorService {
  constructor() {
    this.monitoringInterval = null;
    this.isMonitoring = false;
  }

  // 온도계 모니터링 시작
  startMonitoring() {
    if (this.isMonitoring) {
      Logger.info('온도계 모니터링이 이미 실행 중입니다.');
      return;
    }

    Logger.info('온도계 모니터링 시작');
    this.isMonitoring = true;

    // 10초마다 온도 체크
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllThermometers();
    }, 10000); // 10초
  }

  // 온도계 등록 시 모니터링 자동 시작
  async onThermometerRegistered() {
    Logger.info('온도계 등록됨 - 모니터링 자동 시작');
    this.startMonitoring();
  }

  // 온도계 해지 시 모니터링 자동 중지 (등록된 온도계가 없으면)
  async onThermometerUnregistered() {
    const activeThermometers = await ThermometerService.getAllActiveThermometers();
    
    if (activeThermometers.length === 0) {
      Logger.info('등록된 온도계가 없음 - 모니터링 자동 중지');
      this.stopMonitoring();
    } else {
      Logger.info(`아직 ${activeThermometers.length}개의 온도계가 등록되어 있음 - 모니터링 계속`);
    }
  }

  // 온도계 모니터링 중지
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    Logger.info('온도계 모니터링 중지');
  }

  // 모든 온도계 체크
  async checkAllThermometers() {
    try {
      Logger.info('온도계 모니터링 실행 시작');

      // 모든 활성 온도계 조회
      const thermometers = await ThermometerService.getAllActiveThermometers();

      if (thermometers.length === 0) {
        Logger.info('모니터링할 온도계가 없습니다.');
        return;
      }

      Logger.info(`총 ${thermometers.length}개의 온도계 모니터링 중`);

      // 각 온도계별로 온도 체크
      for (const thermometer of thermometers) {
        await this.checkThermometer(thermometer);
      }

    } catch (error) {
      Logger.error('온도계 모니터링 중 오류 발생', error);
    }
  }

  // 개별 온도계 체크
  async checkThermometer(thermometer) {
    try {
      Logger.info('온도계 체크 시작', { 
        thermometerId: thermometer.thermometerId, 
        channelId: thermometer.channelId 
      });

      // Tuya API에서 기기 상태 조회
      const deviceStatus = await TuyaService.getDeviceStatus(thermometer.thermometerId);

      if (!deviceStatus) {
        Logger.warn('온도계 상태 조회 실패', { thermometerId: thermometer.thermometerId });
        return;
      }

      // 온도 데이터 추출
      const tempData = TuyaService.extractTemperature(deviceStatus);
      const tempStatus = TuyaService.getTemperatureStatus(tempData.tempCelsius);

      // 온도 정보 로깅
      Logger.info('온도계 데이터 수집 완료', {
        thermometerId: thermometer.thermometerId,
        temperature: tempData.tempCelsius,
        status: tempStatus.status
      });

      // 온도 상태에 따른 알림 전송
      await this.sendTemperatureAlert(thermometer, tempData, tempStatus);

    } catch (error) {
      Logger.error('온도계 체크 중 오류', { 
        thermometerId: thermometer.thermometerId, 
        error: error.message 
      });
    }
  }

  // 온도 알림 전송
  async sendTemperatureAlert(thermometer, tempData, tempStatus) {
    try {
      // Slack 클라이언트는 app.js에서 전달받아야 하므로
      // 여기서는 로깅만 하고, 실제 메시지 전송은 별도 처리
      
      const alertMessage = this.createTemperatureAlertMessage(
        thermometer, 
        tempData, 
        tempStatus
      );

      Logger.info('온도 알림 메시지 생성', {
        thermometerId: thermometer.thermometerId,
        channelId: thermometer.channelId,
        message: alertMessage
      });

      // 여기서 Slack 메시지 전송 로직을 추가할 수 있습니다
      // 현재는 로깅만 수행

    } catch (error) {
      Logger.error('온도 알림 전송 중 오류', error);
    }
  }

  // 온도 알림 메시지 생성
  createTemperatureAlertMessage(thermometer, tempData, tempStatus) {
    const tempDisplay = tempData.tempCelsius !== null ? `${tempData.tempCelsius}°C` : 'N/A';
    const timestamp = new Date().toLocaleString('ko-KR');

    return {
      text: `🌡️ 온도계 알림 - ${tempDisplay}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🌡️ 온도계 모니터링 - ${tempStatus.emoji}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*온도계 ID:*\n\`${thermometer.thermometerId}\``
            },
            {
              type: 'mrkdwn',
              text: `*채널:*\n#${thermometer.channelName}`
            },
            {
              type: 'mrkdwn',
              text: `*현재 온도:*\n${tempDisplay}`
            },
            {
              type: 'mrkdwn',
              text: `*상태:*\n${tempStatus.message}`
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏰ ${timestamp}`
            }
          ]
        }
      ]
    };
  }

  // 모니터링 상태 확인
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      interval: this.monitoringInterval ? '10초' : null
    };
  }
}

module.exports = new TemperatureMonitorService(); 