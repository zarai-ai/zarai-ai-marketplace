const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, ImageRun,
  TableOfContents, LevelFormat, ExternalHyperlink, TabStopType, TabStopPosition
} = require("docx");

const DARK = "0D1117", DARK_ALT = "111822", DARK_BLUE = "1B2A4A", DARK_CODE = "141C2B";
const PINK = "FF3366", MAG = "CC33FF", CYAN = "33CCFF", WHITE = "FFFFFF", BODY = "E0E0E0", MUTED = "888888";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "2A2A3A" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const FONT = "Arial";
const ASSETS = __dirname.replace("/misc", "") + "/assets";
const avatarData = fs.readFileSync(ASSETS + "/zarai-avatar.png");
const mascotData = fs.readFileSync(ASSETS + "/zarai-mascot.png");
const heroMoonData = fs.readFileSync(ASSETS + "/hero-moon-mascot.jpg");
const backCoverData = fs.readFileSync(ASSETS + "/back-cover-moon-mascot.jpg");

const darkP = (text, opts = {}) => new Paragraph({
  shading: { fill: opts.bg || DARK, type: ShadingType.CLEAR },
  spacing: { before: opts.before || 0, after: opts.after || 120 },
  alignment: opts.align || AlignmentType.LEFT,
  ...(opts.heading ? { heading: opts.heading } : {}),
  children: Array.isArray(text) ? text : [new TextRun({
    text, color: opts.color || BODY, size: opts.size || 22, font: FONT,
    bold: opts.bold || false, italics: opts.italics || false
  })]
});

const codeBlock = (lines) => lines.map(line => new Paragraph({
  shading: { fill: DARK_CODE, type: ShadingType.CLEAR },
  spacing: { before: 0, after: 0 },
  indent: { left: 360 },
  children: [new TextRun({ text: line || " ", color: CYAN, size: 18, font: "Courier New" })]
}));

const hdr = (text, level, color = PINK) => darkP(
  [new TextRun({ text, color, size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 30 : 24, bold: true, font: FONT })],
  { heading: level, before: 300, after: 160 }
);

const tblCell = (text, opts = {}) => new TableCell({
  borders: BORDERS, width: { size: opts.w || 3120, type: WidthType.DXA },
  shading: { fill: opts.bg || DARK, type: ShadingType.CLEAR },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    children: [new TextRun({ text, color: opts.color || BODY, size: opts.size || 20, font: FONT, bold: opts.bold || false })],
    alignment: opts.align || AlignmentType.LEFT,
    indent: { left: 80 }
  })]
});

const tblRow = (cells, bg) => new TableRow({ children: cells.map(c => tblCell(c.t, { w: c.w, bg, bold: c.b, color: c.c })) });
const tblHdr = (cells) => new TableRow({ tableHeader: true, children: cells.map(c => tblCell(c.t, { w: c.w, bg: DARK_BLUE, bold: true, color: WHITE })) });

const imgPlaceholder = (caption) => [
  darkP("", { before: 200 }),
  darkP([new TextRun({ text: `[ IMAGE PLACEHOLDER: ${caption} ]`, color: MAG, size: 22, font: FONT, italics: true })], { align: AlignmentType.CENTER, bg: DARK_ALT, before: 200, after: 40 }),
  darkP([new TextRun({ text: `Generate with provided AI image prompt`, color: MUTED, size: 18, font: FONT, italics: true })], { align: AlignmentType.CENTER, bg: DARK_ALT, after: 200 }),
];

const divider = () => darkP([
  new TextRun({ text: "___", color: PINK, size: 8 }),
  new TextRun({ text: "________", color: MAG, size: 8 }),
  new TextRun({ text: "___", color: CYAN, size: 8 }),
], { align: AlignmentType.CENTER, before: 200, after: 200 });

