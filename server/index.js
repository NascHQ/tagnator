const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const tagGen = require('../module/index')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html')
})
app.get('/default.css', function (req, res) {
    res.sendFile(__dirname + '/client/default.css')
})

app.post('/', function (req, res) {
    let data = req.body

    data.csvData = data.csvData.replace(/\r/g, '').split('\n').map(line => line.split(data.separator))
    if (!data.csvData.length || (data.csvData.length === 1 && !data.fields)) {
        return res.send('Error: No data was passed')
    }

    if (!data.fields) {
        data.fields = data.csvData.shift()
    }

    tagGen.process(
        data.csvData,
        {
            separator: data.separator,
            fields: data.fields,
            noHeader: data.fields ? true : false,
            qr: data.qr ? data.qr.split(data.separator) : null,
            bar: data.bar,
            sort: data.sort,
            sequential: data.bar
        }
        ).then(parsed => {
            res.send(parsed)
        }).catch(err => {
            res.send(err)
        })
})

app.listen(8008)