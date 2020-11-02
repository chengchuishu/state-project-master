import {app, BrowserWindow, ipcMain, Menu, MenuItem,nativeImage, shell, Tray, dialog,webFrame} from 'electron'

const path = require('path');

const LOGGER = require("electron-log");

const fs = require('fs');
const {api} = require('./api');
const decompress = require('decompress');

var menu = new Menu();

//var icon = require('../../static/icon/favicon.ico');

//app.commandLine.appendSwitch("--disable-http-cache"); //生产环境需要注释掉，减小图片重复下载时间

// console.log(app.getPath("userData"));

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let aboutWindow;
let closeConfirmWindow;
let tray = null;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;
// app.commandLine.appendSwitch("--disable-http-cache"); //禁用缓存
app.commandLine.appendSwitch('--disable-pinch'); //禁用缩放
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');//忽略证书相关错误

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 1200,
        width: 1600,
        frame: true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        },
        //fullscreen: true,
        autoHideMenuBar: true,
        // webPreferences: {
        //     nativeWindowOpen: true
        // }

        backgroundColor: "#f5f5f5"
    });

    mainWindow.loadURL(winURL);

    let contents = mainWindow.webContents
    contents.setLayoutZoomLevelLimits(1,1); //设置缩放等级
    contents.setVisualZoomLevelLimits(1,1);
    // mainWindow.webContents.openDevTools();//F12设置

    // Close the DevTools.
    // mainWindow.webContents.closeDevTools();

    mainWindow.on("close", (e) => {
        e.preventDefault();

        let dialogOption = {
            type: "question",
            buttons: ["取消", "确定"],
            message: "未保存的内容将丢失，确定要关闭么?",
        };

        dialog.showMessageBox(mainWindow, dialogOption, function(response){
            if (response === 1) {
                mainWindow.hide();
            }
        });

        //createCloseConfirmWindow();


    });

    mainWindow.onbeforeunload = (e) => {

        // 与通常的浏览器不同,会提示给用户一个消息框,
        //返回非空值将默认取消关闭
        //建议使用对话框 API 让用户确认关闭应用程序.
        e.returnValue = false; // 相当于 `return false` ，但是不推荐使用
    };

    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    //     //设置文件存放位置
    //     let folderPath = "./remotetemp";
    //     item.setSavePath(folderPath + `\\${item.getFilename()}`);
    //     item.on('updated', (event, state) => {
    //         if (state === 'interrupted') {
    //             console.log('Download is interrupted but can be resumed');
    //         } else if (state === 'progressing') {
    //             if (item.isPaused()) {
    //                 console.log('Download is paused');
    //             } else {
    //                 console.log(`Received bytes: ${item.getReceivedBytes()}`);
    //             }
    //         }
    //     });
    //     item.once('done', (event, state) => {
    //         if (state === 'completed') {
    //             console.log('Download successfully');
    //         } else {
    //             console.log(`Download failed: ${state}`);
    //         }
    //     });
    // });

    createAboutWindow();
}

/**
 *
 */
const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        width: 300,
        height: 400,
        autoHideMenuBar: true,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
    });

    // and load the about.html of the app.

    let aboutWindowUrl =  process.env.NODE_ENV === 'development'
        ? "file://" + path.resolve(__dirname, '../renderer/pages/about.html')
        : "file://" + path.resolve(__dirname, './static/about.html');

    aboutWindow.loadURL(aboutWindowUrl);

    // Close the DevTools.
    aboutWindow.webContents.closeDevTools();

    aboutWindow.on("close", (e) => {
        e.preventDefault();
        aboutWindow.hide();
    });

    aboutWindow.onbeforeunload = (e) => {

        // 与通常的浏览器不同,会提示给用户一个消息框,
        //返回非空值将默认取消关闭
        //建议使用对话框 API 让用户确认关闭应用程序.
        e.returnValue = false; // 相当于 `return false` ，但是不推荐使用
    };

    // Emitted when the window is closed.
    aboutWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.

        aboutWindow = null;
    });
};


/**
 *
 */
const createCloseConfirmWindow = () => {
    closeConfirmWindow = new BrowserWindow({
        parent: mainWindow,
        width: 400,
        height: 300,
        autoHideMenuBar: true,
        frame: false,
        show: true,
        modal: true,
        webPreferences: {
            nodeIntegration: true
        },
    });

    // and load the about.html of the app.

    /*let closeConfirmWindowUrl =  process.env.NODE_ENV === 'development'
        ? "file://" + path.resolve(__dirname, '../renderer/pages/closeconfirm.html')
        : "file://" + path.resolve(__dirname, './static/closeconfirm.html');*/
    let closeConfirmWindowUrl = path.join(__static,'pages','closeconfirm.html');

    closeConfirmWindow.loadURL(closeConfirmWindowUrl);

    // Close the DevTools.
    aboutWindow.webContents.closeDevTools();

    closeConfirmWindow.on("close", (e) => {
        e.preventDefault();
        closeConfirmWindow.hide();
    });

    closeConfirmWindow.onbeforeunload = (e) => {

        // 与通常的浏览器不同,会提示给用户一个消息框,
        //返回非空值将默认取消关闭
        //建议使用对话框 API 让用户确认关闭应用程序.
        e.returnValue = false; // 相当于 `return false` ，但是不推荐使用
    };

    // Emitted when the window is closed.
    closeConfirmWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.

        closeConfirmWindow = null;
    });
};

