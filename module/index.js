const TEMPLATES_PATH = __dirname + '/../templates/default.tpl'
const fs = require('fs')
const QRCode = require('qrcode')
const { StringDecoder } = require('string_decoder')
const bwipjs = require('bwip-js') // bar code generator
const nunjucks = require('nunjucks')
nunjucks.configure({ autoescape: false })

const DEFAULTS = {
    separator: ',',
    fields: [],
    noHeader: false,
    qr: null,
    bar: null,
    sort: true,
    sequential: 1
}

module.exports =(function () {
    const PRIVATE = {
        toQRCode (str) {
            return new Promise((resolve, reject) => {
                QRCode.toDataURL(str, { errorCorrectionLevel: 'Q' }, function (err, url) {
                    if (err) {
                        return reject('Failed generating QR Code: ' + (err.message || err))
                    }
                    resolve(url)
                })
            })
        },
        toBarCode (val) {
            return new Promise((resolve, reject) => {
                bwipjs.toBuffer({
                    bcid:        'code128',       // Barcode type
                    text:        val,             // Text to encode
                    scale:       3,               // 3x scaling factor
                    width:      80,              // Bar height, in millimeters
                    height:      5,              // Bar height, in millimeters
                    includetext: false,            // Show human-readable text
                    textxalign:  'center',        // Always good to set this
                    textfont:    'Inconsolata',   // Use your custom font
                    textsize:    5               // Font size, in points
                }, function (err, png) {
                    if (err) {
                        reject('Failed generating bar code!\n' + (err.message || err))
                    } else {
                        resolve(png)
                    }
                })
            })
        },
        padId (val) {
            return ("00000" + parseInt(val, 10)).substr(-5)
        },
        bufferToBase64 (buffer) {
            // var u8 = new Uint8Array([65, 66, 67, 68]);
            // var decoder = new TextDecoder('utf8');
            // return btoa(decoder.decode(buffer));
            // return btoa(decoder.end(buffer));
            return buffer.toString('base64');
        },
        arrayToObject (fields, data, opts) {
            return Promise.all(
                data.map((item, i) => {
                    let obj = {}
                    if (item.length >= fields.length) {
                        fields.forEach((field, i) => {
                            obj[field] = item[i]
                        })

                        obj.id = PRIVATE.padId(i + parseInt((opts.sequential || 0), 10))
                        let promises = []
                        if (opts.qr) {
                            let data = opts.qr.map(item => obj[item]).join('|')
                            promises.push(PRIVATE.toQRCode(data).then(dataURL => {
                                obj.qr = dataURL
                                return obj
                            }))
                        }
                        if (opts.bar) {
                            promises.push(PRIVATE.toBarCode(obj.id).then(buffer => {
                                obj.bar = PRIVATE.bufferToBase64(buffer)
                                return obj
                            }))
                        }

                        if (!promises.length) {
                            promises.push(Promise.resolve(obj))
                        }

                        return Promise.all(promises).then(done => {
                            return Object.assign({}, ...done)
                        })
                    }
                    return false
                }).filter(item=>item)
            )
        }
    }
    const PUBLIC = {
        process: function (data, opts) {
            return new Promise((resolve, reject) => {
                if (!Array.isArray(data)) {
                    return reject('Data should be an Array, ' + (typeof data) + ' received')
                }
                opts = Object.assign({}, DEFAULTS, opts || {})
                if (!opts.fields || opts.fields.length === 0) {
                    if (!opts.noHeader) {
                        opts.fields = data.shift()
                    } else {
                        reject('If ther is no header in the imported list, you should specify the fields')
                    }
                }
                PRIVATE.arrayToObject(opts.fields, data, opts).then(data => {
                    if (opts.sort) {
                        data = data.sort((prev, next) => {
                            return prev.name.toLowerCase() > next.name.toLowerCase()
                        })
                    }
                    fs.readFile(__dirname + '/../templates/styles.css', 'utf-8', (err, styles) => {
                        if (err) {
                            return reject('Failed retrieving styles for the tags!\n' + (err.message || err))
                        }

                        if (data.length % 2 !== 0) {
                            data.push({})
                        }

                        nunjucks.render(TEMPLATES_PATH, {
                                data,
                                styles,
                                opts
                            }, function (err, parsed) {
                            if (err) {
                                return reject('Failed parsing template!\n' + (err.message || err))
                            }
                            resolve(parsed)
                        })
                    })
                }).catch(err => {
                    reject('Failed processing data to generate file!\n' + (err.message || err))
                })
            })
        }
    }

    return PUBLIC
})()