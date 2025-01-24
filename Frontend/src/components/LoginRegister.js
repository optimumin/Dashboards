import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';
import SignInWithGoogle from './SignInWithGoogle';

const LoginRegister = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registrationUsername, setRegistrationUsername] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [roles, setRoles] = useState([]); // State for roles
  const [selectedRole, setSelectedRole] = useState(''); // State for selected role
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in from session storage
    const storedToken = sessionStorage.getItem('token');
    const storedUsername = sessionStorage.getItem('username');
    
    if (storedToken) {
      setLoggedIn(true);
      setUsername(storedUsername || '');
    }
  }, []);
  useEffect(() => {
    // Fetch roles from backend
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/roles'); // Adjust endpoint as needed
        const data = await response.json();
        setRoles(data.roles); // Assume backend sends roles as { roles: [{ role_id, role_name }, ...] }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      if (username && password) {
        const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem('token', data.access_token);
          sessionStorage.setItem('userId', data.id); // Store the user ID
          sessionStorage.setItem('username', username);
          if (data.role_id !== undefined) {
            sessionStorage.setItem('roleId', data.role_id);
          } else {
            console.error('Role ID is missing in the response');
          }
          setLoggedIn(true);
          setError('');
          alert('Login successful!');
          navigate('/ProjectTable');
        } else {
          setError(data.msg || 'Failed to log in. Please try again.');
        }
      } else {
        setError('Please enter username and password.');
      }
    } catch (error) {
      setError('Failed to log in. Please try again.');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!validateUsername(registrationUsername)) {
      setError('Username must be between 3 and 20 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    if (!validatePassword(registrationPassword)) {
      setError('Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }

    try {
      if (registrationUsername && registrationPassword && selectedRole) {
        const response = await fetch('http://127.0.0.1:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: registrationUsername, password: registrationPassword,role_id: selectedRole }),
        });

        if (response.ok) {
          setRegistrationUsername('');
          setRegistrationPassword('');
          setSelectedRole('');
          setError('');
          setRegistering(false);
          alert('Registration successful!');
        } else {
          const data = await response.json();
          setError(data.msg || 'Failed to register. Please try again.');
        }
      } else {
        setError('Please enter username and password.');
      }
    } catch (error) {
      setError('Failed to register. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    setLoggedIn(false);
    setUsername('');
    navigate('/'); // Navigate to the home page or login page
  };

  return (
      <div className="login-register-container d-flex align-items-center justify-content-center">
        <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body">
            {!loggedIn && !registering ? (
              <>
                <h2 className="card-title text-center mb-4">Login</h2>
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  <button type="submit" className="btn btn-dark w-100">Login</button>
                  <SignInWithGoogle/>
                  <div className="text-center my-3">or</div>

                  <p className="mt-3 text-center">
                    Don't have an account?{' '}
                    <button type="button" className="btn btn-link p-0" onClick={() => setRegistering(true)}>Register</button>
                  </p>
                </form>
              </>
            ) : !loggedIn && registering ? (
              <>
                <h2 className="card-title text-center mb-4">Register</h2>
                <form onSubmit={handleRegistrationSubmit}>
                  <div className="mb-3">
                    <label htmlFor="registrationUsername" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="registrationUsername"
                      placeholder="Choose a username"
                      value={registrationUsername}
                      onChange={(e) => setRegistrationUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="registrationPassword" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="registrationPassword"
                      placeholder="Choose a password"
                      value={registrationPassword}
                      onChange={(e) => setRegistrationPassword(e.target.value)}
                      required
                    />
                  </div>
                    <div className="mb-3">
                  <label htmlFor="roleSelect" className="form-label">Select Role</label>
                  <select
                    className="form-select"
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  <button type="submit" className="btn btn-dark w-100">Register</button>
                  <div className="text-center my-3">or</div>
                  
                  <p className="mt-3 text-center">
                    Already have an account?{' '}
                    <button type="button" className="btn btn-link p-0" onClick={() => setRegistering(false)}>Login</button>
                  </p>
                  
                </form>
              </>
            ) : (
              <div className="text-center">
                <h2>Welcome, {username}!</h2>
                <button onClick={handleLogout} className="btn btn-primary mt-3">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default LoginRegister;
