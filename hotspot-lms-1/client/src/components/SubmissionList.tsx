import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubmissionList: React.FC = () => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get('/api/submissions');
                setSubmissions(response.data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };

        fetchSubmissions();
    }, []);

    return (
        <div>
            <h2>Submission List</h2>
            <ul>
                {submissions.map((submission) => (
                    <li key={submission.id}>
                        <strong>{submission.studentName}</strong>: {submission.fileName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubmissionList;