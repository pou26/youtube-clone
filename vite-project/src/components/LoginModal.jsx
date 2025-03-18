import React from 'react';
import LoginForm from './LoginForm';
// import './LoginModal.css'; // You'll need to create this

const LoginModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <LoginForm isModal={true} onModalClose={onClose} />
      </div>
    </div>
  );
};

export default LoginModal;