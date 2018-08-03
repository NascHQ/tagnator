const express = require('express')
const app = express()
const bodyParser = require('body-parser')
// const tagGen = require('../module/index')
const QRCode = require('qrcode')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.get('/', function (req, res) {
    // if (req.query.find) {
        // res.send('');
    // } else {
        res.sendFile(__dirname + '/client/index.html');
    // }
});
app.get('/default.css', function (req, res) {
    res.sendFile(__dirname + '/client/default.css')
})
app.get('/qr-sample.png', function (req, res) {
    res.sendFile(__dirname + '/client/qr-sample.png')
})
app.get('/qr.png', function (req, res) {
    const str = req.query.name + ',' + req.query.email;
    
    const fileName = __dirname + '/qr-images/' + req.query.email + '.png';
    
    fs.access(fileName, fs.constants.R_OK, err => {
        if (err) {
            // new file
            QRCode.toFile(fileName, str, {
                color: {
                    dark: '#000',  // Blue dots
                    light: '#0000' // Transparent background
                }
            }, function (err) {
                if (err) throw err;
                res.sendFile(fileName);
            });
        } else {
            res.sendFile(fileName);
        }
    });
});

app.get('/bg.jpg', function (req, res) {
    res.sendFile(__dirname + '/client/bg.jpg');
})
app.get('/roboto-2.woff2', function (req, res) {
    res.sendFile(__dirname + '/client/roboto-2.woff2');
})
app.get('/anton-1.woff2', function (req, res) {
    res.sendFile(__dirname + '/client/anton-1.woff2');
})

app.use('/', express.static(__dirname + '/client'));
app.use('/scanner', express.static(__dirname + '/client/scanner'));

app.post('/import/upload', async function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    let csvFile = req.files.csvFile;
    let csvData = csvFile.data.toString().split('\n');
    const promises = [];

    if (req.body.clean) {
        await Promise.all([
            fs.remove(__dirname + '/qr-images'),
            fs.remove(__dirname + '/attendees')
        ]);
    }

    await Promise.all([
        fs.ensureDir(__dirname + '/qr-images'),
        fs.ensureDir(__dirname + '/attendees')
    ]);

    csvData.forEach(line => {
        line = line.split(',');
        if (line[0][0] === '"') {
            return;
        }
        let name = line[2];
        let email = line[4];
        let code = line.pop();

        if (!name || !email || !code) {
            return;
        }

        name = name.substr(1, name.length - 2);
        email = email.substr(1, email.length - 2);
        code = code.substr(1, code.length - 2); // removing the quotes
        const qrContent = name + ',' + email;
        const fileName = __dirname + '/qr-images/' + email + '.png';

        promises.push(new Promise((resolve, reject) => {
            Promise.all([
                new Promise((resolve, reject) => {
                    // generate a QR Code containing the name and e-mail
                    QRCode.toFile(fileName, qrContent, {
                        color: {
                            dark: '#000',
                            light: '#0000' // Transparent background (alpha 0)
                        }
                    }, function (err) {
                        if (err) reject(err);
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    // create a file whose name is the user's e-mail, containing the user's id (the code)
                    fs.writeFile(__dirname + '/attendees/' + email + '.txt', code, err => {
                        if (err) {
                            reject('Failed creating attendee email file. ' + err);
                        } else {
                            resolve();
                        }
                    });
                }),
                new Promise((resolve, reject) => {
                    // create a file whose name is the user's id, containing the user's email
                    fs.writeFile(__dirname + '/attendees/' + code + '.txt', email, err => {
                        if (err) {
                            reject('Failed creating attendee code file. ' + err);
                        } else {
                            resolve();
                        }
                    });
                })
            ])
            .then(resolve)
            .catch(reject);
        }));
    });

    Promise.all(promises)
    .then(done => {
        res.send("All QR-Codes Generated");
    })
    .catch(err => {
        res.send("Error generating QR-Codes! " + err);
    });
});
app.use('/import', express.static(__dirname + '/client/import'));

app.listen(8008)

console.log('Listning on port 8008');
