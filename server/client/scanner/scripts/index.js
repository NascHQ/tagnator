(function () {
    const DBOpenRequest = window.indexedDB.open("qr-code-read", 4);
    let PRINTER_SERVER = '';
    const opts = {
        cb: document.getElementById('save-to-clipboard'),
        al: document.getElementById('append-to-list'),
        bs: document.getElementById('bip'),
        cs: document.getElementById('checkin'),
    };
    const printer = document.getElementById('printer');
    opts.cb.addEventListener('click', event => {
        navigator.clipboard.readText()
        .then(text => {})
        .catch(err => {});
    });

    opts.cb.addEventListener('change', event => {
        if (event.target.checked) {
            localStorage.setItem('save-to-clipboard', 1);
        } else {
            localStorage.removeItem('save-to-clipboard');
        }
    });
    opts.bs.addEventListener('change', event => {
        if (event.target.checked) {
            localStorage.setItem('make-sound', 1);
        } else {
            localStorage.removeItem('make-sound');
        }
    });

    opts.al.addEventListener('change', event => {
        if (event.target.checked) {
            let el = document.getElementById('list-id');
            el.disabled = false;
            if (el.value === '') {
                const d = new Date();
                const dt = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
                el.value = dt;
            }
            el.select();
        } else {
            document.getElementById('list-id').disabled = true;
            localStorage.removeItem('list-id');
        }
    });

    if (localStorage.getItem('list-id')) {
        document.getElementById('list-id').value = localStorage.getItem('list-id') || '';
        opts.al.checked = true;
        document.getElementById('list-id').disabled = false;
    }

    opts.cs.addEventListener('change', event => {
        if (event.target.checked) {
            let el = document.getElementById('checkin-server');
            el.disabled = false;
            if (el.value === '') {
                el.value = location.origin;
            }
            el.select();
        } else {
            document.getElementById('checkin-server').disabled = true;
            localStorage.removeItem('checkin-server');
        }
    });
    if (localStorage.getItem('checkin-server')) {
        document.getElementById('checkin-server').value = localStorage.getItem('checkin-server') || '';
        opts.cs.checked = true;
        document.getElementById('checkin-server').disabled = false;
    }

    if (localStorage.getItem('save-to-clipboard')) {
        opts.cb.checked = true;
    }

    if (localStorage.getItem('make-sound')) {
        opts.bs.checked = true;
    }

    document.getElementById('start-btn').addEventListener('click', event => {
        if (opts.al.checked) {
            localStorage.setItem('list-id', document.getElementById('list-id').value);
        }
        if (opts.cs.checked) {
            PRINTER_SERVER = document.getElementById('checkin-server').value;
            localStorage.setItem('checkin-server', PRINTER_SERVER);
        }
        document.body.dataset.initiated = true;

        QRScanner.initiate({
            singleScan: false,
            // match: /^[a-zA-Z0-9]{16,18}$/, // optional
            onReady: _ => {
                document.body.dataset.scannerReady = true;
                QRScanner.pause();
            },
            onResult: function (result) {
                if (opts.cb.checked) {
                    copyToClipBoard(result);
                }
                if (opts.al.checked) {
                    appendToList(result);
                }
                if (opts.bs.checked) {
                    QRScanner.beep();
                }
                if (result && opts.cs) {
                    // printer.src = PRINTER_SERVER + '?name=felipe&email=hasldjad';
                    printer.src = PRINTER_SERVER + '?find=' + result;
                }
            },
            onError: function (err) { console.error('ERR :::: ', err); }, // optional
            onTimeout: function () { console.warn('TIMEDOUT'); } // optional
        });
    });

    function copyToClipBoard (data) {
        navigator.clipboard.writeText(data)
        .then(() => {
            console.log('Copied to clipboard');
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function appendToList (data) {
        DBOpenRequest.onsuccess = function(event) {
        note.innerHTML += '<li>Database initialised.</li>';
            // store the result of opening the database in the db variable.
            // This is used a lot below
            db = DBOpenRequest.result;
                
            // Run the addData() function to add the data to the database
            addData();
        };

        function addData() {
            // Create a new object ready to insert into the IDB
            var newItem = [ { taskTitle: "Walk dog", hours: 19, minutes: 30, day: 24, month: "December", year: 2013, notified: "no" } ];

            // open a read/write db transaction, ready for adding the data
            var transaction = db.transaction(["toDoList"], "readwrite");

            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function(event) {
                note.innerHTML += '<li>Transaction completed.</li>';
            };

            transaction.onerror = function(event) {
            note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
            };

            // create an object store on the transaction
            var objectStore = transaction.objectStore("toDoList");

            // Make a request to add our newItem object to the object store
            var objectStoreRequest = objectStore.add(newItem[0]);

            objectStoreRequest.onsuccess = function(event) {
                // report the success of our request
                note.innerHTML += '<li>Request successful.</li>';
            };
        };
    }

    function startScanning (event) {
        if (event) {
            event.preventDefault && event.preventDefault();
            event.stopPropagation && event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
            this.dataset.pressed = true;
        }
        QRScanner.release();
    }

    function stopScanning (event) {
        QRScanner.pause();
        this.dataset.pressed = false;
    }

    document.getElementById('qr-reader-btn').addEventListener('mousedown', startScanning);
    document.getElementById('qr-reader-btn').addEventListener('touchstart', startScanning);
    document.getElementById('qr-reader-btn').addEventListener('mouseup', stopScanning);
    document.getElementById('qr-reader-btn').addEventListener('touchend', stopScanning);
})();