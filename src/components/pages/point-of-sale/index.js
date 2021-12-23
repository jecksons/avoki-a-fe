import './styles.css';
import HomeHeader from './controls/header';
import React, {useState, useEffect}  from 'react';
import { useHistory } from 'react-router-dom';
import api from '../../../services/api';
import CartItem from './controls/cart_item';
import ProductCategorySelect  from './controls/product-category-select';
import ContentLoader from 'react-content-loader';
import utils from '../../../services/utils';
import Toast from '../../controls/toast';
import ProductAutoComplete from '../../controls/product-auto-complete';
import DialogMsg from '../../controls/dialog-msg';
import NumberFormat from 'react-number-format';
import PaymentDialog from './controls/payment-dialog';
import SaleFeedback from './controls/sale-feedback';


const DLG_CANCEL_SALE = 'DLG_CANCEL_SALE';

export default function PointOfSale (props) {


    const [posInfo, setPosInfo] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [processItems, setProcessItems] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');    
    const [dialogText, setDialogText] = useState('');
    const [dialogEventCode, setDialogEventCode] = useState('');
    const [dialogPosition, setDialogPosition] = useState(null);
    const [showingPayment, setShowingPayment] = useState(false);
    const [showingSaleFeedback, setShowingSaleFeedback] = useState(false);
    const [lastSaleNumber, setLastSaleNumber] = useState(null);
    const history = useHistory();
    

        
    const onYesDialogEvent = () => {
        console.log(`code: ${dialogEventCode}`);
        if (dialogEventCode === DLG_CANCEL_SALE) {
            onConfirmCancelSales();
        }
    };    


    const onClosePayment = () => {
        setShowingPayment(false);
    }
   

    useEffect(()=> {
        api.get(`/point_sale/${props.match.params.id}`)
        .then((ret) => {
            if (ret.status === 200) {
                setPosInfo({
                    id: ret.data.id,
                    description: ret.data.description,
                    id_business: ret.data.id_business,
                    cart_value: ret.data.currentCart ? ret.data.currentCart.total_value : 0
                });
                setCartItems(ret.data.currentCart ? ret.data.currentCart.items.reverse() : []);
            }            
        })
        .catch((err) => {
            console.log(err);
            if (err.response) {
                if (err.response.status === 404) {                    
                    history.push(`/notfound/?requestedURL=${props.location.pathname}`);
                }
            }
        });
    }, [props.match.params.id, props.location.pathname, history]);

    const addItem = (item) => {
        setProcessItems([...processItems, item]);
        const prcRemItem = () => {
            let procItem = [];
            const oldProcItems = [...processItems];
            oldProcItems.forEach((prc) => {
                if (prc !== item) {
                    procItem.push(prc);
                }
            });
            setProcessItems(procItem);
        }
        api.post('/point_sale/cart/item', {
            id_point_sale: posInfo.id,
            id_product: item.id,
            quantity: item.quantity,
            discount: 0
        }).then((ret) => {
            if (ret.status === 200) {
                let newPosInfo = {...posInfo};
                const cartData = ret.data.current_cart;
                newPosInfo.cart_value = cartData.total_value;
                let newItems = [cartData.item].concat(cartItems);
                setCartItems(newItems);
                setPosInfo(newPosInfo);
                prcRemItem();
            } else {
                setErrorMessage(utils.getHTTPError(ret));
                prcRemItem();
            }
        }).catch((err) => {
            setErrorMessage(utils.getHTTPError(err));
            prcRemItem();
        });
    };

    const onItemDeleted = (newCartInfo) => {
        let newPosInfo = {...posInfo};
        newPosInfo.cart_value = newCartInfo.total_value;
        setCartItems(newCartInfo.items.reverse());
        setPosInfo(newPosInfo);
    }

    const onItemChanged = (newCartInfo) => {
        let newPosInfo = {...posInfo};
        newPosInfo.cart_value = newCartInfo.total_value;
        let oldItems = [...cartItems];                
        const idx = oldItems.findIndex((value) => value.id === newCartInfo.item.id);
        if (idx >= 0) {
            oldItems[idx] = newCartInfo.item;
            setCartItems(oldItems);
            setPosInfo(newPosInfo);
        } else {
            console.log('Item not found to update!');
        }
    }

    const onConfirmCancelSales = () => {
        setDialogText('');
        api.post(`/point_sale/clear`,
        {
            id: posInfo.id
        })
        .then((ret) => {
            if (ret.status === 200) {
                setPosInfo({
                    id: ret.data.id,
                    description: ret.data.description,
                    id_business: ret.data.id_business,
                    cart_value: ret.data.currentCart ? ret.data.currentCart.total_value : 0
                });
                setCartItems(ret.data.currentCart ? ret.data.currentCart.items.reverse() : []);
            } else {
                setErrorMessage(utils.getHTTPError(ret));
            }
        })
        .catch((err) => setErrorMessage(utils.getHTTPError(err)));        
    }


    const onNoDialog = () => {
        setDialogText('');
    }    

    const onHideSaleFeedback = () => {
        setShowingSaleFeedback(false);
    }

    const onSuccessPayment = (saleReturn) => {
        setShowingPayment(false);
        setLastSaleNumber(saleReturn.sale.id);
        setShowingSaleFeedback(true);
        setPosInfo({...posInfo, cart_value: saleReturn.pos_info.currentCart ? saleReturn.pos_info.currentCart.total_value : 0});
        setCartItems(saleReturn.pos_info.currentCart ? saleReturn.pos_info.currentCart.items.reverse() : []);        
    }

    
    const onCancelSaleFromPayment = () => {
        setShowingPayment(false);
        onConfirmCancelSales();        
    }            

    return (
        <div>
            <HomeHeader  posInfo={{description: (posInfo ? posInfo.description : '')} }  />            
            <div className="home-body">
                <div className="top-view">
                    <div>
                        <button 
                            id="cancel-sale-btn"
                            className="action-button"
                            onClick={() => {
                                if (cartItems.length > 0) {
                                    const el = document.getElementById('cancel-sale-btn');
                                    if (el) {
                                        const rct = el.getBoundingClientRect();                                
                                        const objSet = {
                                            top: `${Math.trunc(rct.bottom + 2)}px`, 
                                            left: `${Math.trunc(rct.left)}px`
                                        };                     
                                        setDialogPosition(objSet);
                                    }
                                    setDialogEventCode(DLG_CANCEL_SALE);
                                    setDialogText('Confirm the cancellation?');
                                }                                
                             }}>Cancel sale</button>
                        <button 
                            className="link-button"
                            onClick={() => {
                                setShowingSaleFeedback(true);
                            }}>Discount</button>
                    </div>
                    <div>
                        <ProductAutoComplete onAddItem={addItem} onSetErrorMessage={setErrorMessage}  />
                        <Toast message={errorMessage} onSetMsg={setErrorMessage} messageType="error"/>
                    </div>                    
                    <div className="section-total-value">
                        <div id="display-total-value">
                            <div id="caption-total-value">Total value</div>
                            <div id="curr-total-value">
                                <NumberFormat 
                                    value={posInfo ? posInfo.cart_value : 0}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}                                    
                                    prefix={'$ '}
                                    displayType={'text'}
                                />
                                </div>                    
                        </div>
                        <button onClick={() => {
                            if (posInfo && posInfo.cart_value > 0)  {
                                setShowingPayment(true);
                            }                            
                        }}>To Pay</button>
                    </div>            
                </div>
                <div className="product-view">
                    <div className="section-card">
                        <div className="section-title">Pick up the product</div>
                        <div className="section-card-client">
                            <ProductCategorySelect onAddItem={addItem} onSetErrorMessage={setErrorMessage} />
                        </div>                        
                    </div>
                    <div className="section-card">
                        <div className="section-title">Selected products</div>
                        <div className={`section-card-client${(processItems.length + cartItems.length) === 0 ? '-empty' : ''}`}>
                            <div className="processing-products" >
                                {processItems.length > 0 ? 
                                    (
                                        <ul>
                                            {processItems.map((itm) => {
                                                return <li key={processItems.indexOf(itm)} className="process-product-item" >
                                                    <div className="title">{itm.description}</div>
                                                    <ContentLoader viewBox="0 0 200 8">
                                                        <rect x={0} y="3" rx="3" ry="3" width="140" height="5" />
                                                        <rect x={145} y="3" rx="3" ry="3" width="20" height="5" />
                                                    </ContentLoader>
                                                </li>
                                            })}
                                        </ul>
                                    ) : null
                                }
                            </div>
                            <div className="selected-products" >
                                {cartItems.length > 0 ?  
                                    (
                                        <ul>
                                            {cartItems.map((itm) => 
                                                <CartItem 
                                                    data={itm} 
                                                    key={itm.id} 
                                                    onItemChanged={onItemChanged}
                                                    onItemDeleted={onItemDeleted} 
                                                    idPointSale={posInfo.id}
                                                    onMsgError={setErrorMessage} />)}
                                        </ul>
                                    ) : 
                                    (
                                        <div className="no-items-selected">
                                            <strong>No items selected yet</strong>
                                            <div>You can pick up a product from the aside categories or finding it on the search input at the top of the screen</div>
                                        </div>
                                    )                            
                                }
                            </div>                
                        </div>                                                
                    </div>
                </div>
            </div>            
            <DialogMsg
                message={dialogText}
                onYes={onYesDialogEvent}
                onNo={onNoDialog}
                position={dialogPosition}
                />
            <PaymentDialog
                show={showingPayment}
                posInfo={posInfo}
                onSuccess={onSuccessPayment}
                onClose={onClosePayment}
                onCancelSale={onCancelSaleFromPayment}
                />                
            <SaleFeedback 
                show={showingSaleFeedback}
                saleNumber={lastSaleNumber}
                onAutoHide={onHideSaleFeedback}
            />
        </div>
    );
}