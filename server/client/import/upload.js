const fs = require('fs-extra');
const QRCode = require('qrcode')

const QR_IMAGES_PATH = __dirname + '/../../data/qr-images/';
const ATTENDEES_PATH = __dirname + '/../../data/attendees/';

async function upload (req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    let csvFile = req.files.csvFile;
    let csvData = csvFile.data.toString().split('\n');
    const promises = [];

    // let's remove both directories simultaneously
    if (req.body.clean) {
        await Promise.all([
            fs.remove(QR_IMAGES_PATH),
            fs.remove(ATTENDEES_PATH)
        ]);
    }

    // let's ensure (simultaneously) that both directories exist
    await Promise.all([
        fs.ensureDir(QR_IMAGES_PATH),
        fs.ensureDir(ATTENDEES_PATH)
    ]);

    // here, we will prepare a list of promises to run in parallel
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
        const fileName = QR_IMAGES_PATH + email + '.png';

        promises.push(new Promise((resolve, reject) => {
            // we need to do three things:
            // - generate the qr code image file
            // - create a file named after the code, with the email and name
            // - create a file named after the email, with the code and name
            // So, let's do it also in parallel
            Promise.all([
                // generate a QR Code containing the name and e-mail
                new Promise((resolve, reject) => {
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
                // create a file whose name is the user's e-mail, containing the user's id (the code)
                new Promise((resolve, reject) => {
                    fs.writeFile(ATTENDEES_PATH + email + '.txt', code + '|' + name, err => {
                        if (err) {
                            reject('Failed creating attendee email file. ' + err);
                        } else {
                            resolve();
                        }
                    });
                }),
                // create a file whose name is the code, containing the user's email
                new Promise((resolve, reject) => {
                    fs.writeFile(ATTENDEES_PATH + code + '.txt', email + '|' + name, err => {
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

    // and when those promises are resolved, we check the result
    Promise.all(promises)
    .then(done => {
        res.send("All QR-Codes Generated");
    })
    .catch(err => {
        res.send("Error generating QR-Codes! " + err);
    });
}

module.exports = upload;