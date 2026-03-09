import puppeteer, { Browser, Page } from 'puppeteer'
import type { PDFOptions } from 'puppeteer'

export interface PdfOptions {
  url: string
  outputPath?: string
  format?: 'A4' | 'Letter' | 'Legal' | 'Tabloid'
  scale?: number
  margin?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  printBackground?: boolean
  displayHeaderFooter?: boolean
  headerTemplate?: string
  footerTemplate?: string
  waitForSelector?: string
  waitTime?: number
}

const defaultOptions: Partial<PdfOptions> = {
  format: 'A4',
  scale: 1,
  margin: {
    top: '15mm',
    bottom: '15mm',
    left: '15mm',
    right: '15mm',
  },
  printBackground: true,
  displayHeaderFooter: false,
}

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })
  }
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}

async function hidePrintElements(page: Page): Promise<void> {
  await page.evaluate(() => {
    const selectors = [
      'header',
      'nav',
      'aside',
      'footer',
      '[data-print-hidden]',
      '[data-export-exclude]',
      '.no-print',
    ]

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        ;(el as HTMLElement).style.display = 'none'
      })
    })

    const main = document.querySelector('main')
    if (main) {
      ;(main as HTMLElement).style.width = '100%'
      ;(main as HTMLElement).style.maxWidth = '100%'
      ;(main as HTMLElement).style.padding = '20px'
      ;(main as HTMLElement).style.margin = '0'
    }

    document.body.style.background = 'white'
    document.body.style.color = '#1a1a1a'
  })
}

export async function generatePdf(options: PdfOptions): Promise<Buffer> {
  const mergedOptions = { ...defaultOptions, ...options }
  const browserInstance = await getBrowser()
  const page = await browserInstance.newPage()

  try {
    await page.setViewport({ width: 1200, height: 1600 })

    await page.goto(mergedOptions.url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    })

    if (mergedOptions.waitForSelector) {
      await page.waitForSelector(mergedOptions.waitForSelector, { timeout: 10000 })
    }

    if (mergedOptions.waitTime) {
      await new Promise((resolve) => setTimeout(resolve, mergedOptions.waitTime))
    }

    await hidePrintElements(page)

    await page.addStyleTag({
      content: `
        @page {
          size: ${mergedOptions.format};
          margin: 0;
        }

        .prose > *,
        .prose pre,
        .prose blockquote,
        .prose table,
        .prose figure,
        .prose img,
        .prose ul,
        .prose ol,
        .prose li,
        .shiki-code-block,
        pre,
        blockquote,
        table,
        figure,
        img,
        tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        h1, h2, h3, h4, h5, h6 {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }

        pre {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
        }
      `,
    })

    const pdfOptions: PDFOptions = {
      format: mergedOptions.format,
      scale: mergedOptions.scale,
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
      displayHeaderFooter: mergedOptions.displayHeaderFooter,
    }

    if (mergedOptions.headerTemplate) {
      pdfOptions.headerTemplate = mergedOptions.headerTemplate
    }

    if (mergedOptions.footerTemplate) {
      pdfOptions.footerTemplate = mergedOptions.footerTemplate
    }

    const pdfBuffer = await page.pdf(pdfOptions)

    return Buffer.from(pdfBuffer)
  } finally {
    await page.close()
  }
}

export async function generatePdfFromHtml(html: string, options?: Partial<PdfOptions>): Promise<Buffer> {
  const mergedOptions = { ...defaultOptions, ...options }
  const browserInstance = await getBrowser()
  const page = await browserInstance.newPage()

  try {
    await page.setViewport({ width: 1200, height: 1600 })

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    const pdfOptions: PDFOptions = {
      format: mergedOptions.format,
      scale: mergedOptions.scale,
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
      displayHeaderFooter: mergedOptions.displayHeaderFooter,
    }

    const pdfBuffer = await page.pdf(pdfOptions)
    return Buffer.from(pdfBuffer)
  } finally {
    await page.close()
  }
}
