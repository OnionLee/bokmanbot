const { TuyaContext } = require('@tuya/tuya-connector-nodejs');
const Logger = require('../utils/logger');

class TuyaService {
  constructor() {
    this.tuya = new TuyaContext({
      baseUrl: process.env.TUYA_BASE_URL || 'https://openapi.tuyaus.com',
      accessKey: process.env.TUYA_ACCESS_KEY,
      secretKey: process.env.TUYA_SECRET_KEY,
    });
  }

  // 특정 기기의 상태 가져오기
  async getDeviceStatus(deviceId) {
    try {
      Logger.info('Tuya 기기 상태 조회 시도', { deviceId });

      const response = await this.tuya.request({
        path: `/v1.0/devices/${deviceId}/status`,
        method: 'GET',
      });

      if (!response.success) {
        Logger.error('Tuya API 응답 실패', { deviceId, response });
        return null;
      }

      const status = {};
      for (const item of response.result.status) {
        status[item.code] = item.value;
      }

      Logger.info('Tuya 기기 상태 조회 성공', { deviceId, status });
      return status;
    } catch (error) {
      Logger.error('Tuya 기기 상태 조회 실패', { deviceId, error: error.message });
      return null;
    }
  }

  // 온도 데이터 추출
  extractTemperature(status) {
    if (!status) return null;

    let temperature = null;
    let tempUnit = 'c';

    // 온도 관련 상태 찾기
    if (status.va_temperature !== undefined) {
      temperature = status.va_temperature;
    } else if (status.current_temperature !== undefined) {
      temperature = status.current_temperature;
    }

    if (status.temp_unit_convert !== undefined) {
      tempUnit = status.temp_unit_convert;
    }

    // 섭씨로 변환 (API에서 10배 값으로 오는 경우)
    const tempCelsius = temperature !== null ? temperature / 10 : null;

    return {
      temperature,
      tempUnit,
      tempCelsius
    };
  }

  // 온도 상태 판단
  getTemperatureStatus(tempCelsius) {
    if (tempCelsius === null || tempCelsius === undefined) {
      return { status: 'unknown', emoji: '❓', message: '온도 데이터 없음' };
    }

    const maxTemp = 30; // 최고 온도 임계값
    const minTemp = 10; // 최저 온도 임계값
    const warningThreshold = 5; // 경고 임계값

    if (tempCelsius > maxTemp) {
      return { status: 'danger', emoji: '🔴', message: '최고온도 초과' };
    } else if (tempCelsius < minTemp) {
      return { status: 'danger', emoji: '🔴', message: '최저온도 미만' };
    } else if (tempCelsius >= (maxTemp - warningThreshold) || tempCelsius <= (minTemp + warningThreshold)) {
      return { status: 'warning', emoji: '🟡', message: '온도 임계값 근접' };
    } else {
      return { status: 'normal', emoji: '🟢', message: '정상' };
    }
  }
}

module.exports = new TuyaService(); 