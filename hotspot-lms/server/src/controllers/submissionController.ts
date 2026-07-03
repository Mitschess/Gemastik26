import { Request, Response } from 'express';
import { Submission } from '../models/submission';
import { storageService } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

const normalizeAnswer = (value: unknown): string =>
    String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

export class SubmissionController {
    public async createSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { studentId, studentName, assignmentId, content, answers } = req.body;

            if (!studentId || !assignmentId) {
                res.status(400).json({ message: 'studentId and assignmentId are required' });
                return;
            }

            let parsedAnswers: any[] = [];
            if (answers) {
                try {
                    parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;
                } catch (e) {
                    console.error('Error parsing answers:', e);
                }
            }

            const file = (req as any).file;
            const assignments = await storageService.getAllAssignments();
            const assignment = assignments.find((item: any) => item.id === assignmentId);
            const submission: Submission = {
                id: uuidv4(),
                studentId,
                studentName: studentName || '',
                assignmentId,
                courseId: assignment?.courseId || '',
                content: content || '',
                answers: parsedAnswers,
                fileName: file ? file.originalname : undefined,
                filePath: file ? file.filename : undefined,
                submittedAt: new Date(),
            };

            const questionsWithKeys = (assignment?.questions || []).filter((q: any) => normalizeAnswer(q.answer));

            if (assignment?.autoCheck && questionsWithKeys.length > 0) {
                const answerMap = new Map(parsedAnswers.map((item: any) => [item.questionId, item.answer]));
                let correctCount = 0;
                const earnedPoints = questionsWithKeys.reduce((total: number, question: any) => {
                    const studentAnswer = answerMap.get(question.id);
                    const isCorrect = normalizeAnswer(studentAnswer) === normalizeAnswer(question.answer);
                    if (isCorrect) correctCount += 1;
                    return total + (isCorrect ? Number(question.points || 1) : 0);
                }, 0);
                const totalPoints = questionsWithKeys.reduce((total: number, question: any) => total + Number(question.points || 1), 0);

                submission.grade = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
                submission.feedback = `Auto check: ${correctCount} dari ${questionsWithKeys.length} jawaban sesuai kunci.`;
                submission.gradedAt = new Date().toISOString();
                submission.autoChecked = true;
                submission.correctCount = correctCount;
                submission.totalAutoQuestions = questionsWithKeys.length;
                submission.earnedPoints = earnedPoints;
                submission.totalPoints = totalPoints;
            }

            await storageService.saveSubmission(submission);
            res.status(201).json({ message: 'Submission created successfully', submission });
        } catch (error) {
            res.status(500).json({ message: 'Error creating submission', error: String(error) });
        }
    }

    public async getSubmissions(req: Request, res: Response): Promise<void> {
        try {
            const submissions = await storageService.getAllSubmissions();
            // sort newest first
            submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            res.status(200).json(submissions);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving submissions', error: String(error) });
        }
    }

    public async gradeSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { grade, feedback } = req.body;

            if (grade === undefined || grade === null) {
                res.status(400).json({ message: 'grade is required' });
                return;
            }

            const numGrade = Number(grade);
            if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
                res.status(400).json({ message: 'grade must be 0-100' });
                return;
            }

            const updated = await storageService.updateSubmission(id, {
                grade: numGrade,
                feedback: feedback || '',
                gradedAt: new Date().toISOString()
            });

            if (!updated) {
                res.status(404).json({ message: 'Submission not found' });
                return;
            }

            res.json({ message: 'Graded successfully', submission: updated });
        } catch (error) {
            res.status(500).json({ message: 'Error grading submission', error: String(error) });
        }
    }

    public async deleteSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await storageService.deleteSubmission(id);
            if (!deleted) {
                res.status(404).json({ message: 'Submission not found' });
                return;
            }
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting submission', error: String(error) });
        }
    }
}
