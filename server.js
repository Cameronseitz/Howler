// Import our Express dependency
const express = require('express');
// Create a new server instance
const app = express();
// Port number we want to use of this server
const PORT = process.env.PORT;

app.use(express.static('static'));

const routes = require('./src/routes');

app.use(routes);


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
