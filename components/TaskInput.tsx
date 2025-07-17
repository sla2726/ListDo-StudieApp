import { Shredder } from 'lucide-react-native';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';

interface TaskInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  dialogVisible: boolean;
  setDialogVisible: (arg: boolean) => void;
  onConfirmDelete: () => void;
}

export default function TaskInput({
  value,
  onChangeText,
  onSubmit,
  dialogVisible,
  setDialogVisible,
  onConfirmDelete,
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
          onPress={() => setDialogVisible(true)}
          className="ml-2 h-12 w-12 items-center justify-center rounded-full bg-red-500">
          <Shredder color="white" />
        </TouchableOpacity>
      </View>

      {value.length >= 20 && (
        <Text className="text-center text-sm text-red-500">Limite de caracteres atingido!</Text>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Apagar todas as tarefas?</Dialog.Title>
          <Dialog.Content>
            <Text>Essa ação não poderá ser desfeita.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={onConfirmDelete} textColor="red">
              Apagar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
                                                                                                                                                                                                                                                                