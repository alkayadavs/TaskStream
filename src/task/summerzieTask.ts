// src/tasks/summarizeTasks.ts
import { Task } from '../entity/user';
import { Repository } from 'typeorm';
import fs from 'fs';
import path from 'path';

export const summarizeTasks = async (taskRepository: Repository<Task>) => {
    const tasks = await taskRepository.find();
    const summary = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.completed).length,
        pendingTasks: tasks.filter(task => !task.completed).length,
    };

    const logFilePath = path.join(__dirname, '../../logs/summary.log');
    const logData = `Summary: ${JSON.stringify(summary)}\n`;

    fs.appendFileSync(logFilePath, logData);
    console.log('Summary logged:', summary);
};
