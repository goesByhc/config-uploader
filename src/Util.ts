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

export function writeFile() {

    // fs.writeFile(newPath,data, function(err) {
    //     if (err) console.log('ERRRRRR!! :'+err);
    //     console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
    // })
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