const socket = io();

let producer = null;

nameInput.value = 'user_' + Math.round(Math.random() * 1000);
roomIdInput.value = '1';

socket.request = (type, data = {}) => new Promise((resolve, reject) => {
  console.log('EMIT', type, data);

  socket.emit(type, data, (data) => {
    console.log('CALLBACK', type, data);

    data.error ? reject(data.error) : resolve(data);
  });
});

let rc = null;

async function joinRoom(name, room_id) {
  if (rc?.isOpen()) return console.log('Already connected to a room');

  await initEnumerateDevices();

  rc = new RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen);

  addListeners();
}

function roomOpen() {
  login.style.display = 'none';
  reveal(startAudioButton);
  hide(stopAudioButton);
  reveal(startVideoButton);
  hide(stopVideoButton);
  reveal(startScreenButton);
  hide(stopScreenButton);
  reveal(exitButton);
  reveal(devicesButton);
  control.className = '';
  reveal(videoMedia);
}

function hide(elem) {
  elem.className = 'hidden';
}

function reveal(elem) {
  elem.className = '';
}

function addListeners() {
  rc.on(RoomClient.EVENTS.startScreen, () => {
    hide(startScreenButton);
    reveal(stopScreenButton);
  });

  rc.on(RoomClient.EVENTS.stopScreen, () => {
    hide(stopScreenButton);
    reveal(startScreenButton);
  });

  rc.on(RoomClient.EVENTS.stopAudio, () => {
    hide(stopAudioButton);
    reveal(startAudioButton);
  });
  rc.on(RoomClient.EVENTS.startAudio, () => {
    hide(startAudioButton);
    reveal(stopAudioButton);
  });

  rc.on(RoomClient.EVENTS.startVideo, () => {
    hide(startVideoButton);
    reveal(stopVideoButton);
  });
  rc.on(RoomClient.EVENTS.stopVideo, () => {
    hide(stopVideoButton);
    reveal(startVideoButton);
  });
  rc.on(RoomClient.EVENTS.exitRoom, () => {
    hide(control);
    hide(devicesList);
    hide(videoMedia);
    hide(devicesButton);
    login.style.display = 'flex';
  });
}

let isEnumerateDevices = false;

async function initEnumerateDevices() {
  if (isEnumerateDevices) return;

  const constraints = { audio: true, video: true }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    await enumerateDevices();
    stream.getTracks().forEach(track => track.stop());
  } catch (e) {
    console.error('Access denied for audio/video: ', e);
  }
}

async function enumerateDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  devices.forEach((device) => {
    let el = null;

    device.kind === 'audioinput' ? el = audioSelect
      : device.kind === 'videoinput' ? el = videoSelect
        : null

    if (!el) return;

    let option = document.createElement('option');
    option.value = device.deviceId;
    option.innerText = device.label;
    el.appendChild(option);

    isEnumerateDevices = true;
  });
}
