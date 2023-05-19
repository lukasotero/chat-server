// Función para prohibir a un usuario
function banUser(client, channel, nickname) {
    client.ban(channel, nickname);
    console.log('Usuario', nickname, 'prohibido en el canal', channel);
}

// Función para cerrar el búfer actual
function closeBuffer() {
    client.closeBuffer();
    console.log('Búfer actual cerrado');
}

// Función para revocar privilegios de operador a un usuario
function deopUser(client, channel, nickname) {
    client.deop(channel, nickname);
    console.log('Revocados los privilegios de operador a', nickname, 'en el canal', channel);
}

// Función para revocar privilegios de voz a un usuario
function devoiceUser(client, channel, nickname) {
    client.devoice(channel, nickname);
    console.log('Revocados los privilegios de voz a', nickname, 'en el canal', channel);
}

// Función para invitar a un usuario a un canal
function inviteUser(client, channel, nickname) {
    client.invite(channel, nickname);
    console.log('Usuario', nickname, 'invitado al canal', channel);
}

// Función para crear un canal
function joinChannel(client, channel) {
    client.join(channel);
    console.log('Ahora estas en el canal: #', channel);
}

// Función para establecer el mensaje de ausencia
function setAwayMessage(client, message) {
    client.setAway(message);
    console.log('Mensaje de ausencia establecido:', message);
}

// Función para mostrar la lista de usuarios prohibidos en un canal
function showBanList(client, channel) {
    const banList = client.getBanList(channel);
    console.log('Lista de usuarios prohibidos en el canal', channel + ':');
    banList.forEach((user) => {
        console.log(user);
    });
}

// Función para cambiar a un búfer (canal, sala, ventana, etc.) específico
function switchBuffer(bufferName) {
    client.switchBuffer(bufferName);
    console.log('Cambiado al búfer:', bufferName);
}

module.exports = {
    banUser,
    closeBuffer,
    deopUser,
    devoiceUser,
    inviteUser,
    joinChannel,
    setAwayMessage,
    showBanList,
    switchBuffer
}