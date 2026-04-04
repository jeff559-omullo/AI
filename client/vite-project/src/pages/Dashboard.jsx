import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./dashboard.css";
import AIChat from "../components/AIChat";

export default function Dashboard() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("studentToken"); // ✅ use studentToken
        const res = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!student) return <p style={{ marginLeft: "260px" }}>Loading...</p>;

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="dashboard">
        {/* Basic info */}
        <div className="card">
          <h3>Basic information</h3>
          <div className="info">
            <img src="/avatar.png" alt="" />
            <div>
              <p><b>Reg No</b> {student.regNo}</p>
              <p><b>Name</b> {student.name}</p>
              <p><b>ID No</b> {student.idNo || "N/A"}</p>
              <p><b>Gender</b> {student.gender || "N/A"}</p>
            </div>
            <div>
              <p><b>Address</b> {student.address || "N/A"}</p>
              <p><b>Email</b> {student.email}</p>
              <p><b>Date Of Birth</b> {student.dob || "N/A"}</p>
              <p><b>Campus</b> {student.campus || "MAIN"}</p>
            </div>
          </div>
          <button className="btn">Get Academic Calendar</button>
        </div>

        {/* Academic & Fee */}
        <div className="row">
          <div className="card half">
            <h3>Academic Information</h3>
            <p>{student.course || "Not Assigned"}</p>
            <p>Attempted Units: {student.attemptedUnits || 0}</p>
            <p>Registered Units: {student.registeredUnits || 0}</p>
          </div>
          <div className="card half">
            <h3>Fee Payment</h3>
            <button className="btn">Make Payment</button>
            <p className="link">Already Paid?</p>
            <p><b>Balance:</b> KES {student.feesBalance || 0}</p>
          </div>
        </div>

        {/* Documents table */}
        <div className="card">
          <h3>Important Documents</h3>
          <table>
            <thead>
              <tr><th>#</th><th>File Name</th><th>Remarks</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Rules and Regulations</td>
                <td>-</td>
                <td><button className="view">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <AIChat />
      </div>
    </>
  );
}