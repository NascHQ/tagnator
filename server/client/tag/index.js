const fs = require('fs-extra');
const attendeePath = './server/data/attendees/';

async function findAttendeeData (req) {
    return new Promise(async (resolve, reject) => {
        const data = {};
        if (req.query.email) {
            data.email = req.query.email;
            data.name = req.query.name || req.query.email.split('@')[0];
            resolve(data);
        } else {
            if (req.query.code) {
                const p = attendeePath + req.query.code + '.txt';
                fs.readFile(p, (err, data) => {
                    if (err) {
                        // attendee does not exist
                        reject('Attendee not found');
                    } else {
                        data = data.toString().split('|');
                        data = {
                            email: data[0],
                            name: data[1]
                        }
                        resolve(data);
                    }
                });
            } else {
                resolve(null);
            }
        }
    });
}

module.exports = {
    findAttendeeData
};