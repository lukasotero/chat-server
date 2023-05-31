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

const {
  showHelpMenu
} = require('./help.js');

const irc = require('irc');
const chalk = require('chalk');
const figlet = require('figlet');
const prompts = require('prompts');
const gradient = require('gradient-string');
const readline = require('readline');

const hosts = [
  '181.229.125.113', // Si hace falta, poner mas hosts
];

const port = 8657;
const channels = ['#general', '#Help'];
let currentChannel = channels[0];
let client;
let connectedHost;
let isAsciiDisplayed = false;
let spinner;

console.log(gradient.rainbow(figlet.textSync('¡Chat IRC!', {
  horizontalLayout: 'full'
})));

(async () => {
  const {
    username
  } = await prompts({
    type: 'text',
    name: 'username',
    message: 'Usuario:'
  });

  const {
    password
  } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Contraseña:'
  });

  console.log(gradient.rainbow(figlet.textSync(`¡Bienvenido ${username}!`, {
    horizontalLayout: 'full'
  })));
  runChatClient(username, password);
})();

function runChatClient(username, password) {
  const clientOptions = {
    port,
    userName: username,
    password,
    channels
  };


  function startSpinner() {
    const spinnerFrames = ['-', '\\', '|', '/'];
    let frameIndex = 0;
    connectedHost = hosts[0]; // Inicializar con el primer host

    spinner = setInterval(() => {
      const connectingText = chalk.yellow('Conectando a ') + chalk.cyan(connectedHost);
      process.stdout.write(`${spinnerFrames[frameIndex % spinnerFrames.length]} ${connectingText}\r`);
      frameIndex++;
    }, 100);
  }

  function connectToHost(index) {
    if (index >= hosts.length) {
      console.log(chalk.red('No se pudo conectar a ningún host.'));
      process.exit(1);
    }

    const host = hosts[index];
    client = new irc.Client(host, username, clientOptions);

    client.addListener('registered', () => {
      connectedHost = host;
      clearInterval(spinner);
      const connectedMessage = chalk.green(`Conectado a ${connectedHost}`);
      console.log(connectedMessage);
      showUserStatus(client);
      rl.question('', (message) => {
        sendMessage(client, currentChannel, message);
      });
      rl.setPrompt(`${currentChannel}> `);
      rl.prompt();
    });

    client.addListener('message', (from, to, message) => {
      const userColor = chalk[getRandomColor()];
      const timestamp = getCurrentTimestamp();

      console.log(`[${timestamp}] [${to}] ${userColor('<' + from + '>')} ${message}`);
    });

    client.addListener('error', (message) => {
      handleConnectionError(message, host, client);
    });

    client.addListener('selfMessage', (to, message) => {
      if (!isAsciiDisplayed) {
        isAsciiDisplayed = true;
      }
      const timestamp = getCurrentTimestamp();
      console.log(`[${timestamp}] [${to}] ${chalk.green('<' + username + '>')} ${message}`);
    });

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: 0
    });

    rl.on('line', (input) => {
      handleInput(input);
    });

    startSpinner();
  }

  function handleConnectionError(error, host, client) {
    clearInterval(spinner);
    console.log(`Error al conectar a ${host}`);
    client.disconnect();
    client.on('raw', (message) => {
      if (message.command === 'ERROR') {
        const errorMessage = message.args.join(' ');
        const bannedRegex = /You are banned from this server- Your irc client seems broken and is flooding lots of channels\. Banned for \d+ min, if in error, please contact bans@libera\.chat\. \(\d+\/\d+\/\d+ \d+:\d+\)/;
        const match = errorMessage.match(bannedRegex);
        if (match) {
          const reason = 'Tu cliente IRC parece estar defectuoso y está inundando muchos canales.';
          console.log(chalk.red('¡Estás prohibido en este servidor!'));
          console.log(chalk.red(`Motivo: ${reason}`));
          console.log(chalk.red('Si esto es un error, por favor, contacta a bans@libera.chat.'));
          process.exit(1);
        } else {
          console.log(chalk.red(errorMessage));
          process.exit(1);
        }
      }
    });

    connectToHost(index + 1);
  }

  connectToHost(0);
}

function getRandomColor() {
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function getCurrentTimestamp() {
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return chalk.dim(`${hours}:${minutes}:${seconds}`);
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
    case '/ban':
      const banNickname = args[0];
      if (banNickname) {
        banUser(client, currentChannel, banNickname);
      } else {
        showBanList(client, currentChannel);
      }
      break;
    case '/buffer':
      const bufferName = args[0];
      switchBuffer(bufferName);
      break;
    case '/close':
      closeBuffer();
      break;
    case '/deop':
      const deopNickname = args[0];
      deopUser(client, currentChannel, deopNickname);
      break;
    case '/devoice':
      const devoiceNickname = args[0];
      devoiceUser(client, currentChannel, devoiceNickname);
      break;
    case '/disconnect':
      console.log('Desconectándose del servidor...');
      client.disconnect();
      break;
    case '/invite':
      const inviteNickname = args[0];
      if (inviteNickname) {
        inviteUser(client, currentChannel, inviteNickname);
      } else {
        console.log('Por favor, especifica un apodo válido.');
      }
      break;
    default:
      if (currentChannel) {
        sendMessage(client, currentChannel, input);
      } else {
        console.log('No estás en ningún canal. Usa /join para unirte a un canal existente o crear uno nuevo.');
      }
      break;
  }

  rl.prompt();
}