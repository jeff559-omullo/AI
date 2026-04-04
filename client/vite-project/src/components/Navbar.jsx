import "./navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="search">
        <input type="text" placeholder="Search..." />
      </div>

      <div className="profile">
        <img src="/avatar.png" alt="user" />
        <span>Omullo Otieno Jeff</span>
      </div>
    </div>
  );
}