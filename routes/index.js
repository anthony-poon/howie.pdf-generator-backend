const express = require('express');
const fs = require("fs");
const PDFTemplate = require("../services/pdf-template");
const multer  = require('multer');
const path = require("path");
const { v4 } = require("uuid");
const parser = require('csv-parse')
const md5 = require("md5");
const archiver = require('archiver');

const storage = multer.memoryStorage()
const upload = multer({ storage });
const router = express.Router();
/* GET home page. */
router.get('/heart-beat', (req, res, next) => {
    res.json({
      "status": "OK"
    })
});

const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        parser(file, {}, (err, out) => {
            if (err) {
                return reject(err);
            }
            return resolve(out);
        })
    });
}

router.post('/pdf',  upload.single("upload"), async (req, res, next) => {
    try {
        const upload = req.file.buffer.toString();
        const csv = await parseCSV(upload);
        const headers = csv[0];

        const dirPath = path.join(__dirname, "..", "temp", md5(v4()))
        console.log("Creating temp dir " + dirPath);
        fs.mkdirSync(dirPath);
        for (let row = 1; row < csv.length; row++) {
            const data = {};
            for (let col = 0; col < headers.length; col++) {
                const header = headers[col];
                data[header] = csv[row][col];
            }
            const template = new PDFTemplate();
            const pdf = await template.render({
                certId: data["ST_ATP_DELEGATE_ID"],
                courseId: data["ST_COURSE_ID"],
                delegateId: data["ST_CQI_DELEGATE_ID"],
                iso: data["STDD"],
                name: data["ST_FIRST_NAME"] + " " + data["ST_LAST_NAME"],
                date: data["ST_END_DATE"]
            });
            const pdfPath = path.join(dirPath, data["ST_ATP_DELEGATE_ID"] + ".pdf");
            fs.writeFileSync(pdfPath, pdf);
        }

        const zipPath = path.join(__dirname, '..', 'temp', md5(v4()) + ".zip");
        const output = fs.createWriteStream(zipPath);
        output.on('close', function() {
            console.log("Zip created. Total " + archive.pointer() + ' total bytes');
            res.download(zipPath, "certificates.zip");
        });
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                console.error(err);
            } else {
                throw err;
            }
        });
        archive.on('error', (err) => {
            throw err;
        });
        archive.pipe(output);
        archive.directory(dirPath,false);
        archive.finalize();
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }

});

module.exports = router;
