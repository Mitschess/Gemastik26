import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import submissionRoutes from './routes/submissions';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});