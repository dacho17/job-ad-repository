import configureServer from './config/serverConfig';

const [app, port, host, env] = configureServer();
app.listen(port, () => {
    console.log(`Server is listening at ${host}:${port} in env=${env}`);
});
