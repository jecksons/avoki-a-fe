import React, {useState, useContext, useEffect, useCallback, useRef, useReducer} from 'react';
import SessionContext from '../../../store/session-context';
import SurfaceLoading from '../../controls/surface-loading';
import api from '../../../services/api';
import utils from '../../../services/utils';
import {CgCloseO} from 'react-icons/cg';
import {RiFileCopyLine} from 'react-icons/ri';
import './styles.css';
import HeaderNav from '../../controls/header-nav';
import Modal from 'react-modal/lib/components/Modal';
import ReactLoading from 'react-loading';
import Swal from 'sweetalert2';
import Select from 'react-select';
import 'rc-slider/assets/index.css';
import {Range} from 'rc-slider';


const SS_NONE = 0;
const SS_SEARCHING = 1;
const SS_DONE = 2;
const SS_ERROR = 3;


function CopyProcessing(props) {    
   return (
       <div className='av-center'>                                               
            <ReactLoading type="cylon" color="#F48C06"  width={80} className="loading-copying" />            
       </div>
   )
}

function DeleteProcessing(props) {
   return (
      <div className='avu'>                                               
           <ReactLoading type="spokes" color="#F48C06"  width={16} height={16} className="loading-copying" />            
      </div>
  )
}

function CopyProductItem(props) {

   const [productName, setProductName] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [formStatus, setFormStatus]  = useState(SS_NONE);


   const closeModal = () => {
      if (props.onCloseModal) {
         props.onCloseModal();
      }
   }

   const onClickSave = () => {
      setFormStatus(SS_SEARCHING);
      api.post('/products/copy/',{
         id_product: props.product.id,
         description: productName
      }).then((ret) => {
         closeModal();
         const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            background: '#64ffda',
            iconColor: '#707070',
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })          
          Toast.fire({
            icon: 'success',
            title: `Product ${ret.data.id} added with success!`
          });
      }).catch((err) => {
         setErrorMessage(utils.getHTTPError(err));
         setFormStatus(SS_ERROR);
      });
   }

   useEffect(() => {
      if (props.show && props.product ) {
         setProductName(props.product.description);
         setFormStatus(SS_NONE);
         setErrorMessage('');
      }
   }, [props.show, props.product]);


   if (props.show) {
      return (
         <Modal 
            isOpen={true}
            overlayClassName="overlay-dialog-content"
            className="dialog-content"
            >
               <div className='parent-product-dialog'>
                  <h2 className='dialog-title' >Copying Product</h2>
                  {
                     {
                        0: <>
                              <div className='pd-main-content'>
                                 <label>New Product's Name</label>
                                 <input value={productName} onChange={(e) => setProductName(e.target.value)} className='form-surface copy-name'  autoFocus={true} />
                              </div>                              
                                 <div className="dialog-buttons">
                                    <button onClick={closeModal}  className="link-button">Cancel</button>
                                    <button onClick={onClickSave}  className="action-button">Save</button>                     
                              </div>        
                           </>,
                        1: <CopyProcessing />,
                        3: <>
                              <div className='pd-main-content'>
                                 <label>Error found on try to save:</label>
                                 <p className='error-on-surface'>{errorMessage}</p>    
                              </div>                                                     
                              <div className="dialog-buttons">
                                 <button onClick={closeModal}  className="link-button">Cancel</button>
                                 <button onClick={() => setFormStatus(SS_NONE)}  className="action-button">Back to edit</button>                     
                              </div>        
                     </>,
                     }[formStatus]
                  }
               </div>               
         </Modal>
      )
   } else {
      return null;
   }
}


function ProductItem(props) {
   const [copyingProduct, setCopyingProduct] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   
   const handleDelete = () => {

      const showToastError = (msg) => {
         const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,         
            iconColor: '#ffffff',
            timer: 7000,
            color: '#ffffff',
            background: '#D46A6A',
            text: msg,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })          
          Toast.fire({
            icon: 'error',
            title: `Error on trying to delete!`,
          });    
      }

      const onUndoDel = () => {
         api.post('/products/', {
            id: props.product.id,
            available: true
         }).then(() => {
            props.onUndoRemItem(props.product, props.itemIndex);
         }).catch((err) => {
            showToastError(utils.getHTTPError(err));
         });
      }
      setIsDeleting(true);
      api.post('/products/', {
         id: props.product.id,
         available: false
      }).then((_) => {
         props.onRemItem(props.product);
         const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: true,         
            iconColor: '#707070',
            confirmButtonColor: '#F48C06',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })          
          Toast.fire({
            icon: 'success',
            title: 'Product deleted with success!',
            confirmButtonText: 'Undo'
          }).then((res) => {
             if (res.isConfirmed) {                
               onUndoDel();               
             }
          });         
      }).catch((err) => {
         setIsDeleting(false);
         showToastError(utils.getHTTPError(err));
      })
   }

   return (
      <li key={props.product.id} className='product-item'>
         <div className='detail-product-item header-product-item'>
            <h3>{props.product.description}</h3>
            <p>{`$${props.product.price.toFixed(2)}`}</p>
         </div>
         <div className='detail-product-item'>
            {
               isDeleting ? 
                  <DeleteProcessing /> : 
                  <button className='icon-button' onClick={handleDelete} ><CgCloseO size={16} /></button>            
            }            
            <p>{`${props.product.category.description}`}</p>
            <button className='icon-button' onClick={() => setCopyingProduct(true)}><RiFileCopyLine size={16} /></button>
         </div>
         <CopyProductItem  show={copyingProduct}  onCloseModal={() => setCopyingProduct(false)}  product={props.product} />
      </li>
   );
}

