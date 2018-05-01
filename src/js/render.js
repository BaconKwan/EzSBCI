var ts = new Vue({
    el: '#ts',
    data: {
        current: 0,
        status: 'process',
        list: [['上传', '上传SampleSheet文件'], ['填写', '填写各个样品的数据量'], ['结果', '显示评估结果']],
    }
});

var dt = new Vue({
    el: '#dt',
    data: {
        show: false,
        line: []
    }
})
var uf = new Vue({
    el: '#uf',
    data: {
        show: true,
        file: null
    },
    methods: {
        upload() {
            var ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('upload-dialog');
            ipcRenderer.on('upload-reply-path', function(event, arg) {
                uf.file = arg;
            });
            ipcRenderer.on('upload-reply-array', function(event, arg) {
                dt.show = true;
                dt.line = arg;
            })
        }
    }
})