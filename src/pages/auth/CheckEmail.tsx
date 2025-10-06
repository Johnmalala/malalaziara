import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const CheckEmail: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="mt-4 text-gray-600">
          We've sent a verification link to your email address. Please click the link to confirm your account and complete the sign-up process.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          (Don't forget to check your spam folder!)
        </p>
        <div className="mt-8">
          <Link to="/signin">
            <Button className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckEmail;
