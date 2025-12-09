import nock from 'nock'
import fs from 'node:fs/promises'
import path from 'path'
import os from 'os'
import startApplication from '../src/main.js'

describe('startApplication - error handling', () => {
  let tempDir

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
    nock.cleanAll()
  })

  describe('network errors', () => {
    it('должен выбросить ошибку при 404 страницы', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com').get('/page').reply(404)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при 500 страницы', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com').get('/page').reply(500)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при 403 страницы', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com').get('/page').reply(403)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при недоступности сервера', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com')
        .get('/page')
        .replyWithError({
          code: 'ECONNREFUSED',
          message: 'Connection refused',
        })

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при таймауте', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com')
        .get('/page')
        .replyWithError({ code: 'ETIMEDOUT', message: 'Timeout' })

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при неизвестном хосте', async () => {
      const url = 'https://example.com/page'

      nock('https://example.com')
        .get('/page')
        .replyWithError({ code: 'ENOTFOUND', message: 'Host not found' })

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })
  })

  describe('resource loading errors', () => {
    it('должен выбросить ошибку если один из ресурсов недоступен', async () => {
      const url = 'https://example.com/page'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <img src="/image.png" />
          </body>
        </html>
      `

      nock('https://example.com')
        .get('/page')
        .reply(200, html)
        .get('/image.png')
        .reply(404)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку если скрипт недоступен', async () => {
      const url = 'https://example.com/page'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="/app.js"></script>
          </head>
          <body>
            <h1>Test</h1>
          </body>
        </html>
      `

      nock('https://example.com')
        .get('/page')
        .reply(200, html)
        .get('/app.js')
        .reply(500)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку если стиль недоступен', async () => {
      const url = 'https://example.com/page'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/style.css" />
          </head>
          <body>
            <h1>Test</h1>
          </body>
        </html>
      `

      nock('https://example.com')
        .get('/page')
        .reply(200, html)
        .get('/style.css')
        .reply(403)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку если несколько ресурсов недоступны', async () => {
      const url = 'https://example.com/page'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/style.css" />
            <script src="/app.js"></script>
          </head>
          <body>
            <img src="/image.png" />
          </body>
        </html>
      `

      nock('https://example.com')
        .get('/page')
        .reply(200, html)
        .get('/style.css')
        .reply(404)
        .get('/app.js')
        .reply(404)
        .get('/image.png')
        .reply(404)

      await expect(startApplication(url, tempDir)).rejects.toThrow()
    })
  })

  describe('file system errors', () => {
    it('должен выбросить ошибку при недоступности директории для записи', async () => {
      const url = 'https://example.com/page'
      const html = '<html><body>Test</body></html>'
      const invalidDir = '/root/protected'

      nock('https://example.com').get('/page').reply(200, html)

      await expect(startApplication(url, invalidDir)).rejects.toThrow()
    })

    it('должен выбросить ошибку при отсутствии прав на создание директории', async () => {
      const url = 'https://example.com/page'
      const html = '<html><body>Test</body></html>'
      const invalidDir = '/sys/kernel/test'

      nock('https://example.com').get('/page').reply(200, html)

      await expect(startApplication(url, invalidDir)).rejects.toThrow()
    })
  })

  describe('successful cases with resources', () => {
    it('должен успешно загрузить страницу с ресурсами', async () => {
      const url = 'https://example.com/page'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/style.css" />
            <script src="/app.js"></script>
          </head>
          <body>
            <img src="/image.png" />
          </body>
        </html>
      `

      nock('https://example.com')
        .get('/page')
        .reply(200, html)
        .get('/style.css')
        .reply(200, 'body { color: red; }')
        .get('/app.js')
        .reply(200, 'console.log(\'test\');')
        .get('/image.png')
        .reply(200, Buffer.from('image'))

      await expect(startApplication(url, tempDir)).resolves.toBe(true)

      const htmlFile = path.join(tempDir, 'example-com-page.html')
      const htmlContent = await fs.readFile(htmlFile, 'utf-8')

      expect(htmlContent).toContain('example-com-page_files')
      expect(htmlContent).toContain('example-com-style.css')
      expect(htmlContent).toContain('example-com-app.js')
      expect(htmlContent).toContain('example-com-image.png')
    })

    it('должен успешно загрузить страницу без ресурсов', async () => {
      const url = 'https://example.com/page'
      const html = '<html><body><h1>Test</h1></body></html>'

      nock('https://example.com').get('/page').reply(200, html)

      await expect(startApplication(url, tempDir)).resolves.toBe(true)

      const htmlFile = path.join(tempDir, 'example-com-page.html')
      const htmlContent = await fs.readFile(htmlFile, 'utf-8')

      expect(htmlContent).toContain('<h1>Test</h1>')
    })
  })
})
