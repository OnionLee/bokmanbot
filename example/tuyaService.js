import { TuyaContext } from '@tuya/tuya-connector-nodejs';
import { config } from '../../config/settings.js';

class TuyaService {
  constructor() {
    this.tuya = new TuyaContext({
      baseUrl: config.tuya.baseUrl,
      accessKey: config.tuya.accessKey,
      secretKey: config.tuya.secretKey,
    });
  }

  // 모든 기기 목록 가져오기
  async getAllDevices() {
    try {
      const response = await this.tuya.request({
        path: `/v1.0/iot-01/associated-users/devices`,
        method: 'GET',
      });

      if (!response.success) {
        throw new Error('Failed to fetch devices');
      }

      return response.result.devices.map(device => ({
        id: device.id,
        name: device.name,
        model: device.model,
        online: device.online,
        category: device.category,
        icon: device.icon,
        status: device.status || []
      }));
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  // 특정 기기의 상태 가져오기
  async getDeviceStatus(deviceId) {
    try {
      const response = await this.tuya.request({
        path: `/v1.0/devices/${deviceId}/status`,
        method: 'GET',
      });

      if (!response.success) {
        return null;
      }

      const status = {};
      for (const item of response.result.status) {
        status[item.code] = item.value;
      }

      return status;
    } catch (error) {
      console.error(`Error fetching status for device ${deviceId}:`, error);
      return null;
    }
  }
}

export default new TuyaService(); 