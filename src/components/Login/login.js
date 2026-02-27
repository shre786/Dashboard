import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngellist,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const goToRegister = () => {
  sessionStorage.setItem("allowRegister", "true");
  navigate("/register");
};
  const goToForgetPassword = () => {
  sessionStorage.setItem("allowForgotPassword", "true");
  navigate("/forgot-password");
};

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("allowHomeOnce", "true");
      alert("Login successful");
      navigate("/dashboard");
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
    alert("Server error");
  }
};

  return (
    <div className="modal fade show d-block"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark mx-auto">
          <div className="modal-header justify-content-center" >
            <h4 className="modal-title text-light align-content-center"><FontAwesomeIcon icon={faAngellist} style={{ color: "green", cursor: "pointer", fontSize: '24px' }}/> LogIn</h4>
          </div>

          <div className="modal-body text-light">
            <div className="d-flex justify-content-center">
            <input type="text" id="username" className="form-control w-75 mt-3"
              placeholder="Username"
              onChange={handleChange}
              required
            />
            </div>
            <div className="d-flex justify-content-center">
            <input type="password" id="password" className="form-control w-75 mt-3"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            </div>
            <p className="mt-3 ms-5"><span onClick={goToForgetPassword} style={{ color: "red", cursor: "pointer" }}>Forgot Password?</span></p>
            <div className="text-center mt-3">
              <button className="btn btn-primary w-50" onClick={handleSubmit}>
                Login
              </button>

              <p className="mt-3">
                Not a member?{" "}
                <span style={{ color: "blue", cursor: "pointer" }} onClick={goToRegister}>
                  Register
                </span>
              </p>

              <p className="mb-2">
                SIGN UP </p>
                <div className="icon mt-2 mb-3">
  <img
    src="https://www.google.com/favicon.ico"
    alt="Google"
    style={{ width: "20px", cursor: "pointer" }}
  />

  <img
    src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
    alt="LinkedIn"
    style={{ width: "20px", marginLeft: "10px", cursor: "pointer" }}
  />

  <img
    src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
    alt="Instagram"
    style={{ width: "20px", marginLeft: "10px", cursor: "pointer" }}
  />
</div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
