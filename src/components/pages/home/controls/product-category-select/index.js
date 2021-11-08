import './styles.css';
import api from '../../../../../services/api';
import React, {useEffect, useState} from 'react';
import {IoArrowBackCircleOutline} from 'react-icons/io5'
import ProductSelect from '../product-select';
import ContentLoader from 'react-content-loader';

export default function ProductCategorySelect(props) {

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selCategory, setSelCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [catPath, setCatPath] = useState([]);

    useEffect(() => {
        if (!selCategory || selCategory.has_children) {
            let strGet = '/product_categories/?business=1';
            if (selCategory) {
                strGet += `&parent=${selCategory.id}`;
            }
            setLoadingCategories(true);
            api.get(strGet)
            .then((ret) => {
                if (ret.status === 200) {                
                    if ((ret.data.length > 0))
                        setCategories(ret.data);
                    if (selCategory && selCategory.has_children) {
                        setCatPath(c => [...c, selCategory]);
                    }
                    setLoadingCategories(false);
                } else {
                    setLoadingCategories(false);
                }
            })
            .catch((err) => {
                setLoadingCategories(false);
            });        
        }
        
    }, [selCategory]);

    const onClickItem = (itm) => {
        if (!selCategory || itm.id !== selCategory.id) {
            setSelCategory(itm);
        }        
    }

    const onClickBackCat = () => {
        if (catPath.length > 0) {
            let newPath = [...catPath];
            if (selCategory) {
                newPath.pop();  
            } else {
                newPath = [];
            }
            setCatPath(newPath);
            if (newPath.length > 0) {
                setSelCategory(newPath[newPath.length]);
            } else {
                setSelCategory(null);
            }
        }
    }

    const renderContent = () => {
        return (
            <div tabIndex="1" className="categories-parent">
                    {
                        (catPath.length  > 0) ?                             
                            <button 
                                className="back-category"
                                onClick={() => onClickBackCat()}><IoArrowBackCircleOutline size={24}/> </button> : null
                    }
                    <ul className="categories" tabIndex="-1" >
                        {categories.map((itm) => {
                            return (
                                <li 
                                    className={`category-item${selCategory && selCategory === itm ? '-selected' : ''}`}
                                    tabIndex="1"
                                    key={itm.id}  
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onClickItem(itm);
                                        }
                                    }}
                                    onClick={() => {onClickItem(itm)}}>
                                        <div className="img-content">
                                            img
                                        </div>
                                        <div className="category-text">
                                            {itm.description}
                                        </div>
                                    </li>
                            )
                        })}
                    </ul>
            </div>            
        );
    }

    const renderLoading = () => {
        const itemsLoad = [0, 1, 2, 3];
        return (
            <div tabIndex="1" className="categories-parent">
                <ContentLoader viewBox="0 0 350 35">
                    {itemsLoad.map((itm) => {
                            return <rect x={itm * 35} y="0" rx="3" ry="3" width="30" height="35" key={itm} />
                        })}                    
                </ContentLoader>
            </div>            
        );
    }

    return (
        <div>
            {   loadingCategories ? renderLoading() : 
                renderContent()
            }
            <ProductSelect categoryId={selCategory ? selCategory.id : null} onAddItem={props.onAddItem} />
        </div>
    );
}