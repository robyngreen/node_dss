const Button = ( props ) => {
  return (
    <button onClick={ props.clickEvent }
      className={ props.addClasses + ' btn' }>
      { props.children }
      <style jsx>{`
        .btn {
          display: inline-block;
          text-align: center;
          line-height: 1;
          cursor: pointer;
          background: radial-gradient(#b51a2e, #cd163f);
          color: #fff;
          font-weight: bold;
          transition: background 0.25s ease-out, color 0.25s ease-out;
          vertical-align: middle;
          border: 1px solid #b51a2e;
          border-radius: 10px;
          padding: 0.85em 3em;
          font-size: 0.875rem;
          text-decoration: none;
        }

        .btn:active {
          background: radial-gradient(#8e1424, #8a1322);
        }

        .btn:hover {
          background: radial-gradient(#b51a2e, #b51a2e);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #58595b;
          color: #fff;
        }
      `}</style>
    </button>
  );
};

export default Button;
