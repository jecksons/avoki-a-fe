import React from 'react';
import { useLocation } from 'react-router-dom';

function useQuery(){
    return new URLSearchParams(useLocation().search);
}


export default function NotFound(props) {
    let query = useQuery();
    return (
        <div>
            <div>
                The requested URL is not valid!
            </div>
            <div>
                {query.get('requestedURL') ?? '' }
            </div>
        </div>
    );
}