import './styles.css';
import React, {useState} from  'react';
import {AiFillDelete} from 'react-icons/ai';
import ReactLoading from 'react-loading';

export default function CartItem(props) {

    const itemInfo = props.data;

    const [deletingItem, setDeletingItem] = useState(false);



    const delItem = () => {
        setDeletingItem(true);
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
                        className="cart-item-single" 
                        id="qty-item"
                        onClick={() => {console.log('clicou')}}>{`${itemInfo.quantity} ${itemInfo.product.measurement_unit}`}
                    </div>
                    <div 
                        id="value-item"
                        className="cart-item-single"
                        >{itemInfo.total_value}</div>
                </div>                
            </div>
        </li>
    )
}