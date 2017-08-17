# Tagnator

Tagnator generates tags for badges in events and Conferences.

## Install

You can use it in three main ways:

### As a module

```
npm i --save tagnator
```

### As a CLI tool

```
npm i -g tagnator
```

### As a service

```
git clone https://github.com/NascHQ/tagnator.git
cd tagnator
npm i
npm start
```

### How to use as a Services

Once you started it, just open your browser at
`http://localhost:8008/`.

Now, you can paste a `.csv` content in the textarea or select a `.csv` file clicking the "Upload and Generate" button.

> Careful not to leave "spaces" in between the separators in the `fields` and `qr-code` fields.  
> For eample, use `name,email` instead of `name, email`.

> If `fields` is left empty, the first line of the csv data will be used as fields.

> If barcode is 0, it will not print the barcode

### How to use the CLI tool

Once installed globally, you can simply access its help:

```
$ tagnator --help
```

Basically, you can pass in the options so you can define the `.csv` file you want to load, the path where to save the file, verbosity, separator, etc.

> In case you are using `;` as separator, don't forget to add quotes: `$ tagnator file.csv -s ";"`

Once your file is generated, the html will open in your default browser so you can print it, or save it as a PDF. Also, you will be able to use the tools to test and adjust margins, sizes and spaces.

### How to use it as a module

After installed in your project, you can require it:

```
const tagnator = require('tagnator')
```

Now, you can execute the `process` method:

```
tagnator.process(csvData, opts)
    .then(treatSuccess)
    .catch(treatError)
```

In case of a failure, you will get the error message in the `cache` statement.

In case of success, you will receive the **full html + css + js** for the page to run the same tool, but as a string.