import './styles.css';
import {FaRegMoneyBillAlt} from 'react-icons/fa';
import {BsShop} from 'react-icons/bs';
import { useEffect, useState } from 'react';
import api from '../../../../../services/api';
import utils from '../../../../../services/utils';
import SurfaceLoading from '../../../../controls/surface-loading';
import PeriodStandard, {getDateFromPeriod} from '../../../../controls/period-standard';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import {Tab, TabList, Tabs, TabPanel} from 'react-tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo();

function POSTopProducts(props) {
   if (!props.posInfo) {
      throw new Error('posInfo is not informed!');
   }
   const [products, setProducts] = useState([]);
   const [loadingProducts, setLoadingProducts] = useState(true);
   const [period, setPeriod] = useState('7');
   const [periodDates, setPeriodDates] = useState(getDateFromPeriod('7'));
   
   useEffect(() => {
      setLoadingProducts(true);     
      const source = api.getCancelToken();      
      const fetchItems = async () => {
         try {           
            const ret = await  api.get(
               `/sales/queries/top-products/?id_point_sale=${props.posInfo.id}&from=${utils.getDateToURLParam(periodDates.from)}&to=${utils.getDateToURLParam(periodDates.to)}&limit=20`,
                  {
                     cancelToken: source.token
                  }
               );
            setProducts(ret.data.results);
            setLoadingProducts(false);
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(utils.getHTTPError(err));
            } 
         }
      }
      fetchItems();
      return () => {
         source.cancel();
      }
   }, [props.posInfo, periodDates]);

   const handleChangePeriod = (per) => {
      setPeriod(per);
      setPeriodDates(getDateFromPeriod(per));      
   }

   return (
      <div className="dash-card" id="top-products">
         <div className='dash-card-header dash-card-header-period'>
            <h2>Top Products</h2>
            <PeriodStandard 
               value={period} 
               onChange={(itm) => handleChangePeriod(itm)}            
            />
         </div>         
         {  
            loadingProducts ? 
               <SurfaceLoading  /> :
               products.length > 0 ?
                  (
                     <ol className='items-top-product'>
                        {products.map((itm) => <li key={itm.id_product} className='itm-top-product'>
                           <div className='top-product-sequence'>
                              {products.indexOf(itm)+1}                        
                           </div>
                           <div className='top-prd-info'>
                              <strong>{itm.product_description}</strong>
                              <div className='top-prd-detail'>
                                 <div>{`Sales: ${itm.sales}`}</div>                        
                                 <div>{`${itm.quantity} ${itm.mu}`}</div>
                                 <div>{`Total: $${itm.amount.toFixed(2)}`}</div>
                              </div>
                           </div>
                        </li>)}
                     </ol>
                  ) : 
                  <div className='no-data-content'>No data for the selected period.</div>                                 
         }                  
      </div>
   );
}

