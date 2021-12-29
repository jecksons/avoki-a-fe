import './css/settings.css';
import './css/components.css';
import React, {useState, useMemo, useCallback} from "react";
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Home from './components/pages/home';
import PointOfSale from './components/pages/point-of-sale';
import NotFound from './components/pages/not-found';
import POSManagement from './components/pages/pos-management';
import UnknownError from './components/pages/unknown-error';
import SessionContext from './store/session-context';
import Products from './components/pages/products';
import ProtectedRoute from './components/controls/protected-route';



const lastSessionInfo = JSON.parse(localStorage.getItem('session-info'));

function App() {

  const [sessionInfo, setSessionInfo] = useState(lastSessionInfo ?? {
        id_business: null,
        point_of_sale: null
      } );

  const setSessionValue = useCallback(
    (newInfo) => {
      setSessionInfo(newInfo);
      if (!newInfo) {
        localStorage.removeItem('session-info');
      } else {
        localStorage.setItem('session-info', JSON.stringify(newInfo));
      }      
    }, []);

  const sessionValue = useMemo(
    () => ({sessionInfo, setSessionValue}),
    [sessionInfo, setSessionValue]
  );

  return (
    <div className="App">            
      <SessionContext.Provider value={sessionValue}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/pointofsale/:id" component={PointOfSale} />
            <Route exact path="/pos-management/:id" component={POSManagement} />
            <Route exact path="/unknown-error/" component={UnknownError} />
            <ProtectedRoute exact path="/products/" component={Products} sessionInfo={sessionInfo} />
            <Route path="*" component={NotFound} />
          </Switch>
        </BrowserRouter>
      </SessionContext.Provider>
      
    </div>
  );
}

export default App;
