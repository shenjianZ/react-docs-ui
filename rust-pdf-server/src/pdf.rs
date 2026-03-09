use crate::parser::{Block, Inline};
use crate::styles::{
    CONTENT_WIDTH, FONT_SIZES, MARGIN_BOTTOM, MARGIN_LEFT, MARGIN_TOP, PAGE_HEIGHT, PAGE_WIDTH,
    SPACING,
};
use printpdf::*;
use std::io::{BufWriter, Cursor};

pub fn generate_pdf(content: &str, title: &str) -> Result<Vec<u8>, String> {
    let (doc, page1, layer1) = PdfDocument::new(title, Mm(PAGE_WIDTH), Mm(PAGE_HEIGHT), "Layer 1");

    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;

    let font_bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| e.to_string())?;

    let font_italic = doc
        .add_builtin_font(BuiltinFont::HelveticaOblique)
        .map_err(|e| e.to_string())?;

    let current_layer = doc.get_page(page1).get_layer(layer1);
    let mut y = Mm(PAGE_HEIGHT - MARGIN_TOP);

    let blocks = crate::parser::parse_markdown(content);

    for block in blocks {
        y = render_block(&current_layer, &block, y, &font, &font_bold, &font_italic);
    }

    let mut buffer = BufWriter::new(Cursor::new(Vec::new()));
    doc.save(&mut buffer).map_err(|e| e.to_string())?;

    let cursor = buffer.into_inner().map_err(|e| e.to_string())?;
    Ok(cursor.into_inner())
}

fn render_block(
    layer: &PdfLayerReference,
    block: &Block,
    mut y: Mm,
    font: &IndirectFontRef,
    font_bold: &IndirectFontRef,
    font_italic: &IndirectFontRef,
) -> Mm {
    match block {
        Block::H1(text) => {
            y -= Mm(SPACING.h1_top);
            layer.use_text(text, FONT_SIZES.h1, Mm(MARGIN_LEFT), y, font_bold);
            y -= Mm(SPACING.h1_bottom);
        }
        Block::H2(text) => {
            y -= Mm(SPACING.h2_top);
            layer.use_text(text, FONT_SIZES.h2, Mm(MARGIN_LEFT), y, font_bold);
            y -= Mm(SPACING.h2_bottom);
        }
        Block::H3(text) => {
            y -= Mm(SPACING.h3_top);
            layer.use_text(text, FONT_SIZES.h3, Mm(MARGIN_LEFT), y, font_bold);
            y -= Mm(SPACING.h3_bottom);
        }
        Block::H4(text) => {
            y -= Mm(SPACING.h4_top);
            layer.use_text(text, FONT_SIZES.h4, Mm(MARGIN_LEFT), y, font_bold);
            y -= Mm(SPACING.h4_bottom);
        }
        Block::Paragraph(inlines) => {
            let lines = layout_inlines(inlines, Mm(CONTENT_WIDTH), font, FONT_SIZES.paragraph);
            for line in lines {
                render_inline_line(
                    layer,
                    &line,
                    Mm(MARGIN_LEFT),
                    y,
                    font,
                    font_bold,
                    font_italic,
                    FONT_SIZES.paragraph,
                );
                y -= Mm(SPACING.paragraph_line_height);
            }
            y -= Mm(SPACING.paragraph_bottom);
        }
        Block::Code { language: _, code } => {
            y -= Mm(SPACING.code_padding);
            for line in code.lines() {
                layer.use_text(
                    line,
                    FONT_SIZES.code,
                    Mm(MARGIN_LEFT + SPACING.code_padding),
                    y,
                    font,
                );
                y -= Mm(SPACING.code_line_height);
            }
            y -= Mm(SPACING.code_bottom);
        }
        Block::Quote(inlines) => {
            let lines = layout_inlines(
                inlines,
                Mm(CONTENT_WIDTH - 10.0),
                font_italic,
                FONT_SIZES.quote,
            );
            for line in lines {
                layer.use_text("│", FONT_SIZES.quote, Mm(MARGIN_LEFT + 2.0), y, font);
                render_inline_line(
                    layer,
                    &line,
                    Mm(MARGIN_LEFT + 8.0),
                    y,
                    font_italic,
                    font_bold,
                    font_italic,
                    FONT_SIZES.quote,
                );
                y -= Mm(5.0);
            }
            y -= Mm(SPACING.quote_bottom);
        }
        Block::Ul(items) => {
            for item in items {
                layer.use_text("•", FONT_SIZES.list, Mm(MARGIN_LEFT + 8.0), y, font);
                let text = inlines_to_string(item);
                layer.use_text(&text, FONT_SIZES.list, Mm(MARGIN_LEFT + 18.0), y, font);
                y -= Mm(SPACING.list_item_height);
            }
            y -= Mm(SPACING.list_bottom);
        }
        Block::Ol(items) => {
            for (i, item) in items.iter().enumerate() {
                layer.use_text(
                    &format!("{}.", i + 1),
                    FONT_SIZES.list,
                    Mm(MARGIN_LEFT + 4.0),
                    y,
                    font,
                );
                let text = inlines_to_string(item);
                layer.use_text(&text, FONT_SIZES.list, Mm(MARGIN_LEFT + 18.0), y, font);
                y -= Mm(SPACING.list_item_height);
            }
            y -= Mm(SPACING.list_bottom);
        }
        Block::Table { headers, rows } => {
            let col_width = CONTENT_WIDTH / headers.len() as f32;

            for (i, header) in headers.iter().enumerate() {
                layer.use_text(
                    header,
                    FONT_SIZES.table,
                    Mm(MARGIN_LEFT + i as f32 * col_width + 3.0),
                    y,
                    font_bold,
                );
            }
            y -= Mm(SPACING.table_row_height);

            for row in rows {
                for (i, cell) in row.iter().enumerate() {
                    layer.use_text(
                        cell,
                        FONT_SIZES.table,
                        Mm(MARGIN_LEFT + i as f32 * col_width + 3.0),
                        y,
                        font,
                    );
                }
                y -= Mm(SPACING.table_row_height);
            }
            y -= Mm(SPACING.table_bottom);
        }
        Block::Hr => {
            layer.use_text(
                "─────────────────────────────────────────────────────────────",
                8.0,
                Mm(MARGIN_LEFT),
                y,
                font,
            );
            y -= Mm(SPACING.hr_height);
        }
    }

    y
}

