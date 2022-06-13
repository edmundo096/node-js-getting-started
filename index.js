const express = require('express')
const path = require('path')
const cool = require('cool-ascii-faces')
const { Pool } = require('pg');
const PORT = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
(async () => { // DB seed.
  let client;
  try { client = await pool.connect(); await client.query('SELECT * FROM test_table'); }
  catch (err) {
    if (err.message === 'relation "test_table" does not exist')
      await client.query('create table test_table (id integer, name text); insert into test_table values (1, \'hello database\');');
  } finally { client.release(); }
})();

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    } finally {
      client.release();
    }
  })
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => res.send(showTimes()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const showTimes = () => {
  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return result;
}
