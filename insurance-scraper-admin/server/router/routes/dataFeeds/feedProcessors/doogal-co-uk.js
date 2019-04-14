const parseCSV = require('csv-parse');
const fs = require('fs');
const uuid = require('uuid');
const moment = require('moment');

const commonCSVParseOptions = {
    quote: '"',
    ltrim: true,
    rtrim: true,
    delimiter: ',',
}

const parseHeader = (filePath) => {
    return new Promise((resolve, reject) => {
        let header = [];

        fs.createReadStream(filePath)
            .pipe(parseCSV({
                ...commonCSVParseOptions,
                to_line: 1,
            }))
            .on('data', (data) => {
                header = data;
            })
            .on('error', err => reject(err))
            .on('end', () => {
                if (!header.length) {
                    return reject('No header found');
                }

                return resolve(header);
            });
    })
};

const parseData = (database, file, header, onStep, fileProcessId) => {
    return new Promise((resolve, reject) => {
        let lineCounter = 0;

        fs.createReadStream(file.path)
            .pipe(parseCSV({
                ...commonCSVParseOptions,
                from_line: 2,
            }))
            .on('data', (row) => {
                lineCounter++;

                const data = {};
                header.forEach((key, index) => {
                    data[key.toLowerCase()] = row[index];
                });

                saveToDB(database, data, fileProcessId)
                    .then(() => onStep(`Line ${lineCounter} is processed`))
                    .catch(reject)
            })
            .on('error', (err) => {
                reject(err)
            })
            .on('end', () => {
                resolve();
            });
    })
};

const saveToDB = (db, rowData, fileProcessId) => {
    return new Promise(async (resolve, reject) => {
        const postCode = rowData.postcode.replace(' ', '');

        const exists = await db.collection('RAW_POSTCODES')
            .find({ postCode })
            .toArray()
            .then((records) => {
                if (records.length) {
                    return true;
                }
            })
            .catch(reject);

        if (exists) {
            db.collection('RAW_POSTCODES')
                .updateOne({ postCode }, {
                    $set: {
                        lastUpdated: moment().toDate(),
                    },
                    $push: {
                        data: {
                            fileProcessId,
                            dateCreated: moment().toDate(),
                            data: rowData,
                        },
                    }
                })
                .then(() => resolve())
                .catch(reject);
        } else {
            db.collection('RAW_POSTCODES')
                .insert({
                    postCode,
                    dateCreated: moment().toDate(),
                    lastUpdated: moment().toDate(),
                    data: [{
                        fileProcessId,
                        dateCreated: moment().toDate(),
                        data: rowData,
                    }],
                })
                .then(() => resolve())
                .catch(reject)
        }
    });
}

function processFeedDoogalCoUk(database, file, fileProcessId) {
    const onContinue = (header, onStep, onDone) => {
        parseData(database, file, header, onStep, fileProcessId)
            .then(() => onDone(null, 'doogal.co.uk file processing finished successfully'))
            .catch(err => onDone(err));
    }

    return new Promise((resolve, reject) => {
        parseHeader(file.path)
            .then(header => {
                // console.log('header: ', header)
                resolve({
                    message: 'Header proccesed successfully',
                    onContinue: (onStep, onDone) => onContinue(header, onStep, onDone),
                });
            })
            .catch(err => reject(err));
    });
}



module.exports = processFeedDoogalCoUk;
