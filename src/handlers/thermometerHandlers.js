const ThermometerService = require('../services/thermometerService');
const CronMonitorService = require('../services/cronMonitorService');
const Logger = require('../utils/logger');

// 온도계 설정 파싱 함수
function parseThermometerSettings(text) {
  const parts = text.split(',').map(part => part.trim());
  const settings = {};
  
  // 첫 번째 부분은 온도계 ID
  if (parts.length < 1) return { thermometerId: text, ...settings };
  
  // 온도계 ID 설정
  settings.thermometerId = parts[0];
  
  // 나머지 부분들을 설정으로 파싱
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.includes('=')) {
      const [key, value] = part.split('=').map(s => s.trim());
      const numValue = parseFloat(value);
      
      if (!isNaN(numValue)) {
        switch (key.toLowerCase()) {
          case 'interval':
          case '주기':
            settings.monitoringInterval = numValue;
            break;
          case 'min':
          case '최저':
            settings.minTemp = numValue;
            break;
          case 'max':
          case '최고':
            settings.maxTemp = numValue;
            break;
          case 'warning':
          case '주의':
            settings.warningTemp = numValue;
            break;
        }
      }
    } else {
      // 키=값 형식이 아닌 경우, 순서대로 파싱
      const numValue = parseFloat(part);
      if (!isNaN(numValue)) {
        switch (i) {
          case 1:
            settings.monitoringInterval = numValue;
            break;
          case 2:
            settings.minTemp = numValue;
            break;
          case 3:
            settings.maxTemp = numValue;
            break;
          case 4:
            settings.warningTemp = numValue;
            break;
        }
      }
    }
  }
  
  return settings;
}

class ThermometerHandlers {
  // 온도계 등록 핸들러
  static async handleRegisterThermometer({ command, ack, say, client }) {
    try {
      await ack();
      
               const inputText = command.text.trim();

         if (!inputText) {
           await say({
             text: '❌ 온도계 ID를 입력해주세요.\n사용법: `/register-thermometer [온도계ID]`',
             response_type: 'ephemeral'
           });
           return;
         }

         // 설정 파싱
         const settings = parseThermometerSettings(inputText);
         const thermometerId = settings.thermometerId || inputText;

      Logger.event('/register-thermometer 명령어 수신', { 
        user: command.user_id, 
        channel: command.channel_id,
        thermometerId 
      });

      // 채널 정보 가져오기
      let channelName = '알 수 없는 채널';
      try {
        const channelInfo = await client.conversations.info({
          channel: command.channel_id
        });
        channelName = channelInfo.channel.name;
        Logger.info('채널 정보 조회 성공', { channelName });
      } catch (error) {
        Logger.error('채널 정보 조회 실패', error);
        // 채널 ID를 사용하여 임시 이름 생성
        channelName = `채널-${command.channel_id.slice(-6)}`;
      }

               // 온도계 등록
         await ThermometerService.registerThermometer(
           thermometerId,
           command.channel_id,
           channelName,
           settings
         );

                   // 모니터링 자동 시작
             await CronMonitorService.onThermometerRegistered();

                   // 설정 정보 생성
             const settingsInfo = [];
             if (settings.monitoringInterval) settingsInfo.push(`⏰ 모니터링 주기: ${settings.monitoringInterval}초`);
             if (settings.minTemp) settingsInfo.push(`❄️ 최저온도: ${settings.minTemp}°C`);
             if (settings.maxTemp) settingsInfo.push(`🔥 최고온도: ${settings.maxTemp}°C`);
             if (settings.warningTemp) settingsInfo.push(`⚠️ 주의온도: ${settings.warningTemp}°C`);
             
             const settingsText = settingsInfo.length > 0 ? `\n⚙️ 설정:\n${settingsInfo.join('\n')}` : '\n⚙️ 기본 설정 사용';
             
             await say({
               text: `✅ 온도계 등록 완료!\n\n🌡️ 온도계 ID: \`${thermometerId}\`\n📺 채널: #${channelName}${settingsText}\n\n🌡️ 온도계 모니터링이 자동으로 시작되었습니다.`,
               response_type: 'in_channel'
             });

      Logger.success('온도계 등록 핸들러 완료');

    } catch (error) {
      Logger.error('온도계 등록 핸들러 오류', error);
      
      let errorMessage = '❌ 온도계 등록 중 오류가 발생했습니다.';
      
      if (error.message.includes('이미 활성화된 온도계')) {
        errorMessage = '❌ 이미 등록된 온도계입니다.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = '❌ 이미 등록된 온도계입니다.';
      }

      await say({
        text: errorMessage,
        response_type: 'ephemeral'
      });
    }
  }

