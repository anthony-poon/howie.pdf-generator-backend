const {
    PDFDocument,
    rgb
} = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const fontkit = require("@pdf-lib/fontkit");
const _ = require("lodash");

const MARGIN_TOP = 20;
const FONT_SIZE_1 = 32;
const FONT_SIZE_2 = 18;
const FONT_SIZE_3 = 12;

const template = fs.readFileSync(path.join(__dirname, "..", "assets", "pdf_template.pdf"));
const ttfs = {
    regular: fs.readFileSync(path.join(__dirname, "..", "assets", "Opus Regular.ttf")),
    bold: fs.readFileSync(path.join(__dirname, "..", "assets", "Opus Bold.ttf")),
    italic: fs.readFileSync(path.join(__dirname, "..", "assets", "Opus Italic.ttf"))
};

class PDFTemplate {
    async render(data = {
        certId: "",
        courseId: "",
        delegateId: "",
        iso: "",
        name: "",
        date: ""
    }) {
        this.offsetY = MARGIN_TOP;
        this.pdf = await PDFDocument.load(template);
        this.pdf.registerFontkit(fontkit);
        this.fonts = {}
        for (const [key, ttf] of Object.entries(ttfs)) {
            this.fonts[key] = await this.pdf.embedFont(ttf);
        }
        this.page = this.pdf.getPage(0);
        this._insertCenter("Certificate of Achievement", FONT_SIZE_1, 10, "bold");
        this._insertCenter("Certificate No.: " + data.certId, FONT_SIZE_2, 15);
        this._insertCenter("This is to certify that", FONT_SIZE_2, 0);
        this._insertCenter(data.name, FONT_SIZE_1, 10, "bold");
        this._insertCenter("has successfully passed the required assessment for the five (5) day", FONT_SIZE_3, 8);
        this._insertCenter(data.iso, FONT_SIZE_1, 10, "bold");
        this._insertCenter("Environmental Management Systems", FONT_SIZE_1, 6);
        this._insertCenter("Lead Auditor Course", FONT_SIZE_1, 8, "bold");
        this._insertCenter("CQI & IRCA Certified Course ID " + data.courseId, FONT_SIZE_2, 10);
        this._insertCenter("This certificate is valid for five (5) years for the purpose of auditor registration by the CQI & IRCA", FONT_SIZE_2, 10);
        this._insertCenter("Completion Date: " + data.date + "                                                          CQI & IRCA ULN: " + data.delegateId, FONT_SIZE_2, 10);

        return this.pdf.save();
    }

    _insertCenter(text, size, margin, fontType = "regular") {
        const font = this.fonts[fontType];
        const textW = font.widthOfTextAtSize(text, size);
        const textH = font.heightAtSize(size);
        const { width: pageW, height: pageH } = this.page.getSize();
        this.offsetY += textH;
        this.page.drawText(text, {
            x: (pageW - textW) / 2,
            y: pageH - this.offsetY,
            font: font,
            size,
            color: rgb(0, 0, 0)
        });
        this.offsetY += margin;
    }
}


module.exports = PDFTemplate
