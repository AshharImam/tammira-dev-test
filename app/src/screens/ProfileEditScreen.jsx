// screens/ProfileScreen.js
import assets from 'assets/index';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import authService from 'src/services/authService';
import colors from 'src/styles/colors';
import typography from 'src/styles/typography';
import { clearError, logout, updateProfile } from 'store/authSlice';

const ProfileScreen = ({ navigation }) => {
  const { user, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profile_pic_url: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        profile_pic_url: user.profile_pic_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        let imageResponse = '';
        if (formData.profile_pic_url) {
          imageResponse = await authService.uploadImage(
            formData.profile_pic_url,
          );
        }

        await dispatch(
          updateProfile({
            ...formData,
            profile_pic_url: imageResponse ? imageResponse?.data?.url : '',
          }),
        ).unwrap();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error) {
        // Error is handled in useEffect
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      profile_pic_url: user.profile_pic_url || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    if (result.didCancel) {
      return;
    }
    const imageAsset = result.assets?.[0];
    if (imageAsset) {
      handleInputChange('profile_pic_url', imageAsset.uri);
    }
  };
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {formData.profile_pic_url ? (
            <Image
              source={{ uri: formData.profile_pic_url }}
              style={styles.profileImage}
              onError={() => handleInputChange('profile_pic_url', '')}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>{getInitials()}</Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity
              onPress={handleSelectImage}
              style={styles.editImageButton}
            >
              <Image
                source={assets.Camera}
                style={styles.cameraIcon}
                color={colors.surface}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerActions}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              {/* <Icon name="edit" size={20} color={colors.primary} /> */}
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Form */}
      <View style={styles.form}>
        {/* Name Fields */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>First Name</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.first_name && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={formData.first_name}
                onChangeText={value => handleInputChange('first_name', value)}
                autoCapitalize="words"
                editable={isEditing}
                placeholderTextColor={colors.textHint}
              />
            </View>
            {errors.first_name && (
              <Text style={styles.errorText}>{errors.first_name}</Text>
            )}
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Last Name</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.last_name && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={formData.last_name}
                onChangeText={value => handleInputChange('last_name', value)}
                autoCapitalize="words"
                editable={isEditing}
                placeholderTextColor={colors.textHint}
              />
            </View>
            {errors.last_name && (
              <Text style={styles.errorText}>{errors.last_name}</Text>
            )}
          </View>
        </View>
        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={value => handleInputChange('bio', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={isEditing}
              placeholderTextColor={colors.textHint}
            />
          </View>
        </View>

        {/* Account Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Account Information</Text>
          <View style={styles.statRow}>
            {/* <Icon name="schedule" size={20} color={colors.textSecondary} /> */}
            <Text style={styles.statText}>
              Member since{' '}
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.statRow}>
            {/* <Icon name="article" size={20} color={colors.textSecondary} /> */}
            <Text style={styles.statText}>0 blog posts published</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {/* <Icon name="logout" size={20} color={colors.error} /> */}
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Icon name="logout" size={48} color={colors.error} /> */}
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    ...typography.h2,
    color: colors.surface,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  headerActions: {
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  editButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: 4,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 20,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  form: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 0.48,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statsTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    margin: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalConfirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
  modalConfirmText: {
    ...typography.button,
    color: colors.surface,
  },
  cameraIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: colors.surface,
  },
});

export default ProfileScreen;
