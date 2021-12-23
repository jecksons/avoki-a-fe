export default function Config(){
    let env = process.env.NODE_ENV || 'development';
   
    const dev_prod = process.env.REACT_APP_DEV_PROD || 'N';    

    if (dev_prod === 'Y') {        
        env = 'production';
        console.log('Dev environment manually changed to production.');
    };


    const cfgBase = {        
        development: {
            apiURL: 'http://localhost:3000',
            original_env: env
        },
        production: {
            apiURL: 'https://avoki-a-be.herokuapp.com',
            original_env: env
        }
    };

    return cfgBase[env];
}