import './styles.css';
import HomeHeader from './controls/header';
import React, {useState, useEffect}  from 'react';
import api from '../../../services/api';
import CartItem from './controls/cart_item';
import ProductCategorySelect  from './controls/product-category-select';
import ContentLoader from 'react-content-loader';
import utils from '../../../services/utils';
import Toast from '../../controls/toast';

export default function Home (props) {

    const [textSearch, setTextSearch] = useState('');
    const [posInfo, setPosInfo] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [processItems, setProcessItems] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(()=> {
        api.get('/point_sale/id/1')
        .then((ret) => {
            if (ret.status === 200) {
                setPosInfo({
                    id: ret.data.id,
                    description: ret.data.description,
                    cart_value: ret.data.currentCart ? ret.data.currentCart.total_value : 0
                });
                setCartItems(ret.data.currentCart ? ret.data.currentCart.items.reverse() : []);
            }            
        });
    }, []);

    const addItem = (item) => {
        setProcessItems([...processItems, item]);

        const prcRemItem = () => {
            let procItem = [];
            const oldProcItems = [...processItems];
            oldProcItems.forEach((prc) => {
                if (prc !== item) {
                    procItem.push(prc);
                }
            })
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
        

    return (
        <div>
            <HomeHeader  posInfo={{description: (posInfo ? posInfo.description : '')} }  />
            <div className="home-body">
                <div className="top-view">
                    <div>
                        <button 
                            className="action-button"
                            onClick={() => {setErrorMessage('mensagem de erro aqui') }}>Cancel sale</button>
                        <button 
                            className="link-button"
                            onClick={() => {}}>Discount</button>
                    </div>
                    <div>
                        <input type="text"
                            className="search-input"
                            autoFocus={true}
                            value={textSearch}
                            placeholder="Search the product or type his code"
                            onChange={(e) => setTextSearch(e.target.value)}
                        />
                        <Toast message={errorMessage} onSetMsg={setErrorMessage} messageType="error"/>
                    </div>                    
                    <div className="section-total-value">
                        <div id="display-total-value">
                            <div id="caption-total-value">Total value</div>
                            <div id="curr-total-value">{posInfo ? posInfo.cart_value : 0}</div>                    
                        </div>
                        <button onClick={() => {}}>To Pay</button>
                    </div>            
                </div>
                <div className="product-view">
                    <div className="section-card">
                        <div className="section-title">Pick up the product</div>
                        <ProductCategorySelect onAddItem={addItem} />
                    </div>
                    <div className="section-card">
                        <div className="section-title">Selected products</div>
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
                                        {cartItems.map((itm) => <CartItem data={itm} key={itm.id}/>)}
                                    </ul>
                                ) : 
                                (
                                    <div>No items selected yet</div>
                                )                            
                            }
                        </div>                
                    </div>
                </div>
            </div>            
        </div>
    );
}