import React, { useEffect, useState } from 'react';
import { Submission } from '../types';
import SubmissionList from '../components/SubmissionList';

const Teacher: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const response = await fetch('/api/submissions');
            const data = await response.json();
            setSubmissions(data);
        };

        fetchSubmissions();
    }, []);

    return (
        <div>
            <h1>Teacher Dashboard</h1>
            <SubmissionList submissions={submissions} />
        </div>
    );
};

export default Teacher;