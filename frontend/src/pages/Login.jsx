import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Building, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { darkLogo, otherData } from '../assets';
import { ForgotPasswordModal } from '../components';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPasswordModel, setShowForgotPasswordModal] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate(`/${user.userType}/dashboard`);
        }
    }, [user]);

    const { register, handleSubmit } = useForm({
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const loginHandler = async (loginData) => {
        try {
            setIsLoading(true);

            // Convert email to lowercase before sending to API
            const normalizedLoginData = {
                ...loginData,
                email: loginData.email.toLowerCase().trim()
            };

            const data = await login(normalizedLoginData);

            if (data && data.success) {
                toast.success(data.message);
                navigate(`/${data.userType}/dashboard`);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-16 bg-bg-secondary-dark dark:bg-bg-primary flex items-center justify-center p-4">
            <ForgotPasswordModal isOpen={showForgotPasswordModel} onClose={() => setShowForgotPasswordModal(false)} />
            <div className="bg-gradient-to-b from-secondary/[0.03] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-bg-primary-light">
                {/* Header */}
                <div className="pt-8 text-center flex flex-col items-center justify-center gap-3">
                    <Link to='/' className="mb-4 flex items-center gap-2">
                        <img src={darkLogo} alt="logo" className="h-8 md:h-10" />
                        <span className={`text-xl font-bold text-primary`}>JLTM</span>
                    </Link>
                    <p className="text-text-primary dark:text-text-primary-dark text-lg">Sign in to continue</p>
                </div>

                {/* Login Form */}
                <div className="p-5 sm:p-8">
                    <form onSubmit={handleSubmit(loginHandler)} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={20} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                                    placeholder="you@example.com"
                                    required
                                    {...register('email', { required: true })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                    {...register('password', { required: true })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} className="text-gray-400 dark:text-gray-600 hover:text-text-secondary dark:hover:text-text-secondary-dark" />
                                    ) : (
                                        <Eye size={20} className="text-gray-400 dark:text-gray-600 hover:text-text-secondary dark:hover:text-text-secondary-dark" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-between items-center">
                            <button
                                type='button'
                                onClick={() => setShowForgotPasswordModal(true)}
                                className="text-text-primary dark:text-text-primary-dark hover:text-opacity-80 text-sm font-medium underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-bg-primary dark:bg-bg-secondary text-pure-white dark:text-pure-black py-3 px-4 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-bg-primary-light" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-bg-secondary dark:bg-bg-primary text-text-secondary dark:text-text-secondary-dark">New to {otherData?.brandName}?</span>
                        </div>
                    </div>

                    {/* Get in Touch/Register */}
                    <div className="text-center">
                        <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                            Need an account?{' '}
                            <Link to={`/register`} className="text-text-primary dark:text-text-primary-dark font-semibold underline hover:text-opacity-80">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className=" dark:bg-bg-primary px-4 pb-4 text-center">
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        © {new Date().getFullYear()} {otherData?.brandName}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;