/**
 *
 */
const initTray = () => {
    let image = nativeImage.createFromPath('./static/icon/favicon.ico');
    tray = new Tray(image);

    const trayMenuTemplate = [
        {
            label: '打开主窗口',
            type: 'normal',
            click() {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        {
            label: '帮助',
            type: 'normal',
            click() {
                openHelpPage();
            }
        },
        {
            label: '关于',
            type: 'normal',
            click() {
                openAboutWindow();
            }
        },
        {
            label: '退出',
            type: 'normal',
            click() {
                app.exit();
            }
        }
    ];

    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
    tray.on("double-click", function () {
        mainWindow.show();
        mainWindow.focus();
    });
    /*menu.append(new MenuItem({
      label: 'Print',
      accelerator: 'X+P',
      click: () => { app.exit }
    }))*/
};


// 关键代码在这里
/**
 *
 * @type {boolean}
 */
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore()
        }
    }
    mainWindow.focus()
  })
}
// const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
//     if (mainWindow) {
//         mainWindow.show();
//         if (mainWindow.isMinimized()) {
//             mainWindow.restore();
//         }
//         mainWindow.focus();
//     }
//     return true;
// });
// if (shouldQuit) {
//     app.quit();
// }
// 关键代码在这里

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    LOGGER.transports.console.level = 'info';
    LOGGER.transports.file.level = 'info';
    LOGGER.transports.file.file = './log-' + dateFormat(new Date(), "yyyyMMdd") + '.log';

    createWindow();
    initTray();
    doAction();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 *
 */
const openHelpPage = () => {
    shell.openExternal("https://vr.mmall.com/help.html");
};

/**
 *
 */
const openAboutWindow = () => {
    if (aboutWindow) {
        aboutWindow.show();
    } else {
        createAboutWindow();
        aboutWindow.show();
    }
};


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('download', (evt, args) => {
    let downloadpath = args;
    evt.sender.send('tips', downloadpath);
    mainWindow.webContents.downloadURL(downloadpath);
});

ipcMain.on('checkUpdates', (evt, args) => {
    // evt.sender.send('tips', args); //？？？不知道什么意思
    checkUpdates();
});

ipcMain.on('closeAbout', (evt, args) => {
    // evt.sender.send('tips', args); //？？？不知道什么意思
    if (aboutWindow) {
        aboutWindow.hide();
    }
});
ipcMain.on('doCloseMainWin', (evt, args) => {
    // evt.sender.send('tips', args); //？？？不知道什么意思
    /*if (closeConfirmWindow) {
        closeConfirmWindow.close();
    }*/
    if (mainWindow) {
        app.exit()
    }
});
ipcMain.on('cancelCloseMainWin', (evt, args) => {
    // evt.sender.send('tips', args); //？？？不知道什么意思
    if (closeConfirmWindow) {
        closeConfirmWindow.close();
    }
});

/**
 *
 */
const doAction = () => {
    //定时任务
    setInterval(checkUpdates, 3600 * 1000 * 12); //每12小时更新一次
    checkUpdates(); //首次启动时检查
};

/**
 *
 */
const checkUpdates = () => {

    console.log("check update start");
    LOGGER.warn("AAAAA");

    //读取本地资源信息表
    let source = null;
    /*let data = fs.readFileSync('./static/localinfo/info.json', 'utf8');
    if (data) {
        source = JSON.parse(data);
    }*/
    console.log(source);

    //然后访问远程服务器，获取服务器上的资源信息
    api.getMedias(0, 1000).then(function (res) {
        if (res.code === 200) {
            if (res.data && res.data.content) {
                let data = res.data.content;
                //跟本地的比较, 比较source 与 data
                doCompare(source, data);
            } else {
                console.log("check update fail, no data");
            }
        }
    }).catch(function (error) {
        console.log(error);
    });
};

/**
 *
 * @param source
 * @param data
 */
