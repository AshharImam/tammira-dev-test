// screens/BlogEditorScreen.js - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createBlog, updateBlog } from '../store/blogSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from 'src/styles/colors';
import typography from 'src/styles/typography';
import {
  generateSlug,
  getWordCount,
  calculateReadingTime,
} from '../utils/helpers';
import { CommonActions } from '@react-navigation/native';

const BlogEditorScreen = ({ route, navigation }) => {
  const { blog, isEdit = false } = route.params || {};
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.blogs);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    content: '',
    tags: [],
    slug: '',
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form data only once when component mounts
  useEffect(() => {
    if (isEdit && blog && !initialized) {
      console.log('RERENDING', 49);
      setFormData({
        title: blog.title || '',
        sub_title: blog.sub_title || '',
        content: blog.content || '',
        tags: blog.tags || [],
        slug: blog.slug || '',
      });
      setInitialized(true);
    } else if (!isEdit && !initialized) {
      setInitialized(true);
    }
  }, [isEdit, blog, initialized]);

  // Memoize the back press handler to prevent recreation on every render
  const handleBackPress = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitModal(true);
    } else {
      navigation.goBack();
    }
  }, [hasUnsavedChanges, navigation]);

  // Memoize the save handler
  const handleSave = useCallback(async () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const blogData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      author: user._id,
    };

    try {
      if (isEdit) {
        await dispatch(updateBlog({ id: blog._id, blogData })).unwrap();
        Alert.alert('Success', 'Blog updated successfully', [
          {
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'BlogList',
                    },
                  ],
                }),
              );
            },
            text: 'OK',
          },
        ]);
      } else {
        await dispatch(createBlog(blogData)).unwrap();
        Alert.alert('Success', 'Blog published successfully', [
          {
            onPress: () => {
              navigation.goBack();
            },
            text: 'OK',
          },
        ]);
      }
      setHasUnsavedChanges(false);
      // navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to save blog');
    }
  }, [formData, user._id, isEdit, blog, dispatch, navigation]);

  // Set navigation options only when necessary values change
  useEffect(() => {
    if (!initialized) return;

    navigation.setOptions({
      title: isEdit ? 'Edit Blog' : 'New Blog',
      headerLeft: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Icon name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Icon
              name={showPreview ? 'edit' : 'visibility'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.publishButton,
              (!formData.title.trim() || !formData.content.trim()) &&
                styles.publishButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={
              loading || !formData.title.trim() || !formData.content.trim()
            }
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={styles.publishButtonText}>
                {isEdit ? 'Update' : 'Publish'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    initialized,
    isEdit,
    showPreview,
    formData.title,
    formData.content,
    loading,
    handleBackPress,
    handleSave,
  ]);

  // Track changes - separated into its own effect with proper dependencies
  useEffect(() => {
    if (!initialized) return;

    if (isEdit && blog) {
      const hasChanges =
        formData.title !== (blog.title || '') ||
        formData.sub_title !== (blog.sub_title || '') ||
        formData.content !== (blog.content || '') ||
        JSON.stringify([...formData.tags].sort()) !==
          JSON.stringify(([...blog.tags] || []).sort());
      setHasUnsavedChanges(hasChanges);
    } else {
      const hasContent =
        formData.title.trim() ||
        formData.sub_title.trim() ||
        formData.content.trim() ||
        formData.tags.length > 0;
      setHasUnsavedChanges(hasContent);
    }
  }, [
    initialized,
    isEdit,
    blog,
    formData,
    blog?.title,
    blog?.sub_title,
    blog?.content,
    blog?.tags,
  ]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Auto-generate slug from title
      if (field === 'title' && !isEdit) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }

      // Clear error when user starts typing
      setErrors(prev => {
        if (prev[field]) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return prev;
      });
    },
    [isEdit],
  );

  const handleAddTag = useCallback(() => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setCurrentTag('');
    }
  }, [currentTag, formData.tags]);

  const handleRemoveTag = useCallback(tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitModal(false);
    navigation.goBack();
  }, [navigation]);

  const getStats = useCallback(() => {
    const wordCount = getWordCount(formData.content);
    const readingTime = calculateReadingTime(formData.content);
    return { wordCount, readingTime };
  }, [formData.content]);

  // Don't render until initialized
  if (!initialized) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showPreview) {
    const stats = getStats();

    return (
      <ScrollView style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {formData.title || 'Untitled'}
            </Text>
            {formData.sub_title && (
              <Text style={styles.previewSubtitle}>{formData.sub_title}</Text>
            )}
          </View>

          <View style={styles.previewMeta}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitials}>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.publishDate}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {formData.tags.length > 0 && (
            <View style={styles.previewTags}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.previewTag}>
                  <Text style={styles.previewTagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.previewContent}>
            <Text style={styles.previewContentText}>
              {formData.content || 'Start writing your blog content...'}
            </Text>
          </View>

          <View style={styles.previewStats}>
            <Text style={styles.previewStatsText}>
              {stats.wordCount} words • {stats.readingTime} min read
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const stats = getStats();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.editorContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.titleInput, errors.title && styles.inputError]}
            placeholder="Enter blog title..."
            value={formData.title}
            onChangeText={value => handleInputChange('title', value)}
            multiline
            placeholderTextColor={colors.textHint}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Subtitle Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.subtitleInput}
            placeholder="Enter subtitle (optional)..."
            value={formData.sub_title}
            onChangeText={value => handleInputChange('sub_title', value)}
            multiline
            placeholderTextColor={colors.textHint}
          />
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              value={currentTag}
              onChangeText={setCurrentTag}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
              placeholderTextColor={colors.textHint}
            />
            <TouchableOpacity
              style={[
                styles.addTagButton,
                !currentTag.trim() && styles.addTagButtonDisabled,
              ]}
              onPress={handleAddTag}
              disabled={!currentTag.trim()}
            >
              <Icon name="add" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>

          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                  <Icon
                    name="close"
                    size={16}
                    color={colors.primary}
                    style={styles.tagRemoveIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Slug Input (for edit mode) */}
        {isEdit && (
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>URL Slug</Text>
            <TextInput
              style={styles.slugInput}
              placeholder="url-slug"
              value={formData.slug}
              onChangeText={value => handleInputChange('slug', value)}
              autoCapitalize="none"
              placeholderTextColor={colors.textHint}
            />
          </View>
        )}

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Content</Text>
          <TextInput
            style={[styles.contentInput, errors.content && styles.inputError]}
            placeholder="Start writing your blog content..."
            value={formData.content}
            onChangeText={value => handleInputChange('content', value)}
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.textHint}
          />
          {errors.content && (
            <Text style={styles.errorText}>{errors.content}</Text>
          )}
        </View>

        {/* Stats */}
        {formData.content.trim() && (
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Icon name="text-fields" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{stats.wordCount} words</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="schedule" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{stats.readingTime} min read</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="warning" size={48} color={colors.warning} />
            <Text style={styles.modalTitle}>Unsaved Changes</Text>
            <Text style={styles.modalText}>
              You have unsaved changes. Are you sure you want to leave without
              saving?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={styles.modalCancelText}>Keep Editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmExit}
              >
                <Text style={styles.modalConfirmText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// ... styles remain the same ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  publishButtonText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 14,
  },
  editorContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  titleInput: {
    ...typography.h2,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  subtitleInput: {
    ...typography.h4,
    color: colors.textSecondary,
    padding: 0,
    minHeight: 40,
    textAlignVertical: 'top',
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.body2,
    color: colors.textPrimary,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  tagRemoveIcon: {
    marginLeft: 4,
  },
  slugInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.body2,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...typography.body1,
    color: colors.textPrimary,
    minHeight: 300,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  // Preview Styles
  previewContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  previewHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  previewTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 36,
  },
  previewSubtitle: {
    ...typography.h4,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  previewMeta: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitials: {
    ...typography.body2,
    color: colors.surface,
    fontWeight: 'bold',
  },
  authorName: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  publishDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  previewTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  previewTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  previewContent: {
    padding: 20,
  },
  previewContentText: {
    ...typography.body1,
    color: colors.textPrimary,
    lineHeight: 28,
    textAlign: 'justify',
  },
  previewStats: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  previewStatsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.warning,
    borderRadius: 8,
  },
  modalConfirmText: {
    ...typography.button,
    color: colors.surface,
  },
});

export default BlogEditorScreen;
