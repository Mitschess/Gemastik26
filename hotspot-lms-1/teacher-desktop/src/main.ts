import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './ui/dashboard';

const App = () => {
    return (
        <div>
            <h1>Teacher Dashboard</h1>
            <Dashboard />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));