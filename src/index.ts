import configureServer from './config/serverConfig';
// import logger from './logger';

const [app, port, host, env] = configureServer();
app.listen(port, () => {
    // logger.info(`Server is listening at ${host}:${port} in env=${env}`);
    console.log(`Server is listening at ${host}:${port} in env=${env}`);
});
