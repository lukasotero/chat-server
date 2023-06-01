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



// Función para establecer el mensaje de ausencia
function setAwayMessage(client, message) {
    client.setAway(message);
    console.log('Mensaje de ausencia establecido:', message);
}




module.exports = {
    deopUser,
    devoiceUser,
    inviteUser,
    setAwayMessage,
}