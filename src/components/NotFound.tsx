"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Wifi, Zap, Coffee } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const NotFound = ({ onGoBack }: { onGoBack?: () => void }) => {
    const router = useRouter()
    const pathname = usePathname();

    const isHome = pathname === '/';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-red-900 flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Floating Elements */}
            <motion.div className="absolute inset-0">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-8 h-8 text-yellow-400/30"
                    animate={{ rotate: 360, y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <Zap className="w-full h-full" />
                </motion.div>
                <motion.div
                    className="absolute top-1/3 right-1/4 w-6 h-6 text-orange-400/30"
                    animate={{ rotate: -360, x: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    <Coffee className="w-full h-full" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/3 left-1/3 w-10 h-10 text-red-400/20"
                    animate={{ scale: [1, 1.2, 1], rotate: 180 }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Wifi className="w-full h-full" />
                </motion.div>
            </motion.div>

            <div className="text-center relative z-10 max-w-lg">
                {/* 404 Number */}
                <motion.div
                    className="mb-8"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.h1
                        className="text-9xl font-black text-white/20 leading-none"
                        animate={{
                            textShadow: [
                                "0 0 0px rgba(255,255,255,0.1)",
                                "0 0 20px rgba(255,255,255,0.3)",
                                "0 0 0px rgba(255,255,255,0.1)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        404
                    </motion.h1>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
                    <p className="text-white/70 text-lg mb-2">The page you&apos;re looking for doesn&apos;t exist</p>
                    <p className="text-white/50 text-sm mb-8">It might have been moved, deleted, or you entered the wrong URL</p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {!isHome && <motion.button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </motion.button>}

                    {onGoBack && <motion.button onClick={onGoBack}
                        className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 backdrop-blur-sm"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </motion.button>}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default NotFound;