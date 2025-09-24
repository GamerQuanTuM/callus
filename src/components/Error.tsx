"use client";
import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Home, AlertTriangle, } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const Error = ({ onTryAgain }: { onTryAgain?: () => void }) => {
    const router = useRouter();
    const pathname = usePathname();

    const isHome = pathname === '/';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Animated Background */}
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </motion.div>

            <div className="text-center relative z-10 max-w-md">
                {/* Error Icon */}
                <motion.div
                    className="mb-8"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </motion.div>
                </motion.div>

                {/* Error Content */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Oops! Something went wrong</h1>
                    <p className="text-white/70 text-lg mb-2">We encountered an unexpected error</p>
                    <p className="text-white/50 text-sm mb-8">Error Code: 500 - Internal Server Error</p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {onTryAgain && <motion.button
                        onClick={onTryAgain}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                    </motion.button>}

                    {!isHome && <motion.button
                        onClick={() => router.push('/')}
                        className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 backdrop-blur-sm"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Home className="w-5 h-5" />
                        <span>Go Home</span>
                    </motion.button>}
                </motion.div>

                {/* Help Text */}
                <motion.p
                    className="text-white/40 text-sm mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    If the problem persists, please contact our support team
                </motion.p>
            </div>
        </motion.div>
    );
};

export default Error;