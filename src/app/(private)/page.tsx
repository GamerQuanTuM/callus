"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  BookmarkPlus,
  Pause,
  Volume2,
  VolumeX,
  User,
  Upload,
  Play,
  Loader
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useSession } from '@/providers/session';

type Feed = {
  id: string;
  user: {
    name: string;
    displayName: string;
    id: string;
  };
  description: string;
  stats: {
    likes: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  videoUrl: string;
};

const Home = () => {
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [loadedFeeds, setLoadedFeeds] = useState<Feed[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const session = useSession()

  const { mutate: toggleFollow, isPending: toggleFollowPending } = trpc.video.toggleFollow.useMutation()

  // Fetch videos with cursor-based pagination
  const {
    data: videoData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = trpc.video.feed.useInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Flatten all feeds from all pages
  useEffect(() => {
    if (videoData?.pages) {
      const allFeeds = videoData.pages.flatMap(page => page.feeds || []);
      setLoadedFeeds(allFeeds);
    }
  }, [videoData]);


  // Load more feeds when approaching the end
  useEffect(() => {
    if (currentFeedIndex >= loadedFeeds.length - 2 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [currentFeedIndex, loadedFeeds.length, hasNextPage, isFetching, fetchNextPage]);

  const currentFeed = loadedFeeds[currentFeedIndex];

  // Mutation for like/unlike
  const likeMutation = trpc.video.toggleLike.useMutation();
  const bookmarkMutation = trpc.video.toggleBookmark.useMutation();

  const handleLike = async (feedId: string) => {
    if (!currentFeed) return;

    try {
      await likeMutation.mutateAsync({ videoId: feedId });

      // Optimistic update
      setLoadedFeeds(prev => prev.map(feed =>
        feed.id === feedId
          ? {
            ...feed,
            isLiked: !feed.isLiked,
            stats: {
              ...feed.stats,
              likes: feed.isLiked ? feed.stats.likes - 1 : feed.stats.likes + 1
            }
          }
          : feed
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async (feedId: string) => {
    if (!currentFeed) return;

    try {
      await bookmarkMutation.mutateAsync({ videoId: feedId });

      // Optimistic update
      setLoadedFeeds(prev => prev.map(feed =>
        feed.id === feedId
          ? {
            ...feed,
            isBookmarked: !feed.isBookmarked,
            stats: {
              ...feed.stats,
              bookmarks: feed.isBookmarked ? feed.stats.bookmarks - 1 : feed.stats.bookmarks + 1
            }
          }
          : feed
      ));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // Update the handleFollow function with optimistic update
  const handleFollow = async (profileId: string) => {
    if (!currentFeed) return;

    try {
      // Optimistic update
      setLoadedFeeds(prev => prev.map(feed =>
        feed.user.id === profileId
          ? {
            ...feed,
            isFollowing: !feed.isFollowing,
          }
          : feed
      ));
      toggleFollow({ profileId });

    } catch (error) {
      console.error('Failed to toggle follow:', error);

      // Revert optimistic update on error
      setLoadedFeeds(prev => prev.map(feed =>
        feed.user.id === profileId
          ? {
            ...feed,
            isFollowing: !feed.isFollowing,
          }
          : feed
      ));
    }
  }

  // Video control functions
  const setVideoRef = useCallback((feedId: string, ref: HTMLVideoElement | null) => {
    if (ref) {
      videoRefs.current[feedId] = ref;
      ref.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = useCallback(() => {
    if (!currentFeed) return;

    const currentVideo = videoRefs.current[currentFeed.id];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
        setIsPlaying(false);
      } else {
        currentVideo.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  }, [currentFeed, isPlaying]);

  // only changes mute state, no loading
  const toggleMute = useCallback(() => {
    if (!currentFeed) return;

    const currentVideo = videoRefs.current[currentFeed.id];
    if (currentVideo) {
      const newMutedState = !isMuted;
      currentVideo.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [currentFeed, isMuted]);

  // doesn't pause current video unnecessarily
  useEffect(() => {
    if (!currentFeed) return;

    // Reset loading state when feed changes
    setVideoLoading(true);

    // Pause other videos and reset their position, but handle current video separately
    Object.entries(videoRefs.current).forEach(([feedId, video]) => {
      if (video && feedId !== currentFeed.id) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Handle current video
    const currentVideo = videoRefs.current[currentFeed.id];
    if (currentVideo) {
      currentVideo.muted = isMuted;
      // Only pause if we're not already in a playing state from user interaction
      if (currentVideo.readyState >= 3) {
        setVideoLoading(false);
        if (isPlaying) {
          currentVideo.play().catch(console.error);
        }
      }
    }
  }, [currentFeedIndex, currentFeed, isMuted, isPlaying]);

  // FIXED: Better video loading event handlers
  const handleVideoLoadStart = useCallback(() => {
    // Only set loading if this is actually a new video loading
    const currentVideo = videoRefs.current[currentFeed?.id || ''];
    if (currentVideo && currentVideo.currentTime === 0) {
      setVideoLoading(true);
    }
  }, [currentFeed?.id]);

  const handleVideoLoadedData = useCallback(() => {
    setVideoLoading(false);
    // Auto-play when video is ready if we're in playing state
    const currentVideo = videoRefs.current[currentFeed?.id || ''];
    if (currentVideo && isPlaying) {
      currentVideo.play().catch(console.error);
    }
  }, [currentFeed?.id, isPlaying]);

  // FIXED: Separate handler for when video can play
  const handleVideoCanPlay = useCallback(() => {
    setVideoLoading(false);
  }, []);

  // Helper to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const changeFeed = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down' && currentFeedIndex < loadedFeeds.length - 1) {
      setCurrentFeedIndex(prev => prev + 1);
      setIsPlaying(false);
    } else if (direction === 'up' && currentFeedIndex > 0) {
      setCurrentFeedIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  }, [currentFeedIndex, loadedFeeds.length]);

  // Touch/swipe variables
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const feedVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -100,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  };

  const actionButtonVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  };

  const likeButtonVariants = {
    hover: {
      scale: 1.2,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.8,
      transition: { duration: 0.1 }
    },
    liked: {
      scale: [1, 1.4, 1],
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.6 }
    }
  };

  // Mouse wheel scroll handler
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      if (e.deltaY > 0) {
        changeFeed('down');
      } else if (e.deltaY < 0) {
        changeFeed('up');
      }
    }, 100);
  }, [changeFeed]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changeFeed('down');
      } else {
        changeFeed('up');
      }
    }
  }, [changeFeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeFeed('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeFeed('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, changeFeed]);

  // Add scroll and touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Upload button handler
  const handleUpload = () => {
    router.push('/upload');
  };

  // Loading state
  if (isLoading || loadedFeeds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg">Loading videos...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentFeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80 text-lg">No videos available</p>
          <motion.button
            className="mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-full flex items-center space-x-2 border border-white/30 transition-all duration-300 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload First Video</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden"
    >
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

      {/* Upload Button */}
      <motion.button
        className="absolute top-6 left-6 z-50 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full flex items-center space-x-2 border border-white/30 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUpload}
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm font-medium">Upload</span>
      </motion.button>

      {/* Bottom Spinner shown when fetching next page (not initial load) */}
      <AnimatePresence>
        {isFetching && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-8 z-50"
          >
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feed Container */}
      <motion.div
        className="relative h-screen flex items-center justify-center p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeed.id}
              className="relative bg-black/20 backdrop-blur-lg rounded-3xl h-full shadow-2xl border border-white/10 overflow-hidden"
              variants={feedVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring" }}
            >
              {/* Video Player */}
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  ref={(ref) => setVideoRef(currentFeed.id, ref)}
                  className="w-full h-full object-cover"
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  onLoadStart={handleVideoLoadStart}
                  onLoadedData={handleVideoLoadedData}
                  onCanPlay={handleVideoCanPlay}
                  onClick={togglePlayPause}
                  loop
                >
                  <source src={currentFeed.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Loading Indicator */}
                <AnimatePresence>
                  {videoLoading && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Play/Pause Overlay */}
                <AnimatePresence>
                  {!isPlaying && !videoLoading && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={togglePlayPause}
                    >
                      <motion.div
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Controls */}
                <motion.button
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                >
                  {isMuted ?
                    <VolumeX className="w-5 h-5 text-white" /> :
                    <Volume2 className="w-5 h-5 text-white" />
                  }
                </motion.button>

                {/* Play/Pause Button */}
                <motion.button
                  className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full p-2 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                >
                  {isPlaying ?
                    <Pause className="w-5 h-5 text-white" /> :
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  }
                </motion.button>

                {/* User Info Overlay */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* User Profile */}
                  <div className="flex items-center mb-3">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-0.5"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <p className="text-white font-semibold text-sm">
                          {currentFeed.user.name}
                        </p>
                      </div>
                      <p className="text-white/70 text-xs">@{currentFeed.user.displayName}</p>
                    </div>
                    {currentFeed.user.id !== session?.id && (
                      <motion.button
                        className={`px-6 py-2 rounded-full text-sm font-semibold ${currentFeed.isFollowing
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFollow(currentFeed.user.id)}
                        disabled={toggleFollowPending}
                      >
                        {currentFeed.isFollowing ? 'Following' : 'Follow'}
                      </motion.button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white text-sm mb-3 leading-relaxed">
                    {currentFeed.description}
                  </p>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                className="absolute right-4 bottom-32 flex flex-col space-y-6 mb-12"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* Like Button */}
                <motion.div className="flex flex-col items-center">
                  <motion.button
                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 ${currentFeed.isLiked ? 'bg-red-500' : 'bg-white/10'
                      }`}
                    variants={likeButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    animate={currentFeed.isLiked ? "liked" : ""}
                    onClick={() => handleLike(currentFeed.id)}
                    disabled={likeMutation.isPending}
                  >
                    <Heart className={`w-6 h-6 ${currentFeed.isLiked ? 'text-white fill-white' : 'text-white'}`} />
                  </motion.button>
                  <span className="text-white text-xs mt-1 font-medium">
                    {formatNumber(currentFeed.stats.likes)}
                  </span>
                </motion.div>

                {/* Bookmark Button */}
                <motion.div className="flex flex-col items-center">
                  <motion.button
                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 ${currentFeed.isBookmarked ? 'bg-yellow-500' : 'bg-white/10'
                      }`}
                    variants={actionButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleBookmark(currentFeed.id)}
                    disabled={bookmarkMutation.isPending}
                  >
                    <BookmarkPlus className={`w-6 h-6 ${currentFeed.isBookmarked ? 'text-white fill-white' : 'text-white'}`} />
                  </motion.button>
                  <span className="text-white text-xs mt-1 font-medium">
                    {formatNumber(currentFeed.stats.bookmarks)}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;