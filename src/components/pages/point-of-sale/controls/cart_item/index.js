import './styles.css';
import React, {useState} from  'react';
import {AiFillDelete} from 'react-icons/ai';
import ReactLoading from 'react-loading';
import api from '../../../../../services/api';
import utils from '../../../../../services/utils';
import Modal from 'react-modal';
import {FaMinus, FaPlus} from 'react-icons/fa';
import {RiDeleteBinFill} from 'react-icons/ri';
import NumberFormat from 'react-number-format';

export default function CartItem(props) {

    const itemInfo = props.data;
    const idPointSale = props.idPointSale;

    const [deletingItem, setDeletingItem] = useState(false);
    const [qtyModalIsOpen, setQtyModalIsOpen] = useState(false);
    const [rectQty, setRectQty] = useState({top: '20px', left: '20px', right: '100px', bottom: '100px'});
    const [editQty, setEditQty] = useState(itemInfo.quantity);
    const [updatingItem, setUpdatingItem] = useState(false);


    const handleQty = (value) => {
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            numValue = 1;
        }
        if (numValue <= 0) {
            numValue = 1;
        }
        setEditQty(numValue);
        setUpdatingItem(true);
        api.post(`/point_sale/cart/item`, {
            id_point_sale: idPointSale,
            id_cart_item: itemInfo.id,
            id_product: itemInfo.product.id,
            quantity: numValue,
            discount: 0
        })
        .then((ret) => {
            if (ret.status === 200) {
                props.onItemChanged(ret.data.current_cart);                
            } else {
                props.onMsgError(utils.getHTTPError({response: ret}));
                setEditQty(itemInfo.quantity);
            }
            setUpdatingItem(false);
        })
        .catch((err) => {
            props.onMsgError(utils.getHTTPError(err));
            setEditQty(itemInfo.quantity);
            setUpdatingItem(false);
        });
    }


    const delItem = () => {
        setDeletingItem(true);
        api.delete(`/point_sale/cart/item/id/${itemInfo.id}`)
        .then((ret) => {
            if (ret.status === 200) {
                props.onItemDeleted(ret.data.current_cart);
            } else {
                props.onMsgError(utils.getHTTPError({response: ret}));
                setDeletingItem(false);
            } 
        })
        .catch((err) => {
            props.onMsgError(utils.getHTTPError(err));
            setDeletingItem(false);
        });
    }

    return (
        <li key={itemInfo.id} className="card-item">
            <div className="product-title">
                <strong>
                    {itemInfo.product.description}
                </strong>          
                {deletingItem ? 
                    <ReactLoading type="bubbles" color="#F48C06" height={10} width={60} className="del-progress"/> : 
                    (
                        <button id="del-product" onClick={() => delItem()}>
                            Delete
                            <AiFillDelete size={16}/>                    
                        </button>
                    )                    
                }                
            </div>            
            <div className="cart-item-info">
                <div>{itemInfo.sequence}</div>
                <div className="cart-item-details">
                    <div className="cart-item-single">{itemInfo.price}</div>
                    <div 
                        className="cart-item-qty" 
                        id={`cart-item-qty-${itemInfo.id}`}
                        onClick={() => {
                            const el = document.getElementById(`cart-item-qty-${itemInfo.id}`);
                            if (el) {
                                const rct = el.getBoundingClientRect();                                
                                const objSet = {
                                    top: `${Math.trunc(rct.top)}px`, 
                                    left: `${Math.trunc(rct.left)}px`, 
                                    bottom: `${Math.trunc(window.innerHeight - rct.bottom - 100)}px` ,
                                    right: `${Math.trunc(window.innerWidth - rct.right - 100)}px`
                                };                     
                                setRectQty(objSet);
                            }
                            setQtyModalIsOpen(true);
                        } }>{updatingItem ? 
                            <ReactLoading type="bubbles" color="#F48C06" height={16} width={70} className="upd-progress"/> 
                                : `${itemInfo.quantity} ${itemInfo.product.measurement_unit}`
                        }
                    </div>
                    <Modal
                        isOpen={qtyModalIsOpen}
                        overlayClassName="qty-edit-overlay"
                        className="modal-qty-edit"
                        style={{
                            content: {
                                position: 'fixed',
                                top: rectQty.top,
                                left: rectQty.left                        
                              }
                        }}
                        onRequestClose={() => setQtyModalIsOpen(false)}
                        aria={{
                            labelledby: "heading",
                            describedby: "full_description"
                        }}>
                            <input 
                                type="number" 
                                className="qty-edit" 
                                autoFocus={true}
                                value={editQty} 
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>  handleQty(e.target.value) } />
                            <div className="qty-modal-buttons">                                                            
                                <button className="qty-change" onClick={() => {
                                    setQtyModalIsOpen(false);
                                    delItem();
                                }}><RiDeleteBinFill size="16"/></button>
                                <button className="qty-change" onClick={() => handleQty(editQty -1 )}><FaMinus size="16"/></button>
                                <button className="qty-change" onClick={() => handleQty(editQty + 1)}><FaPlus size="16"/> </button>
                            </div>
                        </Modal>                                            
                    <div 
                        id="value-item"
                        className="cart-item-single"
                        >{updatingItem ? 
                            <ReactLoading type="bubbles" color="#F48C06" height={10} width={60} className="upd-progress"/> : 
                            <NumberFormat 
                                value={itemInfo.total_value}
                                thousandSeparator={true}
                                decimalScale={2}
                                fixedDecimalScale={true}                                    
                                displayType={'text'}
                            />
                            }</div>
                </div>                
            </div>
        </li>
    )
}
