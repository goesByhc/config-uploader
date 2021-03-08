/**
 * Created by Chao.Han on 3/8/21
 */
import * as express from 'express';
import {Application} from 'express';
import {basePath, indexHtml, ListenPort} from "./Config";
import {AddressInfo} from "net";
import {projectConfig} from "./Init";
import * as multiparty from 'multiparty';

const cors = require('cors');

//"但如果你想要设置更多,那么需要使用storage代替dest"

export function initRouter(app: Application) {
    app.use(cors());

    app.get('/', function (req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(indexHtml);
    });

    app.use('/public', express.static('public'));

    app.get('/config', function (req, res) {
        res.send(projectConfig);
    });

    initUpload(app);

    console.log("start listen");
    let server = app.listen(ListenPort, function () {
        let address = server.address() as AddressInfo;

        let host = address.address;
        let port = address.port;

        console.log("应用实例，访问地址为 http://%s:%s", host, port)

    });

}


function initUpload(app: Application) {

    app.post('/upload/', function (req, res, next) {
        let form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            let excels = files.files;
            let project = fields.project[0];
            let subProject = fields.subProject[0];
            let newPath =  `${basePath}/projects/${project}/${subProject}/`;
            for (let i = 0; i < excels.length; i++) {
                let singleImg = excels[i];
                newPath += singleImg.originalFilename;
                res.write("File uploaded to: " + newPath);
            }

            res.send();
        });

    })
}