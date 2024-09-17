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

    const googleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                if (user) {
                    const userData = {
                        google_id: user.uid,
                        name: user.displayName,
                        email: user.email
                    };
                    try {
                        const token = localStorage.getItem('authToken');  // Assuming the token is stored in localStorage
                        if (!token) {
                            toast.error('Token not found. Please log in again.');
                            return;
                        }
                        
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
                        console.log('User saved successfully:', result);  // Log the backend result
                        toast.success('Successfully logged in!');
                        navigate('/ProjectTable');
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to save user data. Please try again.');
                    }
                }
            })
            .catch((error) => {
                console.error(error.message);
                toast.error('Failed to log in. Please try again.');
            });
    };

    const githubLogin = () => {
        const provider = new GithubAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log("GitHub User Info:", user); // Log GitHub user info
                toast.success('Successfully logged in with GitHub!');
                navigate('/ProjectTable'); // Navigate to ProjectTable
            })
            .catch((error) => {
                console.error("GitHub sign-in failed:", error.message);
                toast.error('GitHub sign-in failed. Please try again.');
            });
    };

    return (
        <div >
            <p className="continue-p">--Or Continue with--</p>
            <div className="logo-container">
                <img src={googleImage} width="30px" alt="Google" className="logo-button" onClick={googleLogin} />
                <img src={githubImage} width="30px" alt="GitHub" className="logo-button" onClick={githubLogin} />
            </div>
        </div>
    );
}

export default SignInWithGoogle;
