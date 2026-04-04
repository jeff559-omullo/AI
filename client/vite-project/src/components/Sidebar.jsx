import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaBook,
  FaClock,
  FaFileAlt,
  FaClipboardCheck,
  FaMoneyBill,
  FaReceipt,
  FaBed,
  FaKey,
  FaFileSignature,
  FaUserTie
} from "react-icons/fa";

import "./sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Rongo" />
      </div>

      <div className="menu">

        <p className="section">DASHBOARD</p>
        <NavLink to="/dashboard">
          <FaTachometerAlt className="icon" /> Dashboard
        </NavLink>

        <p className="section">PERSONAL</p>
        <NavLink to="/profile">
          <FaUser className="icon" /> Personal Profile
        </NavLink>

        <p className="section">ACADEMICS</p>
        <NavLink to="/courses">
          <FaBook className="icon" /> Course Registration
        </NavLink>

        <NavLink to="/timetable">
          <FaClock className="icon" /> TimeTable
        </NavLink>

        <NavLink to="/requisition">
          <FaFileAlt className="icon" /> Academic Requisition
        </NavLink>

        <NavLink to="/evaluation">
          <FaClipboardCheck className="icon" /> Course Evaluation
        </NavLink>

        <p className="section">FINANCIALS</p>
        <NavLink to="/fees">
          <FaMoneyBill className="icon" /> Fee Statement
        </NavLink>

        <NavLink to="/receipts">
          <FaReceipt className="icon" /> Receipts
        </NavLink>

        <p className="section">ACCOMMODATION</p>
        <NavLink to="/hostel">
          <FaBed className="icon" /> Hostel Booking
        </NavLink>

        <p className="section">EXAMINATION</p>
        <NavLink to="/transcript">
          <FaFileSignature className="icon" /> Transcript
        </NavLink>

        <p className="section">SETTINGS</p>
        <NavLink to="/password">
          <FaKey className="icon" /> Change Password
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;