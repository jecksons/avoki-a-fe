import React, { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import Modal from 'react-modal';
import api from '../../../../../services/api';
import ReactLoading from 'react-loading';
import utils from '../../../../../services/utils';
import Select from 'react-select';

function PaymentMethod(props)  {
    const [selValue, setSelValue] = useState(0);
    const refInput = useRef(null);
    const [parcelOptions, setParcelOptions] = useState([]);
    const [selParcel, setSelParcel] = useState(null);
    
    if (!props.onNotifyChange) {
        throw new Error('On notify change not informed!');
    }

    if (!props.onGetAmountPending) {
        throw new Error('onGetAmountPending not informed!');
    }

    if (!props.onGetCountMethodsInUse) {
        throw new Error('onGetCountMethodsInUse not informed!');
    }

    useEffect(() => {
        if (props.defValue > 0) {
            setSelValue(props.defValue);
        }
    }, [props.defValue]);

    useEffect(() => {
        if (props.data.max_parcels > 1) {
            let newParcels = [];
            for (let i = 1; i <= props.data.max_parcels; i++ ) {
                newParcels.push({value: i, label: `${i.toString()}x`});
            }
            setSelParcel(newParcels[0]);
            setParcelOptions(newParcels);
        }
    }, [props.data.max_parcels]);
    
    const handleSelValue = (value, resetAll, numParcels) => {
        let newValue = 0;
        if (value) {
            newValue = parseFloat(value) ?? 0;
        }
        newValue = parseFloat(newValue.toFixed(2));        
        setSelValue(newValue);        
        let parcels = 1;
        if (numParcels > 0) {
            parcels = numParcels;
        } else {
            parcels = selParcel ? selParcel.value : 1;
        }
        console.log(`parcels: ${parcels}`);
        props.onNotifyChange(props.data.id, newValue, parcels, resetAll);
    }

    const handleOnClickItem = () => {
        let newSelValue = selValue;
        if (newSelValue === 0) {
            let infoPending = props.onGetAmountPending();
            let resetAll = false;
            newSelValue = infoPending.amount_pending;
            if (newSelValue === 0) {
                /*
                    if only one method is actually in use, it will be reseted
                    and the total value will be to this pay method.
                 */
                if (props.onGetCountMethodsInUse() === 1) {
                    newSelValue = infoPending.cart_value;
                    resetAll = true;
                }
            }
            if (newSelValue > 0) {
                handleSelValue(newSelValue, resetAll);
                refInput.current.focus();
                /*
                    this timeout exists because the system needs 
                    to process the focus, and then the select method
                    can be applied.
                 */
                setTimeout(() => {
                    if (refInput.current) {
                        refInput.current.select();
                    }                    
                }, 50);                
            }
        } else {
            handleSelValue(0);
        }       
    }

    const handleChangeParcel = (parcelOption) => {
        setSelParcel(parcelOption);
        handleSelValue(selValue, false, parcelOption.value);
    }

    return (
        <li key={props.data.id} className="payment-item">
            <div className='parent-payment-option'>
                <button 
                    className={`payment-option${selValue > 0 ? '-selected' : ''}`} 
                    onClick={(e) => handleOnClickItem()}
                    >{props.data.description}</button>
                <input 
                        type="number" 
                        className={`value-edit${selValue > 0 ? '-selected' : ''}`}
                        ref={refInput}
                        value={selValue} 
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>  handleSelValue(e.target.value)  } />
            </div>
            {
                props.data.max_parcels > 1 ? 
                <div className={`payment-option-parcel${selValue > 0 ? '-show' : ''}`}>
                    <Select
                        options={parcelOptions}          
                        value={selParcel}          
                        placeholder=''
                        menuPortalTarget={document.body} 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        onChange={(itm) => handleChangeParcel(itm)}
                        classNamePrefix='select-parcel'
                    ></Select>
                </div> : null
            }             
        </li>
    )
}

