import './css/settings.css';
import React from "react";
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Home from './components/pages/home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
