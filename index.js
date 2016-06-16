'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), '/'));

const init = module.exports.init = path => childProcess.spawnSync(path.join(__dirname, 'binaries/postgresql-9.5.3-1-windows-x64-binaries/pgsql/bin/initdb.exe'), [path]);
const start = path => childProcess.spawn(path.join(__dirname, 'binaries/postgresql-9.5.3-1-windows-x64-binaries/pgsql/bin/postgres.exe'), ['-D', path]);

init();
const postgres = start();

postgres.stdout.setEncoding('utf-8');
postgres.stderr.setEncoding('utf-8');

postgres.stdout
    .on('data', data => {
        console.log(data);
    });

postgres.stderr
    .on('data', data => {
        console.log(data);
    });

postgres.on('close', code => {
    console.log('Process exit with code', code);
});