/**
 * Created by Chao.Han on 3/9/21
 */

import * as process from 'child_process'

export class TaskManager {

    private static instance: TaskManager = null;
    static getInstance(): TaskManager {
        if (this.instance == null) {
            this.instance = new TaskManager();
        }
        return this.instance;
    }

    static usedId: number = 1;

    processingTask: Task = null;
    waitingTasks: Task[] = [];
    allTasks: Map<number, Task> = new Map<number, Task>();

    constructor() {
        setInterval(() => {
            this.clearTask();
        }, 60 * 60 * 1000);
    }

    getTaskStatus(id: number): TaskQueryResult {
        let task = this.allTasks.get(id);
        if (!task) {
            return TaskQueryResult.NoTask;
        }

        if (task.status == TaskStatus.Waiting) {
            return TaskQueryResult.Waiting;
        }
        else if (task.status == TaskStatus.Processing) {
            return TaskQueryResult.Processing;
        }
        else if (task.status == TaskStatus.Finish) {
            return task.result ? TaskQueryResult.OK : TaskQueryResult.Error;
        }
        else {
            return TaskQueryResult.Unknown;
        }

    }

    addTask(task: Task) {
        this.allTasks.set(task.id, task);
        if (this.processingTask) {
            this.waitingTasks.push(task);
        }
        else {
            this.startTask(task);
        }
    }

    notifyTaskFinish(task: Task) {
        if (task != this.processingTask) {
            console.error("notifyTaskFinish err");
        }

        this.processingTask = null;
        if (this.waitingTasks.length > 0) {
            let task = this.waitingTasks.shift();
            this.startTask(task);
        }
    }

    private startTask(task: Task) {
        console.log("startTask cmd:", task.cmd);
        this.processingTask = task;
        task.execute();
    }

    clearTask() {
        let now = Date.now();
        let timeDiff = 60 * 60 * 1000; //1 hour
        this.allTasks.forEach((value, key, map) => {
            if (value.status == TaskStatus.Finish && value.finishTimeStamp < now - timeDiff) {
                map.delete(key);
            }
        })
    }

}

export enum TaskQueryResult {
    Unknown = 0,
    NoTask = 1,
    Waiting = 2,
    Processing = 3,
    OK = 4,
    Error = 5,
}

export enum TaskStatus {
    Waiting = 1,
    Processing = 2,
    Finish = 3,
}

export class Task {
    cmd: string;
    id: number;
    status: TaskStatus = TaskStatus.Waiting;
    finishTimeStamp: number;
    result: boolean = false;
    log: string;

    constructor(cmd: string) {
        this.id = TaskManager.usedId++;
        this.cmd = cmd;
    }

    execute() {
        this.status = TaskStatus.Processing;
        let exec = process.exec;
        exec(this.cmd, (err, stdout, stderr) => {
            this.status = TaskStatus.Finish;
            this.finishTimeStamp = Date.now();
            if(err) {
                console.log("task execute error! id: ", this.id, "cmd:", this.cmd);
                this.result = false;
            } else {
                console.log("task execute finish id: ", this.id, "cmd:", this.cmd);
                this.result = true;
                this.log = stdout;
            }

            TaskManager.getInstance().notifyTaskFinish(this);
        });

    }

}
