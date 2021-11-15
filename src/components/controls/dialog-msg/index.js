import React from 'react';
import './styles.css';
import Modal from 'react-modal';


export default function DialogMsg(props){

    const closeModal = () => {
        if (props.onNo) {
            props.onNo();
        }
    }    

    const  closeModalYes = () => {
        if (props.onYes) {
            props.onYes();
        }
    }

    if (props.message !== '') {
        return (                
            <Modal
                isOpen={props.message !== ''}
                onRequestClose={closeModal}
                overlayClassName="overlay-dialog-content"
                className="dialog-content"
                style={props.position ? 
                    {
                        content: {
                            position: 'fixed',
                            top: props.position.top,
                            left: props.position.left,
                            transform: 'none'
                          }
                    } : {}
                }
            >                
                <div id="main-dialog">                                    
                    <div className="msg-client-dialog">
                        <strong>{props.message}</strong>
                        <div className="dialog-buttons">
                            <button onClick={closeModalYes}  className="action-button">Yes</button>
                            <button onClick={closeModal}  className="link-button">No</button>
                        </div>                    
                    </div>                    
                </div>                
            </Modal>
        );
    } else return null;


};