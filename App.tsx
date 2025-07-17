import { ScrollView, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme as useNativeWindScheme } from 'nativewind';
import { PaperProvider } from 'react-native-paper';
import './global.css';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import TaskInput from './components/TaskInput';
import TaskList from 'components/TaskList';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// Tipos
interface Task {
  id: string;
  date: string;
  description: string;
  check: boolean;
}

export default function App() {
  // Notificação
  Notifications.setNotificationHandler({
    // @ts-ignore
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para notificações negada!');
      }
    };

    requestPermission();
  }, []);

  // Fontes
  const [fontsLoaded] = useFonts({
    OswaldRegular: require('./assets/fonts/Oswald-Regular.ttf'),
    OswaldBold: require('./assets/fonts/Oswald-Bold.ttf'),
  });

  // Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Visibilidade do diálogo de confirmação
  const [dialogVisible, setDialogVisible] = useState(false);

  // Tema
  const deviceTheme = useDeviceColorScheme();
  const { setColorScheme } = useNativeWindScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(deviceTheme || 'light');

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Carregar e salvar tarefas
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const saveTasks = async (tasks: Task[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) setTasks(JSON.parse(data));
  };

  // Adicionar tarefa
  const handleAddTask = async () => {
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

    await handleNotificationSaved();
  };

  // Notificação
  const handleNotificationSaved = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete',
        body: 'Você tem uma tarefa importante!',
        sound: 'default',
      },
      // @ts-ignore
      trigger: {
        seconds: 5,
        repeats: false,
      },
    });
  };

  // Apagar tudo
  const handleConfirmDelete = async () => {
    setTasks([]);
    await AsyncStorage.removeItem('tasks');
    setDialogVisible(false);
  };

  // Apagar tarefa individual
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Marcar tarefa como feita
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, check: !task.check } : task))
    );
  };

  // Espera fontes carregarem
  if (!fontsLoaded) return null;

  // Interface
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
            <TaskInput
              value={newTask}
              onChangeText={setNewTask}
              onSubmit={handleAddTask}
              dialogVisible={dialogVisible}
              setDialogVisible={setDialogVisible}
              onConfirmDelete={handleConfirmDelete}
            />
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