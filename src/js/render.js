var ts = new Vue({
    el: '#ts',
    data: {
        current: 0,
        status: 'process',
        list: [{title: '上传', msg: '请上传SampleSheet文件'}, {title: '填写', msg: '填写各个样品的数据量'}, {title: '结果', msg: '显示评估结果'}],
    }
})

var dt = new Vue({
    el: '#dt',
    data: {
        show: false,
        line: [],
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
            var ipcRenderer = require('electron').ipcRenderer
            ipcRenderer.send('upload-dialog')
            ipcRenderer.on('upload-reply-path', function(event, arg) {
                uf.file = arg
            })
            ipcRenderer.on('upload-reply-csv', function(event, arg) {
                ts.current = 1
                ts.status = 'process'
                ts.list[0]['msg'] = '文件上传成功'
                dt.show = true
                dt.line = arg.data
                dt.line.forEach(element => {
                    element['Volume'] = 1
                })
                run.show = true
            })
            ipcRenderer.on('upload-reply-err', function(event, arg) {
                ts.current = 0
                ts.status = 'error'
                ts.list[0]['msg'] = '失败，文件格式错误'
                dt.show = false
                dt.line = []
                run.show = false
            })
        }
    }
})

var back = new Vue({
    el: '#back',
    data: {
        show: false
    },
    methods: {
        back() {
            this.show = false
            Pstat.show = false
            uf.show = true
            dt.show = true
            run.show = true
            ts.current = 1
            ts.status = 'process'
        }
    }
})

var Pstat = new Vue({
    el: '#Pstat',
    data: {
        msg: "检查通过",
        mm: null,
        mmcheck: false,
        show: false,
        data: null
    }
})

var run = new Vue({
    el: '#run',
    data: {
        show: false,
    },
    methods: {
        check() {
            var stats = new Array()
            var mmStats = new Array()
            var minMisMatch = 999
            dt.line.forEach(element => {
                var barcode = element["index"] + element["index2"]
                var name = element["Sample_ID"] + '.' + element["Sample_Name"]
                for(var i = 0; i < barcode.length; i++) {
                    if(stats[i] == undefined){
                        function AGCT(AC, GT) {
                            this.AC = Number(AC)
                            this.GT = Number(GT)
                            this.class = "background-color: #19be6b"
                        }
                        var obj = new AGCT(0,0)
                        stats.push(obj)
                    }
                    if(barcode[i] == "A" || barcode[i] == "C"){
                        stats[i]['AC'] += Number(element['Volume'])
                    }
                    else{
                        stats[i]['GT'] += Number(element['Volume'])
                    }
                }
                dt.line.forEach(element2 => {
                    var barcode2 = element2["index"] + element2["index2"]
                    var name2 = element2["Sample_ID"] + '.' + element2["Sample_Name"]
                    if(name == name2) {}
                    else{
                        var misMatch = 0
                        for(var i = 0; i < barcode.length; i++) {
                            if(barcode[i] != barcode2[i]) misMatch++
                        }
                        if(misMatch < minMisMatch) {
                            minMisMatch = misMatch
                        }
                        if(mmStats[misMatch] == undefined){
                            mmStats[misMatch] = new Array();
                        }
                        mmStats[misMatch].push(name + "-vs-" + name2)
                    }
                })
            })
            this.show = false
            uf.show = false
            dt.show = false
            back.show = true
            Pstat.show = true
            Pstat.data = stats
            ts.current = 2
            ts.status = 'finish'
            if(minMisMatch < 3){
                Pstat.mm = mmStats[minMisMatch]
                Pstat.msg = "barcode之间最小mismatch数<3，拆分数据有风险，请检查。"
                Pstat.mmcheck = true
                ts.status = 'error'
            }
            else if(minMisMatch < 1){
                Pstat.mm = mmStats[minMisMatch]
                Pstat.msg = "barcode之间最小mismatch数<1，无法拆分数据，请检查。"
                Pstat.mmcheck = true
                ts.status = 'error'
            }
            stats.forEach( element => {
                var total = element['AC'] + element['GT']
                element['AC'] = (element['AC'] / total).toFixed(2)
                element['GT'] = (element['GT'] / total).toFixed(2)
                if(element['AC'] >= 0.65 || element['GT'] >= 0.65){
                    element['class'] = 'background-color: #ff9900;'
                }
                if (element['AC'] >= 0.8 || element['GT'] >= 0.8){
                    element['class'] = 'background-color: #ed3f14;'
                }
            })
        }
    }
})