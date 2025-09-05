import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { Heart, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Comment } from '@/types/reels';
import { commentsData, reactionEmojis } from '@/mocks/reelsData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  reelId: string;
}

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {getInitials(comment.username)}
        </Text>
      </View>
      
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentDate}>{comment.date}</Text>
        </View>
        
        <Text style={styles.commentText}>{comment.text}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentLikeButton} 
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Heart 
              size={14} 
              color={isLiked ? "#ff3040" : "#666"} 
              fill={isLiked ? "#ff3040" : "transparent"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.commentReplyButton} activeOpacity={0.7}>
            <Text style={styles.commentReplyText}>Responder</Text>
          </TouchableOpacity>
          
          {likeCount > 0 && (
            <Text style={styles.commentLikeCount}>
              {likeCount} {likeCount === 1 ? 'comentário' : 'comentários'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentsModal: React.FC<CommentsModalProps> = ({ visible, onClose, reelId }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    setComments(commentsData[reelId] || []);
  }, [reelId]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backgroundOpacity]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        username: 'Você',
        text: newComment.trim(),
        date: 'Agora',
        likes: 0,
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleEmojiPress = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalBackground,
            { opacity: backgroundOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackgroundTouchable}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
          {...panResponder.panHandlers}
        >
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.dragHandle} />
                <Text style={styles.modalTitle}>Comentários</Text>
              </View>
              
              {/* Comments List */}
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CommentItem comment={item} />}
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.commentsListContent}
              />
              
              {/* Reaction Emojis */}
              <View style={styles.reactionsContainer}>
                <FlatList
                  data={reactionEmojis}
                  horizontal
                  keyExtractor={(item) => item.emoji}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.reactionButton}
                      onPress={() => handleEmojiPress(item.emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reactionsContent}
                />
              </View>
              
              {/* Input Area */}
              <View style={styles.inputContainer}>
                <View style={styles.inputAvatar}>
                  <Text style={styles.inputAvatarText}>V</Text>
                </View>
                
                <TextInput
                  style={styles.textInput}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor="#999"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { opacity: newComment.trim() ? 1 : 0.5 }
                  ]}
                  onPress={handleSendComment}
                  disabled={!newComment.trim()}
                  activeOpacity={0.7}
                >
                  <Send size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackgroundTouchable: {
    flex: 1,
  },
  modalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3040',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  commentDate: {
    color: '#999',
    fontSize: 12,
  },
  commentText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeButton: {
    marginRight: 16,
  },
  commentReplyButton: {
    marginRight: 16,
  },
  commentReplyText: {
    color: '#999',
    fontSize: 12,
  },
  commentLikeCount: {
    color: '#999',
    fontSize: 12,
  },
  reactionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 12,
  },
  reactionsContent: {
    paddingHorizontal: 16,
  },
  reactionButton: {
    marginRight: 12,
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    padding: 8,
  },
});

export default CommentsModal;