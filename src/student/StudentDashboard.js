import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentProfile from "./StudentProfile";
import StudentAttendance from "./StudentAttendance";
import AttendanceOverview from "./AttendanceOverview";
import "../student/student.css";
import logo from "../assets/vitb.png";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  
} from "firebase/firestore";

export default function StudentDashboard() {
  // start on profile view since dashboard button removed
  const [active, setActive] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

  const navigate = useNavigate();

  const logout = async () => {
    localStorage.clear();
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setLoadError("");

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const uid = user.uid;
      console.log("Current user UID:", uid);

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User profile not found in Firestore for UID:", uid);
          alert("Failed to load student profile from Firebase. User profile not found.");
          setLoadError("Failed to load student profile from Firebase.");
          setProfile(null);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        console.log("Fetched user data:", userData);

        const role = userData.role;
        if (role !== "student") {
          console.error("Invalid role for student dashboard:", role);
          alert("Access denied. Invalid role.");
          navigate("/");
          return;
        }

        const profileData = {
          uid,
          email: user.email || "",
          name: userData.name || user.displayName || "",
          regNumber: userData.regNumber || "",
          busNumber: userData.busNumber || "",
          college: userData.college || "",
        };

        setProfile(profileData);
        setLoadError("");
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load student profile from Firebase.");
        setLoadError("Failed to load student profile from Firebase.");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <img src={logo} alt="VITB" />
        <h2>Vishnu Institute of Technology and Business</h2>
      </div>

      <div className="dashboard-body">
        <div className="sidebar">
          <div className="profile-section">
            <img
              src={profile?.photo || "https://via.placeholder.com/150"}
              alt="profile"
              className="profile-img"
            />
            <h3>{profile?.name || "Student"}</h3>
            <p className="sidebar-regNo">{profile?.regNumber || "N/A"}</p>
            <p className="sidebar-busNo">Bus No: {profile?.busNumber || "N/A"}</p>
            <p className="sidebar-college">{profile?.college || "College: N/A"}</p>
            <button
              className="edit-profile-btn"
              onClick={() => setActive("profile")}
            >
              Edit Profile
            </button>
          </div>


          <div className="sidebar-menu">

            <button
              className={active === "profile" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActive("profile")}
            >
              <span className="icon">👤</span>
              <span className="label">Profile</span>
              <span className="arrow">›</span>
            </button>

            <button
              className={active === "qr" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActive("qr")}
            >
              <span className="icon">�</span>
              <span className="label">Mark Attendance</span>
              <span className="arrow">›</span>
            </button>
            <button
              className={active === "attendance" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActive("attendance")}
            >
              <span className="icon">✅</span>
              <span className="label">Attendance Overview</span>

            </button>
          </div>

          {loadError && <p className="status-label">{loadError}</p>}

          <button className="logout-btn" onClick={logout}>
            <span className="icon">🚪</span>
            <span className="label">Logout</span>
          </button>
        </div>

        <div className="main-content">
          <div className="content-wrapper">
            {loading && <div className="card">Loading...</div>}
            {!loading && active === "profile" && (
              <StudentProfile profile={profile} onProfileSaved={setProfile} />
            )}
            {!loading && active === "qr" && <StudentAttendance regNo={profile?.regNumber} />}
            {!loading && active === "attendance" && (
              <AttendanceOverview regNo={profile?.regNumber} />
            )}
          </div>
        </div>

        <Calendar />
      </div>
    </div>
  );
}

function Calendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = today.toLocaleString("default", { month: "long" });

  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="right-panel">
      <div className="calendar-box">
        <h3>{monthName} {year}</h3>

        <div className="calendar-grid">
          {/* Week Days */}
          <div className="day-name">Sun</div>
          <div className="day-name">Mon</div>
          <div className="day-name">Tue</div>
          <div className="day-name">Wed</div>
          <div className="day-name">Thu</div>
          <div className="day-name">Fri</div>
          <div className="day-name">Sat</div>

          {/* Empty slots */}
          {blanks.map((_, i) => (
            <div key={"blank" + i}></div>
          ))}

          {/* Dates */}
          {days.map((day) => (
            <div
              key={day}
              className={day === today.getDate() ? "today" : ""}
            >
              {day}
            </div>
          ))}
        </div>

        <p className="today-text">
          Today: <strong>{today.toDateString()}</strong>
        </p>
      </div>
    </div>
  );
}
