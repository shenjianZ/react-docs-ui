use regex::Regex;

#[derive(Debug, Clone)]
pub enum Block {
    H1(String),
    H2(String),
    H3(String),
    H4(String),
    Paragraph(Vec<Inline>),
    Code {
        language: String,
        code: String,
    },
    Quote(Vec<Inline>),
    Ul(Vec<Vec<Inline>>),
    Ol(Vec<Vec<Inline>>),
    Table {
        headers: Vec<String>,
        rows: Vec<Vec<String>>,
    },
    Hr,
}

#[derive(Debug, Clone)]
pub enum Inline {
    Text(String),
    Bold(String),
    Italic(String),
    Code(String),
    Link { text: String, url: String },
}

pub fn parse_markdown(content: &str) -> Vec<Block> {
    let mut blocks = Vec::new();
    let lines: Vec<&str> = content.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i].trim();

        if line.is_empty() {
            i += 1;
            continue;
        }

        if line.starts_with("#### ") {
            blocks.push(Block::H4(line[5..].to_string()));
            i += 1;
        } else if line.starts_with("### ") {
            blocks.push(Block::H3(line[4..].to_string()));
            i += 1;
        } else if line.starts_with("## ") {
            blocks.push(Block::H2(line[3..].to_string()));
            i += 1;
        } else if line.starts_with("# ") {
            blocks.push(Block::H1(line[2..].to_string()));
            i += 1;
        } else if line.starts_with("```") {
            let language = line[3..].to_string();
            let mut code_lines = Vec::new();
            i += 1;
            while i < lines.len() && !lines[i].starts_with("```") {
                code_lines.push(lines[i]);
                i += 1;
            }
            i += 1;
            blocks.push(Block::Code {
                language,
                code: code_lines.join("\n"),
            });
        } else if line.starts_with("> ") {
            let mut quote_lines = vec![line[2..].to_string()];
            i += 1;
            while i < lines.len() && lines[i].starts_with("> ") {
                quote_lines.push(lines[i][2..].to_string());
                i += 1;
            }
            let inlines = parse_inline(&quote_lines.join(" "));
            blocks.push(Block::Quote(inlines));
        } else if line.starts_with("- ") || line.starts_with("* ") {
            let mut items = vec![parse_inline(&line[2..])];
            i += 1;
            while i < lines.len() && (lines[i].starts_with("- ") || lines[i].starts_with("* ")) {
                items.push(parse_inline(&lines[i][2..]));
                i += 1;
            }
            blocks.push(Block::Ul(items));
        } else if Regex::new(r"^\d+\.\s").unwrap().is_match(line) {
            let re = Regex::new(r"^\d+\.\s").unwrap();
            let mut items = vec![parse_inline(&re.replace(line, ""))];
            i += 1;
            while i < lines.len() && re.is_match(lines[i]) {
                items.push(parse_inline(&re.replace(lines[i], "")));
                i += 1;
            }
            blocks.push(Block::Ol(items));
        } else if line.starts_with("|") {
            let mut rows: Vec<Vec<String>> = Vec::new();
            while i < lines.len() && lines[i].starts_with("|") {
                if !lines[i].contains("---") {
                    rows.push(
                        lines[i]
                            .split("|")
                            .skip(1)
                            .filter(|s| !s.is_empty())
                            .map(|s| s.trim().to_string())
                            .collect(),
                    );
                }
                i += 1;
            }
            if rows.len() > 1 {
                blocks.push(Block::Table {
                    headers: rows[0].clone(),
                    rows: rows[1..].to_vec(),
                });
            }
        } else if line == "---" || line == "***" || line == "___" {
            blocks.push(Block::Hr);
            i += 1;
        } else {
            let mut para_lines = vec![line.to_string()];
            i += 1;
            while i < lines.len()
                && !lines[i].is_empty()
                && !lines[i].starts_with("#")
                && !lines[i].starts_with("```")
                && !lines[i].starts_with("- ")
                && !lines[i].starts_with("* ")
                && !lines[i].starts_with("|")
                && !lines[i].starts_with("> ")
                && !Regex::new(r"^\d+\.\s").unwrap().is_match(lines[i])
            {
                para_lines.push(lines[i].to_string());
                i += 1;
            }
            let inlines = parse_inline(&para_lines.join(" "));
            blocks.push(Block::Paragraph(inlines));
        }
    }

    blocks
}

pub fn parse_inline(text: &str) -> Vec<Inline> {
    let mut inlines = Vec::new();
    let mut current = String::new();
    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        if i + 1 < chars.len() && chars[i] == '*' && chars[i + 1] == '*' {
            if !current.is_empty() {
                inlines.push(Inline::Text(current.clone()));
                current.clear();
            }
            i += 2;
            let mut bold_text = String::new();
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '*') {
                bold_text.push(chars[i]);
                i += 1;
            }
            if i + 1 < chars.len() {
                i += 2;
            }
            inlines.push(Inline::Bold(bold_text));
        } else if chars[i] == '*'
            && (i == 0 || chars[i - 1] != '*')
            && (i + 1 >= chars.len() || chars[i + 1] != '*')
        {
            if !current.is_empty() {
                inlines.push(Inline::Text(current.clone()));
                current.clear();
            }
            i += 1;
            let mut italic_text = String::new();
            while i < chars.len() && chars[i] != '*' {
                italic_text.push(chars[i]);
                i += 1;
            }
            if i < chars.len() {
                i += 1;
            }
            inlines.push(Inline::Italic(italic_text));
        } else if chars[i] == '`' {
            if !current.is_empty() {
                inlines.push(Inline::Text(current.clone()));
                current.clear();
            }
            i += 1;
            let mut code_text = String::new();
            while i < chars.len() && chars[i] != '`' {
                code_text.push(chars[i]);
                i += 1;
            }
            if i < chars.len() {
                i += 1;
            }
            inlines.push(Inline::Code(code_text));
        } else if chars[i] == '[' {
            if !current.is_empty() {
                inlines.push(Inline::Text(current.clone()));
                current.clear();
            }
            i += 1;
            let mut link_text = String::new();
            while i < chars.len() && chars[i] != ']' {
                link_text.push(chars[i]);
                i += 1;
            }
            i += 1;
            let mut link_url = String::new();
            if i < chars.len() && chars[i] == '(' {
                i += 1;
                while i < chars.len() && chars[i] != ')' {
                    link_url.push(chars[i]);
                    i += 1;
                }
                i += 1;
            }
            inlines.push(Inline::Link {
                text: link_text,
                url: link_url,
            });
        } else {
            current.push(chars[i]);
            i += 1;
        }
    }

    if !current.is_empty() {
        inlines.push(Inline::Text(current));
    }

    inlines
}
