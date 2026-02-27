import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSimplybuilt,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  useEffect(() => {
  const allowed = sessionStorage.getItem("allowRegister");

  if (!allowed) {
    navigate("/register", { replace: true });
  }

  sessionStorage.removeItem("allowRegister");
}, [navigate]);
  
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    password: "",
    c_password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.c_password)
      return alert("Passwords do not match");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(response.ok ? data.message : data.error);

      if (response.ok) navigate("/", { replace: true });
    } catch (error) {
      alert("Server error");
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "#ffffff" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark mx-auto">
          <div className="modal-header justify-content-center">
            <h4 className="modal-title text-light align-content-center"><FontAwesomeIcon icon={faSimplybuilt} style={{ color: "red", cursor: "pointer", fontSize: '24px' }}/> Register</h4>
          </div>
        <div className="modal-body text-light">
        <div className="row g-3">
          <div className="col">
            <input
              type="text"
              id="fname"
              placeholder="First Name"
              className="form-control"
              onChange={handleChange}
            />
          </div>
          <div className="col">
            <input
              type="text"
              id="lname"
              placeholder="Last Name"
              className="form-control"
              onChange={handleChange}
            />
          </div>
        </div>

        <input type="text" id="username" placeholder="Username" className="form-control mt-3" onChange={handleChange} />
        <input type="email" id="email" placeholder="Email" className="form-control mt-3" onChange={handleChange} />
        <input type="password" id="password" placeholder="Password" className="form-control mt-3" onChange={handleChange} />
        <input type="password" id="c_password" placeholder="Confirm Password" className="form-control mt-3" onChange={handleChange} />
        <div className="text-center mt-4">
        <button className="btn btn-primary w-50" onClick={handleSubmit}>
          Register
        </button>

        <p className="text-center mt-3">Already have an account?{" "}
          <span style={{ color: "blue", cursor: "pointer" }} onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default Register;
