import { Request, Response } from 'express';
import { Submission } from '../models/submission';
import { storageService } from '../services/storage';

export class SubmissionController {
    public async createSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { studentId, assignmentId, content } = req.body;
            const submission = new Submission({ studentId, assignmentId, content });
            await storageService.saveSubmission(submission);
            res.status(201).json({ message: 'Submission created successfully', submission });
        } catch (error) {
            res.status(500).json({ message: 'Error creating submission', error });
        }
    }

    public async listSubmissions(req: Request, res: Response): Promise<void> {
        try {
            const submissions = await storageService.getAllSubmissions();
            res.status(200).json(submissions);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving submissions', error });
        }
    }
}