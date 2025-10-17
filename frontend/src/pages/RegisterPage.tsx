import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import '../styles/RegisterPage.css';

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-page">
      <div className="register-page__container">
        <RegisterForm />
      </div>
    </div>
  );
};