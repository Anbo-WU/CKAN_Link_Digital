const app = require('./app'); // Or ./src/app if server.js is in root
require('dotenv').config();

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Frontend expected at: ${process.env.CLIENT_URL}`);
});