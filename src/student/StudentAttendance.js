import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getDoc, doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ✅ Get student ID
const getStudentId = () => {
  const localId = localStorage.getItem("student_regNo");
  return localId ? localId.trim().toUpperCase() : null;
};

// ✅ Extract sessionId safely
const extractSessionId = (input) => {
  try {
    const parsed = JSON.parse(input);
    return parsed.sessionId || input;
  } catch {
    return input;
  }
};

const StudentAttendance = () => {
  const [sessionInput, setSessionInput] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // ✅ QR Scanner (FASTER)
  useEffect(() => {
    let scanner;

    if (isScanning) {
     scanner = new Html5QrcodeScanner(
  "qr-reader",
  {
    fps: 10,
    qrbox: { width: 280, height: 280 },
    aspectRatio: 1.0,
    rememberLastUsedCamera: true,
  },
  false
);

      scanner.render(
  async (decodedText) => {
    const sessionId = extractSessionId(decodedText);

await scanner.clear();
setIsScanning(false);

if (!sessionId.startsWith("SESSION-")) {

  setMessage("❌ Invalid Faculty QR");
  setSuccess(false);

  return;

}

setSessionInput(sessionId);
markAttendance(sessionId);
  },
  undefined
);
    }

    return () => {
      if (scanner) scanner.clear().catch(() => {});
    };
   // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isScanning]);

  // ✅ MARK ATTENDANCE
  const markAttendance = async (scannedSessionId = null) => {
    const regNo = getStudentId();

    if (!regNo) {
      setMessage("⚠️ Please login again");
      setSuccess(false);
      return;
    }

    const rawSessionId =
      typeof scannedSessionId === "string" ? scannedSessionId : sessionInput;

    const sessionId = extractSessionId(rawSessionId).trim();

    if (!sessionId) {
      setMessage("Session ID is required");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // ✅ CORRECT DATE FORMAT (MATCH FACULTY)
      const today = new Date().toLocaleDateString("en-CA");

      // 🔹 Get student data
      const studentRef = doc(db, "students", regNo);
      const studentSnap = await getDoc(studentRef);
      


      if (!studentSnap.exists()) {
        setMessage("❌ Student not found");
        setSuccess(false);
        return;
      }

      const student = studentSnap.data();

      // 🔹 Get today's attendance
      const attendanceRef = doc(db, "attendance", today);
      const attendanceSnap = await getDoc(attendanceRef);
      if (
  attendanceSnap.exists() &&
  attendanceSnap.data().sessionId !== sessionId
) {
  setMessage("❌ Wrong Faculty QR");
  setSuccess(false);
  return;
}

      const list = attendanceSnap.exists()
        ? attendanceSnap.data().presentList || []
        : [];

      // 🔹 Prevent duplicate
      if (list.some((s) => s.regNo === regNo)) {
        setMessage("⚠️ Already marked");
        setSuccess(false);
        return;
      }

      // 🔹 SAVE attendance
      await setDoc(
        attendanceRef,
        {
          date: today,
          sessionId,
          presentList: arrayUnion({
            name: student.name || "Unknown",
            regNo,
            busNo: student.busNo || "Unknown",
            college: student.college || "Unknown",
            gender: student.gender || "Unknown",
            time: new Date().toLocaleTimeString(),
          }),
        },
        { merge: true }
      );

      setMessage("✅ Attendance marked successfully");
      setSuccess(true);

    } catch (err) {
      console.error(err);
      setMessage("❌ Error marking attendance");
      setSuccess(false);
    } finally {
      setLoading(false);
      setSessionInput("");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Scan Attendance</h1>
      <p style={styles.desc}>Scan QR or enter session ID</p>

      {message && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            background: success ? "#d1fae5" : "#fee2e2",
            color: success ? "#065f46" : "#991b1b",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      {isScanning ? (
        <div style={styles.scannerWrapper}>
          
         <div
  id="qr-reader"
  style={{
    width: "100%",
    maxWidth: "360px",
    margin: "0 auto",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#fff",
    padding: "10px",
  }}
></div>
          <button style={styles.cancelBtn} onClick={() => setIsScanning(false)}>
            Stop Scanning
          </button>
        </div>
      ) : (
        <div style={styles.cardRow}>
          <div style={styles.card} onClick={() => setIsScanning(true)}>
            📷 Scan QR using Camera
          </div>
        </div>
      )}
       <h1>OR</h1>
      <div style={styles.manualCard}>
        <h3>Enter Session ID</h3>
        <input
          style={styles.input}
          placeholder="Session ID"
          value={sessionInput}
          onChange={(e) => setSessionInput(e.target.value)}
          disabled={loading}
        />
        <button
          style={styles.submitBtn}
          onClick={() => markAttendance()}
          disabled={loading}
        >
          {loading ? "Processing..." : "Mark Attendance"}
        </button>
      </div>
    </div>
  );
};

export default StudentAttendance;

// 🎨 Styles (UNCHANGED)
const styles = {
  container: {
    maxWidth: "420px",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
    background: "#f5f7fb",
    minHeight: "100vh",
  },
  title: { color: "#1e3a8a", fontWeight: "700" },
  desc: { fontSize: "14px", marginBottom: "20px", color: "#555" },
  cardRow: { display: "flex", gap: "10px", marginBottom: "40px" },
  card: {
    flex: 1,
    
    padding: "18px",
    background: "#eef2ff",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },
  manualCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  input: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  submitBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    background: "#1e40af",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
  },
  scannerWrapper: {
  width: "100%",
  maxWidth: "420px",
  margin: "20px auto",
  padding: "20px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
},
  cancelBtn: {
    marginTop: "15px",
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    width: "100%",
  },
};