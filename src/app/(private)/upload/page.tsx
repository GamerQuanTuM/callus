"use client";
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
    X,
    Edit3,
    Hash,
    Video,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client';


const UploadPage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [caption, setCaption] = useState('');
    const [description, setDescription] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);


    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const { mutate: uploadVideo } = trpc.video.create.useMutation()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.02 },
        tap: { scale: 0.98 }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if file is a video
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file');
                return;
            }

            // Check file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                alert('Video must be smaller than 100MB');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file');
                return;
            }
            if (file.size > 100 * 1024 * 1024) {
                alert('Video must be smaller than 100MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    const handleUpload = async () => {
        const formData = new FormData();
        setIsUploading(true);
        formData.append('file', selectedFile!);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET as string);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (data?.secure_url) {
                uploadVideo({
                    file: data.secure_url,
                    title: caption.trim(),
                    description: `${description.trimEnd()} ${hashtags.trim()}`.trim(),

                })
                setIsUploaded(true);
                setIsUploading(false);
                setPreviewUrl('');
                setSelectedFile(null);
                setCaption('');
                setDescription('');
                setHashtags('');
                router.push('/');
            }

        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
            setIsUploaded(false);
            setPreviewUrl('');
            setSelectedFile(null);
            setCaption('');
            setDescription('');
            setHashtags('');
        }
    };

    const handleDone = () => {
        router.push('/');
    };

    const suggestedHashtags = [
        '#viral', '#fyp', '#trending', '#funny', '#dance',
        '#music', '#comedy', '#art', '#fashion', '#food'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute -bottom-8 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                        scale: [1, 0.8, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Header */}
            <motion.div
                className="relative z-10 p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <motion.button
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full border border-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                    >
                        <X className="w-5 h-5" />
                    </motion.button>

                    <h1 className="text-2xl font-bold text-white">Upload Video</h1>

                    <div className="w-10"></div>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 px-6 pb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Video Upload */}
                        <motion.div variants={itemVariants} transition={{ ease: "easeOut" }} className="space-y-6">
                            {!previewUrl ? (
                                <motion.div
                                    className="bg-black/20 backdrop-blur-lg rounded-3xl border-2 border-dashed border-white/20 p-8 text-center cursor-pointer"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Video className="w-8 h-8 text-white" />
                                    </motion.div>

                                    <h3 className="text-white text-xl font-semibold mb-2">
                                        Select Video to Upload
                                    </h3>

                                    <p className="text-white/70 text-sm mb-4">
                                        Drag and drop video files or click to browse
                                    </p>

                                    <div className="text-white/50 text-xs space-y-1">
                                        <p>• MP4, MOV, AVI files</p>
                                        <p>• Maximum 100MB</p>
                                        <p>• 10-60 seconds recommended</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="bg-black/20 backdrop-blur-lg rounded-3xl overflow-hidden max-h-[70vh] lg:max-h-[120vh]"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <div className="relative aspect-[9/16] bg-black">
                                        <video
                                            src={previewUrl}
                                            className="w-full h-full object-cover"
                                            controls
                                        />

                                        <motion.button
                                            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={removeFile}
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </motion.button>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-white text-sm truncate">
                                            {selectedFile?.name}
                                        </p>
                                        {/* <p className="text-white/50 text-xs">
                                            {(selectedFile?.size || 0) / (1024 * 1024).toFixed(2)} MB
                                        </p> */}
                                    </div>
                                </motion.div>
                            )}


                        </motion.div>

                        {/* Right Column - Upload Details */}
                        <motion.div variants={itemVariants} transition={{ ease: "easeOut" }} className="space-y-6">
                            {/* Caption */}
                            <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6">
                                <label className="flex items-center text-white font-medium mb-3">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Caption
                                </label>

                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Describe your video..."
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:border-purple-400 transition-colors"
                                    rows={3}
                                    maxLength={50}
                                />

                                <div className="flex justify-between text-white/50 text-xs mt-2">
                                    <span>@{'yourusername'}</span>
                                    <span>{caption.length}/50</span>
                                </div>
                            </div>


                            {/* Description */}
                            <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6">
                                <label className="flex items-center text-white font-medium mb-3">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your video..."
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:border-purple-400 transition-colors h-40"
                                    rows={3}
                                    maxLength={150}
                                />

                                <div className="flex justify-end text-white/50 text-xs mt-2 ">
                                    <span>{description.length}/150</span>
                                </div>
                            </div>

                            {/* Hashtags */}
                            <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6">
                                <label className="flex items-center text-white font-medium mb-3">
                                    <Hash className="w-4 h-4 mr-2" />
                                    Hashtags
                                </label>

                                <input
                                    value={hashtags}
                                    onChange={(e) => setHashtags(e.target.value)}
                                    placeholder="Add hashtags to help others discover your video"
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                                />

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {suggestedHashtags.map((tag) => (
                                        <motion.button
                                            key={tag}
                                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setHashtags(prev =>
                                                prev ? `${prev} ${tag}` : tag
                                            )}
                                        >
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Button */}
                            <motion.button
                                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${!selectedFile || isUploading
                                    ? 'bg-white/20 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                    }`}
                                variants={buttonVariants}
                                whileHover={selectedFile && !isUploading ? "hover" : {}}
                                whileTap={selectedFile && !isUploading ? "tap" : {}}
                                onClick={isUploaded ? handleDone : handleUpload}
                                disabled={!selectedFile || isUploading}
                            >
                                {isUploaded ? 'Done' : isUploading ? 'Uploading...' : 'Upload Video'}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UploadPage;