function POSLastSales(props) {  

   const [loadingSales, setLoadingSales] = useState(true);
   const [salesItems, setSalesItems] = useState([]);
   const [selectedSale, setSelectedSale] = useState(null);

   if (!props.posInfo) {
      throw new Error('posInfo is not informed!');
   }

   useEffect(() => {
      setLoadingSales(true);     
      const source = api.getCancelToken();      
      const fetchItems = async () => {
         try {           
            const ret = await  api.get(
               `/sales/queries/last-sales/?id_point_sale=${props.posInfo.id}&num_sales=20`,
                  {
                     cancelToken: source.token
                  }
               );
            setSalesItems(ret.data);
            setLoadingSales(false);
            if (ret.data.length > 0) {
               setSelectedSale(ret.data[0]);
            } else {
               setSelectedSale(null);
            }
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(utils.getHTTPError(err));
            } 
         }
      }
      fetchItems();
      return () => {
         source.cancel();
      }
   }, [props.posInfo]);

   const handleClickItemSale = (itm) => {
      setSelectedSale(itm);
   }

   const getTimeAgoStr = (dt) => {            
      let dtComp = dt;
      if (typeof dtComp !== 'date')  {
         dtComp = new Date(dtComp);
      }
      return timeAgo.format(dtComp, 'round-minute');
   }
  

   return (
      <div className="dash-card" id="last-sales">
         <div className='dash-card-header'>
            <h2>Last Sales</h2>            
         </div>     
         {  
            loadingSales ? 
               <SurfaceLoading  /> :
               (
                  <div className='sales-client'>
                     <ol className='items-sales'>
                        {salesItems.map((itm) => <li 
                           key={itm.id} 
                           onClick={() => handleClickItemSale(itm)}
                           className={`itm-sale${itm.id === (selectedSale ? selectedSale.id : -1) ? '-selected' : ''}`} >
                           <div className='itm-sale-description'>{`${itm.items.length} items - ${itm.description}`}</div>
                           <div className='itm-sale-amount'>$ {itm.amount.toFixed(2)} </div>
                           <div className='itm-sale-when'>{getTimeAgoStr(itm.occurrence_date)} </div>
                        </li>)}
                     </ol>
                     {
                        selectedSale ? 
                           <div className='sale-detail'>     
                              <Tabs className={'tab-details-sale'}>
                                 <TabList>
                                    <Tab>Items</Tab>
                                    <Tab>Details</Tab>
                                 </TabList>
                                 <TabPanel className={'tab-details-sale-panel'}>
                                    <ol className='det-sale-item'>
                                       {selectedSale.items.map((chi) =>  <li key={chi.sequence} className='det-sale-item'>
                                          <div className='det-si-description'>{chi.description}</div>
                                          <div className='det-si-info'>
                                             <div className='det-si-item-first'># {chi.sequence}</div>
                                             <div className='det-si-item'>Qty: {chi.quantity}</div>
                                             <div className='det-si-item'>Price: $ {chi.price.toFixed(2)}</div>
                                             <div className='det-si-item'>Total: $ {chi.total_value.toFixed(2)}</div>
                                          </div>
                                       </li> )}
                                    </ol>
                                 </TabPanel>
                                 <TabPanel className={'tab-details-sale-add-info'}>
                                    <div className='sale-add-info-first'>
                                       <div>{`Sale #${selectedSale.id}`}</div>
                                       <div>{utils.getDateToStrShow(selectedSale.occurrence_date)}</div>
                                    </div>
                                    <div className='sale-add-info'>{`Products: ${selectedSale.items.length}`}</div>
                                    <div className='sale-add-info-total'>
                                       <div>Total:</div>
                                       <div>{`$${selectedSale.amount.toFixed(2)}`}</div>
                                    </div>                                    
                                 </TabPanel>
                              </Tabs>
                           </div> : 
                           <div className='sale-detail'>
                              <strong>Select a sale for to show his details</strong>
                           </div>
                     }                     
                  </div>
               )               
         }    
      </div>
   );

}

function POSSalesProgress(props) {

   const [period, setPeriod] = useState('7');
   const [periodDates, setPeriodDates] = useState(getDateFromPeriod('7'));
   const [loadingData, setLoadingData] = useState(true);
   const [salesItems, setSalesItems] = useState([]);

   if (!props.posInfo) {
      throw new Error('posInfo is not informed!');
   }

   const handleChangePeriod = (per) => {
      setPeriod(per);
      setPeriodDates(getDateFromPeriod(per));      
   }

   useEffect(() => {
      setLoadingData(true);
      const cancelToken = api.getCancelToken();
      const fetchMtd = async () => {
         try {
            const groupType = (periodDates.from.getTime() === periodDates.to.getTime()) ? 'H' : 'D';
            const itms = await api.get(`/sales/queries/sales-in-period/?id_point_sale=${props.posInfo.id}` + 
            `&from=${utils.getDateToURLParam(periodDates.from)}&to=${utils.getDateToURLParam(periodDates.to)}&group_type=${groupType}`
            );
            setSalesItems(itms.data);
            setLoadingData(false);
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(utils.getHTTPError(err));
            }
         }         
      };
      fetchMtd();
      return () => cancelToken.cancel();
   }, [periodDates, props.posInfo])

   

   return (
      <div className="dash-card" id="sales-progress">
         <div className='dash-card-header dash-card-header-period'>
            <h2>Sales Progress</h2>
            <PeriodStandard 
               value={period} 
               onChange={(itm) => handleChangePeriod(itm)}            
            />
         </div>     
         {
            loadingData ? 
               <SurfaceLoading  />  :
               salesItems.length > 0  ? 
                     (
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart
                              width={500}
                              height={400}
                              data={salesItems}
                              margin={{
                                 top: 16,
                                 right: 16,
                                 left: 0,
                                 bottom: 16,
                              }}
                           >
                              <defs>
                                 <linearGradient id="saleGrd" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFDEB4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#FFDEB4" stopOpacity={0}/>
                                 </linearGradient>                     
                              </defs>
                              <CartesianGrid strokeDasharray="1 1" />
                              <XAxis dataKey="period"  fontSize={12}  />
                              <YAxis fontSize={10} tick={{stroke: '#707070', strokeWidth: 0.5, opacity: 0.7}} />
                              <Tooltip />
                              <Area type="monotone" dataKey="total_value" name={'Amount'}   stroke="#FFBC65" fillOpacity={1} fill="url(#saleGrd)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     ) : 
                     <div className='no-data-content'>No data for the selected period.</div>                                 
         }       
      </div>
   );

}


