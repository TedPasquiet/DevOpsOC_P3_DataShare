interface HeaderProps {
  loggedIn?: boolean;
}
export function Header({loggedIn = false}: HeaderProps) {
  return (
    <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "16px",
        paddingBottom: "16px",
    }}
    >
        <h1
            style={{
            fontSize: "large",
            fontWeight: 700,
            fontStyle: "Bold",
            color: "#000000"
            }}
        >DataShare</h1>
        <span
        style={{
            fontSize: "16px",
            fontWeight: 400,
            fontStyle: "Regular",
            color: "#F3EEEA",
            lineHeight: "16px",
            background: "##2C2C2C",
            borderRadius: "16px",
            borderColor: "##2C2C2C",
            height: "40px",
            width: "143px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            }}
        >
            {loggedIn ? "Mon espace" : "Se connecter"}
        </span>
    </div>
  );
}