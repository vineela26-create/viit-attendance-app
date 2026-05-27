import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import vitb from "./assets/vitb.png";
import "./Home.css";

export default function Home() {

  const navigate = useNavigate();

  // INSTALL APP STATE
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // INSTALL APP EVENT
  useEffect(() => {

    const handler = (e) => {

      e.preventDefault();

      setDeferredPrompt(e);

    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {

      window.removeEventListener("beforeinstallprompt", handler);

    };

  }, []);

  return (

    <div>

      {/* LOGO */}

      <div className="logo-box">

        <img
          src={vitb}
          alt="college logo"
          className="hero-logo"
        />

        <h2 className="college-name">
          Welcome to Vishnu Bus Attendance
        </h2>

      </div>

      {/* HERO */}

      <section className="hero">

        <h1>Smart Bus Attendance</h1>

        <p>
          🚀 Track attendance instantly with QR scanning.
          📊 Real-time updates for students and faculty.
          🔐 Secure, fast, and paperless system.
        </p>

        <div className="hero-buttons">

          {/* GET STARTED */}

          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "signup" } })
            }
            className="get-btn"
          >
            Get Started 🚀
          </button>

          {/* INSTALL APP BUTTON */}

          {deferredPrompt && (

            <button
              className="install-btn"
              onClick={async () => {

                deferredPrompt.prompt();

                const choice =
                  await deferredPrompt.userChoice;

                console.log(choice.outcome);

              }}
            >
              Install App 📲
            </button>

          )}

        </div>

      </section>

      {/* FEATURES */}

      <section className="features">

        <h2>✨ Powerful Features</h2>

        <p>
          Everything you need for smart attendance
        </p>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>📷 QR Scan</h3>
            <p>
              Scan QR codes to mark attendance instantly.
            </p>
          </div>

          <div className="feature-card">
            <h3>⚡ Real-Time</h3>
            <p>
              Attendance updates immediately in database.
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Reports</h3>
            <p>
              View attendance records anytime easily.
            </p>
          </div>

          <div className="feature-card">
            <h3>🔐 Secure</h3>
            <p>
              Firebase authentication ensures safety.
            </p>
          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}

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

      {/* FOOTER */}

      <footer className="footer">

        <p>💜 Made for Vishnu College</p>

        <p>© 2026 Vishnu Bus Attendance</p>

      </footer>

    </div>

  );

}