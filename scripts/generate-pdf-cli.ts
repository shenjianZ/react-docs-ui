import { generatePdf, closeBrowser } from './pdf-generator'
import fs from 'fs'
import path from 'path'

interface CliOptions {
  url: string
  output?: string
  format?: 'A4' | 'Letter' | 'Legal' | 'Tabloid'
  scale?: number
  help?: boolean
}

function printHelp(): void {
  console.log(`
Usage: pnpm pdf:generate [options]

Options:
  --url <url>       URL to generate PDF from (required)
  --output <path>   Output file path (default: ./output.pdf)
  --format <format> Paper format: A4, Letter, Legal, Tabloid (default: A4)
  --scale <number>  Scale factor (default: 1)
  --help            Show this help message

Examples:
  pnpm pdf:generate --url http://localhost:5173/docs/getting-started
  pnpm pdf:generate --url http://localhost:5173/docs/guide --output ./guide.pdf
  pnpm pdf:generate --url https://example.com/docs --format A4 --scale 0.9
`)
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    url: '',
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      return options
    }

    if (arg === '--url' && args[i + 1]) {
      options.url = args[i + 1]
      i++
    }

    if (arg === '--output' && args[i + 1]) {
      options.output = args[i + 1]
      i++
    }

    if (arg === '--format' && args[i + 1]) {
      options.format = args[i + 1] as 'A4' | 'Letter' | 'Legal' | 'Tabloid'
      i++
    }

    if (arg === '--scale' && args[i + 1]) {
      options.scale = parseFloat(args[i + 1])
      i++
    }
  }

  return options
}

async function main(): Promise<void> {
  const options = parseArgs()

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  if (!options.url) {
    console.error('Error: --url is required')
    printHelp()
    process.exit(1)
  }

  console.log('Starting PDF generation...')
  console.log(`URL: ${options.url}`)
  console.log(`Format: ${options.format || 'A4'}`)
  console.log(`Scale: ${options.scale || 1}`)

  try {
    const pdfBuffer = await generatePdf({
      url: options.url,
      format: options.format,
      scale: options.scale,
    })

    const outputPath = options.output || './output.pdf'
    const absolutePath = path.resolve(outputPath)

    fs.writeFileSync(absolutePath, pdfBuffer)

    console.log(`\n✅ PDF generated successfully!`)
    console.log(`   Output: ${absolutePath}`)
    console.log(`   Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('\n❌ Error generating PDF:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await closeBrowser()
  }
}

main()
