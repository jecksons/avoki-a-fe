import './styles.css';
import ReactLoading from 'react-loading';

export default function SurfaceLoading(props) {
   return (
      <div className='parent-loading-status-onsurface'>
         <ReactLoading type="spin" color="#F48C06"  width={props.size > 0 ? props.size : 36 }  height={props.size > 0 ? props.size : 36 } /> 
      </div>
   );
}