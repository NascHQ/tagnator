const fs = require('fs-extra');
const QRCode = require('qrcode');

const filePath = './server/data/qr-images/';
const tag = require('./index.js');

async function qr (req, res) {
    return new Promise(async (resolve, reject) => {
        const str = req.query.name + ',' + req.query.email;
        let email = req.query.email;
        let name = req.query.name;
        
        const data = await tag.findAttendeeData(req);
        
        const fileName = email + '.png';
        
        fs.access(filePath + fileName, fs.constants.R_OK, err => {
            if (err) {
                // new file
                QRCode.toFile(filePath + fileName, str, {
                    color: {
                        dark: '#000',  // Blue dots
                        light: '#0000' // Transparent background
                    }
                }, function (err) {
                    if (err) reject(err);
                    resolve(fileName);
                });
            } else {
                resolve(fileName);
            }
        });
    });
}

module.exports = qr;