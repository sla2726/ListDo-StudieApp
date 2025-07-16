import { Shredder } from 'lucide-react-native';
import { TextInput, TouchableOpacity, View, Text, Pressable } from 'react-native';

interface TaskInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isConfirm: boolean;
  setIsConfirm: (arg: boolean) => void;
  onDeleteAll: () => void;
}

export default function TaskInput({
  value,
  onChangeText,
  onSubmit,
  isConfirm,
  setIsConfirm,
  onDeleteAll,
}: TaskInputProps) {
  return (
    <View className="px-5 pb-5">
      <View className="w-full flex-row items-center">
        <TextInput
          className="mr-3 flex-1 rounded-xl border border-gray-700 bg-gray-800 p-4 text-base text-white"
          placeholder="Digite uma nova tarefa..."
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          maxLength={20}
        />

        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-blue-500"
          onPress={onSubmit}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDeleteAll}
          className="ml-2 h-12 w-12 items-center justify-center rounded-full bg-red-500">
          <Shredder color="white" />
        </TouchableOpacity>
      </View>
      {value.length >= 20 && (
        <Text className="text-center text-sm text-red-500">Limite de caracteres atingido!</Text>
      )}
    </View>
  );
}
