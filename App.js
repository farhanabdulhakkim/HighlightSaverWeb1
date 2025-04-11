import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert
} from 'react-native';
import { Button } from 'react-native-paper';

export default function App() {
  const [sampleText, setSampleText] = useState('');
  const [highlightedWords, setHighlightedWords] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem('highlightedWords');
      if (saved) setHighlightedWords(saved.split(','));
    }
  }, []);

  const toggleHighlight = (word) => {
    setHighlightedWords((prev) => {
      const updated = prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word];
      if (Platform.OS === 'web') {
        localStorage.setItem('highlightedWords', updated.join(','));
      }
      return updated;
    });
  };

  const saveToFile = () => {
    const content = highlightedWords.join(', ');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'highlighted_words.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadTextFromFile = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        setSampleText(text);
        setHighlightedWords([]);
        if (Platform.OS === 'web') {
          localStorage.removeItem('highlightedWords');
        }
      };
      reader.readAsText(file);
    } else {
      Alert.alert('Invalid file', 'Please upload a .txt file');
    }
  };

  const copyToClipboard = async () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(highlightedWords.join(', '));
      alert('Copied to clipboard!');
    }
  };

  const clearHighlights = () => {
    setHighlightedWords([]);
    if (Platform.OS === 'web') localStorage.removeItem('highlightedWords');
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📄 DocScanner Web</Text>
        <Text style={styles.subtitle}>Highlight words from your text file easily!</Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.card}>
        <input
          type="file"
          accept=".txt"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={loadTextFromFile}
        />
        <View style={styles.buttonGroup}>
          <Button mode="contained" onPress={() => fileInputRef.current.click()}>
            Upload .txt File
          </Button>
          <Button mode="contained" onPress={saveToFile} disabled={!sampleText}>
            Save Highlights
          </Button>
          <Button mode="contained" onPress={copyToClipboard} disabled={highlightedWords.length === 0}>
            Copy to Clipboard
          </Button>
          <Button mode="outlined" onPress={clearHighlights} disabled={highlightedWords.length === 0}>
            Clear Highlights
          </Button>
        </View>

        {/* TEXT VIEW */}
        {sampleText ? (
          <ScrollView contentContainerStyle={styles.textContainer}>
            {sampleText.split(/\s+/).map((word, index) => (
              <TouchableOpacity key={index} onPress={() => toggleHighlight(word)}>
                <Text style={[styles.word, highlightedWords.includes(word) && styles.highlighted]}>
                  {word + ' '}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.helperText}>Upload a .txt file to begin highlighting.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  card: {
    width: '100%',
    maxWidth: 800,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
  },
  word: {
    fontSize: 18,
    color: '#222',
    padding: 4,
    borderRadius: 6,
  },
  highlighted: {
    backgroundColor: '#ffd54f',
  },
  helperText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});
