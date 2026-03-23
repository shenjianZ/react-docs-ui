export const siteShikiBundle = {
  langs: {
    bash: () => import("shiki/langs/bash"),
    powershell: () => import("shiki/langs/powershell"),
    markdown: () => import("shiki/langs/markdown"),
    yaml: () => import("shiki/langs/yaml"),
    javascript: () => import("shiki/langs/javascript"),
    jsx: () => import("shiki/langs/jsx"),
    json: () => import("shiki/langs/json"),
    tsx: () => import("shiki/langs/tsx"),
    typescript: () => import("shiki/langs/typescript"),
  },
  themes: {
    "github-light": () => import("shiki/themes/github-light"),
    "github-dark": () => import("shiki/themes/github-dark"),
  },
}