function searchResultsReducer(state, action) {
   switch (action.type) {
      case 'append':  {
         return [...state, ...action.values];
      }
      case 'set': 
         return action.values;
      case 'add': {
         let items = [...state];
         items.splice(action.itemIndex, 0, action.item);
         return items;
      }
      case 'del': {
         return state.filter((itm) => itm !== action.item);
      }
      default: 
         throw new Error('Action not expected');
   }
}

function reducerMinMaxPrice(state, action) {
   switch (action.type) {
      case 'min':  {
         let newSt = [...state];
         if (typeof action.value === 'string') {
            newSt[0] = parseFloat(action.value);
         } else {
            newSt[0] = action.value;
         }         
         return newSt;         
      }
      case 'max':  {
         let newSt = [...state];
         if (typeof action.value === 'string') {
            newSt[1] = parseFloat(action.value);
         } else {
            newSt[1] = action.value;
         }         
         return newSt;         
      }      
      case 'both': {
         return [...action.values];
      }
      default: 
         throw new Error('Action not expected');
   }
}

function ProductSearchFilters({onCloseModal, show, id_business, prevFilters = null}) {   

   const [categories, setCategories] = useState([]);
   const [selCategory, setSelCategory] = useState(null);
   const [loading, setLoading] = useState(SS_SEARCHING);
   const [showInactives, setShowInactives] = useState(false);
   const [minMaxPriceRange, setMinMaxPriceRange] = useState([0, 9999]);
   const [minMaxPrice, dispatchMinMaxPrice] = useReducer(reducerMinMaxPrice,  [0, 9999]);
   const [priceMarks, setPriceMarks] = useState(null);
   const [keyRender, setKeyRender] = useState(0);

   const closeModal = () => {
      if (onCloseModal) {
         onCloseModal();
      }
   }
   
   const onClickReset = useCallback(() => {
      setSelCategory(null);
      setShowInactives(false);
      dispatchMinMaxPrice({type: 'both', values: [minMaxPriceRange[0], minMaxPriceRange[1]]});      
   }, [minMaxPriceRange]);

   const onClickApply = () => {
      if (onCloseModal) {
         onCloseModal(true, {
            id_product_category: selCategory ? selCategory.value : null,
            showInactives: showInactives,
            minPrice: minMaxPrice[0],
            maxPrice: minMaxPrice[1]
         });
      }
   }

   useEffect(() => {
      if (show && loading === SS_SEARCHING) {
         console.log('go to get');
         const cancelToken = api.getCancelToken();
         const calcMarks = (minValue, maxValue) => {
            let rangeBetween = Math.trunc((maxValue - minValue) / 4);
            if (rangeBetween > 1) {
               let marks = [
                  minValue + rangeBetween,
                  minValue + (rangeBetween * 2),
                  minValue + (rangeBetween * 3),
               ];
               let ret = {};
               ret[minValue.toString()] = minValue.toFixed(2);
               marks.forEach((itm) => ret[itm.toString()] = itm.toFixed(2) );
               ret[maxValue.toString()] = maxValue.toFixed(2);
               return ret;
            } else {
               return {
                  minValue: minValue.toFixed(2),
                  maxValue: maxValue.toFixed(2)
               };
            }
         }
         const fetchCats = async () => {
            try {
               const ret = await api.get(`/products/filter-options/?business=${id_business}`);
               dispatchMinMaxPrice(
                  {type: 'both', values: [ret.data.price_range.min, ret.data.price_range.max]}
               );               
               setMinMaxPriceRange(
                  [ret.data.price_range.min, ret.data.price_range.max]
               );
               setPriceMarks(calcMarks(ret.data.price_range.min, ret.data.price_range.max) );
               
               setCategories(ret.data.categories.map((itm) =>  {
                     return {
                        value: itm.id,
                        label: itm.description
                     }
                  } ));               
               setKeyRender(prev => prev +1);
               setLoading(SS_DONE);
            } 
            catch(err) {
               if (!api.isCancel(err)) {
                  setLoading(SS_DONE);
                  console.log(utils.getHTTPError(err));
               }
            }
         }
         fetchCats();
         return () => cancelToken.cancel();
      }

   }, [show, id_business, loading]);

   useEffect(() => {
      if (show && loading === SS_DONE) {
         if (prevFilters) {
            dispatchMinMaxPrice({type: 'both', values: [prevFilters.minPrice, prevFilters.maxPrice]});
            setShowInactives(prevFilters.showInactives);
            const newCategories = [...categories];            
            if (prevFilters && prevFilters.id_product_category > 0) {
               const prevCategory = newCategories.find((itm) => itm.value === prevFilters.id_product_category);                  
               setSelCategory(prevCategory);                  
            } else {
               setSelCategory(null);                  
            }
            setKeyRender(prev => prev +1);
         } else {         
            onClickReset();
         }                           
      }

   }, [show, prevFilters, categories, onClickReset, loading]);

   if (show) {
      return (
         <Modal 
            isOpen={true}
            onRequestClose={closeModal}
            overlayClassName="overlay-dialog-content"
            className="dialog-content"
            >
               <div className='parent-product-dialog'>
                  <h2 className='dialog-title'>Filters</h2>
                  {
                     loading === SS_SEARCHING ? 
                        <SurfaceLoading /> : 
                        <>
                           <div className='av-column-center'>
                              <label className='header-section' >Category</label>
                              <div className='width-100'>
                                 <Select 
                                    options={categories} 
                                    value={selCategory} 
                                    classNamePrefix='av-select'
                                    onChange={(itm) => setSelCategory(itm)} 
                                    key={keyRender} 
                                    isClearable={true}
                                    defaultValue={selCategory} />
                              </div>
                           </div>                           
                           <div className='av-column-center parent-price-range'>
                              <label className='header-section'>Price Range</label> 
                              <div className='container-price-range'>
                                 <Range 
                                    value={minMaxPrice} 
                                    defaultValue={minMaxPrice} 
                                    min={minMaxPriceRange[0]} 
                                    trackStyle={[{backgroundColor: '#FFBC65'}]}
                                    handleStyle={[{backgroundColor: '#F48C06'}, {backgroundColor: '#F48C06'}]}
                                    railStyle={{backgroundColor: '#dAdAdA'}}                                    
                                    max={minMaxPriceRange[1]} 
                                    marks={priceMarks}
                                    onChange={(value) => dispatchMinMaxPrice({type: 'both', values: value})} />
                              </div>
                              <div className='av-row input-min-max width-100'>
                                 <input className='form-surface' type='number' value={minMaxPrice[0]} onChange={(e) => dispatchMinMaxPrice({type: 'min', value: e.target.value}) } />
                                 <input className='form-surface' type='number' value={minMaxPrice[1]} onChange={(e) => dispatchMinMaxPrice({type: 'max', value: e.target.value}) } />
                              </div>                              
                           </div>
                           <div className='av-column-center'>
                              <label className='header-section' >Inactives</label>
                              <div className='width-100'>
                                 <label className='chk-box'><input type="checkbox" checked={showInactives}  onChange={(e) => setShowInactives(e.target.checked)}/>Show inactives</label>                           
                              </div>
                           </div>                           
                           
                           <div className="av-row-reverse">
                              <div className='av-row-reverse'>
                              <button onClick={onClickApply}  className="action-button">Apply</button>                     
                                 <button onClick={closeModal}  className="link-button" >Cancel</button>                                 
                              </div>
                              <button onClick={onClickReset}  className="link-button" >Reset</button>                     
                           </div>        
                        </>
                  }                  
               </div>               
         </Modal>
      )
   } else {
      return null;
   }

}

