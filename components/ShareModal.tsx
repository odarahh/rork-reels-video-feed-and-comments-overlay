import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import { Copy } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';


const MODAL_HEIGHT = 320;

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  reelId: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, reelId }) => {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

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

  const handleCopyLink = async () => {
    try {
      const link = `https://app.example.com/reel/${reelId}`;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(link);
      } else {
        await Clipboard.setStringAsync(link);
      }
      Alert.alert('Sucesso', 'Link copiado para a área de transferência!');
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o link.');
    }
  };



  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      onPress: () => {
        Alert.alert('WhatsApp', 'Compartilhamento via WhatsApp em desenvolvimento.');
        onClose();
      },
    },
    {
      id: 'x',
      name: 'X',
      icon: '𝕏',
      color: '#000000',
      onPress: () => {
        Alert.alert('X (Twitter)', 'Compartilhamento via X em desenvolvimento.');
        onClose();
      },
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      color: '#EA4335',
      onPress: () => {
        Alert.alert('Gmail', 'Compartilhamento via Gmail em desenvolvimento.');
        onClose();
      },
    },
  ];

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
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.dragHandle} />
              <Text style={styles.modalTitle}>Compartilhar</Text>
            </View>
            
            {/* Share Options Grid */}
            <View style={styles.shareOptionsContainer}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.shareOption}
                  onPress={option.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: option.color }]}>
                    <Text style={styles.shareIcon}>{option.icon}</Text>
                  </View>
                  <Text style={styles.shareOptionName} numberOfLines={2}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopyLink}
                activeOpacity={0.7}
              >
                <Copy size={20} color="white" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Copiar link</Text>
              </TouchableOpacity>
              

            </View>
          </SafeAreaView>
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
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  safeArea: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
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
  shareOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  shareOption: {
    alignItems: 'center',
    width: '18%',
    marginBottom: 20,
  },
  shareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareIcon: {
    fontSize: 24,
    color: 'white',
  },
  shareOptionName: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionButtonIcon: {
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default ShareModal;