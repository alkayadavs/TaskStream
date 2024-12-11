import express, { Request, Response } from 'express';
import { createConnection, Repository } from 'typeorm';
import { Task } from './entity/user'; // Corrected import path
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middelware/errorHandler'; // Corrected import path
import { logger } from './middelware/logger'; // Corrected import path
import csv from 'csv-parser';
import { fileProcessor } from './event/fileProcessor';
import { summarizeTasks } from './task/summerzieTask';

const app = express();
const port = 3000;

app.use(express.json());

// Log middleware
app.use(logger);

// Connect to the database
createConnection({
    type: "sqlite",
    database: "database.sqlite",
    entities: [Task],
    synchronize: true,
    logging: false,
}).then(connection => {
    const taskRepository: Repository<Task> = connection.getRepository(Task);

    // Retrieve a list of all tasks
    app.get('/tasks', async (req: Request, res: Response) => {
        try {
            const tasks = await taskRepository.find();
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    });

    // Retrieve a specific task by ID
    app.get('/tasks/:id', async (req: Request, res: Response) => {
        try {
            const taskId: number = parseInt(req.params.id);
            const task = await taskRepository.findOneBy({ id: taskId });
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    });

    // Create a new task
    app.post('/tasks', async (req: Request, res: Response) => {
        try {
            const newTask = taskRepository.create(req.body);
            const result = await taskRepository.save(newTask);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create task' });
        }
    });

    // Update an existing task
    app.put('/tasks/:id', async (req: Request, res: Response) => {
        try {
            const id: number = parseInt(req.params.id);
            const { title, description, completed } = req.body;
            const result = await taskRepository.upsert([{ id, title, description, completed }], { conflictPaths: ['id'] });
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update task' });
        }
    });

    // Delete a specific task
    app.delete('/tasks/:id', async (req: Request, res: Response) => {
        try {
            const id: number = parseInt(req.params.id);
            const result = await taskRepository.delete(id);
            res.json({ message: "Task deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error: "error message" });
        }
    });

      // File upload
    
         // File upload.........................................................
    const upload = multer({ dest: 'uploads/' });
    app.post('/upload', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const tasks: Task[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const task = new Task();
                task.title = row.title;
                task.description = row.description;
                task.completed = row.completed === 'true';
                tasks.push(task);
            })
            .on('end', async () => {
                try {
                    await taskRepository.save(tasks);
                    console.log('Tasks saved:', tasks); // Log the tasks
                    res.json({ message: 'File processed and tasks saved successfully' });
                    fileProcessor.emit('fileProcessed', taskRepository);
                } catch (error) {
                    res.status(500).json({ error: 'Failed to save tasks' });
                }
            })
            .on('error', (error) => {
                res.status(500).json({ error: 'Failed to process file' });
            });
    });

    // Error handling middleware
    app.use(errorHandler);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    // Listen for file processing events
    fileProcessor.on('fileProcessed', async (taskRepository: Repository<Task>) => {
        await summarizeTasks(taskRepository);
    });
}).catch(error => console.log(error));