export default function Products(props) {

   const {sessionInfo} = useContext(SessionContext);
   const [searchText, setSearchText] = useState('');
   const [searchResults, resultsDispatch] = useReducer(searchResultsReducer, []);
   const [searchMetadata, setSearchMetadata] = useState(null);
   const [searchStatus, setSearchStatus] = useState(SS_NONE);
   const [errorMessage, setErrorMessage] = useState('');
   const [loadingMore, setLoadingMore] = useState(false);
   const [showingFilters, setShowingFilters] = useState(false);
   const refSearch = useRef(null);
   const [searchFilters, setSearchFilters] = useState(null);   
      
   const handleSearch = useCallback((mustUseOffset, directFilters) => {
      const offset = (mustUseOffset && searchMetadata && ((searchMetadata.offset + searchMetadata.limit) > 0)) ? (searchMetadata.offset + searchMetadata.limit) : 0;
      if (offset > 0) {
         setLoadingMore(true);
         setSearchStatus(prev => prev !== SS_DONE ? SS_SEARCHING : SS_DONE);
      } else {
         setLoadingMore(false);
         setSearchStatus(SS_SEARCHING);
      }      
      const cancelToken = api.getCancelToken();
      const fetchItems = async ()  => {
         try {
            let strGet = `/products/?business=${sessionInfo.id_business}&searchtext=${searchText}&offset=${offset}&limit=5`;
            const filters = directFilters ?? searchFilters;
            if (filters) {
               if (filters.showInactives === true) {
                  strGet += '&showinactives=Y';
               }
               if (filters.minPrice >= 0) {
                  strGet += `&minprice=${filters.minPrice.toFixed(2)}`;
               }
               if (filters.maxPrice >= 0) {
                  strGet += `&maxprice=${filters.maxPrice.toFixed(2)}`;
               }
               if (filters.id_product_category > 0) {
                  strGet += `&id_product_category=${filters.id_product_category}`;
               }
            }
            const ret = await api.get(strGet);            
            if (offset > 0) {
               resultsDispatch({type: 'append', values: ret.data.results });
            } else {
               resultsDispatch({type: 'set', values: ret.data.results });
            }
            setLoadingMore(false);
            setSearchMetadata(ret.data.metadata);
            setSearchStatus(SS_DONE);
         } catch (err) {
            if (!api.isCancel(err)) {
               setErrorMessage(utils.getHTTPError(err));
               setSearchStatus(SS_ERROR);
            }
         }       
      }
      fetchItems();
      return () => cancelToken.cancel();
   }, [searchMetadata, searchText, sessionInfo.id_business, searchFilters]);

   useEffect(() => {
      handleSearch(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const onRemItem = useCallback((item) => {
      resultsDispatch({type: 'del', item: item});
   }, []);

   const onUndoRemItem = useCallback((item, itemIndex) => {
      resultsDispatch({type: 'add', item: item, itemIndex: itemIndex});
   }, []);

   const onCloseFilters = (applyFilters, newFilters) => {
      setShowingFilters(false);      
      if (applyFilters) {
         setSearchFilters(newFilters);
         handleSearch(false, newFilters);
      }
   }


   return (
      <div className='parent-products'>
         <HeaderNav />
         <div className='client-content'>
            <section className='top-search'>
               <div className='info-products'>
                  <h1>Products</h1>
                  <button className='alternative-back'>New</button>                  
               </div>
               <div className='search-box'>
                  <input value={searchText} className='noborder-surface' ref={refSearch} placeholder='Type to search products...' onChange={(e) => setSearchText(e.target.value)} />
                  <button className='action-button' onClick={() => handleSearch()}>Search</button>
                  <div className='av-row'>
                     <button className='link-button search-sub-btn' onClick={() => {
                        setSearchText('');
                        setSearchFilters(null);
                        refSearch.current.focus();
                     } } >Clear</button>
                     <button className='link-button search-sub-btn' onClick={() => setShowingFilters(true)}>Filters</button>
                  </div>
               </div>               
            </section>
            {
               {
                  0: null,
                  1: (
                     <section className='search-results'>
                        <SurfaceLoading />
                     </section>
                  ),
                  2: (
                     <section className='search-results'>
                        {
                           searchMetadata ? 
                              searchMetadata.total > 0  ?
                                 (
                                    <>
                                       <h4>Found {searchMetadata.total} results</h4>
                                       <ul className='items-results'>
                                          {searchResults.map((itm, idx) => <ProductItem product={itm} key={itm.id} onRemItem={onRemItem} itemIndex={idx} onUndoRemItem={onUndoRemItem}/> )}
                                       </ul>
                                       {
                                          (searchMetadata.offset + searchMetadata.count) < searchMetadata.total ? 
                                             (
                                                loadingMore ? 
                                                   <div>  
                                                      <SurfaceLoading size={36} />
                                                   </div> : 
                                                   <button className='alternative-surface load-more' onClick={() => handleSearch(true)}>Load more</button>
                                             )
                                              :
                                             null
                                       }
                                    </>
                                 ) : 
                                 (
                                    <div className='av-center'>
                                       <strong>No results found! Try with another filter.</strong>
                                    </div>
                                 )                         : 
                                 null
                              }
                        </section>
                     ),
                  3: (
                     <section className='search-results'>
                        <div className='av-center'>
                           <p className='error-on-surface'>
                              {errorMessage}
                           </p>
                        </div>
                     </section>
                  ),
               }[searchStatus]               
            }
            <ProductSearchFilters show={showingFilters} onCloseModal={onCloseFilters} id_business={sessionInfo.id_business} prevFilters={searchFilters}  />            
         </div>
      </div>
   );
}