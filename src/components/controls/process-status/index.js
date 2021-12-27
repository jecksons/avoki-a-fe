import Modal from "react-modal";
import React from "react";
import './styles.css';
import ReactLoading from "react-loading";


const StatusShow = {
    processing: 0,
    error: 1
}

function ProcessingStatus(props) {
    return (
        <div className="box-content">
            <strong>{props.title} </strong>
            <ReactLoading type="cylon" color="#F48C06"  width={150} className="loading-proc-status" /> 
        </div>
    );
}

function ErrorStatus(props) {
    return (
        <div className="box-content">
            <strong>{props.title} </strong>
            <p className="error-on-surface">{props.errorMessage}</p>
            <div className="error-buttons">
                <button className="action-button" onClick={() => props.onRetry()} >Retry</button>
                <button className="secondary-action" onClick={() => {props.onCloseCancel()}}>Back</button>          
            </div>  
        </div>
    );
}


function ProcessStatus(props) {
    
    if (props.show) {
        if (!props.status) {
            throw new Error('Status is not informed!');
        }        
        if (!props.onCloseCancel) {
            throw new Error('onCloseCancel is not informed!');
        }        
        return (
            <Modal
                isOpen={true}                
                overlayClassName="overlay-dialog-content"
                className="dialog-content"
            >   
                <div className="parent-process-status">
                    {
                        {
                            0: <ProcessingStatus
                                    title={props.status.title}
                                    onCloseCancel={props.onCloseCancel}
                                 />,
                            1: <ErrorStatus
                                    title={props.status.title}
                                    onCloseCancel={props.onCloseCancel}
                                    onRetry={props.onRetry}
                                    errorMessage={props.status.message}
                                />
                        }[props.status.code ?? 0]
                     }
                </div>
            </Modal>
        );
    } else {
        return null;
    }
    
}

export {StatusShow, ProcessStatus}