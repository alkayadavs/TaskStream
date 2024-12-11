// src/events/fileProcessor.ts
import { EventEmitter } from 'events';

class FileProcessor extends EventEmitter {}

export const fileProcessor = new FileProcessor();
