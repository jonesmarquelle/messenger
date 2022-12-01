interface SendIconProps {
    className?: string,
    height?: string|number,
    width?: string|number,
    fill?: string,
}

const SendIcon: React.FC<SendIconProps> = (props) => {
    return (
        <svg 
            height={props.height} width={props.width} 
            className= {`${props.className ?? ""} svg-icon`}
            viewBox="0 0 48 48" 
            xmlns="http://www.w3.org/2000/svg">
                <path d="M4.02 42l41.98-18-41.98-18-.02 14 30 4-30 4z" stroke={props.fill} fill={props.fill}/>
        </svg>
    );
}

export default SendIcon