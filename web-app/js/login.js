// login.js (top)
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

// Login Function
async function loginUser(event) {
  event.preventDefault(); // Prevent the default form submission
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Authenticating user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    alert("Login Successful!");
    window.location.href = "./Dashboard_page1.html"; // Redirect to dashboard after successful login
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("Login error:", error); // Log the error for debugging
  }
}

// Event listener for the login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", loginUser); // Attach the event listener
  }
});
