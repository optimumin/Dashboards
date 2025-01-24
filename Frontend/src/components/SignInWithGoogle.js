import React from 'react';
import { useNavigate } from 'react-router-dom';
import googleImage from '../Google_logo.webp';
import githubImage from '../Git_Logo.png';
import './LoginRegister.css';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignInWithGoogle() {
    const navigate = useNavigate();

    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user) {
                // Get the token from Firebase
                const token = await user.getIdToken();
                sessionStorage.setItem('token', token); // Store token in sessionStorage
                console.log("Token obtained:", token); // Debugging

                const userData = {
                    google_id: user.uid,
                    name: user.displayName,
                    email: user.email
                };

                // Send the token and user data to the backend
                const response = await fetch('http://localhost:5000/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    throw new Error('Failed to save user data. Please try again.');
                }

                const result = await response.json();
                console.log('User saved successfully:', result);
                toast.success('Successfully logged in!');
                navigate('/ProjectTable');
            }
        } catch (error) {
            console.error("Google login failed:", error.message);
            toast.error('Failed to log in. Please try again.');
        }
    };

    const githubLogin = async () => {
        const provider = new GithubAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user) {
                console.log("GitHub User Info:", user); // Log GitHub user info
                toast.success('Successfully logged in with GitHub!');
                navigate('/ProjectTable'); // Navigate to ProjectTable
            }
        } catch (error) {
            console.error("GitHub sign-in failed:", error.message);
            toast.error('GitHub sign-in failed. Please try again.');
        }
    };

    return (
        <div>
            <p className="continue-p">--Or Continue with--</p>
            <div className="logo-container">
                <img
                    src={googleImage}
                    width="30px"
                    alt="Google"
                    className="logo-button"
                    onClick={googleLogin}
                />
                <img
                    src={githubImage}
                    width="30px"
                    alt="GitHub"
                    className="logo-button"
                    onClick={githubLogin}
                />
            </div>
        </div>
    );
}

export default SignInWithGoogle;
