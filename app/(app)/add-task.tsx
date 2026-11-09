import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/contexts/TasksContext';
import type { TaskPriority } from '../../src/types';

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  { key: 'high', label: 'HIGH', color: '#EF4444' },
  { key: 'med', label: 'MED', color: '#F59E0B' },
  { key: 'low', label: 'LOW', color: '#22C55E' },
];

export default function AddTaskScreen() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('med');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-5 pb-10 pt-14"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>

        <Text className="mb-6 font-bold text-2xl text-ink">Add task</Text>

        <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
          <Text className="mb-1.5 font-medium text-sm text-ink">Title</Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <Text className="mb-1.5 font-medium text-sm text-ink">Notes (optional)</Text>
          <TextInput
            className="mb-4 rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="Extra details"
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Text className="mb-2 font-medium text-sm text-ink">Priority</Text>
          <View className="mb-6 flex-row gap-2">
            {PRIORITIES.map((p) => {
              const selected = priority === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  className={`rounded-full px-4 py-2 ${
                    selected ? 'opacity-100' : 'opacity-50'
                  }`}
                  style={{ backgroundColor: selected ? p.color : '#F3F4F6' }}
                >
                  <Text
                    className={`font-semibold text-xs ${
                      selected ? 'text-white' : 'text-ink-muted'
                    }`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">Save task</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}