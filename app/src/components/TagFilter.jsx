// components/TagFilter.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TagFilter = ({ selectedTags, onTagsChange, availableTags = [] }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Get unique tags from available tags and selected tags
  const allTags = [...new Set([...availableTags, ...selectedTags])];

  const toggleTag = (tag) => {
    const isSelected = selectedTags.includes(tag);
    let newTags;
    
    if (isSelected) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    
    onTagsChange(newTags);
  };

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
      setCustomTag('');
      setIsModalVisible(false);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter by Tags</Text>
        <View style={styles.headerActions}>
          {selectedTags.length > 0 && (
            <TouchableOpacity onPress={clearAllTags} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.addButton}
          >
            <Icon name="add" size={20} color="#1976d2" />
          </TouchableOpacity>
        </View>
      </View>

      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={styles.selectedTagsTitle}>Selected Tags:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedTagsScroll}
          >
            {selectedTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tag, styles.selectedTag]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, styles.selectedTagText]}>
                  #{tag}
                </Text>
                <Icon name="close" size={16} color="#fff" style={styles.removeIcon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScroll}
      >
        {allTags.filter(tag => !selectedTags.includes(tag)).map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            onPress={() => toggleTag(tag)}
          >
            <Text style={styles.tagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Custom Tag Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Tag</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.customTagInput}
              placeholder="Enter tag name..."
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
              autoFocus
              returnKeyType="done"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.addTagButton,
                  !customTag.trim() && styles.addTagButtonDisabled
                ]}
                onPress={addCustomTag}
                disabled={!customTag.trim()}
              >
                <Text style={styles.addTagButtonText}>Add Tag</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  addButton: {
    padding: 4,
  },
  selectedTagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedTagsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  selectedTagsScroll: {
    marginBottom: 8,
  },
  tagsScroll: {
    paddingHorizontal: 16,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTag: {
    backgroundColor: '#1976d2',
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#fff',
  },
  removeIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  customTagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  addTagButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addTagButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addTagButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});

export default TagFilter;