//express_demo.js 文件
// import express = require('express');

import * as express from 'express';
import {initRouter} from "./src/Router";
import {prepareProject} from "./src/Init";

console.log("app start");
// (async () => {
prepareProject()
.then(() => {
    let app = express();

    initRouter(app);
});


// })();