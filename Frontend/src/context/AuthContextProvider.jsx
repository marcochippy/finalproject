import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from './index.js';
import { me, signout } from '../data/auth';
import { deleteCookie, getCookie } from '../utils/cookieUtils.js';

const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkSession, setCheckSession] = useState(true);

  const logout = async () => {
    try {
      await signout();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('userId');
      deleteCookie('userId');
      deleteCookie('token');
      toast.success('Hope to see you soon.');
    } catch (error) {
      toast.error(error.message || 'Trouble signing out, please try again');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await me();

        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('userId');
        deleteCookie('userId');
        deleteCookie('token');
        // toast.error(error.message || 'Error signing in, please sign in again');
      } finally {
        setCheckSession(false);
      }
    };

    // if (checkSession) getUser();
    checkSession && getUser();
  }, [checkSession]);
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setCheckSession, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
