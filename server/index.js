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

// app.get('/', function (req, res) {
//     if (req.query.find) {
//         fs.readFile(__dirname + '/attendees/' + req.query.find, (err, data) => {
//             if (err) {
//                 // there is no registry for that code
//                 res.send('NOPE');
//             } else {
//                 const email = data;
//                 const code = req.query.find;
//                 res.redirect(url.format({
//                     pathname:"/",
//                     query: {
//                         email,
//                         name
//                      }
//                 }));
//             }
//         });
//     } else {
//         res.sendFile(__dirname + '/client/index.html');
//     }
// });

app.get(['/tag/', '/tag/index.html'], async function (req, res, next) {
    const tag = require('./client/tag/index.js');
    const attendee = await tag.findAttendeeData(req, true);
    console.log({attendee});

    const queryData = {...(attendee) || {}};
    queryData.notFound = attendee ? 0 : 1;
    
    if (req.query.redirected) {
        return next();
    }
    queryData.redirected = 1;

    res.redirect(url.format({
        pathname:"/tag/index.html",
        query: queryData
    }));
});

app.get('/qr.png', async function (req, res) {
    const qrPath = await require('./client/tag/qr.js')(req, res);
    res.sendFile(__dirname + '/data/qr-images/' + qrPath);
});

app.post('/import/upload', async function(req, res) {
    require('./client/import/upload.js')(req, res);
});

app.use('/', express.static(__dirname + '/client'));

app.listen(8008);

console.log('Listning on port 8008');
