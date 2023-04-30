const path = require('path');
const express = require('express');
const app = express();

const publicPath = path.join(__dirname, '../build');app.use(express.static(publicPath));
console.log(publicPath);
app.use(express.static(publicPath));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
 });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
 });
