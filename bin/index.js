#!/usr/bin/env node

const source = process.argv[2]
const fs = require('fs')
const optimist = require('optimist')
const DEFAULT_OUTPUT_FILE_NAME = 'printable-tags.html'
const DEFAULT_OUTPUT_PATH = process.cwd()
const tagGen = require('../module/index')
const open = require('opn');

let VERBOSE = false
const LOG = function (...data) {
    if (VERBOSE) {
        console.log('LOG:: ', data)
    }
}

const argv = optimist
    .usage(`
Usage: tagnator source.csv [-o outputPath] [-s separator] [-f field,names] [otherOptions]

Eg:
    $ tagnator path/file.csv -s ";" -f "id:name;email;status" -v --qr "name;email:id"`)
    .boolean('v')
        .alias('v', 'verbose')
        .describe('v', 'Gets in verbose mode')
    .default('s', ',')
        .alias('s', 'separator')
        .describe('s', 'Specifies the separator to be used (default ,)')
    .default('o', DEFAULT_OUTPUT_PATH)
        .alias('o', 'output')
        .describe('o', 'The output where to save the html file')
    .string('f')
        .alias('f', 'fields')
        .describe('f', `List of columns separated by the separator.
                   Eg.: name,email,status`)
    .boolean('no-header')
        .describe('no-header', 'Will not ignore the first line')
    .string('n')
        .alias('n', 'number')
        .describe('n', `A sequencial number starting at n`)
    .boolean('h')
        .alias('h', 'help')
        .describe('h', 'Shows this help message and usage')
    .string('qr')
        .describe('qr', 'QR Code will be generated using the given fields(coma separated)')
    .boolean('bar')
        .describe('bar', `Bar Code will be generated using the given value for -n`)
    .argv;

if (!source) {
    console.error('ERROR: You need to specify a .csv source file')
    optimist.showHelp()
    return
}
if (argv['no-header'] && !argv.fields) {
    console.error(`ERROR: When using --no-header, you need to specify
                   the order of fields, like "name,email,other"`)
    optimist.showHelp()
    return
}
if (argv.h) {
    optimist.showHelp()
    return
}
if (argv.v) {
    VERBOSE = true
    return
}

LOG('Loading source file')
const content = fs.readFile(source, 'utf-8', (err, result) => {
    if (err) {
        return console.error('Failed retrieving the content from the source path!\n' + (err.message || err))
    }
    LOG('Loaded source file')
    LOG('Parsing source file')
    result = result.split('\n').map(line => line.split(argv.s))
    if (!result.length || (result.length === 1 && !argv['no-header'])) {
        return console.error('The file was empty!')
    }
    fields = []
    if (!argv['no-header']) {
        fields = result.shift()
    }
    if (argv.fields) {
        fields = argv.fields.split(argv.s)
    }
    LOG('Parsed source file')

    LOG('Generating file based on template')

    tagGen.process(
        result,
        {
            separator: argv.s,
            fields: fields,
            noHeader: argv['no-header'],
            qr: argv.qr ? argv.qr.split(argv.s) : null,
            bar: argv.bar,
            sequential: argv.n
        }
        ).then(parsed => {
        LOG('File generated in memory')
        let output = argv.o
        // if user has not passed an output path, or has passed a directory
        if (output === DEFAULT_OUTPUT_PATH || output.slice(-1) === '/') {
            output+= '/' + DEFAULT_OUTPUT_FILE_NAME
        }
        fs.writeFile(output, parsed, err => {
            if (err) {
                return console.error('Failed saving generated file at ' + output + '!\n' + (err.message || err))
            }
            LOG('File saved at ' + output)
            LOG('Opening on browser')
            open(output)
        })
    }).catch(err => {
        return console.error('Failed parsing template!\n' + (err.message || err))
    })
})