  // 온도계 해지 핸들러
  static async handleUnregisterThermometer({ command, ack, say }) {
    try {
      await ack();
      
      const thermometerId = command.text.trim();
      
      if (!thermometerId) {
        await say({
          text: '❌ 온도계 ID를 입력해주세요.\n사용법: `/unregister-thermometer [온도계ID]`',
          response_type: 'ephemeral'
        });
        return;
      }

      Logger.event('/unregister-thermometer 명령어 수신', { 
        user: command.user_id, 
        channel: command.channel_id,
        thermometerId 
      });

      // 온도계 해지
      await ThermometerService.unregisterThermometer(
        thermometerId, 
        command.channel_id
      );

                   // 모니터링 자동 중지 (등록된 온도계가 없으면)
             await CronMonitorService.onThermometerUnregistered();

      await say({
        text: `✅ 온도계 해지 완료!\n\n🌡️ 온도계 ID: \`${thermometerId}\`\n\n온도계 모니터링이 자동으로 조정되었습니다.`,
        response_type: 'in_channel'
      });

      Logger.success('온도계 해지 핸들러 완료');

    } catch (error) {
      Logger.error('온도계 해지 핸들러 오류', error);
      
      let errorMessage = '❌ 온도계 해지 중 오류가 발생했습니다.';
      
      if (error.message.includes('등록되지 않은 온도계')) {
        errorMessage = '❌ 등록되지 않은 온도계입니다.';
      } else if (error.message.includes('이미 비활성화된 온도계')) {
        errorMessage = '❌ 이미 해지된 온도계입니다.';
      }

      await say({
        text: errorMessage,
        response_type: 'ephemeral'
      });
    }
  }

  // 온도계 목록 조회 핸들러
  static async handleListThermometers({ command, ack, say }) {
    try {
      await ack();

      Logger.event('/list-thermometers 명령어 수신', { 
        user: command.user_id, 
        channel: command.channel_id
      });

      // 채널의 온도계 목록 조회
      const thermometers = await ThermometerService.getThermometersByChannel(command.channel_id);

      if (thermometers.length === 0) {
        await say({
          text: '📋 이 채널에 등록된 온도계가 없습니다.\n\n온도계를 등록하려면 `/register-thermometer [온도계ID]`를 사용하세요.',
          response_type: 'ephemeral'
        });
        return;
      }

                   const thermometerList = thermometers.map((t, index) => {
               const settings = [];
               if (t.monitoringInterval !== 10) settings.push(`⏰${t.monitoringInterval}초`);
               if (t.minTemp !== 10) settings.push(`❄️${t.minTemp}°C`);
               if (t.maxTemp !== 30) settings.push(`🔥${t.maxTemp}°C`);
               if (t.warningTemp !== 5) settings.push(`⚠️${t.warningTemp}°C`);
               
               const settingsText = settings.length > 0 ? ` (${settings.join(', ')})` : '';
               
               return `${index + 1}. 🌡️ \`${t.thermometerId}\`${settingsText}\n   📅 등록일: ${t.createdAt.toLocaleDateString('ko-KR')}`;
             }).join('\n\n');

             await say({
               text: `📋 이 채널의 온도계 목록:\n\n${thermometerList}\n\n총 ${thermometers.length}개의 온도계가 등록되어 있습니다.\n\n💡 설정 변경: \`/reg-thermometer [온도계ID],주기=30,최저=5,최고=35,주의=3\``,
               response_type: 'ephemeral'
             });

      Logger.success('온도계 목록 조회 핸들러 완료');

    } catch (error) {
      Logger.error('온도계 목록 조회 핸들러 오류', error);
      
      await say({
        text: '❌ 온도계 목록 조회 중 오류가 발생했습니다.',
        response_type: 'ephemeral'
      });
    }
  }
}

module.exports = ThermometerHandlers; 