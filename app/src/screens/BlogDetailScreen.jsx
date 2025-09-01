// screens/BlogDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogById, clearCurrentBlog } from 'store/blogSlice';
import { setSelectedTags } from 'store/filterSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BlogDetailScreen = ({ route, navigation }) => {
  const { blogId, blog: routeBlog } = route.params;
  const dispatch = useDispatch();
  const { currentBlog, loading, error } = useSelector(state => state.blogs);

  const [textSize, setTextSize] = useState('medium');

  const blog = currentBlog || routeBlog;

  useEffect(() => {
    // Set header options
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Icon name="share" size={24} color="#1976d2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleTextSize}
          >
            <Icon name="format-size" size={24} color="#1976d2" />
          </TouchableOpacity>
        </View>
      ),
    });

    // Fetch blog details if not available
    if (!routeBlog || blogId !== routeBlog._id) {
      dispatch(fetchBlogById(blogId));
    }

    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [blogId, routeBlog, navigation]);

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (!blog) return;

    try {
      await Share.share({
        message: `Check out this blog: ${blog.title}\n\n${
          blog.sub_title || ''
        }\n\nRead more in the BlogApp!`,
        title: blog.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share blog');
    }
  };

  const toggleTextSize = () => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setTextSize(sizes[nextIndex]);
  };

  const getTextStyles = () => {
    const baseSize = textSize === 'small' ? 14 : textSize === 'large' ? 18 : 16;
    return {
      fontSize: baseSize,
      lineHeight: baseSize * 1.5,
    };
  };

  if (loading && !blog) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading blog...</Text>
      </View>
    );
  }

  if (error && !blog) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#f44336" />
        <Text style={styles.errorTitle}>Failed to load blog</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchBlogById(blogId))}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="article" size={64} color="#ccc" />
        <Text style={styles.errorTitle}>Blog not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.blogHeader}>
          <Text style={styles.title}>{blog.title}</Text>
          {blog.sub_title && (
            <Text style={styles.subtitle}>{blog.sub_title}</Text>
          )}
        </View>

        {/* Author Info */}
        <View style={styles.authorSection}>
          <Image
            source={{
              uri:
                blog.author?.profile_pic_url ||
                'https://via.placeholder.com/50x50',
            }}
            style={styles.authorImage}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {blog.author?.first_name} {blog.author?.last_name}
            </Text>
            {blog.author?.bio && (
              <Text style={styles.authorBio}>{blog.author.bio}</Text>
            )}
            <View style={styles.dateContainer}>
              <Icon name="schedule" size={14} color="#999" />
              <Text style={styles.dateText}>
                Published {formatDate(blog.created_date)}
              </Text>
            </View>
            {blog.modified_date !== blog.created_date && (
              <View style={styles.dateContainer}>
                <Icon name="edit" size={14} color="#999" />
                <Text style={styles.dateText}>
                  Updated {formatDate(blog.modified_date)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>Tags:</Text>
            <View style={styles.tagsContainer}>
              {blog.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => {
                    // Navigate back and filter by this tag
                    dispatch(setSelectedTags([tag]));
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Blog Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.blogContent, getTextStyles()]}>
            {blog.content}
          </Text>
        </View>

        {/* Reading Stats */}
        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.statText}>
              {Math.ceil(blog.content.split(' ').length / 200)} min read
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="text-fields" size={16} color="#666" />
            <Text style={styles.statText}>
              {blog.content.split(' ').length} words
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  blogHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  authorSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  tagsSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  blogContent: {
    color: '#333',
    textAlign: 'justify',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default BlogDetailScreen;
