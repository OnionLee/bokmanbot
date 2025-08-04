const Thermometer = require('../models/thermometer');
const Logger = require('../utils/logger');

class ThermometerService {
  // 온도계 등록 (설정 포함)
  static async registerThermometer(thermometerId, channelId, channelName, settings = {}) {
    try {
      Logger.info('온도계 등록 시도', { 
        thermometerId, 
        channelId, 
        channelName, 
        settings 
      });

      // 기존 등록 확인
      const existing = await Thermometer.findOne({ 
        thermometerId, 
        channelId 
      });

      if (existing) {
        if (existing.isActive) {
          throw new Error('이미 활성화된 온도계입니다.');
        } else {
          // 비활성화된 온도계를 다시 활성화 (설정 업데이트)
          existing.isActive = true;
          if (settings.monitoringInterval) existing.monitoringInterval = Math.max(60, settings.monitoringInterval);
          if (settings.minTemp) existing.minTemp = Math.max(-50, Math.min(100, settings.minTemp));
          if (settings.maxTemp) existing.maxTemp = Math.max(-50, Math.min(100, settings.maxTemp));
          if (settings.warningTemp) existing.warningTemp = Math.max(1, Math.min(20, settings.warningTemp));
          await existing.save();
          Logger.success('비활성화된 온도계를 다시 활성화했습니다.', { settings });
          return existing;
        }
      }

      // 설정값 검증 및 기본값 적용
      const validatedSettings = {
        monitoringInterval: Math.max(60, settings.monitoringInterval || 60),
        minTemp: Math.max(-50, Math.min(100, settings.minTemp || 10)),
        maxTemp: Math.max(-50, Math.min(100, settings.maxTemp || 30)),
        warningTemp: Math.max(1, Math.min(20, settings.warningTemp || 5))
      };

      // 새 온도계 등록
      const thermometer = new Thermometer({
        thermometerId,
        channelId,
        channelName,
        isActive: true,
        ...validatedSettings
      });

      await thermometer.save();
      Logger.success('온도계 등록 성공', { 
        thermometerId, 
        channelId, 
        settings: validatedSettings 
      });
      return thermometer;

    } catch (error) {
      Logger.error('온도계 등록 실패', error);
      throw error;
    }
  }

  // 온도계 해지
  static async unregisterThermometer(thermometerId, channelId) {
    try {
      Logger.info('온도계 해지 시도', { thermometerId, channelId });

      const thermometer = await Thermometer.findOne({ 
        thermometerId, 
        channelId 
      });

      if (!thermometer) {
        throw new Error('등록되지 않은 온도계입니다.');
      }

      if (!thermometer.isActive) {
        throw new Error('이미 비활성화된 온도계입니다.');
      }

      thermometer.isActive = false;
      await thermometer.save();

      Logger.success('온도계 해지 성공', { thermometerId, channelId });
      return thermometer;

    } catch (error) {
      Logger.error('온도계 해지 실패', error);
      throw error;
    }
  }

  // 채널의 모든 온도계 조회
  static async getThermometersByChannel(channelId) {
    try {
      const thermometers = await Thermometer.find({ 
        channelId, 
        isActive: true 
      }).sort({ createdAt: -1 });

      Logger.info('채널 온도계 조회', { channelId, count: thermometers.length });
      return thermometers;

    } catch (error) {
      Logger.error('채널 온도계 조회 실패', error);
      throw error;
    }
  }

  // 온도계 ID로 조회
  static async getThermometerById(thermometerId) {
    try {
      const thermometer = await Thermometer.findOne({ 
        thermometerId, 
        isActive: true 
      });

      Logger.info('온도계 ID로 조회', { thermometerId, found: !!thermometer });
      return thermometer;

    } catch (error) {
      Logger.error('온도계 ID 조회 실패', error);
      throw error;
    }
  }

  // 모든 활성 온도계 조회
  static async getAllActiveThermometers() {
    try {
      const thermometers = await Thermometer.find({ 
        isActive: true 
      }).sort({ createdAt: -1 });

      Logger.info('모든 활성 온도계 조회', { count: thermometers.length });
      return thermometers;

    } catch (error) {
      Logger.error('모든 활성 온도계 조회 실패', error);
      throw error;
    }
  }

  // 온도계 존재 여부 확인
  static async isThermometerRegistered(thermometerId, channelId) {
    try {
      const thermometer = await Thermometer.findOne({ 
        thermometerId, 
        channelId, 
        isActive: true 
      });

      return !!thermometer;

    } catch (error) {
      Logger.error('온도계 등록 여부 확인 실패', error);
      return false;
    }
  }

  // 마지막 체크 시간 업데이트
  static async updateLastCheckTime(thermometerId, channelId) {
    try {
      await Thermometer.updateOne(
        { thermometerId, channelId, isActive: true },
        { lastCheckTime: new Date() }
      );
      
      Logger.info('마지막 체크 시간 업데이트', { thermometerId, channelId });
    } catch (error) {
      Logger.error('마지막 체크 시간 업데이트 실패', error);
    }
  }
}

module.exports = ThermometerService; 