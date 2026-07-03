import fs from 'fs';
import path from 'path';

const storagePath = path.join(__dirname, '../../uploads');

const ensureStoragePathExists = () => {
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
};

export const saveSubmission = (fileName: string, fileData: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        ensureStoragePathExists();
        const filePath = path.join(storagePath, fileName);
        fs.writeFile(filePath, fileData, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(filePath);
        });
    });
};

export const getSubmission = (fileName: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(storagePath, fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};