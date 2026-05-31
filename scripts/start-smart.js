#!/usr/bin/env node
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const rootDir = process.cwd();
const backendBasePort = Number(process.env.BACKEND_PORT || 3000);
const frontendBasePort = Number(process.env.FRONTEND_PORT || 4200);
const maxPort = 65535;

function isPortFreeOnHost(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error && (error.code === 'EADDRNOTAVAIL' || error.code === 'EAFNOSUPPORT')) {
        resolve(true);
        return;
      }

      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen({ port, host, exclusive: true });
  });
}

async function isPortFree(port) {
  const hostsToCheck = ['127.0.0.1', '0.0.0.0', '::1', '::'];

  for (const host of hostsToCheck) {
    const free = await isPortFreeOnHost(port, host);
    if (!free) {
      return false;
    }
  }

  return true;
}

async function findFreePort(startPort) {
  for (let port = startPort; port <= maxPort; port += 1) {
    const free = await isPortFree(port);
    if (free) {
      return port;
    }
  }

  throw new Error(`No se encontró puerto libre desde ${startPort}`);
}

function writeFrontendProxy(backendPort) {
  const proxyConfigPath = path.join(
    rootDir,
    'frontend',
    'proxy.runtime.conf.json',
  );
  const proxyConfig = {
    '/api': {
      target: `http://localhost:${backendPort}`,
      secure: false,
      changeOrigin: true,
      logLevel: 'warn',
      pathRewrite: {
        '^/api': '',
      },
    },
  };

  fs.writeFileSync(proxyConfigPath, `${JSON.stringify(proxyConfig, null, 2)}\n`, 'utf8');
  return proxyConfigPath;
}

function spawnProcess(command, args, name, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] terminó por señal ${signal}`);
      return;
    }

    if (code !== 0) {
      console.error(`[${name}] terminó con código ${code}`);
      process.exit(code || 1);
    }
  });

  return child;
}

async function main() {
  const backendPort = await findFreePort(backendBasePort);
  const frontendPort = await findFreePort(
    frontendBasePort === backendPort ? frontendBasePort + 1 : frontendBasePort,
  );

  const proxyConfigPath = writeFrontendProxy(backendPort);

  console.log(`Backend port: ${backendPort}`);
  console.log(`Frontend port: ${frontendPort}`);
  console.log(`Backend URL: http://localhost:${backendPort}`);
  console.log(`Frontend URL: http://localhost:${frontendPort}`);
  console.log(`Proxy config: ${proxyConfigPath}`);

  const backend = spawnProcess(
    'npm',
    ['run', 'start:dev', '--workspace', 'backend'],
    'backend',
    { PORT: String(backendPort) },
  );

  const frontend = spawnProcess(
    'npm',
    [
      'run',
      'ng',
      '--workspace',
      'frontend',
      '--',
      'serve',
      '--port',
      String(frontendPort),
      '--proxy-config',
      'proxy.runtime.conf.json',
    ],
    'frontend',
    { CI: '1' },
  );

  const shutdown = () => {
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('No se pudo iniciar en modo smart:', error.message);
  process.exit(1);
});
