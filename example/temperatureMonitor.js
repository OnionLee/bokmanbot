import tuyaService from './tuyaService.js';
import { config } from '../../config/settings.js';

class TemperatureMonitor {
  constructor() {
    this.previousDevices = new Map(); // 이전 기기 목록 저장
    this.deviceHistory = new Map(); // 기기 온도 히스토리
  }

  // 온도 상태 판단
  getTemperatureStatus(temperature) {
    const { maxTemp, minTemp, warningThreshold } = config.temperature;
    
    if (temperature === null || temperature === undefined) {
      return { status: 'unknown', emoji: '❓', message: '온도 데이터 없음' };
    }

    // 섭씨로 변환 (API에서 10배 값으로 오므로)
    const tempCelsius = temperature / 10;

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

  // 기기 변경 감지
  detectDeviceChanges(currentDevices) {
    const currentDeviceIds = new Set(currentDevices.map(d => d.id));
    const previousDeviceIds = new Set(this.previousDevices.keys());
    
    const newDevices = currentDevices.filter(d => !previousDeviceIds.has(d.id));
    const removedDevices = Array.from(previousDeviceIds).filter(id => !currentDeviceIds.has(id));
    
    return { newDevices, removedDevices };
  }

  // 온도 데이터 처리
  processTemperatureData(devices) {
    const temperatureData = [];
    
    for (const device of devices) {
      let temperature = null;
      let tempUnit = 'c';
      
      // 온도 관련 상태 찾기
      for (const status of device.status) {
        if (status.code === 'va_temperature') {
          temperature = status.value;
        } else if (status.code === 'temp_unit_convert') {
          tempUnit = status.value;
        }
      }

      const tempStatus = this.getTemperatureStatus(temperature);
      
      const deviceInfo = {
        id: device.id,
        name: device.name || '알 수 없는 기기',
        model: device.model || '모델 정보 없음',
        online: device.online,
        category: device.category,
        temperature,
        tempUnit,
        tempCelsius: temperature !== null ? temperature / 10 : null,
        status: tempStatus,
        timestamp: new Date().toISOString()
      };

      temperatureData.push(deviceInfo);
      
      // 히스토리 업데이트
      this.deviceHistory.set(device.id, deviceInfo);
    }

    return temperatureData;
  }

  // 모니터링 실행
  async monitor() {
    try {
      const devices = await tuyaService.getAllDevices();
      
      // 기기 변경 감지
      const changes = this.detectDeviceChanges(devices);
      
      if (changes.newDevices.length > 0) {
        console.log(`🆕 새로운 기기 발견: ${changes.newDevices.length}개`);
        changes.newDevices.forEach(device => {
          console.log(`   - ${device.name} (${device.id})`);
        });
      }
      
      if (changes.removedDevices.length > 0) {
        console.log(`❌ 기기 연결 해제: ${changes.removedDevices.length}개`);
        changes.removedDevices.forEach(deviceId => {
          const deviceName = this.previousDevices.get(deviceId)?.name || deviceId;
          console.log(`   - ${deviceName} (${deviceId})`);
        });
      }

      // 온도 데이터 처리
      const temperatureData = this.processTemperatureData(devices);
      
      // 콘솔 출력
      this.displayTemperatureData(temperatureData);
      
      // 이전 기기 목록 업데이트
      this.previousDevices.clear();
      devices.forEach(device => {
        this.previousDevices.set(device.id, device);
      });

      return temperatureData;
    } catch (error) {
      console.error('모니터링 중 오류 발생:', error);
      return [];
    }
  }

  // 온도 데이터 콘솔 출력
  displayTemperatureData(temperatureData) {
    console.log('\n' + '='.repeat(60));
    console.log(`🌡️ 온도 모니터링 - ${new Date().toLocaleString('ko-KR')}`);
    console.log('='.repeat(60));
    
    if (temperatureData.length === 0) {
      console.log('❌ 모니터링 가능한 기기가 없습니다.');
      return;
    }

    temperatureData.forEach(device => {
      const status = device.status;
      const tempDisplay = device.tempCelsius !== null ? `${device.tempCelsius}°C` : 'N/A';
      
      console.log(`\n📱 ${device.name}`);
      console.log(`   기기 ID: ${device.id}`);
      console.log(`   모델: ${device.model}`);
      console.log(`   온도: ${tempDisplay} ${status.emoji}`);
      console.log(`   상태: ${status.message}`);
      console.log(`   연결: ${device.online ? '🟢 온라인' : '🔴 오프라인'}`);
      console.log(`   카테고리: ${device.category || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(60));
  }
}

export default new TemperatureMonitor(); 