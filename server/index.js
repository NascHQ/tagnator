const express = require('express')
const app = express()
const bodyParser = require('body-parser')
// const tagGen = require('../module/index')
const QRCode = require('qrcode')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const url = require('url');    

// used specially to deal with uploads and imports
app.use(fileUpload());
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// the index page
// will offer access to the menus and different profiles
app.use('/', express.static(__dirname + '/client'));

app.get('/', function (req, res) {
    if (req.query.find) {
        fs.readFile(__dirname + '/attendees/' + req.query.find, (err, data) => {
            if (err) {
                // there is no registry for that code
                res.send('NOPE');
            } else {
                const email = data;
                const code = req.query.find;
                res.redirect(url.format({
                    pathname:"/",
                    query: {
                        email,
                        name
                     }
                }));
            }
        });
    } else {
        res.sendFile(__dirname + '/client/index.html');
    }
});

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

app.post('/import/upload', async function(req, res) {
    require('./client/import/upload.js')(req, res);
});

app.listen(8008);

console.log('Listning on port 8008');
