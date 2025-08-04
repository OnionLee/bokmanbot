const Thermometer = require('../models/thermometer');
const Logger = require('../utils/logger');

class ThermometerService {
  // 온도계 등록
  static async registerThermometer(thermometerId, channelId, channelName) {
    try {
      Logger.info('온도계 등록 시도', { thermometerId, channelId, channelName });

      // 기존 등록 확인
      const existing = await Thermometer.findOne({ 
        thermometerId, 
        channelId 
      });

      if (existing) {
        if (existing.isActive) {
          throw new Error('이미 활성화된 온도계입니다.');
        } else {
          // 비활성화된 온도계를 다시 활성화
          existing.isActive = true;
          await existing.save();
          Logger.success('비활성화된 온도계를 다시 활성화했습니다.');
          return existing;
        }
      }

      // 새 온도계 등록
      const thermometer = new Thermometer({
        thermometerId,
        channelId,
        channelName,
        isActive: true
      });

      await thermometer.save();
      Logger.success('온도계 등록 성공', { thermometerId, channelId });
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
}

module.exports = ThermometerService; 