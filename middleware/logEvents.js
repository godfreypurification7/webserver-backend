const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fsPromise = require('fs').promises;
const path = require('path');
const fs=require('fs');
const logEvents = async (message, logName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');

    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    console.log(logItem);

    try {
        if (!fs.existsSync(path.join(__dirname, '..','logs'))){
            await fsPromise.mkdir(path.join(__dirname, '..','logs'));
        }
        const log = path.join(__dirname, 'logs');

        // Append the log entry to the file
        await fsPromise.appendFile(
            path.join(__dirname, '..','logs', logName),
            logItem
        );
    } catch (err) {
        console.error('Failed to write log:', err);
    }
};

const logger = (req, res, next) => {
    const origin = req.headers.origin || 'no-origin';

    logEvents(
        `${req.method}\t${origin}\t${req.url}`,
        'reqLog.txt'
    );

    console.log(`${req.method} ${req.path}`);

    next();
};

module.exports = { logEvents, logger };

