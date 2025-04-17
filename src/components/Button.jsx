const Button = (props)=>{
    return(
        <>
            <button type={props.type || "button"} onClick={props.onClick}>
                {props.name}
            </button>
        </>
    )
}

export default Button