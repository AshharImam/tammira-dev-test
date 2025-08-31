import { View, Text } from 'react-native';
import React from 'react';
import BlogCard from 'components/BlogCard';
import SearchBar from 'components/SearchBar';

const App = () => {
  return (
    <View>
      <BlogCard
        onPress={() => {}}
        blog={{
          title: 'Sample Blog Post',
          sub_title: 'This is a sample subtitle for the blog post.',
          content:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          tags: ['React Native', 'JavaScript', 'Mobile Development'],
          author: {
            first_name: 'John Doe',
            last_name: 'John Doe',
          },
        }}
      />
    </View>
  );
};

export default App;
