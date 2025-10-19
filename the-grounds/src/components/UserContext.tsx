import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState('');
  const [email, setEmailState] = useState('');
  const [isFirstTime, setIsFirstTimeState] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    const savedFirstTime = localStorage.getItem('isFirstTime');

    if (savedName) setNameState(savedName);
    if (savedEmail) setEmailState(savedEmail);
    if (savedFirstTime === 'false') setIsFirstTimeState(false);
  }, []);

  const setName = (newName: string) => {
    setNameState(newName);
    localStorage.setItem('userName', newName);
  };

  const setEmail = (newEmail: string) => {
    setEmailState(newEmail);
    localStorage.setItem('userEmail', newEmail);
  };

  const setIsFirstTime = (value: boolean) => {
    setIsFirstTimeState(value);
    localStorage.setItem('isFirstTime', String(value));
  };

  return (
    <UserContext.Provider
      value={{
        name,
        email,
        setName,
        setEmail,
        isFirstTime,
        setIsFirstTime,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
