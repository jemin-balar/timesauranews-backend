const { DEBUG } = process.env
// const path = require('path');
// const fs = require('fs');
// const morgan = require('morgan');

function success({ code, data, msg, message, res, extra }) {
    return res.status(code).json(
        {
            code: code,
            message: msg || message,
            data: data,
            ...extra
        }
    )
}

function error({ code, msg, message, res, extra, error, req, method = null }) {
    let errResp = {
        code: code,
        error: {
            msg: msg || message,
            extra
        }
    }
    if (DEBUG === 'true') {
        errResp.error.stack = error?.stack
        errResp.error.method = method
    }
    res.status(code).json(errResp)
    // storeLogsInFile({ req, errResp, error, method })
    return
}

// const storeLogsInFile = ({ req, errResp, error, method }) => {
//     try {
//         // Create a write stream (in append mode) for logging
//         const logDirectory = path.join(__dirname, '..', 'logs');
//         if (!fs.existsSync(logDirectory)) {
//             fs.mkdirSync(logDirectory);
//         }

//         errResp.error.stack = error?.stack
//         errResp.error.method = method
        
//         let errLog = {
//             date: new Date().toISOString(),
//             method: req?.method,
//             url: req?.url,
//             payload: {
//                 query: req?.query,
//                 body: req?.body,
//                 params: req?.params
//             },
//             ip: req?.ip,
//             headers: req?.headers,
//             UserInfo: req?.user,
//             error: errResp
//         }
        
//         const logStream = fs.createWriteStream(path.join(logDirectory, `${new Date().toLocaleDateString().replace(/\//g, '-')}.log`), { flags: 'a' });
        
//         // Write the error log to the file
//         logStream.write(JSON.stringify(errLog) + '\n');
        
//         // Setup morgan to use the log stream
//         const logger = morgan('combined', { stream: logStream });

        
//     } catch (error) {
//         console.log('Error while storing logs in file:', error);
//     }
// }

module.exports = {
    success,
    error
}