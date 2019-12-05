import React from 'react';
import './App.css';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import Main from './components/Main';
import Register from './components/auth/Register';
import SignIn from './components/auth/Signin';
import Memo from './components/Memo';
import EditMemo from './components/EditMemo';
import Share from './components/Share';

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path='/signin'>
              <SignIn />
            </Route>

            <Route path='/register'>
              <Register />
            </Route>

            <Route exact path='/'>
              <Main /> 
            </Route>

            <Route path='/memo'>
              <Memo /> 
            </Route>

            <Route path='/edit'>
              <EditMemo /> 
            </Route>

            <Route path='/share'>
              <Share /> 
            </Route>

            <Route path='*'>
              <NoMatch />
            </Route>
          </Switch>
        </BrowserRouter>
    </div>
  );
}

const NoMatch = () => {
  let location = useLocation();
  return <div><h1>404 - Path {location.pathname} not found</h1></div>
}

export default App;
