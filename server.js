const irc = require('irc');
const chalk = require('chalk');
const figlet = require('figlet');
const prompts = require('prompts');
const gradient = require('gradient-string');
const readline = require('readline');

const hosts = [
  'irc.libera.chat',
  'irc.eu.libera.chat',
  'irc.us.libera.chat',
  'irc.au.libera.chat',
  'irc.ea.libera.chat',
  'irc.ipv4.libera.chat',
  'irc.ipv6.libera.chat'
];

const port = 6697;
const channels = ['#libera', '#linux'];
let currentChannel = channels[0];
let client;
let connectedHost;
let isAsciiDisplayed = false;
let spinner;

console.log(gradient.rainbow(figlet.textSync('¡Chat IRC!', { horizontalLayout: 'full' })));

(async () => {
  const { username } = await prompts({
    type: 'text',
    name: 'username',
    message: 'Usuario:'
  });

  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Contraseña:'
  });

  console.log(gradient.rainbow(figlet.textSync(`¡Bienvenido ${username}!`, { horizontalLayout: 'full' })));
  runChatClient(username, password);
})();

function runChatClient(username, password) {
  const clientOptions = {
    port,
    userName: username,
    password,
    secure: true,
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


async function showHelpMenu() {
  const choices = [
    { title: '/away [message]', description: 'Establecer mensaje de ausencia' },
    { title: '/ban [nick]', description: 'Bloquear a un usuario en el canal o mostrar la lista actual de bloqueos' },
    { title: '/buffer <name>', description: 'Cambiar a un buffer' },
    { title: '/close', description: 'Cerrar el buffer actual' },
    { title: '/deop <nick>', description: 'Quitar estado de operador a un usuario en este canal' },
    { title: '/devoice <nick>', description: 'Quitar estado de voz a un usuario en este canal' },
    { title: '/disconnect', description: 'Desconectarse del servidor' },
    { title: '/help', description: 'Mostrar menú de ayuda' },
    { title: '/invite <nick>', description: 'Invitar a un usuario al canal' },
    { title: '/j <name> [password]', description: 'Unirse a un canal (forma abreviada)' },
    { title: '/join <name> [password]', description: 'Unirse a un canal' },
    { title: '/kick <nick> [comment]', description: 'Expulsar a un usuario del canal' },
    { title: '/kickban <target>', description: 'Bloquear a un usuario y expulsarlo del canal' },
    { title: '/lusers [<mask> [<target>]]', description: 'Solicitar estadísticas de usuarios sobre la red' },
    { title: '/me <action>', description: 'Enviar un mensaje de acción al buffer actual' },
    { title: '/mode [target] [modes] [mode args...]', description: 'Consultar o cambiar el modo de un canal o usuario' },
    { title: '/motd [server]', description: 'Obtener el Mensaje del Día' },
    { title: '/msg <target> <message>', description: 'Enviar un mensaje a un apodo o canal' },
    { title: '/nick <nick>', description: 'Cambiar apodo actual' },
    { title: '/notice <target> <message>', description: 'Enviar un aviso a un apodo o canal' },
    { title: '/op <nick>', description: 'Dar estado de operador a un usuario en este canal' },
    { title: '/part [reason]', description: 'Salir de un canal' },
    { title: '/query <nick> [message]', description: 'Abrir un buffer para enviar mensajes a un apodo' },
    { title: '/quiet [nick]', description: 'Silenciar a un usuario en el canal o mostrar la lista actual de silenciados' },
    { title: '/quit', description: 'Salir del chat' },
    { title: '/quote <command>', description: 'Enviar un comando IRC en crudo al servidor' },
    { title: '/reconnect', description: 'Reconectarse al servidor' },
    { title: '/setname <realname>', description: 'Cambiar nombre real actual' },
    { title: '/stats <query> [server]', description: 'Solicitar estadísticas del servidor' },
    { title: '/topic <topic>', description: 'Cambiar el tema del canal actual' },
    { title: '/unban <nick>', description: 'Quitar a un usuario de la lista de bloqueos' },
    { title: '/unquiet <nick>', description: 'Quitar a un usuario de la lista de silenciados' },
    { title: '/unvoice <nick>', description: 'Quitar a un usuario de la lista de usuarios con voz' },
    { title: '/voice <nick>', description: 'Dar estado de voz a un usuario en este canal' },
    { title: '/who <mask>', description: 'Obtener una lista de usuarios' },
    { title: '/whois <nick>', description: 'Obtener información sobre un usuario' },
    { title: '/whowas <nick> [count]', description: 'Obtener información sobre un usuario desconectado' },
    { title: '/list [filter]', description: 'Obtener una lista de canales de la red' },
  ];

  const options = choices.map(choice => choice.title);
  const index = await prompts({
    type: 'select',
    name: 'index',
    message: 'Seleccione un comando para obtener más información:',
    choices: options,
  });

  const selectedChoice = choices[index.index];
  console.log(`Comando: ${selectedChoice.title}`);
  console.log(`Descripción: ${selectedChoice.description}`);
}

// Función para establecer el mensaje de ausencia
function setAwayMessage(client, message) {
  client.setAway(message);
  console.log('Mensaje de ausencia establecido:', message);
}

// Función para prohibir a un usuario
function banUser(client, channel, nickname) {
  client.ban(channel, nickname);
  console.log('Usuario', nickname, 'prohibido en el canal', channel);
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