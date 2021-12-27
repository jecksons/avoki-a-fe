class Utils {

    getHTTPError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.data) {
                if (error.response.data.error)
                    return error.response.data.error;
                if (error.response.data.message)
                    return error.response.data.message;
                return error.response.data;
            }
          }
        return error.message;
    }

    getDateToURLParam(dt) {        
        return `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
    }

    getDateToStrShow(dt) {
        let dtDate = dt;
        if (typeof dtDate === 'string') {
            dtDate = new Date(dtDate);
        }
        return `${dtDate.getDate().toString().padStart(2, '0')}/${(dtDate.getMonth()+1).toString().padStart(2, '0')}/` + 
            `${dtDate.getFullYear().toString()}, ${dtDate.getHours().toString().padStart(2, '0')}:${dtDate.getMinutes().toString().padStart(2, '0')}`;

    }

}

export default new Utils();