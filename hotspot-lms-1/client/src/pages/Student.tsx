import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';

const Student: React.FC = () => {
    const [submissions, setSubmissions] = useState([]);

    const handleNewSubmission = (submission: any) => {
        setSubmissions([...submissions, submission]);
    };

    return (
        <div>
            <h1>Student Page</h1>
            <UploadForm onNewSubmission={handleNewSubmission} />
            <h2>Your Submissions</h2>
            <ul>
                {submissions.map((submission, index) => (
                    <li key={index}>{submission.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Student;