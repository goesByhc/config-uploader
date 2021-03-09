/**
 * Created by Chao.Han on 3/8/21
 */

import * as fs from "fs";

export function isFolderExist(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        fs.exists(path, (exists: boolean) => {
            resolve(exists);
        })
    })
}

export function clearFolder(path: string, depth: number = 0) {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                clearFolder(curPath, depth + 1); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });

        if (depth > 0) {
            fs.rmdirSync(path);
        }
    }
}

export function readAndWriteFile(path: string, newPath: string): Promise<void> {

    return new Promise<void>((resolve) => {
        fs.readFile(path, function (err, data) {
            fs.writeFile(newPath, data, function (err) {
                if (err) console.log('ERRRRRR!! :' + err);
                console.log('Fitxer: ' + path + ' - ' + newPath);
                resolve();
            })
        })
    });
}

export async function prepareFolder(path: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        let isExist = await isFolderExist(path);
        if (!isExist) {
            fs.mkdir(path, { recursive: true },  (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject();
                }
            })
        }
    })
}