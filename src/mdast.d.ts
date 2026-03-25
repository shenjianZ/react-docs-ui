declare module "mdast" {
  export interface Node {
    type: string
    value?: string
    children?: Node[]
    depth?: number
    url?: string
    alt?: string
    lang?: string | null
    ordered?: boolean
    checked?: boolean | null
  }

  export interface Parent extends Node {
    children: Node[]
  }

  export interface Root extends Parent {}

  export interface Text extends Node {
    type: "text"
    value: string
  }

  export interface InlineCode extends Node {
    type: "inlineCode"
    value: string
  }

  export interface Image extends Node {
    type: "image"
    url: string
    alt?: string
  }

  export interface Math extends Node {
    type: "math"
    value: string
  }

  export interface Heading extends Parent {
    type: "heading"
    depth: number
  }

  export interface ListItem extends Parent {
    type: "listItem"
    checked?: boolean | null
  }

  export type PhrasingContent = Node
  export type Content = Node
}
