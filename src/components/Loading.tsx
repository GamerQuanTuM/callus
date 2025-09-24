
import React from 'react';
import * as motion from 'motion/react-client';

const Loading = () => {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden"
        >
            <div className="text-center relative z-10">
                {/* Main Spinner */}
                <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <motion.div
                        className="w-20 h-20 border-4 border-white/30 rounded-full mx-auto"
                    />
                    <motion.div
                        className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>

                {/* Loading Text */}
                <motion.h1
                    className="text-4xl font-bold text-white mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Loading...
                </motion.h1>
            </div>
        </motion.div>
    );
};

export default Loading;