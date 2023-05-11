const readline = require('readline');
const irc = require('irc');

const clientOptions = {
  userName: '',
  password: '',
  port: 6697,
  secure: true,
  autoConnect: false,
  host: ''
};

const hosts = [
  'irc.libera.chat',
  'irc.eu.libera.chat',
  'irc.us.libera.chat',
  'irc.au.libera.chat',
  'irc.ea.libera.chat',
  'irc.ipv4.libera.chat',
  'irc.ipv6.libera.chat'
];

let client;

function connectToIRC() {
  client = new irc.Client(clientOptions.host, clientOptions.userName, clientOptions);

  client.addListener('registered', function () {
    console.log('Conexión establecida con éxito.');
    showMainMenu();
  });

  client.addListener('error', function (message) {
    console.log('Error de conexión:', message);
    connectToNextHost();
  });

  client.connect();
}

function connectToNextHost() {
  const currentHostIndex = hosts.indexOf(clientOptions.host);
  const nextHostIndex = (currentHostIndex + 1) % hosts.length;
  clientOptions.host = hosts[nextHostIndex];
  console.log(`Intentando conexión con ${clientOptions.host}...`);
  connectToIRC();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Ingrese su nombre de usuario: ', function (userName) {
  clientOptions.userName = userName;
  rl.question('Ingrese su contraseña: ', function (password) {
    clientOptions.password = password;
    clientOptions.host = hosts[0];
    console.log(`Intentando conexión con ${clientOptions.host}...`);
    connectToIRC();
  });
});

function showMainMenu() {
  console.log('=== Menú Principal ===');
  console.log('1. Enviar mensaje (Formato: /msg destino mensaje)');
  console.log('2. Unirse a una sala de chat (Formato: /join #sala)');
  console.log('3. Crear una sala de chat (Formato: /create #sala)');
  console.log('4. Mostrar información de conexión');
  console.log('5. Salir');
  process.stdout.write('Ingrese el número de opción: ');

  rl.on('line', function (input) {
    handleMainMenuInput(input.trim());
  });
}

function handleMainMenuInput(input) {
  switch (input) {
    case '1':
      console.log('Ingrese el destino y el mensaje (Formato: /msg destino mensaje): ');
      break;
    case '2':
      console.log('Ingrese el nombre de la sala a la que desea unirse (Formato: /join #sala): ');
      break;
    case '3':
      console.log('Ingrese el nombre de la sala que desea crear (Formato: /create #sala): ');
      break;
    case '4':
      console.log(`Conectado como ${clientOptions.userName} al servidor ${clientOptions.host}`);
      break;
    case '5':
      console.log('Saliendo...');
      client.disconnect();
      process.exit(0);
      break;
    default:
      console.log('Opción inválida');
      break;
  }
}