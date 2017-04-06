const Button = ( props ) => {
  return (
    <button onClick={ props.clickEvent }
      className={ props.addClasses }>
      { props.children }
      <style jsx>{`
        button {
          display: block;
          border: 0;
          padding: 0.5rem 1rem;
          text-align: center;
          background-color: #CCC;
          cursor: pointer;
        }
      `}</style>
    </button>
  );
};

export default Button;
