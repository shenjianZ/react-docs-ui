declare module "jszip" {
  const JSZip: any
  export default JSZip
}

declare module "flexsearch" {
  const FlexSearch: any
  export default FlexSearch
}

declare module "docx" {
  export class Document { constructor(options?: any) }
  export const Packer: any
  export class Paragraph { constructor(options?: any) }
  export class TextRun { constructor(options?: any) }
  export class ImageRun { constructor(options?: any) }
  export const HeadingLevel: any
  export const AlignmentType: any
  export class Table { constructor(options?: any) }
  export class TableRow { constructor(options?: any) }
  export class TableCell { constructor(options?: any) }
  export const WidthType: any
  export const BorderStyle: any
  export const TableLayoutType: any
  export type IRunOptions = any
  export type FileChild = any
  export type IBordersOptions = any
}

declare module "shiki/core" {
  export const createBundledHighlighter: any
  export type HighlighterGeneric<L = any, T = any> = any
  export type ShikiTransformer = any
}

declare module "shiki/engine/javascript" {
  export const createJavaScriptRegexEngine: any
}
