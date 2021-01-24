const express = require('express');
const fs = require('fs');
const md5 = require('md5');
var app = express();

app.listen(30080, function () {
  console.log('ACG.WATCH API listening on port 30080!');
});



app.get('/api/', (req, res)=>{
    res.send('Hello from ACG.WATCH API!!');
});

app.get('/api/getAll', async (req, res) => {
    res.send(video.obj);
});

app.get('/api/getClassBySeries', async (req, res)=>{
    await video.getClassBySeries(req.query['class'])
    .then(classess => res.send(classess))
    .catch(err => {
        var tmp = {};
        Object.assign(tmp, video.unknownObj);
        res.send(tmp);
    });
});

app.get('/api/getVideoByUrl', async (req, res) => {
    await video.getVideoByUrl(req.query.url)
    .then(video => res.send(video))
    .catch(err => {
        var tmp = {};
        Object.assign(tmp, video.unknownObj);
        tmp.url = req.query.url;
        tmp.danmakuID =  md5(req.query.url).substring(0, 8); //String(parseInt(Math.random()*(90000000-50000000+1)+50000000,10));
        res.send(tmp);
    });
});

app.get('/api/getNextByUrl', async (req, res) => {
    await video.getNextByUrl(req.query.url)
    .then(video => res.send(video))
    .catch(err => {
        var tmp = {};
        Object.assign(tmp, video.unknownObj);
        res.send(tmp);
    });
});


var video = {
    obj: {},
    unknownObj: {
        name: 'unknown',
        season: 'unknown',
        url: 'https://cdn.yimian.xyz/video/404.mp4',
        description: 'unknown',
        danmakuID: '40404040',
        'class': 'extra'
    },
    getAll: () => JSON.parse(fs.readFileSync('mnt/cache/video/video.json')),
    getClassBySeries: series => new Promise((resolve, reject) => {
        Object.keys(video.obj).forEach(item => {
            if(video.obj[item].hasOwnProperty(series)){
                resolve(item);
            }
        });
        reject('err in get Class By Series');
    }),
    getVideoByUrl: url => new Promise((resolve, reject) => {
       Object.keys(video.obj).forEach(
           classes => {
               Object.keys(video.obj[classes]).forEach(series => {
                    video.obj[classes][series]['video'].forEach((vid, index) => {
                        if(vid.url == url){
                            resolve(video.getVideo(classes, series, index));
                        }
                    });
               });
          }
       ); 
       reject('err in getVideoByUrl');
    }),
    getVideo: (classes, series, vid) => {
        if(vid >= video.obj[classes][series]['video'].length){
            vid = 0;
        }
        var tmp = {
            "class": classes,
            "seriesID": series,
            "vid": vid
        };
        Object.assign(tmp, video.obj[classes][series]['video'][vid]);
        return tmp;
    },
    getNextByUrl: url => new Promise(async (resolve, reject) => {
        try{
            var lastVideo = await video.getVideoByUrl(url);
            resolve(video.getVideo(lastVideo['class'], lastVideo.seriesID, lastVideo.vid+1));
        }catch(e){
            reject(e);
        }
    }),
    reload: () => {
        video.obj = video.getAll();
    },
    

}

/* watch video.json cache */
video.reload();
fs.watch('/mnt/cache/video/', event => video.reload());

