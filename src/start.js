////////////////////////////////////// REQUIRES /////////////////////////////////////////

const electron = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

///////////////////////////////// ELECTRON SETTING //////////////////////////////////////

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const ipcMain = electron.ipcMain
const session = electron.session

////////////////////////////////////// DB SETTING ///////////////////////////////////////

// DB path
const dbPath = path.resolve(__dirname, 'mymo.db')

// DB Connection
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the sqlite <Mymo> database.');
    }
});

// DB Query setting
const insertUsersTable = `
    CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100),
    password VARCHAR(100)
    )`;
const insertMemosTable = `
    CREATE TABLE IF NOT EXISTS memos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owned_by INTEGER,
    title VARCHAR(100),
    description TEXT,
    second_pwd VARCHAR(100),
    title_color VARCHAR(50) DEFAULT 'black',
    is_shared BOOLEAN DEFAULT 0,
    FOREIGN KEY(owned_by) REFERENCES users(id)
    )`;
const insertShareTable = `
    CREATE TABLE IF NOT EXISTS memo_share(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    memo_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(memo_id) REFERENCES memos(id)
    )`;
const dropMemosTable = `DROP TABLE memos`;
const dropShareTable = `DROP TABLE memo_share`;
db.serialize(() => {
    //db.each(dropMemosTable);
    db.each(insertUsersTable);
    db.each(insertMemosTable);
    db.each(insertShareTable);
    //db.each(dropShareTable);
});

////////////////////////////////////// JWT SETTING ///////////////////////////////////////

function jwtSetting(Email, Password, nameOfRequest) {
    // User data to set jwt data
    const userData = {
        email: Email,
        password: Password
    }
    
    // jwt setting
    jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: '7d'}, (err, token) => {
        if(err) {
            console.log(err)
        }
        
        const userData = [Email, token];                        
                            
        return mainWindow.webContents.send(nameOfRequest, userData)      // right, send data to ipcRenderer
    });
}

//////////////////////////////////////////////////////////////////////////////////////////

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  )

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

//template for menu
const mainMenuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: "Chrome dev tools",
          accelerator: 'Ctrl+D',
          click() {BrowserWindow.getFocusedWindow().webContents.openDevTools()}
        },
        {
          label: "Setting",
          accelerator: 'Ctrl+O',
          click() {settingWindow()}
        },
        {
          label: "Quit",
          accelerator: 'Ctrl+Q',
          click() {app.quit()}
        }
      ]
    }
];

// build up the menu
let menu = Menu.buildFromTemplate(mainMenuTemplate);
Menu.setApplicationMenu(menu)

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})



////////// Register //////////
ipcMain.on('register-userInfo', (e, item) => {
    console.log(item);
    ///// User seeking to find the same value /////
    const getQuery = `SELECT count(*) as count FROM users WHERE email='${item[0]}'`;
    db.each(getQuery, function(err, data) {
        if (data.count === 0) {
            ///// Password Hash Setting /////
            const saltRounds = 10;
            bcrypt.hash(item[1], saltRounds, (err, hash) => {
                ///// User Regiser DB Setting /////
                const query = `INSERT INTO users(email, password) VALUES ('${item[0]}', '${hash}')`;
                db.serialize();
                jwtSetting(item[0], hash, 'registered')             // jwt setting and send data
                console.log('register success')
                return db.each(query);                
            })
        } else {
            return console.log('This email already exists')
        }
    }) 
})



////////// Sign In //////////
ipcMain.on('signin-userInfo', (e, item) => {
    console.log(item);
    ///// User seeking to find the same value /////
    const emailGetQuery = `SELECT count(*) as count FROM users WHERE email='${item[0]}'`;
    const passwordGetQuery = `SELECT password FROM users WHERE email='${item[0]}'`;

    ///// Match the userdata with database /////
    db.each(emailGetQuery, function(err, data) {
        if (data.count === 1) {                                            // email exists
            db.serialize();
            db.each(passwordGetQuery, function(err, data) {                // match password
                bcrypt.compare(item[1], data.password, (err, res) => {     // compare the hashed password and user input password
                    if (!res) return console.log('wrong password')         // wrong password

                    jwtSetting(item[0], data.password, 'signedin')         // jwt setting and send data
                })
            })
        }
    })
})


//////// Memo App //////////
ipcMain.on('prepare-memo', (e, email) => {
    const userGetQuery = `SELECT  * FROM users WHERE users.email='${email}'`
    db.each(userGetQuery, (e, data) => {
        console.log(data)
        const memoGetQuery = `SELECT * FROM memos WHERE owned_by=${data.id}`
        db.all(memoGetQuery, (e, memoData) => {
            mainWindow.webContents.send('user-memos', memoData);
        })

        const sharedMemoQuery = `SELECT memo_share.memo_id, memos.title, memos.description, memos.owned_by, users.email as owner_email, memo_share.user_id 
                                 FROM memos
                                 INNER JOIN memo_share ON memo_share.memo_id=memos.id
                                 INNER JOIN users ON memos.owned_by=users.id
                                 WHERE memo_share.user_id=${data.id}`;
        db.each(sharedMemoQuery, (e, data) => {
            console.log(data)
            mainWindow.webContents.send('shared-memos', data);
        })

    })
})


//////// New Memo Create //////////
ipcMain.on('new-memo', (e, receivedData) => {
    const userGetQuery = `SELECT * FROM users WHERE email='${receivedData[2]}'`
    db.each(userGetQuery, (err, data) => {
        console.log(data)
        const insertNewMemoQuery = `INSERT INTO memos(title, description, owned_by) VALUES ('${receivedData[0]}', '${receivedData[1]}', '${data.id}')`;
        db.each(insertNewMemoQuery);
    })
})


//////// Memo Delete //////////
ipcMain.on('delete-memo', (e, data) => {
    console.log(data);
    const memoDeleteQuery = `DELETE FROM memos WHERE id='${data}'`
    db.serialize();
    return db.each(memoDeleteQuery);
})


//////// Memo Edit //////////
ipcMain.on('edit-memo', (e, data) => {
    console.log(data);
    const memoUpdateQuery = `UPDATE memos SET title='${data[1]}', description='${data[2]}' WHERE id='${data[0]}'`
    db.serialize();
    return db.each(memoUpdateQuery);
})


//////// Memo Share - find insert email //////////
ipcMain.on('share-user-email', (e, data) => {
    const countUserQuery = `SELECT count(*) as count FROM users WHERE email='${data[0]}'`;
    const selectUserQuery = `SELECT * FROM users WHERE email='${data[0]}'`;

    db.each(countUserQuery, (e, item) => {
        if(item.count === 0) {
            console.log('No data')
        }
        
        db.each(selectUserQuery, (e, value) => {
            if(value.id === data[1]) {
                console.log('user inserted his email')
                return mainWindow.webContents.send('share-same-user', null);
            }

            return mainWindow.webContents.send('found-user', value);
        })
    })
})


//////// Memo Share - insert user list //////////
ipcMain.on('share-list-users', (e, data) => {
    console.log('----------------------------')
    console.log(data[1][0]);

    if (data[1].length > 1) {
        console.log(data[1].length);
        for(var i=0; i<data[1].length; i++) {
            const insertShareMultiUserQuery = `INSERT INTO memo_share(user_id, memo_id) VALUES ('${data[1][i]}', '${data[0]}')`;

            db.each(insertShareMultiUserQuery);
        }
    } else {
        const insertShareUserQuery = `INSERT INTO memo_share(user_id, memo_id) VALUES ('${data[1]}', '${data[0]}')`
        db.each(insertShareUserQuery)
    }

})