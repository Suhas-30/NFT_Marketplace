import React from 'react';

const Button = (props) => {
  // Default styles for the button
  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: props.disabled ? "#cccccc" : "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: props.disabled ? "not-allowed" : "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0.5rem",
    transition: "background-color 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    opacity: props.disabled ? 0.7 : 1,
    textTransform: "capitalize"
  };

  // Handle mouse over effect
  const handleMouseOver = (e) => {
    if (!props.disabled) {
      e.target.style.backgroundColor = "#2980b9";
      e.target.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.15)";
    }
  };

  // Handle mouse out effect
  const handleMouseOut = (e) => {
    if (!props.disabled) {
      e.target.style.backgroundColor = "#3498db";
      e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    }
  };

  return (
    <button 
      type={props.type || "button"} 
      onClick={props.disabled ? null : props.onClick}
      style={buttonStyle}
      disabled={props.disabled}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {props.name}
    </button>
  );
};

export default Button;