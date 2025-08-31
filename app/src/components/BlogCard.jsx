import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const BlogCard = ({ blog, onPress }) => {
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(blog)}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{blog.title}</Text>
        {blog.sub_title && (
          <Text style={styles.subtitle}>{blog.sub_title}</Text>
        )}
        <Text style={styles.content}>{truncateText(blog.content, 120)}</Text>

        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {blog.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {blog.tags.length > 3 && (
              <Text style={styles.moreTagsText}>
                +{blog.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        <View style={styles.authorSection}>
          <Image
            source={{
              uri:
                blog.author?.profile_pic_url ||
                'https://imebehavioralhealth.com/wp-content/uploads/2021/10/user-icon-placeholder-1.png',
            }}
            style={styles.authorImage}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {blog.author?.first_name} {blog.author?.last_name}
            </Text>
            <Text style={styles.date}>{formatDate(blog.created_date)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  content: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  authorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default BlogCard;
