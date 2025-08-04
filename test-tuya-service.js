require('dotenv').config();

// TuyaService 테스트용 파일
const TuyaService = require('./src/services/tuyaService');

// 테스트할 기기 ID (로그에서 확인된 ID)
const TEST_DEVICE_ID = 'ebfbe6077ff78d9548etmg';

// 환경 변수 확인
console.log('🔍 Tuya API 환경 변수 확인:');
console.log('TUYA_ACCESS_KEY:', process.env.TUYA_ACCESS_KEY ? '✅ 설정됨' : '❌ 설정 안됨');
console.log('TUYA_SECRET_KEY:', process.env.TUYA_SECRET_KEY ? '✅ 설정됨' : '❌ 설정 안됨');
console.log('');

// TuyaService 테스트 함수
async function testTuyaService() {
  console.log('🚀 TuyaService 테스트 시작\n');
  
  try {
    // 1. 기기 상태 조회 테스트
    console.log('📡 1. 기기 상태 조회 테스트');
    console.log(`   기기 ID: ${TEST_DEVICE_ID}`);
    
    const deviceStatus = await TuyaService.getDeviceStatus(TEST_DEVICE_ID);
    
    if (!deviceStatus) {
      console.log('   ❌ 기기 상태 조회 실패');
      return;
    }
    
    console.log('   ✅ 기기 상태 조회 성공');
    console.log('   응답 데이터:', JSON.stringify(deviceStatus, null, 2));
    console.log('');

    // 2. 온도 데이터 추출 테스트
    console.log('🌡️ 2. 온도 데이터 추출 테스트');
    
    const tempData = TuyaService.extractTemperature(deviceStatus);
    
    if (!tempData) {
      console.log('   ❌ 온도 데이터 추출 실패');
      console.log('   사용 가능한 속성들:');
      if (deviceStatus.result) {
        deviceStatus.result.forEach(item => {
          console.log(`     - ${item.code}: ${item.value}`);
        });
      }
      return;
    }
    
    console.log('   ✅ 온도 데이터 추출 성공');
    console.log('   온도 데이터:', JSON.stringify(tempData, null, 2));
    console.log('');

    // 3. 온도 상태 판단 테스트
    console.log('📊 3. 온도 상태 판단 테스트');
    
    const tempStatus = TuyaService.getTemperatureStatus(tempData.tempCelsius);
    
    console.log('   ✅ 온도 상태 판단 완료');
    console.log('   온도 상태:', JSON.stringify(tempStatus, null, 2));
    console.log('');

    // 4. 전체 프로세스 테스트
    console.log('🔄 4. 전체 프로세스 테스트');
    
    // 온도계 객체 시뮬레이션
    const mockThermometer = {
      thermometerId: TEST_DEVICE_ID,
      channelId: 'test-channel',
      channelName: 'test-channel'
    };
    
    console.log('   시뮬레이션 온도계:', JSON.stringify(mockThermometer, null, 2));
    console.log('   현재 온도:', `${tempData.tempCelsius}°C`);
    console.log('   온도 상태:', `${tempStatus.emoji} ${tempStatus.message}`);
    console.log('');

    // 5. 다양한 온도 테스트
    console.log('🧪 5. 다양한 온도 상태 테스트');
    
    const testTemperatures = [5, 15, 25, 35, null];
    
    testTemperatures.forEach(temp => {
      const status = TuyaService.getTemperatureStatus(temp);
      console.log(`   ${temp}°C → ${status.emoji} ${status.message} (${status.status})`);
    });
    
    console.log('\n✅ TuyaService 테스트 완료!');
    
  } catch (error) {
    console.error('❌ TuyaService 테스트 중 오류 발생:');
    console.error('오류 타입:', error.constructor.name);
    console.error('오류 메시지:', error.message);
    console.error('전체 오류:', error);
    
    // Tuya API 관련 오류인지 확인
    if (error.message && error.message.includes('GET_TOKEN_FAILED')) {
      console.log('\n💡 해결 방법:');
      console.log('1. Tuya API 키가 올바른지 확인');
      console.log('2. 기기 ID가 올바른지 확인');
      console.log('3. API 권한이 있는지 확인');
      console.log('4. 네트워크 연결 상태 확인');
    }
  }
}

// 에러 핸들링 테스트
async function testErrorHandling() {
  console.log('\n🛡️ 에러 핸들링 테스트');
  
  // 1. 잘못된 기기 ID 테스트
  console.log('1. 잘못된 기기 ID 테스트');
  try {
    const result = await TuyaService.getDeviceStatus('invalid-device-id');
    console.log('   결과:', result);
  } catch (error) {
    console.log('   예상된 오류:', error.message);
  }
  
  // 2. null 데이터로 온도 추출 테스트
  console.log('2. null 데이터로 온도 추출 테스트');
  try {
    const result = TuyaService.extractTemperature(null);
    console.log('   결과:', result);
  } catch (error) {
    console.log('   예상된 오류:', error.message);
  }
  
  // 3. 빈 객체로 온도 추출 테스트
  console.log('3. 빈 객체로 온도 추출 테스트');
  try {
    const result = TuyaService.extractTemperature({});
    console.log('   결과:', result);
  } catch (error) {
    console.log('   예상된 오류:', error.message);
  }
}

// 메인 실행 함수
async function main() {
  console.log('🧪 TuyaService 종합 테스트 시작\n');
  
  // 기본 테스트 실행
  await testTuyaService();
  
  // 에러 핸들링 테스트 실행
  await testErrorHandling();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 테스트 실행
main().catch(error => {
  console.error('❌ 테스트 실행 중 치명적 오류:', error);
  process.exit(1);
}); 