fn layout_inlines(
    inlines: &[Inline],
    max_width: Mm,
    font: &IndirectFontRef,
    font_size: f32,
) -> Vec<Vec<Inline>> {
    let mut lines = Vec::new();
    let mut current_line = Vec::new();
    let mut current_width = 0_usize;
    let chars_per_mm = (font_size / 3.0) as usize;
    let max_chars = (max_width.0 as usize) * chars_per_mm;

    for inline in inlines {
        let text = match inline {
            Inline::Text(t) | Inline::Bold(t) | Inline::Italic(t) | Inline::Code(t) => t.clone(),
            Inline::Link { text, .. } => text.clone(),
        };

        let remaining = if current_width > 0 {
            max_chars.saturating_sub(current_width).saturating_sub(1)
        } else {
            max_chars
        };

        if text.len() > remaining && !current_line.is_empty() {
            lines.push(current_line.clone());
            current_line.clear();
            current_width = 0;
        }

        if text.len() > max_chars {
            for chunk in text.as_bytes().chunks(max_chars) {
                let chunk_str = String::from_utf8_lossy(chunk).to_string();
                current_line.push(Inline::Text(chunk_str));
                if current_line
                    .iter()
                    .map(|i| match i {
                        Inline::Text(t) | Inline::Bold(t) | Inline::Italic(t) | Inline::Code(t) => {
                            t.len()
                        }
                        Inline::Link { text, .. } => text.len(),
                    })
                    .sum::<usize>()
                    > max_chars
                {
                    lines.push(current_line.clone());
                    current_line.clear();
                }
            }
        } else {
            current_line.push(inline.clone());
            current_width += text.len() + 1;
        }
    }

    if !current_line.is_empty() {
        lines.push(current_line);
    }

    if lines.is_empty() {
        lines.push(vec![Inline::Text(String::new())]);
    }

    lines
}

fn render_inline_line(
    layer: &PdfLayerReference,
    inlines: &[Inline],
    x: Mm,
    y: Mm,
    font: &IndirectFontRef,
    font_bold: &IndirectFontRef,
    font_italic: &IndirectFontRef,
    font_size: f32,
) {
    let mut current_x = x.0;

    for inline in inlines {
        match inline {
            Inline::Text(text) => {
                layer.use_text(text, font_size, Mm(current_x), y, font);
                current_x += text.len() as f32 * font_size / 3.0;
            }
            Inline::Bold(text) => {
                layer.use_text(text, font_size, Mm(current_x), y, font_bold);
                current_x += text.len() as f32 * font_size / 3.0;
            }
            Inline::Italic(text) => {
                layer.use_text(text, font_size, Mm(current_x), y, font_italic);
                current_x += text.len() as f32 * font_size / 3.0;
            }
            Inline::Code(text) => {
                layer.use_text(
                    &format!("`{}`", text),
                    font_size - 1.0,
                    Mm(current_x + 2.0),
                    y,
                    font,
                );
                current_x += (text.len() + 2) as f32 * font_size / 3.0 + 4.0;
            }
            Inline::Link { text, url: _ } => {
                layer.use_text(text, font_size, Mm(current_x), y, font);
                current_x += text.len() as f32 * font_size / 3.0;
            }
        }
    }
}

fn inlines_to_string(inlines: &[Inline]) -> String {
    inlines
        .iter()
        .map(|i| match i {
            Inline::Text(t) | Inline::Bold(t) | Inline::Italic(t) | Inline::Code(t) => t.clone(),
            Inline::Link { text, .. } => text.clone(),
        })
        .collect::<Vec<_>>()
        .join("")
}
