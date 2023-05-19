const {
    banUser,
    closeBuffer,
    deopUser,
    devoiceUser,
    inviteUser,
    joinChannel,
    setAwayMessage,
    showBanList,
    switchBuffer
  } = require('./functions.js');


const chalk = require('chalk');
const figlet = require('figlet');
const gradient = require('gradient-string');

function showWelcomeMessage(username) {
  console.log(gradient.rainbow(figlet.textSync(`¡Bienvenido ${username}!`, {
    horizontalLayout: 'full'
  })));
}

function showUserStatus(client) {
    client.addListener('join', (channel, nick) => {
      console.log(chalk.yellow(`[${getCurrentTimestamp()}] ${nick} se ha unido a ${channel}`));
    });
  
    client.addListener('part', (channel, nick, reason) => {
      console.log(chalk.yellow(`[${getCurrentTimestamp()}] ${nick} ha salido de ${channel}. Motivo: ${reason}`));
    });
  
    client.addListener('quit', (nick, reason) => {
      console.log(chalk.yellow(`[${getCurrentTimestamp()}] ${nick} se ha desconectado. Motivo: ${reason}`));
    });
  }
  
  function sendMessage(client, channel, message) {
    const trimmedInput = message.trim();
    if (trimmedInput.startsWith('/join ')) {
      const newChannel = trimmedInput.slice(6);
      if (channels.includes(newChannel)) {
        client.join(newChannel);
        currentChannel = newChannel; // Actualizar el canal actual
        console.log(chalk.green(`Te has unido al canal ${newChannel}.`));
      } else {
        console.log(chalk.yellow(`El canal "${newChannel}" no es válido. Utiliza el formato "/join <nombre-del-canal>".`));
      }
    } else {
      client.say(channel, trimmedInput); // Enviar mensaje al canal actual
    }
  }

  function handleInput(input) {
    const [command, ...args] = input.trim().split(' ');
  
    switch (command) {
      case '/help':
        showHelpMenu();
        break;
      case '/join':
        const channel = args[0];
        if (channel) {
          joinChannel(client, channel);
        } else {
          console.log('Por favor, especifica un canal válido.');
        }
        break;
      case '/quit':
        console.log('Saliendo del chat...');
        process.exit(0);
        break;
      case '/away':
        const awayMessage = args.join(' ');
        setAwayMessage(client, awayMessage);
        break;
      case '/invite':
        const userToInvite = args[0];
        if (userToInvite) {
          inviteUser(client, userToInvite, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario que deseas invitar.');
        }
        break;
      case '/op':
        const userToOp = args[0];
        if (userToOp) {
          opUser(client, userToOp, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario al que deseas otorgar privilegios de operador.');
        }
        break;
      case '/deop':
        const userToDeop = args[0];
        if (userToDeop) {
          deopUser(client, userToDeop, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario al que deseas quitarle los privilegios de operador.');
        }
        break;
      case '/voice':
        const userToVoice = args[0];
        if (userToVoice) {
          voiceUser(client, userToVoice, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario al que deseas darle voz.');
        }
        break;
      case '/devoice':
        const userToDevoice = args[0];
        if (userToDevoice) {
          devoiceUser(client, userToDevoice, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario al que deseas quitarle la voz.');
        }
        break;
      case '/ban':
        const userToBan = args[0];
        if (userToBan) {
          banUser(client, userToBan, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario que deseas banear.');
        }
        break;
      case '/unban':
        const userToUnban = args[0];
        if (userToUnban) {
          unbanUser(client, userToUnban, currentChannel);
        } else {
          console.log('Por favor, especifica el nombre de usuario que deseas desbanear.');
        }
        break;
      case '/banlist':
        showBanList(client, currentChannel);
        break;
      case '/switch':
        const bufferIndex = parseInt(args[0]);
        if (bufferIndex >= 0 && bufferIndex < buffers.length) {
          switchBuffer(bufferIndex);
        } else {
          console.log('Por favor, especifica un índice de buffer válido.');
        }
        break;
      default:
        sendMessage(client, currentChannel, input);
    }
  
    rl.prompt();
  }

  function extractChannelsFromMotd(motd) {
    const channelRegex = /#\w+/g;
    return motd.match(channelRegex) || [];
  }

  function showAvailableChannels(channels) {
    if (channels.length > 0) {
      console.log('Salas disponibles:');
      channels.forEach((channel) => {
        console.log(chalk.green(channel));
      });
    } else {
      console.log('No se encontraron salas disponibles.');
    }
    console.log();
  }
  
  function joinDefaultChannel(client, channel) {
    client.join(channel, () => {
      console.log(chalk.green(`Conectado a la sala "${channel}"`));
      showUserStatus(client);
      rl.setPrompt(`${channel}> `);
      rl.prompt();
    });
  }

  module.exports = {
    extractChannelsFromMotd,
    showAvailableChannels,
    joinDefaultChannel,
    showWelcomeMessage,
    showUserStatus,
    sendMessage,
    handleInput
  };