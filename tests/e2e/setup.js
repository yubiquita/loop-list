/**
 * E2E Tests Setup
 * Termux環境でのE2Eテスト用セットアップ
 */

// グローバル設定
global.testTimeout = 30000;
global.serverStartupTimeout = 10000;

// Jestのタイムアウト設定
jest.setTimeout(30000);

// プロセス管理用の配列
global.runningProcesses = [];

// テストスイート後にサーバープロセスを終了
afterAll(async () => {
  if (global.runningProcesses.length > 0) {
    for (const process of global.runningProcesses) {
      if (process && process.kill) {
        process.kill();
      }
    }
    global.runningProcesses = [];
  }
});

// テストエラーのハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in E2E test:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in E2E test:', reason);
  process.exit(1);
});

// Zombie.js の警告を抑制
process.env.NODE_ENV = 'test';
process.env.ZOMBIE_SILENT = 'true';

// ヘルパー関数
global.waitForServer = async (port, timeout = 10000) => {
  const http = require('http');
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkServer = () => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
      }, (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Server not ready after ${timeout}ms`));
        } else {
          setTimeout(checkServer, 100);
        }
      });
      
      req.end();
    };
    
    checkServer();
  });
};

// ポート利用可能性チェック
global.isPortAvailable = async (port) => {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

// 利用可能なポートを見つける
global.findAvailablePort = async (startPort = 8080) => {
  let port = startPort;
  
  while (port < startPort + 100) {
    if (await global.isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  
  throw new Error('No available ports found');
};

// テストサーバー起動ヘルパー
global.startTestServer = async (port) => {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('npx', ['http-server', '-p', port.toString(), '-c-1', '--cors'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    // プロセスを管理リストに追加
    global.runningProcesses.push(serverProcess);
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Available on:') || output.includes('Starting up')) {
        setTimeout(() => resolve(serverProcess), 1000);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
    
    serverProcess.on('error', (error) => {
      reject(error);
    });
    
    // タイムアウト設定
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, global.serverStartupTimeout);
  });
};

// テストユーティリティ
global.testUtils = {
  // E2Eテスト用の共通設定
  defaultBrowserOptions: {
    silent: true,
    waitDuration: '30s',
    runScripts: true,
    loadCSS: true
  },
  
  // 共通のアサーションヘルパー
  assertScreenVisible: (browser, screenId) => {
    expect(browser.query(`#${screenId}:not(.hidden)`)).toBeTruthy();
  },
  
  assertScreenHidden: (browser, screenId) => {
    expect(browser.query(`#${screenId}.hidden`)).toBeTruthy();
  },
  
  // テストデータジェネレータ
  generateTestList: (name, itemCount = 3) => {
    const items = [];
    for (let i = 1; i <= itemCount; i++) {
      items.push(`${name}項目${i}`);
    }
    return { name, items };
  }
};

// ログ出力設定
if (process.env.NODE_ENV === 'test') {
  // テスト時のコンソールログを調整
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('E2E')) {
      originalLog(...args);
    }
  };
  
  console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('E2E')) {
      originalError(...args);
    }
  };
}

console.log('E2E テストセットアップ完了');