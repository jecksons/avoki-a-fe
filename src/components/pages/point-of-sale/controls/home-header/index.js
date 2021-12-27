import './styles.css';
import { Link } from 'react-router-dom';

export default function HomeHeader(props) {
    return (
        <header className="pos-header">
            <Link to="/">AVOKI</Link> 
            <div id="pos-name"> {props.posInfo.description} </div>
        </header>
    );
}