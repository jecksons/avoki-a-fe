import React from 'react';
import './styles.css';

export default function Toast(props){

    const onSetMsg = props.onSetMsg;

    if (props.message !== '') {
        if (props.onSetMsg) {
            setTimeout( () => {                                
                onSetMsg('');
             }, 3000);
        }      
    }; 
    return (
        <div id={`toast${props.messageType === 'error' ? '-error' : ''}`} className={props.message !==  '' ? 'toast-show' : ''}>
            <strong>{props.message}</strong>
        </div>
    )
}