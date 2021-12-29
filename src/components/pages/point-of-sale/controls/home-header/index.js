import './styles.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';


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
                    props.menuItems.map((itm) => <Link key={props.menuItems.indexOf(itm)} to={itm.url} >{itm.caption}</Link> )
                }
            </div>
        </div>
    )

}

export default function HomeHeader(props) {
    return (
        <header className="pos-header">
            <Link to="/" className='app-home-title'>AVOKI</Link> 
            {
                props.posInfo ? 
                    <div className='parent-nav'>
                        <HomeDropDown  
                            caption={'Products'}
                            menuItems={[
                                {caption: 'Products', url: '/products'},
                                {caption: 'Product Categories', url: '/product-categories'}
                            ]} />
                        <HomeDropDown  
                            caption={'Point of Sale'}
                            menuItems={[
                                {caption: 'Dashboard', url: `/pos-management/${props.posInfo.unique_code}`},
                            ]} />
                    </div> : 
                    
                    <div id="pos-name">  </div>
            }            
        </header>
    );
}