import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useFamily } from "../../../src/contexts/FamilyContext";
import { useTasks } from "../../../src/contexts/TasksContext";
import { TaskRow } from "../../../src/components/TaskRow";

export default function HomeScreen() {
  const { user } = useAuth();
  const { currentFamily, isAdmin } = useFamily();

  const firstName = user?.displayName?.split(" ")[0] || "there";

  const { openTasks, doneTasks, tasks, toggleTask, loading } = useTasks();

  const completed = doneTasks.length;
  const total = tasks.length;
  const remaining = openTasks.length;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 8,
      }}
    >
      {/* Greeting */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-medium text-sm text-ink-muted">
            {currentFamily?.name || "Your family"}
          </Text>
          <Text className="mt-1 font-bold text-2xl text-ink">
            Good day, {firstName}
          </Text>
        </View>
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
          onPress={() => router.push("/(app)/settings")}
          activeOpacity={0.85}
        >
          <Text className="font-bold text-base text-white">
            {(user?.displayName || "F").charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- Admin: Manage Family ---------- */}
      {isAdmin && (
        <TouchableOpacity
          className="mb-6 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-sm"
          onPress={() => router.push("/(app)/manage-family")}
          activeOpacity={0.85}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
            <Ionicons name="people-outline" size={20} color="#7C3AED" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-ink">
              Manage family
            </Text>
            <Text className="font-sans text-sm text-ink-muted">
              Members, roles & invite codes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      {/* Progress card */}
      <View className="mb-6 overflow-hidden rounded-3xl bg-primary p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-medium text-sm text-white/80">
            Today’s progress
          </Text>
          <View className="rounded-full bg-white/20 px-3 py-1">
            <Text className="font-medium text-xs text-white">Family tasks</Text>
          </View>
        </View>

        <Text className="font-bold text-4xl text-white">
          {completed}/{total || "—"}
        </Text>
        <Text className="mt-1 font-medium text-sm text-white/80">
          Tasks complete
        </Text>

        <TouchableOpacity
          className="mt-5 items-center rounded-full bg-white/15 py-3"
          onPress={() => router.push("/(app)/add-task")}
          activeOpacity={0.85}
        >
          <Text className="font-semibold text-base text-white">Add a task</Text>
        </TouchableOpacity>
      </View>

      {/* Hit list */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-semibold text-lg text-ink">Today’s hit list</Text>
        <Text className="font-medium text-sm text-ink-muted">
          {String(remaining).padStart(2, "0")} remaining
        </Text>
      </View>

      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : openTasks.length === 0 && doneTasks.length === 0 ? (
        <View className="items-center rounded-3xl bg-white px-6 py-10 shadow-sm">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <Ionicons name="checkbox-outline" size={28} color="#7C3AED" />
          </View>
          <Text className="mb-1 text-center font-semibold text-base text-ink">
            No tasks yet
          </Text>
          <Text className="mb-5 text-center font-sans text-sm text-ink-muted">
            Add shared to-dos for your family. Anyone can check them off when
            done.
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-3"
            onPress={() => router.push("/(app)/add-task")}
            activeOpacity={0.85}
          >
            <Text className="font-semibold text-sm text-white">
              Create first task
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {openTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={(completed) => toggleTask(task.id, completed)}
            />
          ))}
          {doneTasks.slice(0, 5).map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={(completed) => toggleTask(task.id, completed)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
