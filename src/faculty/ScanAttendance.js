import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import QRCode from "react-qr-code";

export default function ScanAttendance() {
  const [userName, setUserName] = useState("Faculty");
  const [attendanceCode, setAttendanceCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [busId] = useState("");
  const [,setExpiryTime] = useState("");
  const [detectedStudent, setDetectedStudent] = useState(null);

  const today = new Date().toLocaleDateString("en-CA");

  // ✅ FIXED SESSION (NO CHANGE ON LOGIN)
  useEffect(() => {
    const savedSession = localStorage.getItem("faculty_sessionId");
    const savedDate = localStorage.getItem("faculty_sessionDate");

    if (savedSession && savedDate === today) {
      // reuse same session
      setSessionId(savedSession);
    } else {
      // create new session
      const newSession = "SESSION-" + today;
      setSessionId(newSession);

      localStorage.setItem("faculty_sessionId", newSession);
      localStorage.setItem("faculty_sessionDate", today);
    }

    setExpiryTime(null); // full day
  }, [today]);

  // ✅ FETCH USER
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { auth } = await import("../firebase/firebase");
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserName(userSnap.data().name || user.displayName || "Faculty");
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };
    fetchUserName();
  }, []);

  // ✅ MARK ATTENDANCE (UNCHANGED)
  const markAttendance = async (regNo) => {
    if (!regNo.trim()) return;

    try {
      const reg = regNo.trim().toUpperCase();

      const studentRef = doc(db, "students", reg);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        setDetectedStudent({ status: "❌ Student not found" });
        return;
      }

      const student = studentSnap.data();

      const attendanceRef = doc(db, "attendance", today);
      const attendanceSnap = await getDoc(attendanceRef);

      const existingList = attendanceSnap.exists()
        ? attendanceSnap.data().presentList || []
        : [];

      if (existingList.some((s) => s.regNo === reg)) {
        setDetectedStudent({
          status: "⚠️ Already marked",
          name: student.name
        });
        return;
      }

      await setDoc(
        attendanceRef,
        {
          date: today,
          sessionId,
          presentList: arrayUnion({
            name: student.name,
            regNo: reg,
            time: new Date().toLocaleTimeString(),
            markedBy: "faculty"
          })
        },
        { merge: true }
      );

      setDetectedStudent({
        status: "✅ Attendance marked",
        name: student.name
      });

      setAttendanceCode("");
    } catch (err) {
      console.error(err);
      setDetectedStudent({ status: "❌ Error" });
    }
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
        }
        .page-center {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          background: #f1f5f9;
        }

        
       .scan-attendance-page {
  width: 100%;
  max-width: 100%;
  padding: 10px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
        h1 {
          color: #1e3a8a;
          margin-bottom: 20px;
          text-align: center;
        }

        .qr-card {
          width: 100%;
          padding: 40px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        .qr-card h2 {
          color: #1e3a8a;
          margin-top: 0;
        }

        .qr-container {
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }

        .manual-attendance-card {
          width: 100%;
          padding: 30px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          box-sizing: border-box;
        }

        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 8px;
          border: 1px solid #ccc;
          box-sizing: border-box;
        }

        button {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        button:hover {
          background: #1d4ed8;
        }

        .status-box {
          margin-top: 15px;
          padding: 10px;
          border-radius: 8px;
          background: #f1f5f9;
        }
      `}</style>

      <div className="page-center">
        <div className="scan-attendance-page">

          <h1>Generate Attendance (Faculty)</h1>

          <div className="qr-card">
            <h2>Hello {userName}</h2>
            <p>Students scan this QR to mark attendance</p>

            <div className="qr-container">
              <QRCode
                value={JSON.stringify({
                  sessionId,
                  busId: busId,
                  date: today,
                  expiryTime: null,
                })}
                size={200}
              />
            </div>

            <p><strong>Session ID:</strong> {sessionId}</p>
          </div>

          <h2>OR</h2>

          <div className="manual-attendance-card">
            <h2>Manual Attendance</h2>

            <input
              type="text"
              placeholder="Enter Register Number"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
            />

            <button onClick={() => markAttendance(attendanceCode)}>
              Mark Attendance
            </button>

            {detectedStudent && (
              <div className="status-box">
                <p>{detectedStudent.status}</p>
                {detectedStudent.name && <p>{detectedStudent.name}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}