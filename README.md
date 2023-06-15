# chat-server
## Objetivo del proyecto :dart:
Implementar un cliente/servidor con el protocolo IRC, en el cual un usuario puede chatear en tiempo real con otro (a través de una interfaz de línea de comandos). Luego, si se logra un funcionamiento óptimo, considerar la posibilidad de contener el proyecto mediante la herramienta Docker.

## Cosas para arreglar :hammer:
- [ ] Aparece el mensaje "Creaste y te uniste al canal #'nombre_del_canal'" cuando ya estaba creado por otro usuario. El mensaje que tendria que aparecer es: "Te uniste al canal #'nombre_del_canal'".
- [ ] Crashea cuando creas un canal con /join 'nombre_del_canal'. La forma correcta sería /join #'nombre_del_canal'.