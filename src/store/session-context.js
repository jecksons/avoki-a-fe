import React from 'react';


export const initialState = {
   id_business: null
};

const SessionContext = React.createContext(initialState);

export default SessionContext;