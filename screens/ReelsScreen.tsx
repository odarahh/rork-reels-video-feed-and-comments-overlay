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
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reelsData } from '@/mocks/reelsData';
import type { ReelItem } from '@/types/reels';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  item: ReelItem;
  isActive: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, isActive }) => {
  const videoRef = useRef<Video>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  React.useEffect(() => {
    if (isActive && videoRef.current) {
      if (Platform.OS === 'web' && !hasUserInteracted) {
        // On web, don't autoplay until user interacts
        return;
      }
      videoRef.current.playAsync().catch((error) => {
        console.log('Video play failed:', error);
      });
    } else if (!isActive && videoRef.current) {
      videoRef.current.pauseAsync().catch((error) => {
        console.log('Video pause failed:', error);
      });
    }
  }, [isActive, hasUserInteracted]);

  const handleVideoPress = () => {
    if (Platform.OS === 'web' && !hasUserInteracted) {
      setHasUserInteracted(true);
      if (videoRef.current && isActive) {
        videoRef.current.playAsync().catch((error) => {
          console.log('Video play failed:', error);
        });
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.video} 
      onPress={handleVideoPress}
      activeOpacity={1}
    >
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: item.videoUrl }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={Platform.OS === 'web' ? (isActive && hasUserInteracted) : isActive}
        isLooping
        isMuted={Platform.OS === 'web' ? true : false}
      />
      {Platform.OS === 'web' && !hasUserInteracted && isActive && (
        <View style={styles.playPrompt}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶</Text>
          </View>
          <Text style={styles.playPromptText}>Toque para reproduzir</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface ReelOverlayProps {
  item: ReelItem;
  fadeAnim: Animated.Value;
}

interface FloatingHeart {
  id: string;
  animValue: Animated.Value;
}

const ReelOverlay: React.FC<ReelOverlayProps> = ({ item, fadeAnim }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
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

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <MessageCircle size={28} color="white" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
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
          
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
          
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
            />
            <ReelOverlay item={item} fadeAnim={fadeAnim} />
          </View>
        ))}
      </ScrollView>
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
    bottom: 120,
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

  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
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
});

export default ReelsScreen;