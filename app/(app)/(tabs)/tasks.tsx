import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../../src/contexts/TasksContext';
import { TaskRow } from '../../../src/components/TaskRow';

export default function TasksScreen() {
  const { openTasks, doneTasks, loading, toggleTask } = useTasks();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const empty = openTasks.length === 0 && doneTasks.length === 0;

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-5 pb-24 pt-2">
        {empty ? (
          <View className="mt-20 items-center px-6">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-light">
              <Ionicons name="list-outline" size={28} color="#7C3AED" />
            </View>
            <Text className="mb-1 font-semibold text-lg text-ink">All tasks</Text>
            <Text className="mb-6 text-center font-sans text-sm text-ink-muted">
              Your family’s shared to-do list will show up here.
            </Text>
            <TouchableOpacity
              className="rounded-full bg-primary px-6 py-3"
              onPress={() => router.push('/(app)/add-task')}
            >
              <Text className="font-semibold text-sm text-white">Add task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {openTasks.length > 0 && (
              <>
                <Text className="mb-2 font-semibold text-sm text-ink-muted">
                  OPEN · {openTasks.length}
                </Text>
                {openTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={(c) => toggleTask(task.id, c)}
                  />
                ))}
              </>
            )}
            {doneTasks.length > 0 && (
              <>
                <Text className="mb-2 mt-4 font-semibold text-sm text-ink-muted">
                  DONE · {doneTasks.length}
                </Text>
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={(c) => toggleTask(task.id, c)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}