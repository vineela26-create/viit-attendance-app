import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import vitb from "./assets/vitb.png";
import "./Home.css";

export default function Home() {

  const navigate = useNavigate();

  

  useEffect(() => {

  const handler = (e) => {

    e.preventDefault();

    setInstallPrompt(e);

    // AUTO SHOW INSTALL POPUP

    setTimeout(async () => {

      if (e) {

        e.prompt();

        const choice = await e.userChoice;

        console.log(choice.outcome);

      }

    }, 2000);

  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {

    window.removeEventListener("beforeinstallprompt", handler);

  };

}, []);

  return (
    <div>

      <div className="logo-box">
        <img src={vitb} alt="college logo" className="hero-logo" />
        <h2 className="college-name">
          welcome to vishnu bus attendance
        </h2>
      </div>

      <section className="hero">

        <h1>smart Bus attendance</h1>

        <p>
          🚀 Track attendance instantly with QR scanning.
          📊 Real-time updates for students and faculty.
          🔐 Secure, fast, and paperless system.
        </p>

        <div className="hero-buttons">

          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "signup" } })
            }
            className="get-btn"
          >
            Get Started 🚀
          </button>

          {/* INSTALL BUTTON */}

          
  

        </div>

      </section>

      {/* ⭐ Features */}

      <section className="features">

        <h2>✨ Powerful Features</h2>

        <p>Everything you need for smart attendance</p>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>📷 QR Scan</h3>
            <p>Scan QR codes to mark attendance instantly.</p>
          </div>

          <div className="feature-card">
            <h3>⚡ Real-Time</h3>
            <p>Attendance updates immediately in database.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Reports</h3>
            <p>View attendance records anytime easily.</p>
          </div>

          <div className="feature-card">
            <h3>🔐 Secure</h3>
            <p>Firebase authentication ensures safety.</p>
          </div>

        </div>

      </section>

      {/* 🔄 How It Works */}

      <section className="how">

        <h2>⚙️ How It Works</h2>

        <div className="steps">

          <div className="step">
            <h3>1️⃣ Generate QR</h3>
            <p>Faculty creates session QR code</p>
          </div>

          <div className="step">
            <h3>2️⃣ Scan</h3>
            <p>Students scan using mobile</p>
          </div>

          <div className="step">
            <h3>3️⃣ Record</h3>
            <p>Attendance saved instantly</p>
          </div>

          <div className="step">
            <h3>4️⃣ View</h3>
            <p>Check records anytime</p>
          </div>

        </div>

      </section>

      {/* 📞 Footer */}

      <footer className="footer">
        <p>💜 Made for Vishnu College</p>
        <p>© 2026 Vishnu Bus Attendance</p>
      </footer>

    </div>
  );
}