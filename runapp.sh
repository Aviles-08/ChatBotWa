#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usa la versión de Node.js que necesites (por ejemplo, 14)
nvm use 14.21.3

# Ejecuta tu aplicación Node.js
node /home/ubuntu/ChatBotWa/src/app.js
