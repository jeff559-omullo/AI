function Card({ title, children }) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: "5px",
        marginBottom: "20px"
      }}>
        <div style={{
          background: "#c59b2a",
          padding: "10px",
          color: "#fff",
          fontWeight: "bold"
        }}>
          {title}
        </div>
  
        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>
    );
  }
  
  export default Card;