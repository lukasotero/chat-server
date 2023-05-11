const IRCFramework = require('irc-framework');
const readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  

  let currentChannel = null;
  

  function showMenu() {
    console.log('=== Menú ===');
    console.log('1. Enviar mensaje (/msg)');
    console.log('2. Registrarse (/register)');
    console.log('3. Unirse a una sala de chat (/join)');
    console.log('4. Crear una sala de chat (/create)');
    console.log('0. Salir');
  

    if (currentChannel) {
      console.log(`--- Sala de chat actual: ${currentChannel}`);
    }
  }
  
  // Escuchar los comandos ingresados por el usuario
  rl.on('line', (input) => {
    const command = input.trim();
  
    switch (command) {
      case '1':
        console.log('Ingrese el mensaje en el formato "/msg destino mensaje"');
        sendMessage();
        break;
      case '2':
        console.log('Ingrese la contraseña y el correo electrónico en el formato "/register contraseña correo"');
        registerUser();
        break;
      case '3':
        console.log('Ingrese el nombre de la sala de chat en el formato "/join #sala"');
        joinChannel();
        break;
      case '4':
        console.log('Ingrese el nombre de la sala de chat en el formato "/create #sala"');
        createChannel();
        break;
      case '0':
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Comando inválido');
        break;
    }
  });
  
  // Enviar un mensaje al servidor IRC
  function sendMessage() {
    rl.question('Comando: ', (command) => {
      server.raw(command);
      showMenu();
    });
  }
  
  // Registrar un usuario en el servidor IRC
  function registerUser() {
    rl.question('Comando: ', (command) => {
      server.raw(command);
      showMenu();
    });
  }
  
  // Unirse a una sala de chat en el servidor IRC
  function joinChannel() {
    rl.question('Comando: ', (command) => {
      server.raw(command);
      currentChannel = getChannelName(command);
      showMenu();
    });
  }
  
  // Crear una sala de chat en el servidor IRC
  function createChannel() {
    rl.question('Comando: ', (command) => {
      server.raw(command);
      currentChannel = getChannelName(command);
      showMenu();
    });
  }
  
  // Obtener el nombre de la sala de chat a partir del comando
  function getChannelName(command) {
    const channelRegex = /^\/(join|create) (#\w+)/;
    const match = command.match(channelRegex);
    if (match) {
      return match[2];
    }
    return null;
  }
  

  const server = new IRCFramework.Client();
  
  server.on('registered', () => {
    console.log('Servidor IRC en ejecución');
    showMenu();
  });
  
  server.on('message', (event) => {
    const { target, message } = event;
    console.log(`Mensaje recibido en ${target}: ${message}`);
  });
  
  server.connect({
    host: 'irc.libera.chat',
    port: 6667,
    nick: 'DePalma2'
  });


server.on('join', (event) => {
    const { channel, nick } = event;
    if (nick === server.user.nick && channel === currentChannel) {
      showChatRoom();
    }
  });
  
  server.on('join.create', (event) => {
    const { channel, nick } = event;
    if (nick === server.user.nick && channel === currentChannel) {
      console.log(`Has creado la sala de chat ${channel}`);
      showChatRoom();
    }
  });
  
  function showChatRoom() {
    console.log(`=== Sala de chat: ${currentChannel} ===`);
    console.log('Ingrese "/back" para regresar al menú principal');
    console.log('Ingrese el mensaje en el formato "/msg destino mensaje"');
  
    rl.on('line', (input) => {
      const command = input.trim();
  
      if (command === '/back') {
        currentChannel = null; 
        rl.removeAllListeners('line'); 
        showMenu();
      } else if (command.startsWith('/msg')) {
        const [, target, message] = command.split(' ');
        server.raw(`PRIVMSG ${target} :${message}`);
      } else {
        console.log('Comando inválido');
      }
    });
  }
  

  showMenu();