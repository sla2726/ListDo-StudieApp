import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme as useNativeWindScheme } from 'nativewind';
import { Dialog, Portal, Button, PaperProvider } from 'react-native-paper';
import './global.css';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import TaskInput from './components/TaskInput';
import TaskList from 'components/TaskList';
import Toast from 'react-native-toast-message';

interface Task {
  id: string;
  date: string;
  description: string;
  check: boolean;
}
export default function App() {
  const [dialogVisible, setDialogVisible] = useState(false);

  // Fontes
  const [fontsLoaded] = useFonts({
    OswaldRegular: require('./assets/fonts/Oswald-Regular.ttf'),
    OswaldBold: require('./assets/fonts/Oswald-Bold.ttf'),
  });

  // Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Salvamento
  const saveTasks = async (tasks: Task[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  };
  const loadTasks = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) setTasks(JSON.parse(data));
  };

  // Tema
  const deviceTheme = useDeviceColorScheme(); // Tema do sistema
  const { setColorScheme } = useNativeWindScheme(); // Preparação na mudança de tema no Nativewind

  const [theme, setTheme] = useState<'light' | 'dark'>(deviceTheme || 'light');

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  if (!fontsLoaded) return null;

  // Handlers
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const declaredTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleString('pt-BR'),
      description: newTask,
      check: false,
    };

    setTasks([...tasks, declaredTask]);
    setNewTask('');

    Toast.show({
      type: 'success',
      text1: 'Tarefa adicionada',
      text2: 'Sua tarefa foi salva com sucesso.',
      position: 'bottom',
      visibilityTime: 2500,
    });
  };

  const handleConfirmDelete = async () => {
    setTasks([]);
    await AsyncStorage.removeItem('tasks');
    setDialogVisible(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, check: !task.check } : task))
    );
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // TSX
  return (
    <>
      <View className="flex h-20 w-full items-center justify-center bg-slate-800">
        <Text className="text-2xl font-extrabold uppercase">Lista de Tarefas</Text>
        <TouchableOpacity onPress={handleToggleTheme} className="rounded-full">
          <Text>Trocar de Tema</Text>
        </TouchableOpacity>
      </View>

      <PaperProvider>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-slate-300 dark:bg-slate-600"
          contentContainerStyle={{ padding: 20, paddingBottom: 0 }}>
          <View className="flex-1 items-center gap-2 p-5 font-semibold">
            {/* Pesquisa + Adição de Tarefas */}
            <TaskInput
              value={newTask}
              onChangeText={setNewTask}
              onSubmit={handleAddTask}
              dialogVisible={dialogVisible}
              setDialogVisible={setDialogVisible}
              onConfirmDelete={handleConfirmDelete}
            />
            {/* Tarefas */}
            <TaskList
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </View>
        </ScrollView>
      </PaperProvider>
      <Toast />
    </>
  );
}