function POSSalesAmount(props) {

   const [period, setPeriod] = useState('7');
   const [periodDates, setPeriodDates] = useState(getDateFromPeriod('7'));
   const [loadingData, setLoadingData] = useState(true);
   const [totalSales, setTotalSales] = useState(0);

   if (!props.posInfo) {
      throw new Error('posInfo is not informed!');
   }

   const handleChangePeriod = (per) => {
      setPeriod(per);
      setPeriodDates(getDateFromPeriod(per));      
   }

   useEffect(() => {
      setLoadingData(true);
      const cancelToken = api.getCancelToken();
      const fetchMtd = async () => {
         try {
            const groupType = (periodDates.from.getTime() === periodDates.to.getTime()) ? 'H' : 'D';
            const dtRet = await api.get(`/sales/queries/amount-from-period/?id_point_sale=${props.posInfo.id}` + 
            `&from=${utils.getDateToURLParam(periodDates.from)}&to=${utils.getDateToURLParam(periodDates.to)}&group_type=${groupType}`
            );
            setTotalSales(dtRet.data.total);
            setLoadingData(false);
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(utils.getHTTPError(err));
            }
         }         
      };
      fetchMtd();
      return () => cancelToken.cancel();
   }, [periodDates, props.posInfo])

   

   return (
      <div className="dash-card header-dash-item" id="sales-amount">
         <div id='parent-icon-dash-shop'>
            <BsShop size={24}  />
         </div>
         <div className='header-dash-subitem'>
            <div className='header-sales-amount'>
               <h3>Sales Amount</h3>
               <PeriodStandard 
                  value={period} 
                  onChange={(itm) => handleChangePeriod(itm)}            
               />
            </div>
            {
            loadingData ? 
               <SurfaceLoading size={20} />  :
               <strong className='sales-amount'>${totalSales.toFixed(2)}</strong>                          
         }                   
         </div>            
      </div>      
   );

}

export default function POSDashboard (props) {

   return (
      <div className='dashboard-parent'>
         <div className="grid-parent"> 
            <div className="dash-card header-dash-item" id="physical-amount">            
               <div id='parent-icon-dash-money'>
                  <FaRegMoneyBillAlt size={24} />            
               </div>
               <div className='header-dash-subitem'>
                  <h3>Physical Amount</h3>
                  <strong className='physical-amount'>$ {props.posInfo.current_value.toFixed(2)}</strong>
               </div>            
            </div>
            <POSSalesAmount posInfo={props.posInfo} />
            <POSSalesProgress  posInfo={props.posInfo} />
            <POSLastSales posInfo={props.posInfo} />
            <POSTopProducts posInfo={props.posInfo}  />
         </div>
         <div className='dashboard-flex'>
            <div className="dash-card header-dash-item" id="physical-amount">            
               <div id='parent-icon-dash-money'>
                  <FaRegMoneyBillAlt size={24} />            
               </div>
               <div className='header-dash-subitem'>
                  <h3>Physical Amount</h3>
                  <strong className='physical-amount'>$ {props.posInfo.current_value.toFixed(2)}</strong>
               </div>            
            </div>
            <POSSalesAmount posInfo={props.posInfo} />            
            <Tabs className={'tabs-dash'}>
               <TabList>
                  <Tab>Sales Progress</Tab>
                  <Tab>Last Sales</Tab>
                  <Tab>Top Products</Tab>
               </TabList>
               <TabPanel >
                  <POSSalesProgress  posInfo={props.posInfo} />
               </TabPanel>
               <TabPanel >
                  <POSLastSales posInfo={props.posInfo} />
               </TabPanel>
               <TabPanel >
                  <POSTopProducts posInfo={props.posInfo}  />
               </TabPanel>                                      
            </Tabs>            
         </div>

      </div>
      
   );

}