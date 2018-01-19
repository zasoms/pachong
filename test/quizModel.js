const mysql = require('mysql')
const config = {
  database: 'tnwz',
  user: 'root',
  password: 'root',
  port: '3306',
  host: 'localhost'
}
const pool = mysql.createPool(config)

let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(JSON.parse(JSON.stringify(rows)))
          }
          connection.release()
        })
      }
    })
  })
}

const findOne = (quiz) => {
  let _sql = `select * from quiz where quiz="${quiz}"`
  return query(_sql).then(res => res[0])
}

const save = (value) => {
  let { quiz, options, school, type, contributor, endTime, curTime, answer, createAt, updateAt} = value
  options = options.join(', ')
  let _sql = 'insert into quiz set quiz=?,options=?,school=?,type=?,contributor=?,endTime=?,curTime=?, answer=?,createAt=?,updateAt=?'
  return query(_sql, [quiz, options, school, type, contributor, endTime, curTime, answer, createAt, updateAt])
}

const count = () => {
  let _sql = 'select * from quiz'
  return query(_sql)
}

module.exports =  {
  findOne,
  save,
  count
}