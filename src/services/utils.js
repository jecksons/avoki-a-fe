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
}

export default new Utils();