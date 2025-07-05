/**
 * HTTP Server Integration E2E Tests
 * Termux環境での HTTP server 統合テスト
 */

const { spawn } = require('child_process');
const http = require('http');
const cheerio = require('cheerio');

describe('HTTP Server Integration E2E Tests', () => {
  let serverProcess;
  const serverPort = 8081; // テスト用ポート
  const baseUrl = `http://localhost:${serverPort}`;

  beforeAll(async () => {
    // HTTP server を起動
    return new Promise((resolve, reject) => {
      serverProcess = spawn('npx', ['http-server', '-p', serverPort.toString(), '-c-1', '--cors'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Available on:') || output.includes('Starting up')) {
          // サーバー起動完了を待つ
          setTimeout(resolve, 1000);
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
      }, 10000);
    });
  });

  afterAll(async () => {
    // HTTP server を停止
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe('HTTP レスポンステスト', () => {
    test('メインページが正しく配信される', async () => {
      const response = await fetchPage('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });

    test('CSSファイルが正しく配信される', async () => {
      const response = await fetchPage('/style.css');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/css');
    });

    test('JavaScriptファイルが正しく配信される', async () => {
      const jsFiles = [
        '/src/config.js',
        '/src/constants.js',
        '/src/ChecklistDataManager.js',
        '/src/ChecklistUIManager.js',
        '/src/ChecklistListManager.js',
        '/src/ChecklistItemManager.js',
        '/src/ChecklistApp.js'
      ];

      for (const file of jsFiles) {
        const response = await fetchPage(file);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/javascript');
      }
    });

    test('存在しないファイルに対して404を返す', async () => {
      const response = await fetchPage('/nonexistent.html');
      expect(response.status).toBe(404);
    });
  });

  describe('HTTPレスポンス内容テスト', () => {
    test('メインページのHTMLが正しい内容を含む', async () => {
      const response = await fetchPage('/');
      const html = await response.text();
      const $ = cheerio.load(html);

      expect($('title').text()).toBe('繰り返しチェックリスト');
      expect($('.app').length).toBe(1);
      expect($('.screen').length).toBe(3);
      expect($('script[src]').length).toBeGreaterThan(0);
    });

    test('CSSファイルにスタイル定義が含まれる', async () => {
      const response = await fetchPage('/style.css');
      const css = await response.text();

      expect(css).toContain('.app');
      expect(css).toContain('.screen');
      expect(css).toContain('.hidden');
      expect(css.length).toBeGreaterThan(100);
    });

    test('JavaScriptファイルにクラス定義が含まれる', async () => {
      const response = await fetchPage('/src/ChecklistApp.js');
      const js = await response.text();

      expect(js).toContain('ChecklistApp');
      expect(js).toContain('class') || expect(js).toContain('function');
      expect(js.length).toBeGreaterThan(100);
    });
  });

  describe('CORSヘッダーテスト', () => {
    test('CORSヘッダーが正しく設定される', async () => {
      const response = await fetchPage('/', {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('リソースロードテスト', () => {
    test('必要なリソースファイルがすべて存在する', async () => {
      const requiredFiles = [
        '/',
        '/style.css',
        '/src/config.js',
        '/src/constants.js',
        '/src/ChecklistDataManager.js',
        '/src/ChecklistUIManager.js',
        '/src/ChecklistListManager.js',
        '/src/ChecklistItemManager.js',
        '/src/ChecklistApp.js'
      ];

      for (const file of requiredFiles) {
        const response = await fetchPage(file);
        expect(response.status).toBe(200);
      }
    });

    test('リソースファイルのサイズが適切', async () => {
      const response = await fetchPage('/');
      const html = await response.text();
      
      // HTMLファイルが空でないことを確認
      expect(html.length).toBeGreaterThan(1000);
      
      // 必要な要素が含まれることを確認
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="ja">');
      expect(html).toContain('</html>');
    });
  });

  describe('レスポンス時間テスト', () => {
    test('メインページのレスポンス時間が適切', async () => {
      const startTime = Date.now();
      const response = await fetchPage('/');
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5秒以内
    });

    test('静的ファイルのレスポンス時間が適切', async () => {
      const startTime = Date.now();
      const response = await fetchPage('/style.css');
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(3000); // 3秒以内
    });
  });

  describe('キャッシュ制御テスト', () => {
    test('キャッシュ制御ヘッダーが正しく設定される', async () => {
      const response = await fetchPage('/');
      
      // no-cache設定が適用されているかチェック
      expect(response.headers['cache-control']).toBeDefined();
    });
  });

  // ヘルパー関数
  async function fetchPage(path, options = {}) {
    const url = baseUrl + path;
    
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          res.text = () => Promise.resolve(data);
          resolve(res);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }
});