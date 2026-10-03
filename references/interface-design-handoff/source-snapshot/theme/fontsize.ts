type FontSizeToken = string | [string, { lineHeight: string; letterSpacing: string }];

export const fontSize: Record<string, FontSizeToken> = {
    "size-13": "13px",
    "display-xl": ["2.375rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
    "display-lg": ["1.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
    "title-lg": ["1.125rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
    "title-md": ["0.9375rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
    "title-sm": ["0.8125rem", { lineHeight: "1.35", letterSpacing: "0" }],
    "body": ["0.875rem", { lineHeight: "1.5", letterSpacing: "0" }],
    "body-sm": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0" }],
    "label": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0" }],
    "eyebrow": ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.05em" }],
    "caption": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0" }],
};
