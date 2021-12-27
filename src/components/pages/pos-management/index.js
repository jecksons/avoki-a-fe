import './styles.css';
import React, {useState, useEffect} from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../../../services/api';
import utils from '../../../services/utils';
import qs from 'qs';
import {MdSpaceDashboard, MdOutlineFeaturedPlayList} from 'react-icons/md';
import POSDashboard from './controls/pos-dashboard';


const ManMenuOptions =  {
   dashboard: 0,
   statements: 1
};

function LeftSideMenu(props) {

   const history = useHistory();
   const posInfo = props.posInfo;
   const selMenuOption = props.selMenuOption;
   if (!posInfo) {
      throw new Error('posInfo is not informed!');
   }

   const handleSelMenuItem = (idItem) => {      
      history.push({pathname: props.location.pathname, search: `?menuOption=${idItem}`});
   }

   return (
      <section className='side-menu'>
         <Link to="/" className='app-title' >AVOKI</Link>
         <button className='dash-pos-info' onClick={() => {
            history.push(`/pointofsale/${posInfo.unique_code}`);
         }}>
            {posInfo.description}            
         </button>         
         <div className='dash-mo' >
            <button 
               className={`dash-mi${selMenuOption === ManMenuOptions.dashboard ? '-selected' : ''}` }
               onClick={() => handleSelMenuItem(ManMenuOptions.dashboard)}>
               <MdSpaceDashboard size={20}/>Dashboard
            </button>
            <button 
               className={`dash-mi${selMenuOption === ManMenuOptions.statements ? '-selected' : ''}` }
               onClick={() => handleSelMenuItem(ManMenuOptions.statements)}>
               <MdOutlineFeaturedPlayList size={20} />POS Statements
            </button>
         </div>
      </section>
   )
}


export default function POSManagement(props) {

   const [posInfo, setPosInfo] = useState(null);
   const [loadingPosInfo, setLoadingPosInfo] = useState(true);
   const history = useHistory();
   const [selMenuOption, setSelMenuOption] = useState(ManMenuOptions.dashboard);

   useEffect(() => {
      console.log('loading');
      setLoadingPosInfo(true);
      api.get(`point_sale/${props.match.params.id}/?only_pos_info=Y`)
      .then((ret) => {
         setPosInfo({
            id: ret.data.id,
            description: ret.data.description,
            id_business: ret.data.id_business,
            current_value: ret.data.current_value,
            unique_code: ret.data.unique_code
         });
         setLoadingPosInfo(false);
      })
      .catch((err) => {
         if (err.response) {
            if (err.response.status === 404)  {
               history.push(`/notfound/?requestedURL=${props.location.pathname}`);
               return;
            }
         }
         console.log(utils.getHTTPError(err));         
         setLoadingPosInfo(false);
      });
   }, [props.match.params.id, props.location.pathname, history]);

   useEffect(() => {
      if (props.location.search !== '') {
         let options =  qs.parse(props.location.search.substring(1));
         if (options.menuOption !== '') {
            options.menuOption = parseInt(options.menuOption);
         }         
         if (options.menuOption === ManMenuOptions.dashboard || options.menuOption === ManMenuOptions.statements)  {
            setSelMenuOption(options.menuOption);
         }
      }
   }, [props.location.search]);


   return (
      <div>
         {
            loadingPosInfo ? <div>Loading...</div> :
            (               
               <div className='parent-management'>
                  <header className='top-mgment'>
                     <button onClick={() => {}}>H</button>
                     <Link to="/" className='app-title-small' >AVOKI</Link>
                  </header>
                  <LeftSideMenu   
                     posInfo={posInfo} 
                     location={props.location}
                     selMenuOption={selMenuOption} />
                  <section className='client-items'>
                     {selMenuOption === ManMenuOptions.dashboard ? <POSDashboard posInfo={posInfo}/> : 'statements'}
                  </section>
               </div>
            )         
         } 
      </div>
   )
}