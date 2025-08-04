const mongoose = require('mongoose');

const thermometerSchema = new mongoose.Schema({
  thermometerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  channelId: {
    type: String,
    required: true,
    trim: true
  },
  channelName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // 모니터링 설정
  monitoringInterval: {
    type: Number,
    default: 60, // 기본값: 60초 (1분)
    min: 60      // 최소: 60초 (1분)
  },
  minTemp: {
    type: Number,
    default: 10, // 기본값: 10°C
    min: -50,
    max: 100
  },
  maxTemp: {
    type: Number,
    default: 30, // 기본값: 30°C
    min: -50,
    max: 100
  },
  warningTemp: {
    type: Number,
    default: 5,  // 기본값: 5°C (임계값 근접 경고)
    min: 1,
    max: 20
  },
  lastCheckTime: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 복합 인덱스 생성 (온도계 ID + 채널 ID)
thermometerSchema.index({ thermometerId: 1, channelId: 1 }, { unique: true });

// 업데이트 시 updatedAt 자동 설정
thermometerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Thermometer', thermometerSchema); 