import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import assets from 'assets/index'; // Adjust the path as necessary
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchBar = ({
  onSearch,
  onClear,
  placeholder = 'Search blogs...',
  initialValue = '',
}) => {
  const [searchText, setSearchText] = useState(initialValue);

  useEffect(() => {
    setSearchText(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    onSearch(searchText.trim());
  };

  const handleClear = () => {
    setSearchText('');
    onClear();
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image source={assets.Search} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="search"
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Icon name="clear" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      {searchText.trim() !== initialValue && (
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#999',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SearchBar;
