import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PAGE_HELP_INFO } from '../constants/HelpContent';
import { Colors } from '@/constants/Colors';

export default function HelpModal({ visible, onClose, path }: { visible: boolean; onClose: () => void; path?: string }) {
  const info = PAGE_HELP_INFO[path || 'default'] || PAGE_HELP_INFO['default'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{info.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>닫기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            <Text style={styles.desc}>{info.desc}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  close: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  body: {
    padding: 16,
  },
  desc: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
});
