// sign_up.js (top)
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

async function signUpUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Creating a new user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    alert("Registration Successful! Please log in.");
    window.location.href = "./login.html"; // Redirect to login page after successful registration
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Email already registered. Please log in.");
    } else {
      alert(`Error: ${error.message}`);
    }
  }
}

// Event listener for sign-up form submission
document.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.getElementById("signUpForm");
  if (signUpForm) signUpForm.addEventListener("submit", signUpUser);
});
