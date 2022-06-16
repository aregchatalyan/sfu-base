const os = require('os');
const faces = os.networkInterfaces();

const getLocalIp = () => {
  let localIp = '127.0.0.1';

  for (const { family, internal, address } of Object.values(faces).flat(1)) {
    if (family === 'IPv4' && !internal) {
      return localIp = address;
    }
  }

  return localIp;
}

module.exports = {
  listenIp: 'localhost',
  listenPort: 3030,
  sslCrt: './ssl/cert.pem',
  sslKey: './ssl/key.pem',

  mediasoup: {
    // Worker settings
    CPU: os.cpus(),
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'warn',
      logTags: [ 'info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx', 'bwe', 'score', 'simulcast', 'svc' ]
    },

    // Router settings
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          parameters: {
            'profile-id': 2,
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000
          }
        }
      ]
    },

    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: getLocalIp() // replace by client IP address
        }
      ],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000
    }
  }
}
