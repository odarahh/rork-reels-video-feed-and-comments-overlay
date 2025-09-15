import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { reelsData } from '@/mocks/reelsData';
import type { ReelItem } from '@/types/reels';
import CommentsModal from '@/components/CommentsModal';
import ShareModal from '@/components/ShareModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  item: ReelItem;
  isActive: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlayPause: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, isActive, volume, isMuted, onTogglePlayPause }) => {
  const videoRef = useRef<Video>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  React.useEffect(() => {
    if (isActive && videoRef.current) {
      if (Platform.OS === 'web' && !hasUserInteracted) {
        // On web, don't autoplay until user interacts
        return;
      }
      if (isPlaying) {
        videoRef.current.playAsync().catch((error) => {
          console.log('Video play failed:', error);
        });
      }
    } else if (!isActive && videoRef.current) {
      videoRef.current.pauseAsync().catch((error) => {
        console.log('Video pause failed:', error);
      });
    }
  }, [isActive, hasUserInteracted, isPlaying]);

  const handleVideoPress = async () => {
    if (Platform.OS === 'web' && !hasUserInteracted) {
      setHasUserInteracted(true);
      if (videoRef.current && isActive) {
        videoRef.current.playAsync().catch((error) => {
          console.log('Video play failed:', error);
        });
      }
      return;
    }

    // Toggle play/pause
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        }
        onTogglePlayPause();
      } catch (error) {
        console.log('Video toggle failed:', error);
      }
    }
  };

  // Create PanResponder to handle video area touches only
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: handleVideoPress,
  });

  return (
    <View style={styles.video} {...panResponder.panHandlers}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: item.videoUrl }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={Platform.OS === 'web' ? (isActive && hasUserInteracted && isPlaying) : (isActive && isPlaying)}
        isLooping
        isMuted={Platform.OS === 'web' ? true : isMuted}
        volume={volume}
      />
      {Platform.OS === 'web' && !hasUserInteracted && isActive && (
        <View style={styles.playPrompt}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶</Text>
          </View>
          <Text style={styles.playPromptText}>Toque para reproduzir</Text>
        </View>
      )}
      {!isPlaying && isActive && hasUserInteracted && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseIcon}>
            <Text style={styles.pauseIconText}>▶</Text>
          </View>
        </View>
      )}
    </View>
  );
};

