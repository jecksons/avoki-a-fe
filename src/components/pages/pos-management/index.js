import './styles.css';
import React, {useState, useEffect} from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../../../services/api';
import utils from '../../../services/utils';
import qs from 'qs';
import {MdSpaceDashboard, MdOutlineFeaturedPlayList} from 'react-icons/md';
import POSDashboard from './controls/pos-dashboard';
import {RiMenu5Fill} from 'react-icons/ri';


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
      if (props.onSelectOption) {
         props.onSelectOption();
      }
   }

   return (
      <section className='side-menu'>
         {props.hideAppTitle ? null :  <Link to="/" className='app-title' >AVOKI</Link>}         
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



function POSManagementTopMenu(props) {

   if (!props.onChangeShow) {
      throw new Error('No onChangeShow is informed!');
   }
   
   return (
      <header className='top-mgment'>
         <button onClick={() => {
            props.onChangeShow();
         } } className='hambg-menu'><RiMenu5Fill size={20}/></button>
         <Link to="/" className='app-title-small' >AVOKI</Link>                     
      </header>
   );

}


function LeftSideMenuHidden(props) {
   return (
      <div className={`left-side-hide-menu${props.show ? '-show' : ''}`}>
         <LeftSideMenu 
            posInfo={props.posInfo} 
            location={props.location}
            hideAppTitle={true}
            selMenuOption={props.selMenuOption}         
            onSelectOption={() => {
               if (props.onChangeShow) {
                  props.onChangeShow();
               }
            }}
         />
         
      </div>
   ) 
}

export default function POSManagement(props) {

   const [posInfo, setPosInfo] = useState(null);
   const [loadingPosInfo, setLoadingPosInfo] = useState(true);
   const history = useHistory();
   const [selMenuOption, setSelMenuOption] = useState(ManMenuOptions.dashboard);
   const [showMenu, setShowMenu] = useState(false) ;

   useEffect(() => {
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
         utils.redirectToErrorPage(history, err, props.location);
      });
   }, [props.match.params.id, props.location, history]);

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

   const onChangeShowMenu = () => {
      setShowMenu(!showMenu);
   }


   return (
      <div>
         {
            loadingPosInfo ? <div>Loading...</div> :
            (               
               <div className='parent-management'>
                  <POSManagementTopMenu  onChangeShow={onChangeShowMenu} />              
                  <div className='side-menu-normal'>
                     <LeftSideMenu   
                        posInfo={posInfo} 
                        location={props.location}
                        selMenuOption={selMenuOption} />
                  </div>                                        
                  <LeftSideMenuHidden 
                     posInfo={posInfo} 
                     onChangeShow={onChangeShowMenu}
                     location={props.location}
                     show={showMenu}
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