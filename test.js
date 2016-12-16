'use strict';

const Chance = require('chance');
const chance = new Chance();
const PG = require('./');

describe('test', function () {
  this.timeout(8000);
  it('should work', function () {
    const pg = new PG();

    const user = chance.string();
    const db = chance.string();

    return pg.upgrade()
      .then(() => pg.init())
      .then(() => pg.start())
      .then(() => pg.createUser(user))
      .then(() => pg.createDB(db, user))
      .then(() => pg.stop())

  });
});
