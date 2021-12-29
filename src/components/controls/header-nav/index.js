import './styles.css';
import { Link } from 'react-router-dom';
import { useState, useContext, useReducer, useLayoutEffect } from 'react';
import SessionContext from '../../../store/session-context';
import {RiMenu5Fill} from 'react-icons/ri';
import {IoIosClose} from 'react-icons/io';

const initialRoutes = [
   {
      section: 'Products',
      items: [
         {
            caption: 'Products',
            path: '/products'
         },
         {
            caption: 'Product categories',
            path: '/product-categories'
         },
      ]
   }
];




function HomeDropDown(props) {

    const [isExpanded, setIsExpanded] = useState(false);        
    const toggleDrop = () => setIsExpanded(prevValue => !prevValue);
    
    const onBlurCloseDrop = (evnt)  => {
        if (!evnt.currentTarget.contains(evnt.relatedTarget)) {
            setIsExpanded(false);
        }
    }

    // 

    return (
        <div tabIndex={0} className={`home-drop-down ${isExpanded ? 'home-drop-down-expanded' : ''}`} onBlur={onBlurCloseDrop}>
            <button onClick={toggleDrop}>{props.caption}</button>
            <div className='home-drop-down-content'>
                {   
                    props.menuItems.map((itm) => <Link key={props.menuItems.indexOf(itm)} to={itm.path} >{itm.caption}</Link> )
                }
            </div>
        </div>
    )
}

function LeftSideMenu(props) {

   return (
      <div className={`left-side-menu-parent${props.show ? '-show' : ''}`}>  
         <div className={`left-side-menu${props.show ? '-show' : ''}`}  tabIndex={props.show ? 0 : -1}>
            <ul className='left-menu-items'>
               {
                  props.routes.map((itm) => <li key={itm.section} className='section-menu'>
                     <h4 className='section-menu-title'>{itm.section}</h4>
                     {itm.items.map((lnk) => <Link  className='left-menu-item' to={lnk.path} key={itm.items.indexOf(lnk)}>{lnk.caption}</Link> )}                  
                  </li> )
               }
            </ul>         
            <button className='left-menu-close' 
               onClick={() => {
                  if (props.onClose) {
                     props.onClose();
                  }
               }}         
               ><IoIosClose size={24}/></button>            
            </div>
         <div 
            className={`left-side-menu-shadow${props.show ? '-show' : ''}`}
            onClick={() => {
               if (props.onClose) {
                  props.onClose();
               }
            }}
            >
         </div>

      </div>

   );
}

function getRoutes(state, action)  {
   console.log('passou pelo getroutes');
   let ret = [...initialRoutes];
   if (action.sessionInfo.point_of_sale ) {
      ret.push(
         {
            section: 'Point of Sale',
            items: [         
               {
                  caption: 'Dashboard',
                  path: `/pos-management/${action.sessionInfo.point_of_sale.unique_code}`                  
               }
            ]
         }
      );
   }
   return ret;
}


export default function HeaderNav(props) {
   const {sessionInfo} = useContext(SessionContext);
   const [routes, routeDispatch] = useReducer(getRoutes, initialRoutes);
   const [showHiddenMenu, setShowHiddenMenu] = useState(false);

   useLayoutEffect(() => {
      routeDispatch({sessionInfo: sessionInfo});
   }, [sessionInfo]);


    return (
        <header className="home-nav">                                
            <button className='hambg-menu' onClick={() => setShowHiddenMenu(prev => !prev) }><RiMenu5Fill size={20} /></button>
            <Link to="/" className='app-home-title'>AVOKI</Link> 
            <div className='parent-nav-normal'>
               {
                  routes.map((itm) => <HomeDropDown key={itm.section} caption={itm.section} menuItems={itm.items} /> )
               }
            </div>             
            <LeftSideMenu show={showHiddenMenu} routes={routes} onClose={() => setShowHiddenMenu(false)} />

        </header>
    );
}