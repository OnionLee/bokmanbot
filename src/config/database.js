const mongoose = require('mongoose');
const Logger = require('../utils/logger');

class Database {
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      }

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      Logger.success('MongoDB 연결 성공');
      
      // 연결 이벤트 리스너
      mongoose.connection.on('error', (error) => {
        Logger.error('MongoDB 연결 오류', error);
      });

      mongoose.connection.on('disconnected', () => {
        Logger.info('MongoDB 연결 해제됨');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        Logger.info('MongoDB 연결이 애플리케이션 종료로 인해 닫힘');
        process.exit(0);
      });

    } catch (error) {
      Logger.error('MongoDB 연결 실패', error);
      throw error;
    }
  }

  static async disconnect() {
    try {
      await mongoose.connection.close();
      Logger.success('MongoDB 연결 해제 성공');
    } catch (error) {
      Logger.error('MongoDB 연결 해제 실패', error);
    }
  }
}

module.exports = Database; 