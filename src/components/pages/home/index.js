import './styles.css';
import logo from '../../images/logo_white_512.png';
import React, { useState, useRef, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import api from '../../../services/api';
import utils from '../../../services/utils';
import { useHistory } from 'react-router-dom';
import {MdClear} from 'react-icons/md';
import SessionContext from '../../../store/session-context';


function BarLoadingButton(props) {
    return <ReactLoading  height={15} width={30} color='#FFFFFF' type='bars' className='bar-load-progress'/>; 
}


export default function Home(props) {

    const [demoCode, setDemoCode] = useState('');
    const [demoCodeError, setDemoCodeError] = useState('');
    const [runNewDemoError, setRunNewDemoError] = useState('');
    const [loadingNewDemo, setLoadingNewDemo] = useState(false);
    const [loadingDemo, setLoadingDemo] = useState(false);
    const {setSessionValue} = useContext(SessionContext);
    const refDemoInput = useRef(null);
    let history = useHistory();

    const saveLastDemoCode = (code) => {
        localStorage.setItem('lastDemoCode', code);
    }

    useEffect(() => {
        const lastDemo = localStorage.getItem('lastDemoCode');
        if (lastDemo && lastDemo !== '')  {
            setDemoCode(lastDemo);
        }
    }, []);
    

    const handleDemoCode = () => {
        if (demoCode.length === 4) {
            setLoadingDemo(true);
            setDemoCodeError('');
            api.get(`/point_sale/demo/${demoCode}`)
            .then((ret) => {
                
                setSessionValue({
                    id_business: ret.data.id_business,
                    point_of_sale: {
                        id: ret.data.id,
                        unique_code: ret.data.unique_code
                    }
                });
                saveLastDemoCode(ret.data.demo_code);
                history.push(`/pointofsale/${ret.data.unique_code}`);                    
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status === 404) {                        
                        setLoadingDemo(false);
                        setDemoCodeError('Demo code is invalid!');
                        return;
                    }
                }
                setLoadingDemo(false);
                setDemoCodeError(utils.getHTTPError(err));
            });            
        }      
    }

    const handleNewDemo = () => {
        setLoadingNewDemo(true);        
        setRunNewDemoError('');
        api.get('/point_sale/newdemo/')
        .then((ret) => {
            if (ret.status === 200) {
                saveLastDemoCode(ret.data.demo_code);
                history.push(`/pointofsale/${ret.data.unique_code}`);                    
            }
        })
        .catch((err) => {
            setLoadingNewDemo(false);
            setRunNewDemoError(utils.getHTTPError(err));

        })
    }

    const handleClearDemoCode = () => {
        setDemoCode('');
        setDemoCodeError('');
        refDemoInput.current.focus();
    }

    return (
        <div className="main-body">
            <section className="main-info">
                <h1>Welcome to Avoki</h1>
                <img className="logo" src={logo} alt="logo" />
                <strong>A Point of Sale software designed to desktop devices with focus on agile sales.</strong>
                <div className="access-pos">
                    {runNewDemoError !== '' ? <div className='error-on-primary'>{runNewDemoError}</div>     : null} 
                    <button 
                        onClick={loadingNewDemo ? null : handleNewDemo}
                        id="new-demo"
                        className={`on-primary${loadingNewDemo ? '-disabled' : ''}`}>                            
                            {loadingNewDemo ? <BarLoadingButton /> : 'Run a new demo'}                            
                            </button>
                    <h4>or</h4>
                    <p>Continue with an existing demo code:</p>
                    <div className="demodiv">
                        {demoCodeError !== '' ? <div className='error-on-primary'>{demoCodeError}</div>     : null} 
                        <div className="parent-democode">
                            <div className='code-space'/>
                            <input 
                                id="democode"
                                ref={refDemoInput}
                                value={demoCode}                             
                                onChange={(e) => {
                                    setDemoCode(e.target.value.substring(0, 4));
                                    if (demoCodeError !== '') {
                                        setDemoCodeError('');
                                    }
                                }}                            
                                />       
                            {demoCode !== '' ? <button className='clear-demo' onClick={() => handleClearDemoCode()}>{<MdClear size={16} />}</button> : <div className='code-space'/> }                 
                        </div>
                        <button 
                            onClick={((demoCode.length === 4) && !loadingDemo ? handleDemoCode : null)}
                            id="btn-go"
                            className={`on-primary${((demoCode.length !== 4) || loadingDemo  ? '-disabled'  : '')}`} 
                         >
                             {loadingDemo ?  <BarLoadingButton /> : 'Go' }
                         </button>                         
                    </div>
                </div>
            </section>
            <section className="features">
                <h2>Features</h2>
                <div className="parent-features">
                    <div className="feature-item">
                        <h3>Quick Product Picking</h3>
                        <p>Product choose by barcode, category navigation or even by text.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Agility Is The Rule One</h3>
                        <p>Shortcuts to sales options.<br/>System designed for the real world of Point of Sale needs.</p>
                    </div>
                    <div className="feature-item">
                        <h3>All In One Place</h3>
                        <p>All the features in the same place, improving the sales speed.</p>
                    </div>
                </div>
            </section>            
            <section className="bottom-info">
                <h4>Design and development by Jéckson Schwengber</h4>
            </section>
        </div>
    );
}