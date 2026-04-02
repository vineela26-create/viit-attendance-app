import { useState } from "react";
import "../auth.css";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const name = e.target.name?.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
   const regNo = role === "student"? e.target.regno.value.trim().toUpperCase() : "";
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Keep localStorage for backwards-compat, but source of truth is Firestore.
      localStorage.setItem(`name_${email}`, name);
      localStorage.setItem(`role_${email}`, role);
      if (role === "student") localStorage.setItem(`regNo_${email}`, regNo);

      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          uid: cred.user.uid,
          email,
          name: name || "",
          role,
          regNumber: role === "student" ? regNo : "",
          busNumber: "",
              college: "",   
    gender: "",    
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Faculty scanner expects students collection keyed by regNo
      if (role === "student" && regNo) {
        await setDoc(
          doc(db, "students", regNo),
          {
            regNo,
            name: name || "",
            email,
            busNo: "",
            photo: "",
            uid: cred.user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Reset form first
      e.target.reset();
      
      // Sign out and switch to login tab
      await signOut(auth);
      setIsLogin(true);
      setError("");
      
      // Show success message
      alert("Signup successful. Please login with your credentials.");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already exists."
          : err.message || "Signup failed."
      );
    }
  };


  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      console.log("Logged in user UID:", uid);

      // Fetch user profile from Firestore
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User profile not found in Firestore for UID:", uid);
        setError("User profile not found. Please contact support.");
        await signOut(auth);
        return;
      }

      const userData = userSnap.data();
     if (userData.role === "student") {
 localStorage.setItem(
  "student_regNo",
  (userData.regNumber || "").toUpperCase()
);
  localStorage.setItem("student_name", userData.name || "");
  localStorage.setItem("student_busNo", userData.busNumber || "");
  localStorage.setItem("student_college", userData.college || "");
  localStorage.setItem("student_gender", userData.gender || "");
}
      console.log("Fetched user data:", userData);

      const role = userData.role;
      if (!role) {
        console.error("No role found in user data:", userData);
        setError("No role found. Please contact support.");
        await signOut(auth);
        return;
      }

      // Redirect based on role
      if (role === "student") {
        navigate("/student");
      } else if (role === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        setError("Invalid role. Please contact support.");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    }
  };

  // GOOGLE LOGIN
  

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="tab-buttons">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Signup
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <input 
              name="name" 
              placeholder="Full Name" 
              required 
              autoComplete="name"
            />
          )}

          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            autoComplete={isLogin ? "email" : "off"}
            key={isLogin ? "login-email" : "signup-email"}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            autoComplete={isLogin ? "current-password" : "new-password"}
            key={isLogin ? "login-password" : "signup-password"}
          />

          {!isLogin && role === "student" && (
            <input 
              name="regno" 
              placeholder="Register Number" 
              required 
              autoComplete="off"
            />
          )}

          {!isLogin && (
            <div className="role-box">
              <button
                type="button"
                className={role === "student" ? "active-role" : ""}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={role === "faculty" ? "active-role" : ""}
                onClick={() => setRole("faculty")}
              >
                Faculty
              </button>
            </div>
          )}

          <button className="main-btn">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
      </div>
      </div>
      
        
   
  );
}