interface ReelOverlayProps {
  item: ReelItem;
  fadeAnim: Animated.Value;
  onOpenComments: () => void;
  onOpenShare: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

interface FloatingHeart {
  id: string;
  animValue: Animated.Value;
}

const ReelOverlay: React.FC<ReelOverlayProps> = ({ 
  item, 
  fadeAnim, 
  onOpenComments, 
  onOpenShare, 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const volumeSliderAnim = useRef(new Animated.Value(0)).current;
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descriptionAnimHeight = useRef(new Animated.Value(60)).current;

  const createFloatingHeart = useCallback(() => {
    const heartId = Date.now().toString();
    const animValue = new Animated.Value(0);
    
    const newHeart: FloatingHeart = {
      id: heartId,
      animValue,
    };
    
    setFloatingHearts(prev => [...prev, newHeart]);
    
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setFloatingHearts(prev => prev.filter(heart => heart.id !== heartId));
    });
  }, []);

  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    // Button scale animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Create floating heart animation only when liking
    if (newLikedState) {
      createFloatingHeart();
    }
  }, [isLiked, buttonScaleAnim, createFloatingHeart]);

  const handleVolumePress = useCallback(() => {
    if (Platform.OS === 'web') {
      onToggleMute();
      return;
    }
    
    const newShowState = !showVolumeSlider;
    setShowVolumeSlider(newShowState);
    
    // Clear existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    if (newShowState) {
      // Animate slider in
      Animated.timing(volumeSliderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Hide slider after 4 seconds of inactivity
      volumeTimeoutRef.current = setTimeout(() => {
        Animated.timing(volumeSliderAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowVolumeSlider(false);
        });
      }, 4000);
    } else {
      // Animate slider out immediately
      Animated.timing(volumeSliderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowVolumeSlider(false);
      });
    }
  }, [onToggleMute, volumeSliderAnim, showVolumeSlider]);

  const handleSliderChange = useCallback((value: number) => {
    onVolumeChange(value);
    
    // Reset timeout when user interacts with slider
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    volumeTimeoutRef.current = setTimeout(() => {
      Animated.timing(volumeSliderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowVolumeSlider(false);
      });
    }, 4000);
  }, [onVolumeChange, volumeSliderAnim]);

  // Handle description expansion animation
  const toggleDescription = useCallback(() => {
    const newExpandedState = !isDescriptionExpanded;
    setIsDescriptionExpanded(newExpandedState);
    
    Animated.timing(descriptionAnimHeight, {
      toValue: newExpandedState ? Math.max(descriptionHeight, 60) : 60,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDescriptionExpanded, descriptionHeight, descriptionAnimHeight]);

  const onDescriptionLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 60 && !shouldShowExpandButton) {
      setShouldShowExpandButton(true);
      setDescriptionHeight(height);
    }
  }, [shouldShowExpandButton]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      {/* Volume Control */}
      <View style={styles.volumeControl}>
        <TouchableOpacity 
          style={styles.volumeButton} 
          onPress={handleVolumePress}
          activeOpacity={0.7}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={24} color="white" />
          ) : (
            <Volume2 size={24} color="white" />
          )}
        </TouchableOpacity>
        
        {showVolumeSlider && Platform.OS !== 'web' && (
          <Animated.View 
            style={[
              styles.volumeSliderContainer,
              {
                opacity: volumeSliderAnim,
                transform: [{
                  translateX: volumeSliderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  })
                }]
              }
            ]}
          >
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleSliderChange}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#ffffff"
            />
          </Animated.View>
        )}
      </View>

      {/* Right side interaction buttons */}
      <View style={styles.rightActions}>
        <View style={styles.likeButtonContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.heartButton, { transform: [{ scale: buttonScaleAnim }] }]}>
              <Heart 
                size={28} 
                color={isLiked ? "#ff3040" : "white"} 
                fill={isLiked ? "#ff3040" : "transparent"}
              />
            </Animated.View>
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>
          
          {/* Floating hearts animation */}
          {floatingHearts.map((heart) => (
            <Animated.View
              key={heart.id}
              style={[
                styles.floatingHeart,
                {
                  opacity: heart.animValue.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: heart.animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -80],
                      }),
                    },
                    {
                      translateX: heart.animValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, Math.random() * 20 - 10, Math.random() * 30 - 15],
                      }),
                    },
                    {
                      scale: heart.animValue.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [0, 1.2, 1, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Heart size={20} color="#ff3040" fill="#ff3040" />
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={onOpenComments} activeOpacity={0.7}>
          <MessageCircle size={28} color="white" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onOpenShare} activeOpacity={0.7}>
          <Share size={28} color="white" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.username.charAt(0)}</Text>
            </View>
            <Text style={styles.username}>@{item.username}</Text>

          </View>
          
          <View style={styles.descriptionContainer}>
            <Animated.View style={[styles.descriptionWrapper, { height: descriptionAnimHeight }]}>
              <Text 
                style={styles.description}
                numberOfLines={isDescriptionExpanded ? undefined : 4}
                onLayout={onDescriptionLayout}
              >
                {item.description}
              </Text>
            </Animated.View>
            
            {shouldShowExpandButton && (
              <TouchableOpacity 
                style={styles.expandButton} 
                onPress={toggleDescription}
                activeOpacity={0.7}
              >
                <Text style={styles.expandButtonText}>
                  {isDescriptionExpanded ? 'menos' : 'mais'}
                </Text>
                {isDescriptionExpanded ? (
                  <ChevronUp size={16} color="white" />
                ) : (
                  <ChevronDown size={16} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.metadata}>
            <Text style={styles.views}>{item.views} visualizações</Text>
            {item.hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>#{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ReelsScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string>('');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(Platform.OS === 'web');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, fadeAnim]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(contentOffset / SCREEN_HEIGHT);
    
    if (index !== currentIndex) {
      setCurrentIndex(index);
      
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex, fadeAnim]);

  const handleOpenComments = useCallback((reelId: string) => {
    setSelectedReelId(reelId);
    setCommentsModalVisible(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentsModalVisible(false);
    setSelectedReelId('');
  }, []);

  const handleOpenShare = useCallback((reelId: string) => {
    setSelectedReelId(reelId);
    setShareModalVisible(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareModalVisible(false);
    setSelectedReelId('');
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        style={styles.scrollView}
      >
        {reelsData.map((item, index) => (
          <View key={item.id} style={styles.reelContainer}>
            <VideoPlayer 
              item={item} 
              isActive={index === currentIndex}
              volume={volume}
              isMuted={isMuted}
              onTogglePlayPause={() => {}}
            />
            <ReelOverlay 
              item={item} 
              fadeAnim={fadeAnim} 
              onOpenComments={() => handleOpenComments(item.id)}
              onOpenShare={() => handleOpenShare(item.id)}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          </View>
        ))}
      </ScrollView>
      
      <CommentsModal
        visible={commentsModalVisible}
        onClose={handleCloseComments}
        reelId={selectedReelId}
      />
      
      <ShareModal
        visible={shareModalVisible}
        onClose={handleCloseShare}
        reelId={selectedReelId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPrompt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButtonText: {
    fontSize: 32,
    color: '#000',
    marginLeft: 4,
  },
  playPromptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.4,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 96,
    alignItems: 'center',
  },
  likeButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heartButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3040',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  descriptionContainer: {
    marginBottom: 8,
  },
  descriptionWrapper: {
    overflow: 'hidden',
  },
  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  views: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginRight: 12,
  },
  hashtag: {
    color: 'white',
    fontSize: 12,
    marginRight: 8,
  },
  volumeControl: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  volumeSliderContainer: {
    marginLeft: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  volumeSlider: {
    width: 120,
    height: 24,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconText: {
    fontSize: 32,
    color: '#000',
    marginLeft: 4,
  },

});

export default ReelsScreen;