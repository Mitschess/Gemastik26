import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Student from './pages/Student';
import Teacher from './pages/Teacher';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/student" component={Student} />
        <Route path="/teacher" component={Teacher} />
        <Route path="/" exact>
          <h1>Welcome to Hotspot LMS</h1>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;