const {app, BrowserWindow} = require('electron');

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow;

function createWindow() {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({width: 1366, height: 768});

    // 加载应用的 index.html。
    mainWindow.loadURL(`file://${__dirname}/../html/index.html`);

    // 启用开发工具。
    // mainWindow.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    mainWindow.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null;
    });
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且该应用没有打开的窗口时，
    // 绝大部分应用会重新创建一个窗口。
    if (mainWindow === null) {
        createWindow();
    }
});

// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
const ipcMain = require('electron').ipcMain;
const dialog  = require('electron').dialog;
const fs      = require('fs');
const Papa    = require('papaparse');

ipcMain.on('upload-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile']
    }, function (files) {
        if (files) {
            var path = files[0];
            event.sender.send('upload-reply-path', path);
            fs.readFile(path, 'utf8', function (err, data) {
                if(err) {
                    event.sender.send('upload-reply-err');
                    return console.log(err);
                }
                else{
                    var tmp = data.split(/[\r\n]+/);
                    var skip = true;
                    while(skip) {
                        var item = tmp.shift();
                        if(item.indexOf('[Data]') == 0){
                            skip = false
                        }
                    }
                    var csv = Papa.parse(tmp.join('\r\n'), {header: true});
                    if ('Sample_ID' in csv.meta.fields && 'Sample_Name' in csv.meta.fields && 'index' in csv.meta.fields && 'index2' in csv.meta.fields) {
                        event.sender.send('upload-reply-err');
                    }
                    else{
                        event.sender.send('upload-reply-csv', csv);
                    }
                }
            });
        }
    });
});