import './styles.css';
import React from 'react';
import { useEffect } from 'react';


export default function SaleFeedback(props) {

    
    if (!props.onAutoHide) {
        throw new Error('onAutoHide not informed!');
    }

    useEffect(() => {
        if (props.show) {
            const timout = setTimeout(() => {                
                props.onAutoHide();
            }, 5000);            
            return () => clearTimeout(timout);    
        }       

    }, [props]);

    return (
        <div className={`parent-feedback${props.show ? '-show' : ''}`}>
            <strong>Successfull sale!</strong>
            <p>Number: <span>{props.saleNumber ?? 0}</span></p>
        </div>
    );
    
}
