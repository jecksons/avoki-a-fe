import './styles.css';

export default function HomeHeader(props) {
    return (
        <header className="pos-header">
            <div id="title">AVOKI</div>
            <div id="pos-name"> {props.posInfo.description} </div>
        </header>
    );
}