import fs from "node:fs"
import path from "node:path"
import yaml from "js-yaml"

const rootDir = process.cwd()
const configDir = path.join(rootDir, "public", "config")
const outputFile = path.join(rootDir, "src", "generated", "shiki-bundle.ts")
const defaultLangs = [
  "javascript", "typescript", "jsx", "tsx", "bash", "shell",
  "python", "java", "c", "cpp", "csharp", "go", "rust", "ruby",
  "php", "swift", "kotlin", "sql", "json", "yaml", "toml",
  "markdown", "html", "css", "scss", "less", "vue", "svelte",
  "docker", "nginx", "xml", "diff", "regex",
]
const langAliasMap = {
  js: "javascript",
  ts: "typescript",
  sh: "shell",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  py: "python",
  dockerfile: "docker",
  conf: "nginx",
}

function resolveLang(lang) {
  const normalized = String(lang || "").trim().toLowerCase()
  return normalized ? langAliasMap[normalized] || normalized : null
}

function readYamlConfig(fileName) {
  const filePath = path.join(configDir, fileName)
  return fs.existsSync(filePath) ? yaml.load(fs.readFileSync(filePath, "utf8")) : null
}

function collectBundleConfig() {
  const configs = ["site.yaml", "site.en.yaml"].map(readYamlConfig).filter(Boolean)
  const langs = new Set()
  const themes = new Set()
  for (const config of configs) {
    const configuredLangs = config?.codeHighlight?.langs
    const sourceLangs = Array.isArray(configuredLangs) && configuredLangs.length > 0 ? configuredLangs : defaultLangs
    sourceLangs.forEach(lang => {
      const resolved = resolveLang(lang)
      if (resolved) langs.add(resolved)
    })
    themes.add(String(config?.codeHighlight?.lightTheme || "github-light").trim())
    themes.add(String(config?.codeHighlight?.darkTheme || "github-dark").trim())
  }
  if (langs.size === 0) defaultLangs.forEach(lang => langs.add(resolveLang(lang)))
  if (themes.size === 0) {
    themes.add("github-light")
    themes.add("github-dark")
  }
  return { langs: Array.from(langs).sort(), themes: Array.from(themes).sort() }
}

function toObjectEntries(values, basePath) {
  return values.map(value => `    ${JSON.stringify(value)}: () => import(${JSON.stringify(`${basePath}/${value}`)}),`).join("\n")
}

function main() {
  const bundleConfig = collectBundleConfig()
  const fileContent = `export const siteShikiBundle = {
  langs: {
${toObjectEntries(bundleConfig.langs, "shiki/langs")}
  },
  themes: {
${toObjectEntries(bundleConfig.themes, "shiki/themes")}
  },
}
`
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, fileContent, "utf8")
  console.log(`[shiki-bundle] generated ${path.relative(rootDir, outputFile)} with ${bundleConfig.langs.length} languages and ${bundleConfig.themes.length} themes`)
}

main()
