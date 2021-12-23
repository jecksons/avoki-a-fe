import './style.css';
import React, {useState} from 'react';
import Autocomplete from 'react-autocomplete';
import api from '../../../services/api';
import utils from '../../../services/utils';

export default function ProductAutoComplete(props) {

    if (!props.onSetErrorMessage) {
        throw new Error('No onSetErrorMessage informed!');
    }

    const [textSearch, setTextSearch] = useState('');
    const [foundItems, setFoundItems] = useState([]);    
    const [searchMenuIsOpen, setSearchMenuIsOpen] = useState(false);
    const [selItemSearch, setSelItemSearch] = useState(null);

    const handleSearch = (newText) => {
        setSelItemSearch(null);
        setTextSearch(newText ?? '');
        api.get(`products/?business=1=&searchtext=${newText}`)
        .then((ret) => {
            if (ret.status === 200) {                
                setFoundItems(ret.data.results.map((itm) => 
                    { return {
                        value: itm.id, 
                        key: itm.id, 
                        label: itm.description, 
                        category_name: itm.category.description
                    }; } 
                ));
            } else {
                setFoundItems([]);                
                props.onSetErrorMessage(utils.getHTTPError(ret));
            }
        }).catch((err) => {
            props.onSetErrorMessage(utils.getHTTPError(err));
        });
    }

    const handleSelectItemSearch = (value, item)  => {
        setTextSearch(value);
        setSelItemSearch(item);
    }

    const addSelItemSearch = () => {
        if (selItemSearch) {
            props.onAddItem({
                id: selItemSearch.value,
                quantity: 1
            });
            handleSearch('');
        }
    }

    return (
        <Autocomplete 
            value={textSearch}
            onMenuVisibilityChange={(isOpen) => setSearchMenuIsOpen(isOpen)}
            wrapperProps={
                {
                    className: `search-input-parent${searchMenuIsOpen ? '-open' : ''}`
                }
            }
            inputProps={
                {
                    placeholder: 'Search the product or type his code',
                    onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                            addSelItemSearch();
                        }
                    },
                    onFocus: (win, ev) => {
                        if (textSearch === '' && foundItems.length === 0) {
                            handleSearch('');
                        }
                    }
                }
            }                            
            onSelect={handleSelectItemSearch}
            menuStyle={
                {
                    borderRadius: '0 0 20px 20px',
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 10px 12px rgba(0, 0, 0, 0.1)',
                    padding: '3px 0 2px',
                    zIndex: '3',
                    fontSize: '90%',
                    marginTop: '-1px',
                    position: 'fixed',
                    overflow: 'auto',
                    maxHeight: '50%', 
                    }
            }
            items={foundItems}
            getItemValue={(item) => item.label}
            onChange={(e) => handleSearch(e.target.value)}
            renderItem={(item, isHighlighted) =>
                <div key={item.value} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    background: isHighlighted ? 'lightgray' : 'white' 
                }} > 
                    <div style={
                        {                                             
                            fontSize: '1rem',
                            padding: '0.5rem',
                            cursor: 'default'
                        }}>
                        {item.label}
                    </div>
                    <div style={
                        { 
                            fontSize: '0.8rem',
                            padding: '0.5rem',
                            cursor: 'default',
                            color: '#707007'
                        }}>
                        {item.category_name}
                    </div>

                </div>                                
                }                           
        />
    );
}
