"use client";
import React, { useState } from 'react';
import { z } from "zod";
//import * as motion from "motion/react-client"
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, User, Mail, Lock, Github, Chrome } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
    .object({
        name: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
        displayName: z
            .string()
            .min(2, "Display name must be at least 2 characters")
            .max(50)
            .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const AuthPage = () => {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<"login" | "register">('login');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        displayName: string;
    }>({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        displayName: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { mutate: register, isPending: isRegistering } = trpc.auth.register.useMutation({
        onSuccess: (data) => {
            if (data)
                setActiveTab('login');
        }
    });
    const { mutate: login, isPending: isLoggingIn } = trpc.auth.login.useMutation(
        {
            onSuccess: (data) => {
                if (data) {
                    router.push('/')
                    localStorage.setItem('auth_token', data.user.token || '');
                }

            }
        }
    );
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({}); // reset errors

        if (activeTab === "register") {
            const result = registerSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: { [key: string]: string } = {};
                result.error.issues.forEach((err) => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setErrors(fieldErrors);
                return;
            }
            register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                displayName: formData.displayName,
            });
        } else {
            const result = loginSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: { [key: string]: string } = {};
                result.error.issues.forEach((err) => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setErrors(fieldErrors);
                return;
            }
            login({ email: formData.email, password: formData.password });
        }
    };


    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
        }
    };

    const tabVariants = {
        inactive: {
            opacity: 0.6,
            scale: 0.95,
            transition: { duration: 0.2 }
        },
        active: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.2 }
        }
    };

    const formVariants = {
        hidden: {
            opacity: 0,
            x: activeTab === 'login' ? -20 : 20,
            transition: { duration: 0.3 }
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3, delay: 0.1 }
        }
    };

    const inputVariants = {
        focus: {
            scale: 1.02,
            transition: { duration: 0.2 }
        }
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    const socialButtonVariants = {
        hover: {
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute -bottom-8 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                        scale: [1, 0.8, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div
                className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ ease: "easeInOut", duration: 0.6 }}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
                    <p className="text-white/70">Sign in to your account or create a new one</p>
                </motion.div>

                {/* Tab Selector */}
                <div className="flex bg-white/10 rounded-2xl p-1 mb-6 backdrop-blur-sm">
                    <motion.button
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${activeTab === 'login'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'text-white/70 hover:text-white'
                            }`}
                        variants={tabVariants}
                        animate={activeTab === 'login' ? 'active' : 'inactive'}
                        onClick={() => setActiveTab('login')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <p>Sign In</p>
                    </motion.button>
                    <motion.button
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${activeTab === 'register'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'text-white/70 hover:text-white'
                            }`}
                        variants={tabVariants}
                        animate={activeTab === 'register' ? 'active' : 'inactive'}
                        onClick={() => setActiveTab('register')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Sign Up
                    </motion.button>
                </div>

                {/* Form Content */}
                <AnimatePresence mode="wait">
                    <motion.form
                        key={activeTab}
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* Name field for register */}
                        {activeTab === 'register' && (
                            <>
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                    <motion.input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                        variants={inputVariants}
                                        whileFocus="focus"
                                        required
                                    />
                                </motion.div>
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                                )}
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                    <motion.input
                                        type="text"
                                        name="displayName"
                                        placeholder="Display Name"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                        variants={inputVariants}
                                        whileFocus="focus"
                                        required
                                    />
                                </motion.div>
                                {errors.displayName && (
                                    <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
                                )}
                            </>
                        )}

                        {/* Email field */}
                        <motion.div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                            <motion.input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                variants={inputVariants}
                                whileFocus="focus"
                                required
                            />
                        </motion.div>
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}

                        {/* Password field */}
                        <motion.div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                            <motion.input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                variants={inputVariants}
                                whileFocus="focus"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </motion.div>
                        {errors.password && (
                            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}

                        {/* Confirm Password field for register */}
                        {activeTab === 'register' && (
                            <>
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                    <motion.input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                        variants={inputVariants}
                                        whileFocus="focus"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </motion.div>

                                {errors.confirmPassword && (
                                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </>

                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${isRegistering || isLoggingIn
                                ? 'bg-white/20 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                }`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            disabled={isLoggingIn || isRegistering}
                        >
                            {
                                activeTab === 'login' ? (
                                    <>{isLoggingIn ? <span>Logging...</span> : <p>Sign In</p>}</>
                                ) : (
                                    <>{isRegistering ? <span>Registering...</span> : <p>Create Account</p>}</>
                                )
                            }
                        </motion.button>
                    </motion.form>
                </AnimatePresence>

                {/* Divider */}
                <motion.div
                    className="flex items-center my-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex-1 h-px bg-white/20"></div>
                    <span className="px-4 text-white/50 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/20"></div>
                </motion.div>

                {/* Social Login */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        className="w-full flex items-center justify-center space-x-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm"
                        variants={socialButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <Chrome className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </motion.button>
                    <motion.button
                        className="w-full flex items-center justify-center space-x-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm"
                        variants={socialButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <Github className="w-5 h-5" />
                        <span>Continue with GitHub</span>
                    </motion.button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-white/50 text-sm mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                        className="text-white hover:text-purple-300 transition-colors underline"
                    >
                        {activeTab === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default AuthPage;