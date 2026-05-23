import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


export default function FullBusReport() {
  const [groupedData, setGroupedData] = useState({});
  const reportRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, "attendance"));

      let temp = {};
      const docs = snapshot.docs;

      if (docs.length === 0) return;

      // ✅ GET ONLY VALID DATE IDS (like 2026-03-28)
      const validDates = docs
        .map((doc) => doc.id)
        .filter((id) => /^\d{4}-\d{2}-\d{2}$/.test(id)); // 🔥 important

      if (validDates.length === 0) return;

      // ✅ FIND LATEST DATE
      const latestDate = validDates.sort().reverse()[0];

      docs.forEach((doc) => {
        const date = doc.id;

        // ✅ ONLY LATEST DATE
        if (date !== latestDate) return;

        const list = doc.data().presentList || [];

        list.forEach((s) => {
          // ❌ skip incomplete data
          if (!s.busNo || !s.gender || !s.college) return;

          const bus = s.busNo;
          const college = s.college;
          const gender = s.gender.toLowerCase();

          if (!temp[date]) temp[date] = {};
          if (!temp[date][bus]) temp[date][bus] = {};
          if (!temp[date][bus][college]) {
            temp[date][bus][college] = { Male: 0, Female: 0 };
          }

          if (gender === "male") temp[date][bus][college].Male++;
          if (gender === "female") temp[date][bus][college].Female++;
        });
      });

      setGroupedData(temp);
    };

    fetch();
  }, []);

  // 🔥 PDF EXPORT
  const downloadPDF = async () => {
    const element = reportRef.current;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("Attendance_Report.pdf");
  };

  const currentDate = Object.keys(groupedData)[0];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 Attendance Report</h1>

      {/* DOWNLOAD BUTTON */}
      <button style={styles.downloadBtn} onClick={downloadPDF}>
        📄 Download PDF
      </button>

      {/* REPORT */}
      <div ref={reportRef} style={{ width: "100%" }}>
        {!currentDate ? (
          <p style={{ textAlign: "center" }}>No attendance today</p>
        ) : (
          <div style={styles.dateCard}>
            <h2 style={styles.dateTitle}>📅 {currentDate}</h2>

            {Object.keys(groupedData[currentDate]).map((bus) => {
              const colleges = groupedData[currentDate][bus];

              let total = 0;
              Object.values(colleges).forEach((c) => {
                total += c.Male + c.Female;
              });

              return (
                <div key={bus} style={styles.busCard}>
                  <h3 style={styles.busTitle}>🚌 Bus No: {bus}</h3>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>College</th>
                        <th>Male</th>
                        <th>Female</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.keys(colleges).map((col) => (
                        <tr key={col}>
                          <td>{col}</td>
                          <td style={styles.male}>
                            {colleges[col].Male}
                          </td>
                          <td style={styles.female}>
                            {colleges[col].Female}
                          </td>
                        </tr>
                      ))}

                      <tr style={styles.totalRow}>
                        <td>Total</td>
                        <td colSpan="2">{total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 🎨 STYLES (UNCHANGED)
const styles = {
  page: {
  background: "#f4f7fb",
  width: "100%",
  minHeight: "100vh",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
},

  title: {
    color: "#1e3a8a",
    marginBottom: "10px",
    
  },

  downloadBtn: {
    marginBottom: "20px",
    padding: "10px 20px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dateCard: {
    width: "100%",
    maxWidth: "100%",
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    marginBottom: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  dateTitle: {
    marginBottom: "15px",
    color: "#333",
  },

  busCard: {
    marginTop: "15px",
    padding: "20px",
    borderRadius: "12px",
    background: "#eef2ff",
  },

  busTitle: {
    color: "#1e40af",
  },

  table: {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  display: "block",
  overflowX: "auto",
  whiteSpace: "nowrap",
},

  male: {
    color: "blue",
    fontWeight: "600",
  },

  female: {
    color: "deeppink",
    fontWeight: "600",
  },

  totalRow: {
    fontWeight: "bold",
    background: "#dbeafe",
  },
};