// let sqlite3 = require("sqlite3");

// var dbConnection = function() {
//     let db = new sqlite3.Database('../database/mymo.db', sqlite3.OPEN_READWRITE, (err) => {
//         if (err) {
//             console.error(err.message);
//         } else {
//             console.log('Connected to the sqlite <Mymo> database.');
//         }
//       });
// }

// var insertQuery = function() {
//     const insertQuery = `
//         CREATE TABLE IF NOT EXISTS users(
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         email VARCHAR(100),
//         password VARCHAR(100)
//     )`;

//     return db.serialize(() => {
//     db.each(insertQuery);
//     });
// }

// var userRegister = function(value) {
//     const query = `INSERT INTO users(email, password) VALUES ('${value[0]}', '${value[1]}')`;
//     const getQuery = `SELECT * FROM wine`;
//     db.serialize();
//     db.each(query);
//     db.each(getQuery, function(err, table) {
//       console.log(table);
//     });
// }

// module.export.dbConnection() = dbConnection;
// module.export.insertQuery() = insertQuery;
// module.export.userRegister() = userRegister