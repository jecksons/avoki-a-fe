import React from 'react';
import { useLocation } from 'react-router-dom';

function useQuery(){
    return new URLSearchParams(useLocation().search);
}


export default function UnknownError(props) {
    let query = useQuery();
    
    return (
        <div>
            <strong>Ooops! An error has occurred!</strong>
            <div>
                {query.get('message')}
            </div>
            <div>
                {query.get('requestedURL') ?? '' }
            </div>
        </div>
    );
}