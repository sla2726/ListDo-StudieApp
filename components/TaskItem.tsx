import { Trash2, CheckCheck } from 'lucide-react-native';
import { Pressable, View, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface Task {
  id: string;
  date: string;
  description: string;
  check: boolean;
}
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <Animatable.View key={task.id} animation="fadeIn" duration={400}>
      <Animatable.View
        key={task.id + task.check}
        animation={task.check ? 'rubberBand' : undefined}
        duration={400}>
        <Pressable
          onPress={() => onToggle(task.id)}
          className={`flex-row items-center justify-between rounded-lg border-l-4 ${task.check ? 'border-green-700' : 'border-red-500'} p-4 shadow active:opacity-70 ${task.check ? 'bg-green-400' : 'bg-slate-700'}`}>
          <View className="flex-row items-center">
            {task.check && (
              <Text className="mr-2">
                <CheckCheck color="green" />
              </Text>
            )}
            <Text className={`${task.check ? 'line-through' : ''} text-base text-white`}>
              {task.description}
            </Text>
          </View>

          <Text className={`mt-1 text-sm ${task.check ? 'text-slate-500' : 'text-slate-300'}`}>
            {task.date}
          </Text>

          <Pressable onPress={() => onDelete(task.id)} className="px-2 py-1 active:scale-125">
            <Trash2 color="red" />
          </Pressable>
        </Pressable>
      </Animatable.View>
    </Animatable.View>
  );
}