const doCompare = (source, data) => {
    let todoList = {
        toAddList: [],
        toUpdateList: [],
        toDeleteList: []
    };
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let id = item.id.toString();
        if (source.hasOwnProperty(id.toString())) {
            //存在，判断是否需要更新
            let localItem = source[id.toString()];
            if (localItem.version_no !== item.version_no) {
                //需要更新
                todoList.toUpdateList.push(item);
            }
        } else {
            //需要增加
            todoList.toAddList.push(item);
        }
    }
    //检查本地需要删除的素材
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            let localItem = source[key];
            let exist = false;
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                if (item.id.toString() === localItem.id.toString()) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                //需要删除
                let obj = {
                    id: localItem.id,
                    media_keyname: localItem.media_keyname
                };
                todoList.toDeleteList.push(obj);
            }
        }
    }

    downloadFiles(source, data, todoList);
};

/**
 *
 * @param source
 * @param data
 * @param todoList
 */
const downloadFiles = (source, data, todoList) => {

    //读取todoList
    let toAddNum = todoList.toAddList.length;
    let toUpdateNum = todoList.toUpdateList.length;
    let toDeleteNum = todoList.toDeleteList.length;
    if (toAddNum === 0 && toUpdateNum === 0 && toDeleteNum === 0) {
        console.log("check update finish, current local resources are latest")
    } else {
        if (toAddNum > 0) {
            console.log(toAddNum + " modules need to be added");
        }
        if (toUpdateNum > 0) {
            console.log(toUpdateNum + " modules need to be updated");
        }
        if (toDeleteNum > 0) {
            console.log(toDeleteNum + " modules need to be deleted");
        }

        doAdd(source, data, todoList);
    }
};

/**
 *
 * @param source
 * @param data
 * @param todoList
 */
const doAdd = (source, data, todoList) => {

    let toAddList = todoList.toAddList;
    if (toAddList.length === 0) {
        doUpdate(source, data, todoList);
    } else {
        let localCurrentInfo = source;
        //对每个待添加资源，访问后端服务器下载资源并解压至相应文件夹

        Promise.all(toAddList.map(item => {
            return new Promise((resolve, reject) => {
                api.downloadModule(item, function () {
                    unzipFiles(item, function () {
                        localCurrentInfo[item.id.toString()] = item;
                        resolve();
                    });
                });
            });
        })).then(() => {
            doUpdate(localCurrentInfo, data, todoList);
        });
    }
};

/**
 *
 * @param source
 * @param data
 * @param todoList
 */
const doUpdate = (source, data, todoList) => {

    let toUpdateList = todoList.toUpdateList;
    if (toUpdateList.length === 0) {
        doDelete(source, data, todoList);
    } else {
        let localCurrentInfo = source;
        //对每个待更新资源，访问后端服务器下载资源并解压至相应文件夹

        Promise.all(toUpdateList.map(item => {
            return new Promise((resolve, reject) => {
                api.downloadModule(item, function () {
                    unzipFiles(item, function () {
                        localCurrentInfo[item.id.toString()] = item;
                        resolve();
                    });
                });
            });
        })).then(() => {
            doDelete(source, data, todoList);
        });
    }
};

/**
 *
 * @param source
 * @param data
 * @param todoList
 */
const doDelete = (source, data, todoList) => {

    let localCurrentInfo = source;

    let toDeleteList = todoList.toDeleteList;
    if (toDeleteList.length > 0) {
        //对每个待删除资源，访问后端服务器下载资源并解压至相应文件夹
        toDeleteList.map(item => {
            let media_keyname = item.media_keyname;
            deleteAll("./static/localprojects/" + media_keyname + "/");
            delete localCurrentInfo[item.id.toString()];
        });
    }

    let destString = JSON.stringify(localCurrentInfo);
    fs.writeFile("./static/localinfo/info.json", destString, function () {
        cleanTempFolder();
        console.log("resource updated successfully");
    });
};

/**
 *
 */
const cleanTempFolder = () => {
    deleteAll("./static/remotetemp/");
    fs.mkdirSync("./static/remotetemp");
};

/**
 *
 * @param item
 * @param callback
 */
const unzipFiles = (item, callback) => {

    let source = './static/remotetemp/' + item.media_keyname + '.zip';
    let target = './static/localmedia/' + item.media_keyname;
    decompress(source, target).then((files) => {
        callback();
    });
};

/**
 *
 * @param path
 */
const deleteAll = (path) => {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteAll(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};



/**
 * 把一个日期变量按照给定格式输出
 * @param format
 * @param date
 * @returns {string}
 */
const dateFormat = (date, format) => {
    let obj = {
        year: date.getFullYear(),
        month: (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1, //月份
        day: date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
        hour: date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
        minite: date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
        second: date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
    };
    if (format === null || format === undefined || format === "yyyy-MM-dd HH:mm:ss") {
        return obj.year + "-" + obj.month + "-" + obj.day
            + " "
            + obj.hour + ":" + obj.minite + ":" + obj.second;
    } else if (format === "yyyy-MM-dd") {
        return obj.year + "-" + obj.month + "-" + obj.day;
    } else if (format === "yyyyMMdd") {
        return obj.year + obj.month + obj.day;
    } else {
        throw new Error("format not supported");
    }
};
