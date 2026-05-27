import "./student.css";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ✅ Calculate PRESENT DAYS only
const calculatePresentDays = async (selectedMonth, selectedYear, regNo) => {

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const promises = [];

  for (let day = 1; day <= daysInMonth; day++) {

    const dateStr = new Date(selectedYear, selectedMonth - 1, day)
      .toISOString()
      .split("T")[0];

    promises.push(
      getDoc(doc(db, "attendance", dateStr))
    );
  }

  const snapshots = await Promise.all(promises);

  let presentDays = 0;

  snapshots.forEach((snap) => {

    if (snap.exists()) {

      const data = snap.data();

      const presentList = data.presentList || [];

      const isPresent = presentList.some(
        s => s.regNo?.toUpperCase() === regNo
      );

      if (isPresent) presentDays++;

    }

  });

  return presentDays;
};

export default function AttendanceOverview({ regNo }) {
  const [loading, setLoading] = useState(true);
  const [present, setPresent] = useState(0);
  const [total, setTotal] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ✅ Get Reg No properly
  const effectiveRegNo = useMemo(
    () => (regNo || localStorage.getItem("student_regNo") || "").trim().toUpperCase(),
    [regNo]
  );

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  useEffect(() => {
  let cancelled = false;

  const run = async () => {
    setLoading(true);
    setError("");

    try {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

      // ✅ ALWAYS SET TOTAL
      setTotal(daysInMonth);

      if (!effectiveRegNo) {
        setPresent(0);
        setAttendanceRate(0);
        return;
      }

      const presentDays = await calculatePresentDays(
        selectedMonth,
        selectedYear,
        effectiveRegNo
      );

      if (cancelled) return;

      setPresent(presentDays);

      const percent =
        daysInMonth > 0
          ? Math.round((presentDays / daysInMonth) * 100)
          : 0;

      setAttendanceRate(percent);

    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");

      setPresent(0);
      setAttendanceRate(0);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  run();

  return () => {
    cancelled = true;
  };
}, [effectiveRegNo, selectedMonth, selectedYear]);
  return (
    <div className="card attendance-card">
      <div className="attendance-content">
        <h2>Attendance Overview</h2>

        {/* ✅ Month & Year */}
        <div className="month-year-selector">
          <div className="selector-group">
            <label>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Loading */}
        {loading && <p>Loading attendance...</p>}

        {/* ✅ Data */}
        {!loading && (
          <>
            <div className="attendance-stats">
              <div className="stat-box">
                <div className="stat-label">Total Days</div>
                <div className="stat-value">{total}</div>
                <div className="stat-desc">This Month</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Present Days</div>
                <div className="stat-value present">{present}</div>
                <div className="stat-desc">This Month</div>
              </div>
            </div>

            <div className="attendance-percentage">
              <div className="percentage-label">Attendance Rate</div>
              <div className="percentage-box">
                <div className="percentage-value">{attendanceRate}%</div>
              </div>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}