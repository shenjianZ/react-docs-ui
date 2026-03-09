import express from 'express'
import cors from 'cors'
import { generatePdf, generatePdfFromHtml, closeBrowser, type PdfOptions } from './pdf-generator'

const app = express()
const PORT = process.env.PDF_SERVER_PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/generate-pdf', async (req, res) => {
  try {
    const { url, filename, ...pdfOptions }: { url: string; filename?: string } & Partial<PdfOptions> = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    console.log(`[PDF Server] Generating PDF for: ${url}`)

    const pdfBuffer = await generatePdf({
      url,
      ...pdfOptions,
    })

    const outputFilename = filename || `document-${Date.now()}.pdf`
    const encodedFilename = encodeURIComponent(outputFilename)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`)
    res.setHeader('Content-Length', pdfBuffer.length)

    res.send(pdfBuffer)

    console.log(`[PDF Server] PDF generated successfully: ${outputFilename} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
  } catch (error) {
    console.error('[PDF Server] Error generating PDF:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/generate-pdf-sync', async (req, res) => {
  try {
    const { url, ...pdfOptions }: { url: string } & Partial<PdfOptions> = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const pdfBuffer = await generatePdf({
      url,
      ...pdfOptions,
    })

    res.json({
      success: true,
      size: pdfBuffer.length,
      base64: pdfBuffer.toString('base64'),
    })
  } catch (error) {
    console.error('[PDF Server] Error generating PDF:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/generate-pdf-from-html', async (req, res) => {
  try {
    const { html, filename, baseUrl, ...pdfOptions }: { html: string; filename?: string; baseUrl?: string } & Partial<PdfOptions> = req.body

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' })
    }

    console.log(`[PDF Server] Generating PDF from HTML content (${(html.length / 1024).toFixed(2)} KB)`)

    const pdfBuffer = await generatePdfFromHtml(html, { ...pdfOptions, baseUrl })

    const outputFilename = filename || `document-${Date.now()}.pdf`
    const encodedFilename = encodeURIComponent(outputFilename)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`)
    res.setHeader('Content-Length', pdfBuffer.length)

    res.send(pdfBuffer)

    console.log(`[PDF Server] PDF generated successfully: ${outputFilename} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
  } catch (error) {
    console.error('[PDF Server] Error generating PDF from HTML:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

const server = app.listen(PORT, () => {
  console.log(`[PDF Server] Running on http://localhost:${PORT}`)
  console.log(`[PDF Server] Endpoints:`)
  console.log(`  - GET  /health`)
  console.log(`  - POST /generate-pdf`)
  console.log(`  - POST /generate-pdf-from-html`)
})

process.on('SIGTERM', async () => {
  console.log('[PDF Server] Shutting down...')
  await closeBrowser()
  server.close(() => {
    console.log('[PDF Server] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('\n[PDF Server] Shutting down...')
  await closeBrowser()
  server.close(() => {
    console.log('[PDF Server] Server closed')
    process.exit(0)
  })
})
