import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Task } from "../types";

const priorityStyle: Record<string, { bg: string; label: string }> = {
  high: { bg: "#EF4444", label: "HIGH" },
  med: { bg: "#F59E0B", label: "MED" },
  low: { bg: "#22C55E", label: "LOW" },
};

type Props = {
  task: Task;
  onToggle: (completed: boolean) => void;
};

export function TaskRow({ task, onToggle }: Props) {
  const done = task.status === "done";
  const title = task.title ?? "";
  const notes = task.notes ?? "";
  const priority = task.priority ?? "med";
  const chip = priorityStyle[priority] ?? priorityStyle.med;

  return (
    <Pressable
      onPress={() => onToggle(!done)}
      className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-3.5"
    >
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={done ? "#7C3AED" : "#D1D5DB"}
      />
      <View className="ml-3 flex-1">
        <Text
          className={`font-medium text-base ${done ? "text-ink-muted" : "text-ink"}`}
          style={done ? { textDecorationLine: "line-through" } : undefined}
        >
          {title}
        </Text>
        {task.notes ? (
          <Text
            className="mt-0.5 font-sans text-sm text-ink-muted"
            numberOfLines={1}
          >
            {task.notes}
          </Text>
        ) : null}
      </View>
      {done ? (
        <View className="rounded-full bg-gray-100 px-2.5 py-1">
          <Text className="font-semibold text-xs text-ink-muted">DONE</Text>
        </View>
      ) : (
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: chip.bg }}
        >
          <Text className="font-semibold text-xs text-white">{chip.label}</Text>
        </View>
      )}
    </Pressable>
  );
}