// ─── COVER PAGE ──────────────────────────────────────────
const coverSection = {
  properties: {
    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
  },
  children: [
    darkP("", { before: 2400 }),
    darkP([new ImageRun({ type: "png", data: mascotData, transformation: { width: 280, height: 400 },
      altText: { title: "ZARAI AI", description: "ZARAI AI Mascot", name: "zarai-mascot" } })],
      { align: AlignmentType.CENTER, after: 200 }),
    darkP([new TextRun({ text: "ZARAI AI", color: PINK, size: 72, bold: true, font: FONT })],
      { align: AlignmentType.CENTER, after: 40 }),
    darkP([new TextRun({ text: "PLUGIN MARKETPLACE", color: WHITE, size: 36, font: FONT, bold: true })],
      { align: AlignmentType.CENTER, after: 200 }),
    divider(),
    darkP([new TextRun({ text: "Precision developer tools for Claude Code.", color: BODY, size: 24, font: FONT })],
      { align: AlignmentType.CENTER, after: 120 }),
    darkP([new TextRun({ text: "Built to deploy. Not to demo.", color: PINK, size: 24, font: FONT, italics: true })],
      { align: AlignmentType.CENTER, after: 600 }),
    darkP([
      new TextRun({ text: "v1.0.0", color: MUTED, size: 20, font: FONT }),
      new TextRun({ text: "  |  ", color: MUTED, size: 20, font: FONT }),
      new TextRun({ text: "ZARAI AI", color: CYAN, size: 20, font: FONT }),
      new TextRun({ text: "  |  ", color: MUTED, size: 20, font: FONT }),
      new TextRun({ text: "zarai.ai", color: PINK, size: 20, font: FONT }),
    ], { align: AlignmentType.CENTER }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
};

// ─── CONTENT ─────────────────────────────────────────────
const W3 = [3120, 3120, 3120], W2 = [4680, 4680];
const flagsTable = new Table({
  columnWidths: W3, margins: { top: 60, bottom: 60, left: 100, right: 100 },
  rows: [
    tblHdr([{ t: "Flag", w: W3[0] }, { t: "Mode", w: W3[1] }, { t: "What Changes", w: W3[2] }]),
    tblRow([{ t: "--tesla", w: W3[0], c: CYAN }, { t: "Master", w: W3[1] }, { t: "Build entire solution mentally before writing.", w: W3[2] }], DARK),
    tblRow([{ t: "--noFallbacks", w: W3[0], c: CYAN }, { t: "Constraint", w: W3[1] }, { t: "Zero stubs, zero shells. Every path is real.", w: W3[2] }], DARK_ALT),
    tblRow([{ t: "--robust", w: W3[0], c: CYAN }, { t: "Quality", w: W3[1] }, { t: "Every edge case and error path handled.", w: W3[2] }], DARK),
    tblRow([{ t: "--verbose", w: W3[0], c: CYAN }, { t: "Output", w: W3[1] }, { t: "Cite every algorithm. Derive every constant.", w: W3[2] }], DARK_ALT),
    tblRow([{ t: "--complex", w: W3[0], c: CYAN }, { t: "Fidelity", w: W3[1] }, { t: "Full algorithm from source. No simplification.", w: W3[2] }], DARK),
    tblRow([{ t: "--sophisticated", w: W3[0], c: CYAN }, { t: "Technique", w: W3[1] }, { t: "Advanced types, algebraic errors, property tests.", w: W3[2] }], DARK_ALT),
  ]
});

const combosTable = new Table({
  columnWidths: W2, margins: { top: 60, bottom: 60, left: 100, right: 100 },
  rows: [
    tblHdr([{ t: "Combo", w: W2[0] }, { t: "Expands To", w: W2[1] }]),
    tblRow([{ t: "--all", w: W2[0], c: CYAN }, { t: "All 6 flags", w: W2[1] }], DARK),
    tblRow([{ t: "--defense_grade", w: W2[0], c: CYAN }, { t: "tesla + noFallbacks + robust + complex + sophisticated", w: W2[1] }], DARK_ALT),
    tblRow([{ t: "--production", w: W2[0], c: CYAN }, { t: "noFallbacks + robust", w: W2[1] }], DARK),
    tblRow([{ t: "--research", w: W2[0], c: CYAN }, { t: "tesla + verbose + complex", w: W2[1] }], DARK_ALT),
  ]
});

const contentSection = {
  properties: {
    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
  },
  headers: {
    default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "ZARAI AI", color: PINK, size: 16, font: FONT, bold: true }),
        new TextRun({ text: "  Plugin Marketplace", color: MUTED, size: 16, font: FONT }),
      ]
    })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      tabStops: [
        { type: TabStopType.CENTER, position: TabStopPosition.MAX / 2 },
        { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
      ],
      children: [
        new TextRun({ text: "\twww.zarai.ai", color: MUTED, size: 16, font: FONT }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: "Page ", color: MUTED, size: 16, font: FONT }),
        new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16, font: FONT }),
      ]
    })] })
  },
  children: [
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ children: [new PageBreak()] }),

    // ─── What This Is ───
    hdr("What This Is", HeadingLevel.HEADING_1),
    darkP("A Claude Code plugin marketplace by ZARAI AI."),
    divider(),

    // ─── Install ───
    hdr("Install", HeadingLevel.HEADING_1),
    darkP([new TextRun({ text: "Add the marketplace:", color: BODY, size: 22, font: FONT })]),
    ...codeBlock(["/plugin marketplace add zarai-ai/zarai-ai-marketplace"]),
    darkP("", { after: 80 }),
    darkP([new TextRun({ text: "Install a plugin:", color: BODY, size: 22, font: FONT })]),
    ...codeBlock(["/plugin install zarai-implement@zarai-ai"]),
    darkP("", { after: 80 }),
    darkP([new TextRun({ text: "Or test locally:", color: BODY, size: 22, font: FONT })]),
    ...codeBlock(["claude --plugin-dir ./plugins/zarai-implement"]),
    divider(),

    // ─── IMAGE 1: Mascot on crescent moon ───
    darkP("", { before: 100 }),
    darkP([new ImageRun({ type: "jpg", data: heroMoonData, transformation: { width: 680, height: 380 },
      altText: { title: "ZARAI Mascot", description: "Mascot on crescent moon with hexagonal badges", name: "hero-moon" } })],
      { align: AlignmentType.CENTER, after: 100 }),

    // ─── Plugins ───
    hdr("Plugins", HeadingLevel.HEADING_1),
    hdr("zarai-implement", HeadingLevel.HEADING_2, MAG),
    darkP("Implementation task runner with a behavioral flag system. Six flags, each mapped to a Tesla-method consciousness dimension. Each flag activates a verifiable quality mode backed by its own contract file."),
    darkP("", { after: 40 }),
    ...codeBlock(['/zarai-implement:implement "build the auth system" --tesla --robust']),
    darkP("", { after: 120 }),
    darkP([new TextRun({ text: "The default is maximum quality.", color: WHITE, size: 22, font: FONT, bold: true }),
      new TextRun({ text: " No flags = all flags active. Flags scale ", color: BODY, size: 22, font: FONT }),
      new TextRun({ text: "down", color: PINK, size: 22, font: FONT, italics: true }),
      new TextRun({ text: " from the maximum, not up.", color: BODY, size: 22, font: FONT })]),

    hdr("Flags", HeadingLevel.HEADING_3, CYAN),
    flagsTable,
    darkP("", { after: 120 }),
    hdr("Combos", HeadingLevel.HEADING_3, CYAN),
    combosTable,
    darkP("", { after: 120 }),

    hdr("How It Works", HeadingLevel.HEADING_3, CYAN),
    darkP([new TextRun({ text: "1.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  You type /zarai-implement:implement \"task\" --flags", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "2.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  Zero-dep Node.js parser extracts task + resolves flags (combo expansion)", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "3.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  Claude reads each active flag's behavioral contract .md file", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "4.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  All contracts bind simultaneously for the session", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "5.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  Implementation executes under those constraints", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "6.", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: "  Verification checklist produced with evidence for every criterion", color: BODY, size: 22, font: FONT })]),
    divider(),

    // ─── IMAGE 2: Back cover mascot (golden badges) ───
    darkP("", { before: 100 }),
    darkP([new ImageRun({ type: "jpg", data: backCoverData, transformation: { width: 680, height: 380 },
      altText: { title: "ZARAI Mascot", description: "Mascot with golden hexagonal badges, cosmic backdrop", name: "back-mascot" } })],
      { align: AlignmentType.CENTER, after: 100 }),

    // ─── For Plugin Authors ───
    hdr("For Plugin Authors", HeadingLevel.HEADING_1),
    darkP("The three-layer architecture pattern:"),
    darkP([new TextRun({ text: "Layer 1", color: CYAN, size: 22, font: FONT, bold: true }), new TextRun({ text: "  (.cjs scripts) \u2014 Parse arguments, return structured JSON. Zero AI logic.", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "Layer 2", color: CYAN, size: 22, font: FONT, bold: true }), new TextRun({ text: "  (.md contracts) \u2014 Behavioral contracts Claude reads conditionally.", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "Layer 3", color: CYAN, size: 22, font: FONT, bold: true }), new TextRun({ text: "  (slash command .md) \u2014 Thin entry point that orchestrates layers 1 and 2.", color: BODY, size: 22, font: FONT })]),
    darkP([new TextRun({ text: "Derived from the GSD framework (v1.30.0) and official Claude Code plugin spec.", color: MUTED, size: 20, font: FONT, italics: true })]),
    divider(),

    // ─── Philosophy ───
    hdr("Philosophy", HeadingLevel.HEADING_1),
    darkP([new TextRun({ text: '"When I get an idea I start at once building it up in my imagination. I change the construction, make improvements and even operate the device in my mind."', color: BODY, size: 22, font: FONT, italics: true })], { bg: DARK_ALT, before: 120, after: 40 }),
    darkP([new TextRun({ text: "\u2014 Nikola Tesla, My Inventions (1919)", color: MUTED, size: 20, font: FONT })], { bg: DARK_ALT, after: 200 }),
    darkP("Every flag maps to a dimension of Tesla's mental laboratory method. Not as metaphor, but as operational protocol. The --tesla flag literally requires building the complete solution in extended thinking before writing a single line."),
    darkP([new TextRun({ text: "The quality bar is not aspirational. It is the floor.", color: WHITE, size: 22, font: FONT, bold: true })], { before: 120 }),
    divider(),

    // ─── About ───
    hdr("About", HeadingLevel.HEADING_1),
    darkP([new TextRun({ text: "ZARAI AI", color: PINK, size: 22, font: FONT, bold: true }), new TextRun({ text: " \u2014 precision AI tools for developers who ship.", color: BODY, size: 22, font: FONT })]),
    darkP(""),
    darkP([new TextRun({ text: "Web: ", color: MUTED, size: 20, font: FONT }), new TextRun({ text: "zarai.ai", color: PINK, size: 20, font: FONT })]),
    darkP([new TextRun({ text: "Marketplace: ", color: MUTED, size: 20, font: FONT }), new TextRun({ text: "zarai-ai", color: CYAN, size: 20, font: FONT })]),
    darkP([new TextRun({ text: "First plugin: ", color: MUTED, size: 20, font: FONT }), new TextRun({ text: "zarai-implement v1.0.0", color: WHITE, size: 20, font: FONT })]),
    darkP("", { after: 400 }),
    darkP([new TextRun({ text: "Built to deploy. Not to demo.", color: PINK, size: 28, font: FONT, italics: true, bold: true })], { align: AlignmentType.CENTER }),
  ]
};

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: BODY } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: PINK, font: FONT }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: MAG, font: FONT }, paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: CYAN, font: FONT }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [coverSection, contentSection]
});

const OUT = __dirname.replace("/misc", "") + "/ZARAI-AI-Marketplace-Guide.docx";
const UNPACKED = "/tmp/zarai-docx-unpack";

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("Generated: " + OUT);
  console.log("Now post-process to inject dark background:");
  console.log(`  ~/miniforge3/bin/python3 ~/.claude/skills/docx-official/ooxml/scripts/unpack.py "${OUT}" ${UNPACKED}`);
  console.log(`  sed -i 's|<w:body>|<w:background w:color="${DARK}"/>\\n  <w:body>|' ${UNPACKED}/word/document.xml`);
  console.log(`  ~/miniforge3/bin/python3 ~/.claude/skills/docx-official/ooxml/scripts/pack.py ${UNPACKED} "${OUT}"`);
});