function PaymentMethodItems(props) {
    const [payMethods, setPayMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [totalSelected, setTotalSelected] = useState(0);
    const [methodsValues, setMethodsValues] = useState([]);
    const [physicalChangePayment, setPhysicalChangePayment] = useState(null);

    if (!props.posInfo) {
        throw new Error('No posInfo informed!');
    }

    if (!props.onChangePaymentInfo) {
        throw new Error('No change payment info callback informed!');
    }

    const getAmountPending = () => {
        let pendingAmount = props.posInfo.cart_value - totalSelected;
        if (pendingAmount < 0) {
            pendingAmount = 0;
        }
        return {
            cart_value: props.posInfo.cart_value, 
            amount_pending: pendingAmount
        };
    }

    useEffect(() => {        
        setLoadingMethods(true);
        api.get(`/payment_types/?business=${props.posInfo.id_business}`)
        .then((ret) => {
            let defValues = [];
            if (props.defPayMethodsValues) {
                if (props.defPayMethodsValues.length > 0) {
                    defValues = props.defPayMethodsValues;
                    setMethodsValues(defValues);
                    let totValue = 0;
                    defValues.forEach((itm) => totValue += itm.value);
                    setTotalSelected(totValue);
                }
            }
            const getValueFromMethod = (metId) => {
                const itmValue = defValues.find((itm) => itm.id === metId);                        
                if (itmValue) {
                    return itmValue.value;
                }
                return 0;
            }
            let newPhysPmt = null;
            const itms = ret.data.map((itm) => {       
                if (itm.physical_payment) {
                    if (!newPhysPmt) {
                        newPhysPmt = itm;
                    }                    
                }
                return {
                    id: itm.id,
                    key: itm.id,
                    description: itm.description,
                    max_parcels: itm.max_parcels,
                    def_value: getValueFromMethod(itm.id)
                };
            });
            if (newPhysPmt) {
                setPhysicalChangePayment(newPhysPmt);
            }
            setPayMethods(itms);
            setLoadingMethods(false);
        });        
    }, [props.posInfo, props.defPayMethodsValues]);

    const resetPayMethods = (itemIdSkip) => {
        let newMethods = [...payMethods];
        newMethods.forEach((itm) => {
            if (!itemIdSkip  || itm.id !== itemIdSkip) {
                itm.key = itm.key + 100;
                itm.def_value = 0;
            }            
        } );
        setPayMethods(newMethods);
    }

    const onItemNotifyChanged = (itemId, value, numParcels, resetAll) => {
        let newValues = [...methodsValues];
        if (resetAll) {
            newValues = [];
            resetPayMethods(itemId);
        }
        let prevItem = newValues.find((itm) => itm.id === itemId);
        let changePhysItem = null;
        if (prevItem) {
            prevItem.value = value;
            prevItem.parcels = numParcels;
        } else {
            newValues.push(
                {
                    id: itemId, 
                    value: value, 
                    flow_direction: 1,
                    parcels: numParcels
                }
            );
        }
        let newTotal = 0;
        newValues.forEach((itm) => {
            if ((itm.flow_direction ?? 1) === 1) {
                newTotal += itm.value;
            } else {
                changePhysItem = itm;
            }
        });
        if (physicalChangePayment) {
            if (!changePhysItem) {
                changePhysItem = {
                    id: physicalChangePayment.id,
                    value: 0,
                    flow_direction: -1,
                    numParcels: 1
                };    
                newValues.push(changePhysItem);
            }
            if (newTotal > props.posInfo.cart_value) {
                changePhysItem.value = newTotal - props.posInfo.cart_value;    
            } else {
                changePhysItem.value = 0;
            }
        }        
        setMethodsValues(newValues);
        setTotalSelected(newTotal);
        props.onChangePaymentInfo({
            total_value: newTotal,
            payment_methods: newValues
        });
    }

    const getCountMethodsInUse = () => {
        let total = 0;
        const items = [...methodsValues];
        items.forEach((itm) => {
            if ((itm.flow_direction ?? 1) === 1) {
                if (itm.value > 0) {
                    total++;
                }
            }
        });
        return total;
    }

    const handleResetPayment = () => {
        if (!loadingMethods) {
            setMethodsValues([]);
            setTotalSelected(0);
            resetPayMethods();
            props.onChangePaymentInfo({
                total_value: 0,
                payment_methods: []
            });
        }      
    };

    return (
        <section id="payment" className="card-pay">
            <div className='header-payments'>
                <h2 className="card-title">Payment Method</h2>            
                <button className='link-button' id="reset-payments" onClick={() => handleResetPayment()}>Reset</button>
            </div>
            <ul className='payment-items'>
                {
                    payMethods.map(
                        (itm) => <PaymentMethod 
                                    data={itm} 
                                    key={itm.key} 
                                    defValue={itm.def_value ?? 0}
                                    onNotifyChange={onItemNotifyChanged} 
                                    onGetCountMethodsInUse={getCountMethodsInUse}
                                    onGetAmountPending={getAmountPending} /> )
                }
            </ul>
            <div className='summary-total'>
                <h3>Total</h3>
                <h2 className='total-value'>{`$ ${totalSelected.toFixed(2)}`}</h2>
            </div>                                        
        </section>
    );
}


function PaymentPanel(props) {

    const [cancelRequested, setCancelRequested] = useState(false);

    if (!props.posInfo) {
        throw new Error('Pos info not informed!');
    }

    if (!props.onChangePaymentInfo) {
        throw new Error('onChangePaymentInfo not informed!');
    }

    if (!props.hasOwnProperty('changeMoney')) {
        throw new Error('changeMoney not informed!');
    }

    const handleSaleCancel = () => {
        props.onClickCancelSale();
    }

    const posInfo = props.posInfo;       

    return (
        <div id="parent-dialog-payment">                                    
            <PaymentMethodItems 
                posInfo={posInfo}
                defPayMethodsValues={props.defPayMethodsValues}                
                onChangePaymentInfo={props.onChangePaymentInfo}
            />
            <section id="order-summary" className="card-pay">                         
                <h2 className="card-title">Order Summary</h2>
                <div className="parent-summary-item">
                    <div className="summary-item">
                        <h4>Products</h4>
                        <h4>$ {posInfo.cart_value.toFixed(2)}</h4>
                    </div>
                    <div className="summary-item">
                        <h4>Discount</h4>
                        <h4>$ 0.00</h4>
                    </div>
                    <div className="summary-item">
                        <h4>Addition</h4>
                        <h4>$ 0.00</h4>
                    </div>
                </div>                        
                <div className="summary-total">
                    <h3>Total</h3>
                    <h2 className='total-value'>$ {posInfo.cart_value.toFixed(2)}</h2>
                </div>
            </section>
            <section id="payment-summary" className="card-pay">                        
                <h2 className="card-title">Payment Summary</h2>
                <div className="parent-summary-item">
                    <div className="summary-item">
                        <h4>Order total</h4>
                        <h4>$ {posInfo.cart_value.toFixed(2)}</h4>
                    </div>
                    <div className="summary-item">
                        <h4>Payment</h4>
                        <h4>$ {props.paymentInfo ?  props.paymentInfo.total_value.toFixed(2) : '0.00'}</h4>
                    </div>
                    <div className="summary-item">
                        <h4 className={`${props.changeMoney > 0 ? 'green-highlight' : ''}`}>Change of money</h4>
                        <h4 className={`${props.changeMoney > 0 ? 'green-highlight' : ''}`} >$ {props.changeMoney.toFixed(2)}</h4>
                    </div>
                </div>
                <div className="summary-total">
                    <h3>Amount pending</h3>
                    <h2 className='total-value'>{`$ ${
                        (
                            (posInfo.cart_value > (props.paymentInfo ?  props.paymentInfo.total_value : 0) ) ? 
                            (posInfo.cart_value - (props.paymentInfo ?  props.paymentInfo.total_value : 0)) : 0
                        ).toFixed(2)                                
                        }`}</h2>
                </div>
            </section>
            <div className="bottom-options">                        
                <div className='cancel-buttons'>
                    <button onClick={() => setCancelRequested(!cancelRequested)} id="cancel-sale"  className="link-button">Cancel Sale</button>
                    <div className={`confirm-cancel${cancelRequested ? '-show': ''}`}>
                        <button onClick={handleSaleCancel} className={`action-button`}>Confirm?</button>
                        <button onClick={() => setCancelRequested(false)} className='secondary-action' >No</button>
                    </div>                    
                </div>
                <div className="finish-buttons">                                                        
                    <button onClick={props.closeModal}  className="link-button">Back</button>
                    <button onClick={ props.canFinish ? props.onClickFinish : null}  id="finish" className={`action-button${props.canFinish ? '' : '-disabled'}`} >Finish  </button>
                </div>                    
            </div>                    
        </div>                
    );
}

function PaymentProcess(props) {    
    return (
        <div id="parent-dialog-process-payment">                                    
            <section className='card-pay' id='process-payment-parent'>
                <h2 className='card-title'>Processing Payment</h2>
                <ReactLoading type="cylon" color="#F48C06"  width={150} className="loading-payment" /> 
            </section>
        </div>
    )
}

function PaymentError(props) {    

    if (!props.onClickRetry) {
        throw new Error('onClickRetry is not informed!');
    }
    if (!props.onClickBackToPayment) {
        throw new Error('onClickBackToPayment is not informed!');
    }
    if (!props.onClickBackToSale) {
        throw new Error('onClickBackToSale is not informed!');
    }

    return (
        <div id="parent-dialog-process-payment">                                    
            <section className='card-pay' id='process-payment-parent'>
                <h2 className='card-title'>There was an error on processing the payment</h2>
                <p className='error-on-surface'>{props.errorMessage}</p>                
                <div className='button-options-error'>
                    <button onClick={props.onClickRetry} className="action-button" id="try-again-pmt">Try again</button>                
                    <button onClick={props.onClickBackToPayment} className='secondary-action'>Back to payment</button>                
                    <button onClick={props.onClickBackToSale} className='secondary-action'>Back to current sale</button>                
                </div>                
            </section>
        </div>
    )
}

const VIEW_PAYMENT = 0;
const VIEW_PAYMENT_PROCESSING = 1;
const VIEW_PAYMENT_ERROR = 2;

export default function PaymentDialog(props){

    const [paymentInfo, setPaymentInfo] = useState(null);
    const [canFinish, setCanFinish] = useState(false);
    const [changeMoney, setChangeMoney] = useState(0);
    const [visibleView, setVisibleView] = useState(VIEW_PAYMENT);
    const [oldPayMethodsValues, setOldPayMethodsValues] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const onChangePaymentInfo = useCallback((newPaymentInfo) => {
        if (props.show) {
            setPaymentInfo(newPaymentInfo);
            let newCanFinish = false;
            let newChangeMoney = 0;
            if (newPaymentInfo) {
                newCanFinish = (newPaymentInfo.total_value >= props.posInfo.cart_value);            
                if (newCanFinish) {
                    newChangeMoney = newPaymentInfo.total_value - props.posInfo.cart_value;
                }
            }
            setCanFinish(newCanFinish);
            setChangeMoney(newChangeMoney);
        }
        
    }, [props.show, props.posInfo]);

    const onClickFinish = () => {
        if (paymentInfo && paymentInfo.payment_methods) {
            let pmtValues = [];
            paymentInfo.payment_methods.forEach((itm) => {
                if (itm.value > 0) {
                    pmtValues.push({
                        flow_direction: itm.flow_direction ?? 1,
                        id_payment_type: itm.id,
                        amount: itm.value,
                        parcels: itm.parcels
                    });
                }
            });
            if (pmtValues.length > 0) {
                setVisibleView(VIEW_PAYMENT_PROCESSING);
                api.post('/sales', {
                        id_point_sale: props.posInfo.id,
                        payment_values: pmtValues
                    }
                ).then((ret) => {
                    if (props.onSuccess) {
                        props.onSuccess(ret.data);
                    }
                }).catch((err) => {
                    setErrorMessage(utils.getHTTPError(err));
                    setVisibleView(VIEW_PAYMENT_ERROR);                     
                });
            }
        }
    }

    const onClickBackToPayment = () => {
        setVisibleView(VIEW_PAYMENT);
        if (paymentInfo) {
            if (paymentInfo.payment_methods) { 
                setOldPayMethodsValues(paymentInfo.payment_methods);
                return;
            }
        }        
        setOldPayMethodsValues([]);        
    }

    const closeModal = () => {
        if (props.onClose) {
            props.onClose();
        }
    }    

    useEffect(() => {
        if (props.show) {
            onChangePaymentInfo(null);
            setOldPayMethodsValues([]);
            setVisibleView(VIEW_PAYMENT);
        }
    }, [props.show, onChangePaymentInfo]);
    
    if (props.show) {
        if (!props.posInfo) {
            throw new Error('Pos info not informed!');
        }
        const posInfo = props.posInfo;       
        return (                
            <Modal
                isOpen={props.message !== ''}                
                overlayClassName="overlay-dialog-content"
                className="dialog-content"
            >   
            {
                {
                    0:  <PaymentPanel 
                        posInfo={posInfo}
                        onChangePaymentInfo={onChangePaymentInfo}
                        changeMoney={changeMoney}
                        canFinish={canFinish}
                        closeModal={closeModal}
                        paymentInfo={paymentInfo}
                        defPayMethodsValues={oldPayMethodsValues}
                        onClickFinish={onClickFinish}
                        onClickCancelSale={props.onCancelSale}
                    />,
                    1: <PaymentProcess 
                        posInfo={posInfo}
                        closeModal={closeModal}
                        paymentInfo={paymentInfo}
                        onClickBackToPayment={onClickBackToPayment}
                    />,  
                    2: <PaymentError 
                        onClickBackToSale={closeModal}
                        onClickRetry={onClickFinish}
                        errorMessage={errorMessage}
                        onClickBackToPayment={onClickBackToPayment}
                    />  
                }[visibleView]                                                          
            }             
         
            </Modal>
        );
    } else return null;


};