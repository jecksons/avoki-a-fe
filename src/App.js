import './css/settings.css';
import './css/components.css';
import React from "react";
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Home from './components/pages/home';
import PointOfSale from './components/pages/point-of-sale';
import NotFound from './components/pages/not-found';
import POSManagement from './components/pages/pos-management';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/pointofsale/:id" component={PointOfSale} />
          <Route exact path="/pos-management/:id" component={POSManagement} />
          <Route path="*" component={NotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
