let mqtt = require("mqtt");
let options = {
  protocol: "ws",
  // clientId uniquely identifies client
  // choose any string you wish
  // clientId: "b0908853",
};
let client = mqtt.connect("mqtts://test.mosquitto.org:8081", options);

export function generateRoomId() {
  let roomId = "" + Math.round((Math.random() + 1) * 100000);
  return { roomId };
}

export function enterRoom(roomId, onReceiveMsg) {
  
  client.on("message", (topic, payload) => {
    let msg = JSON.parse(payload.toString());
    onReceiveMsg(msg);
  });

  // MQTT topic
  client.subscribe(roomId);

}

export function sendMsg(roomId, msg) {
  //use unsafe publish for non-ssl websockets
  client.publish(roomId, JSON.stringify(msg));
}

export function leaveRoom(roomId) { 
  client.unsubscribe(roomId);
}
