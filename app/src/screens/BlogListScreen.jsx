// screens/BlogListScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBlogs, clearError, setRefreshing } from 'store/blogSlice';
import {
  setSelectedTags,
  setSearchQuery,
  setCurrentPage,
  resetFilters,
} from 'store/filterSlice';
import SearchBar from 'components/SearchBar';
import TagFilter from 'components/TagFilter';
import BlogCard from 'components/BlogCard';
import assets from 'assets/index';

const BlogListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { blogs, pagination, loading, error, refreshing } = useSelector(
    state => state.blogs,
  );

  const { selectedTags, searchQuery, currentPage, itemsPerPage } = useSelector(
    state => state.filters,
  );

  const [showFilters, setShowFilters] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // Extract all unique tags from blogs
  useEffect(() => {
    const tags = blogs.reduce((acc, blog) => {
      blog.tags?.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, []);
    setAllTags(tags);
  }, [blogs]);

  // Fetch blogs when component mounts or filters change
  useFocusEffect(
    useCallback(() => {
      loadBlogs();
    }, [selectedTags, searchQuery, currentPage]),
  );

  const loadBlogs = () => {
    dispatch(
      fetchBlogs({
        page: currentPage,
        limit: itemsPerPage,
        tags: selectedTags.join(','),
        search: searchQuery,
      }),
    );
  };

  const handleRefresh = () => {
    dispatch(setRefreshing(true));
    dispatch(setCurrentPage(1));
    loadBlogs();
  };

  const handleLoadMore = () => {
    if (pagination.has_next && !loading) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  const handleBlogPress = blog => {
    navigation.navigate('BlogDetail', { blogId: blog._id, blog });
  };

  const handleSearch = query => {
    dispatch(setSearchQuery(query));
  };

  const handleSearchClear = () => {
    dispatch(setSearchQuery(''));
  };

  const handleTagsChange = tags => {
    dispatch(setSelectedTags(tags));
  };

  const renderBlogItem = ({ item }) => (
    <BlogCard blog={item} onPress={handleBlogPress} />
  );

  const renderFooter = () => {
    if (!pagination.has_next) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1976d2" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={assets.Article}
        style={styles.articleIcon}
        tintColor="#ccc"
      />
      <Text style={styles.emptyStateTitle}>No blogs found</Text>
      <Text style={styles.emptyStateText}>
        {selectedTags.length > 0 || searchQuery
          ? 'Try adjusting your filters or search terms'
          : 'Check back later for new content'}
      </Text>
      {(selectedTags.length > 0 || searchQuery) && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => dispatch(resetFilters())}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Image
        source={assets.Warning}
        style={styles.articleIcon}
        tintColor="#f44336"
      />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadBlogs}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blog Posts</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Image
            source={showFilters ? assets.FilterOff : assets.Filter}
            style={styles.filterIcon}
            tintColor="#1976d2"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onClear={handleSearchClear}
        initialValue={searchQuery}
      />

      {/* Tag Filter */}
      {showFilters && (
        <TagFilter
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          availableTags={allTags}
        />
      )}

      {/* Active Filters Summary */}
      {(selectedTags.length > 0 || searchQuery) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>
            {searchQuery && `Search: "${searchQuery}"`}
            {searchQuery && selectedTags.length > 0 && ' • '}
            {selectedTags.length > 0 &&
              `${selectedTags.length} tag(s) selected`}
          </Text>
        </View>
      )}

      {/* Content */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1976d2']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            blogs.length === 0 ? styles.emptyContainer : null
          }
        />
      )}

      {/* Loading Overlay */}
      {loading && blogs.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading blogs...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterToggle: {
    padding: 8,
  },
  activeFilters: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  articleIcon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  filterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default BlogListScreen;
