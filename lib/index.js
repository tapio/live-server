import messageHandler from './message-handler'

const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
const address = protocol + window.location.host + window.location.pathname + '/ws';
const socket = new WebSocket(address);
socket.onmessage = msg => {
  try {
    messageHandler(JSON.parse(msg.data))
  } catch (e) {
    console.error("Non-JSON response received: " + JSON.stringify(msg))
    throw e;
  }
}
