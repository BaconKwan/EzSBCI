var ts = new Vue({
    el: '#ts',
    data: {
        current: 0,
        status: 'process',
        list: [{title: '上传', msg: '请上传SampleSheet文件'}, {title: '填写', msg: '填写各个样品的数据量'}, {title: '结果', msg: '显示评估结果'}],
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
            ipcRenderer.on('upload-reply-csv', function(event, arg) {
                ts.current = 1;
                ts.status = 'process';
                ts.list[0]['msg'] = '文件上传成功';
                dt.show = true;
                dt.line = arg.data;
            });
            ipcRenderer.on('upload-reply-err', function(event, arg) {
                ts.current = 0;
                ts.status = 'error';
                ts.list[0]['msg'] = '文件上传失败';
                dt.show = false;
                dt.line = [];
            });
        }
    }
})