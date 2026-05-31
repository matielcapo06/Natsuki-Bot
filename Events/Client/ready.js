
const { loadCommands } = require("../../Handlers/commandHandler");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log("El cliente se ha iniciado");

    loadCommands(client);
  },
};
