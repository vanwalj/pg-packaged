'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const download = require('pg-download');

const osBinExt = {
  darwin: '',
  win32: '.exe'
};

module.exports = class PG {
  constructor () {
    this._downloadDir = path.join(__dirname, '../binaries');
    this._osExtension = osBinExt[os.platform()];
    this._dataFolder = path.join(__dirname, '../data');
  }

  upgrade () {
    return this.version()
      .catch(() => {
        return download({
          downloadDir: this._downloadDir
        })
      });
  }

  download () {
    return download({
      downloadDir: this._downloadDir
    })
  }

  init () {
    return childProcess.spawnSync(path.join(this._downloadDir, `pgsql/bin/initdb${ this._osExtension }`), [this._dataFolder])
  }

  version () {
    return new Promise((resolve, reject) => {
      const process = childProcess.spawn(path.join(this._downloadDir, `pgsql/bin/postgres${ this._osExtension }`), ['--version']);
      process.stdout.setEncoding('utf-8');
      process.stderr.setEncoding('utf-8');
      process.stdout
        .on('data', data => {
          return resolve(data);
        });
      process.stderr
        .on('data', data => {
          return reject(data);
        });
    });
  }

  start ({ port } = {}) {
    return new Promise((resolve, reject) => {
      const command = ['-D', this._dataFolder];
      if (port) {
        command.push('-p', port);
      }
      this._process = childProcess.spawn(path.join(this._downloadDir, `pgsql/bin/postgres${ this._osExtension }`), command);
      this._process.stdout.setEncoding('utf-8');
      this._process.stderr.setEncoding('utf-8');

      this._process.stderr
        .on('data', data => {
          console.log(data);
          if (data.match(/database system is ready to accept connections/)) {
            return resolve(data);
          }
        });
      this._process.on('close', code => {
        if (code === 0) {
          return resolve(code);
        } else {
          return reject(code);
        }
      });
    });
  }

  createUser (user) {
    return new Promise((resolve, reject) => {
      const process = childProcess.spawn(path.join(this._downloadDir, `pgsql/bin/createuser${ this._osExtension }`), [user]);
      process.stdout.setEncoding('utf-8');
      process.stderr.setEncoding('utf-8');
      process.stderr
        .on('data', data => {
          console.log(data);
        });
      process.on('close', code => {
        if (code === 0) {
          return resolve(code);
        } else {
          return reject(code);
        }
      });

    });
  }

  createDB (db, user) {
    return new Promise((resolve, reject) => {
      const command = [db];
      if (user) {
        command.push('-O', user);
      }
      const process = childProcess.spawn(path.join(this._downloadDir, `pgsql/bin/createdb${ this._osExtension }`), command);
      process.stdout.setEncoding('utf-8');
      process.stderr.setEncoding('utf-8');
      process.stderr
        .on('data', data => {
          console.log(data);
        });
      process.on('close', code => {
        if (code === 0) {
          return resolve(code);
        } else {
          return reject(code);
        }
      });
    });
  }

  stop () {
    return new Promise((resolve, reject) => {
      if (this._process) {
        this._process.kill();
        return resolve();
      }
      return reject();
    });
  }
};
