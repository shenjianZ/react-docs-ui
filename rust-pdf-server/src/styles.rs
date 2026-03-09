pub const PAGE_WIDTH: f32 = 210.0;
pub const PAGE_HEIGHT: f32 = 297.0;
pub const MARGIN_TOP: f32 = 20.0;
pub const MARGIN_BOTTOM: f32 = 20.0;
pub const MARGIN_LEFT: f32 = 15.0;
pub const MARGIN_RIGHT: f32 = 15.0;

pub const CONTENT_WIDTH: f32 = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

pub const COLORS: Colors = Colors {
    text: (0.1, 0.1, 0.1),
    muted: (0.4, 0.4, 0.4),
    code_bg: (0.965, 0.973, 0.980),
    code_border: (0.898, 0.910, 0.922),
    table_header_bg: (0.953, 0.957, 0.965),
    table_border: (0.898, 0.910, 0.922),
    quote_border: (0.898, 0.910, 0.922),
    hr_color: (0.898, 0.910, 0.922),
    link: (0.145, 0.388, 0.922),
};

pub struct Colors {
    pub text: (f32, f32, f32),
    pub muted: (f32, f32, f32),
    pub code_bg: (f32, f32, f32),
    pub code_border: (f32, f32, f32),
    pub table_header_bg: (f32, f32, f32),
    pub table_border: (f32, f32, f32),
    pub quote_border: (f32, f32, f32),
    pub hr_color: (f32, f32, f32),
    pub link: (f32, f32, f32),
}

pub const FONT_SIZES: FontSizes = FontSizes {
    h1: 28.0,
    h2: 22.0,
    h3: 18.0,
    h4: 14.0,
    paragraph: 11.0,
    code: 9.0,
    quote: 10.0,
    list: 11.0,
    table: 10.0,
};

pub struct FontSizes {
    pub h1: f32,
    pub h2: f32,
    pub h3: f32,
    pub h4: f32,
    pub paragraph: f32,
    pub code: f32,
    pub quote: f32,
    pub list: f32,
    pub table: f32,
}

pub const SPACING: Spacing = Spacing {
    h1_top: 20.0,
    h1_bottom: 12.0,
    h2_top: 16.0,
    h2_bottom: 10.0,
    h3_top: 12.0,
    h3_bottom: 8.0,
    h4_top: 10.0,
    h4_bottom: 6.0,
    paragraph_bottom: 8.0,
    paragraph_line_height: 5.5,
    code_padding: 8.0,
    code_line_height: 4.0,
    code_bottom: 8.0,
    quote_bottom: 8.0,
    list_item_height: 5.0,
    list_bottom: 4.0,
    table_row_height: 6.0,
    table_bottom: 8.0,
    hr_height: 8.0,
};

pub struct Spacing {
    pub h1_top: f32,
    pub h1_bottom: f32,
    pub h2_top: f32,
    pub h2_bottom: f32,
    pub h3_top: f32,
    pub h3_bottom: f32,
    pub h4_top: f32,
    pub h4_bottom: f32,
    pub paragraph_bottom: f32,
    pub paragraph_line_height: f32,
    pub code_padding: f32,
    pub code_line_height: f32,
    pub code_bottom: f32,
    pub quote_bottom: f32,
    pub list_item_height: f32,
    pub list_bottom: f32,
    pub table_row_height: f32,
    pub table_bottom: f32,
    pub hr_height: f32,
}
