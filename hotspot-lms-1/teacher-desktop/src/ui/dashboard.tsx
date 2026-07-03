import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const response = await fetch('http://localhost:5000/api/submissions');
            const data = await response.json();
            setSubmissions(data);
        };

        fetchSubmissions();
    }, []);

    return (
        <div>
            <h1>Teacher Dashboard</h1>
            <h2>Submissions</h2>
            <ul>
                {submissions.map((submission) => (
                    <li key={submission.id}>
                        {submission.studentName}: {submission.fileName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;