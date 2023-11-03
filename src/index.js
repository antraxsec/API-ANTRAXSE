import server from "./app.js";
import { PORT } from "./config.js";
// Escuchar en el puerto 3000

server.listen(PORT, () => {
  console.log(`Server en el puerto ${PORT}`);
});
