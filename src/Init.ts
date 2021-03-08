/**
 * Created by Chao.Han on 3/8/21
 */
import * as fs from "fs";
import {basePath} from "./Config";
import {prepareFolder} from "./Util";


export interface IConfigProject {
    name: string;
    subProjects: string[];
}


export interface IConfigFormat {
    projects: IConfigProject[];
}


export let projectConfig: IConfigFormat = null;

export async function prepareProject() {

    if (projectConfig) {
        return;
    }

    const file = fs.readFileSync(basePath + "config.json", 'utf-8');

    projectConfig = JSON.parse(file) as IConfigFormat;

    for(let i = 0, length = projectConfig.projects.length; i < length; i++) {
        let project = projectConfig.projects[i];

        for(let j = 0, length = project.subProjects.length; j < length; j++) {
            let subProject = project.subProjects[j];
            let projectPath = basePath + "projects/" + project.name + "/" + subProject + "/";
            prepareFolder(projectPath + "bin");
            prepareFolder(projectPath + "excel");
        }
    }

}