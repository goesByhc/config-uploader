/**
 * Created by Chao.Han on 3/8/21
 */
import * as express from 'express';
import {Application} from 'express';
import {basePath, indexHtmlPath, ListenPort} from "./Config";
import {AddressInfo} from "net";
import {IndexHtmlText, projectConfig} from "./Init";
import * as multiparty from 'multiparty';
import {clearFolder, readAndWriteFile} from "./Util";
import {Task, TaskManager, TaskQueryResult} from "./Task";
import * as serveIndex from "serve-index";
import * as archiver from "archiver";
import * as fs from "fs";

const cors = require('cors');

//"但如果你想要设置更多,那么需要使用storage代替dest"

export function initRouter(app: Application) {
    app.use(cors());

    app.get('/', function (req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(IndexHtmlText);
    });

    app.use('/projects', serveIndex(basePath + '/projects'));
    app.use('/projects', express.static(basePath + '/projects'));

    app.get('/config', function (req, res) {
        res.send(projectConfig);
    });

    app.get('/download', function (req, res) {
        let project = req.query.project as string;
        let subProject = req.query.subProject as string;

        let archive = archiver('zip');
        let projectPath = getProjectPath(project, subProject);
        const output = fs.createWriteStream(projectPath + '/archive.zip');
        // output.on('end', function() {
        //     res.download(projectPath + '/archive.zip');
        // });

        output.on('finish', function() {
            res.download(projectPath + '/archive.zip');
        });
        archive.directory(projectPath+ "/bin/", "bin");
        archive.directory(projectPath+ "/excel/", "excel");
        archive.pipe(output);
        archive.finalize();

    });

    app.get('/clear', function (req, res) {
        let project = req.query.project as string;
        let subProject = req.query.subProject as string;
        let path = getProjectPath(project, subProject);
        clearFolder(path+ "/excel/");
        clearFolder(path+ "/bin/");
        res.send("清理成功");
    });

    app.get('/result', function (req, res) {
        let taskId = req.query.taskId as string;
        let result = 0;
        if (taskId) {
            result = TaskManager.getInstance().getTaskStatus(parseInt(taskId));
        } else {
            result = TaskQueryResult.Unknown;
        }
        res.send(JSON.stringify({status: result}));
    });

    initUpload(app);

    console.log("start listen");
    let server = app.listen(projectConfig.ServerPort, function () {
        let address = server.address() as AddressInfo;

        let host = address.address;
        let port = address.port;

        console.log("应用实例，访问地址为 http://%s:%s", host, port)

    });

}


function initUpload(app: Application) {

    app.post('/upload/', function (req, res, next) {
        let form = new multiparty.Form();

        form.parse(req, async function(err, fields, files) {
            let excels = files.files;
            let project = fields.project[0];
            let subProject = fields.subProject[0];
            let projectPath = getProjectPath(project, subProject);
            let newPath = projectPath + "/excel/";
            for (let i = 0; i < excels.length; i++) {
                let excel = excels[i];
                await readAndWriteFile(excel.path, newPath + excel.originalFilename);
            }

            let cmd = `sh ${basePath}/tools/gen_data.sh ${projectPath}/excel/ ${projectPath}/bin/`;
            let task = new Task(cmd);
            TaskManager.getInstance().addTask(task);
            res.send(JSON.stringify({taskId: task.id}));
        });

    })
}

function getProjectPath(project: string, subProject: string): string {
    return `${basePath}/projects/${project}/${subProject}`
}