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

      // 응답 구조 확인 및 로깅
      Logger.info('Tuya API 응답 구조', { 
        deviceId, 
        hasResult: !!response.result,
        resultType: typeof response.result,
        resultKeys: response.result ? Object.keys(response.result) : []
      });

      // response.result가 직접 상태 객체인 경우
      if (response.result && typeof response.result === 'object' && !Array.isArray(response.result)) {
        Logger.info('Tuya 기기 상태 조회 성공 (직접 객체)', { deviceId, result: response.result });
        return response.result;
      }

      // response.result.status가 배열인 경우
      if (response.result && response.result.status && Array.isArray(response.result.status)) {
        const status = {};
        for (const item of response.result.status) {
          status[item.code] = item.value;
        }
        Logger.info('Tuya 기기 상태 조회 성공 (배열 변환)', { deviceId, status });
        return status;
      }

      // 기타 경우 - 원본 반환
      Logger.info('Tuya 기기 상태 조회 성공 (원본 반환)', { deviceId, result: response.result });
      return response.result;
    } catch (error) {
      Logger.error('Tuya 기기 상태 조회 실패', { deviceId, error: error.message });
      return null;
    }
  }

  // 온도 데이터 추출
  extractTemperature(status) {
    if (!status) return null;

    Logger.info('온도 데이터 추출 시작', { 
      statusType: typeof status, 
      isArray: Array.isArray(status),
      statusKeys: Array.isArray(status) ? status.length : Object.keys(status)
    });

    let temperature = null;
    let tempUnit = 'c';

    // 배열 형태인 경우 객체로 변환
    let statusObj = status;
    if (Array.isArray(status)) {
      statusObj = {};
      status.forEach(item => {
        if (item && item.code && item.value !== undefined) {
          statusObj[item.code] = item.value;
        }
      });
      Logger.info('배열을 객체로 변환', statusObj);
    }

    // 다양한 온도 속성명 시도
    const tempKeys = [
      'va_temperature',
      'current_temperature', 
      'temperature',
      'temp',
      'current_temp',
      'va_temp'
    ];

    for (const key of tempKeys) {
      if (statusObj[key] !== undefined && statusObj[key] !== null) {
        temperature = statusObj[key];
        Logger.info('온도 속성 발견', { key, value: temperature });
        break;
      }
    }

    // 온도 단위 확인
    if (statusObj.temp_unit_convert !== undefined) {
      tempUnit = statusObj.temp_unit_convert;
    } else if (statusObj.temp_unit !== undefined) {
      tempUnit = statusObj.temp_unit;
    }

    // 섭씨로 변환 (API에서 10배 값으로 오는 경우)
    let tempCelsius = null;
    if (temperature !== null) {
      // 값이 100 이상이면 10으로 나누기 (API 특성)
      tempCelsius = temperature >= 100 ? temperature / 10 : temperature;
    }

    const result = {
      temperature,
      tempUnit,
      tempCelsius
    };

    Logger.info('온도 데이터 추출 완료', result);
    return result;
  }

  // 온도 상태 판단 (개별 온도계 설정 사용)
  getTemperatureStatus(tempCelsius, thermometerSettings = null) {
    if (tempCelsius === null || tempCelsius === undefined) {
      return { status: 'unknown', emoji: '❓', message: '온도 데이터 없음' };
    }

    // 기본값 또는 온도계별 설정 사용
    const maxTemp = thermometerSettings?.maxTemp || 30;
    const minTemp = thermometerSettings?.minTemp || 10;
    const warningThreshold = thermometerSettings?.warningTemp || 5;

    if (tempCelsius > maxTemp) {
      return { status: 'danger', emoji: '🔴', message: `최고온도 초과 (${maxTemp}°C)` };
    } else if (tempCelsius < minTemp) {
      return { status: 'danger', emoji: '🔴', message: `최저온도 미만 (${minTemp}°C)` };
    } else if (tempCelsius >= (maxTemp - warningThreshold) || tempCelsius <= (minTemp + warningThreshold)) {
      return { status: 'warning', emoji: '🟡', message: '온도 임계값 근접' };
    } else {
      return { status: 'normal', emoji: '🟢', message: '정상' };
    }
  }
}

module.exports = new TuyaService(); 