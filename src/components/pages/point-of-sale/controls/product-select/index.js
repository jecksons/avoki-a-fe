import React, {useEffect, useState} from "react";
import api from "../../../../../services/api";
import './styles.css';
import ContentLoader from "react-content-loader";

export default function ProductSelect(props) {

    const categoryId = props.categoryId;
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState([]);
    const [qtyAdd, setQtyAdd] = useState('1');

    const handleQty = (value) => {
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            numValue = 1;
        }
        setQtyAdd(numValue);
    }

    useEffect(() => {
        if (!categoryId) {
            setLoadingProducts(false);
            setProducts([]);
        } else {
            setLoadingProducts(true);
            api.get(`/products/?business=1&category=${categoryId}`)
            .then((ret) => {
                if (ret.status === 200) {
                    setProducts(ret.data.results);
                    setLoadingProducts(false);
                } else {
                    console.log(ret);
                    setLoadingProducts(false);
                    setProducts([]);
                }
            })
            .catch((err) => {
                console.log(err);
                setLoadingProducts(false);
                setProducts([]);
            })
        }
    }, [categoryId]);    

    const renderLoading = () => {
        const itemsLoad = [0, 1, 2];
        return (
            <div tabIndex="1" className="categories-parent">
                <ContentLoader viewBox="0 0 350 100">
                    <rect x={0} y="5" rx="3" ry="3" width="140" height="5" />
                    {itemsLoad.map((itm) => {
                            return <rect x={itm * 65} y="21" rx="3" ry="3" width="60" height="22" key={itm}/>
                        })}                    
                </ContentLoader>
            </div>            
        );
    }

    const handleAddItem = (item)  => {
        if (props.onAddItem) {
            props.onAddItem({...item, quantity: parseFloat(qtyAdd)});
        }
    }

    return (
        <div className="parent-products">
            {loadingProducts ? 
                renderLoading() : 
                    products.length > 0 ? 
                        (
                            <div>
                                <div className="header-products">
                                    <label>Click on the item to add it to cart with quantity:</label>
                                    <input 
                                        type="number" 
                                        value={qtyAdd} 
                                        onChange={(e) =>  handleQty(e.target.value)} 
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                <ul className="product-list">
                                    {products.map((itm) => {
                                        return <li 
                                            key={itm.id} 
                                            onClick={() => handleAddItem(itm)}
                                            className="product-item">{itm.description} </li>
                                    })}
                                </ul>
                            </div>

                        ): null
            }
            
        </div>
    );
}