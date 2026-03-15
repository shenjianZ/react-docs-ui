import "katex/contrib/mhchem/mhchem.js"
import katexCss from "katex/dist/katex.min.css?inline"

const KATEX_STYLE_ID = "react-docs-ui-katex-styles"

if (typeof document !== "undefined" && !document.getElementById(KATEX_STYLE_ID)) {
  const style = document.createElement("style")
  style.id = KATEX_STYLE_ID
  style.textContent = katexCss
  document.head.appendChild(style)
}

export { MdxContent as default } from "./MdxContent"
