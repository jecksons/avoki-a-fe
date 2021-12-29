import React, {useState, useContext, useEffect, useCallback, useRef} from 'react';
import SessionContext from '../../../store/session-context';
import SurfaceLoading from '../../controls/surface-loading';
import api from '../../../services/api';
import utils from '../../../services/utils';
import {CgCloseO} from 'react-icons/cg';
import {RiFileCopyLine} from 'react-icons/ri';
import './styles.css';
import HeaderNav from '../../controls/header-nav';

const SS_NONE = 0;
const SS_SEARCHING = 1;
const SS_DONE = 2;
const SS_ERROR = 3;


function ProductItem(props) {
   return (
      <li key={props.product.id} className='product-item'>
         <div className='detail-product-item header-product-item'>
            <h3>{props.product.description}</h3>
            <button className='icon-button'><CgCloseO size={16} /></button>
         </div>
         <div className='detail-product-item'>
            <p>{`Price: $${props.product.price.toFixed(2)}`}</p>
            <p>{`Category: ${props.product.category.description}`}</p>
            <button className='icon-button'><RiFileCopyLine size={16} /></button>
         </div>
      </li>
   );
}

export default function Products(props) {

   const {sessionInfo} = useContext(SessionContext);
   const [searchText, setSearchText] = useState('');
   const [searchResults, setSearchResults] = useState([]);
   const [searchMetadata, setSearchMetadata] = useState(null);
   const [searchStatus, setSearchStatus] = useState(SS_NONE);
   const [errorMessage, setErrorMessage] = useState('');
   const [loadingMore, setLoadingMore] = useState(false);
   const refSearch = useRef(null);

   
   const handleSearch = useCallback((mustUseOffset) => {
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
            const ret = await api.get(`/products/?business=${sessionInfo.id_business}&searchtext=${searchText}&offset=${offset}&limit=5`);
            if (offset > 0) {
               setSearchResults(prev => [...prev, ...ret.data.results]);
            } else {
               setSearchResults(ret.data.results);
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
   }, [searchMetadata, searchText, sessionInfo.id_business]);

   useEffect(() => {
      handleSearch(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []) ;
   

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
                        refSearch.current.focus();
                     } } >Clear</button>
                     <button className='link-button search-sub-btn'>Filters</button>
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
                                          {searchResults.map((itm) => <ProductItem product={itm} key={itm.id} /> )}
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
            
         </div>
      </div>
   );
}