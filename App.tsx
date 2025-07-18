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
import { Moon, Sun } from 'lucide-react-native';

// Tipos
interface Task {
  id: string;
  date: string;
  description: string;
  check: boolean;
  notificationId: string;
}

export default function App() {
  // Notificação
  Notifications.setNotificationHandler({
    // @ts-ignore
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
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

  // Data da Tarefa
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      const currentDate = selectedDate;

      if (mode === 'date') {
        setDate(currentDate);
        setMode('time');
        setShowPicker(true);
      } else {
        setShowPicker(false);
        setMode('date');

        setDate(currentDate);
        handleAddTask(currentDate);
      }
    } else {
      setShowPicker(false);
      setMode('date');
    }
  };

  // Adicionar tarefa
  const handleAddTask = async (customDate?: Date) => {
    if (!newTask.trim()) return;

    const taskDate = customDate ?? date;
    const now = new Date();

    if (taskDate.getTime() - now.getTime() <= 5000) {
      Toast.show({
        type: 'error',
        text1: 'Data inválida!',
        text2: 'A data e hora precisam ser pelo menos 5 segundos no futuro.',
      });
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete!',
        body: newTask,
        sound: 'default',
      },
      // @ts-ignore
      trigger: taskDate,
    });

    const declaredTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: date.toLocaleString('pt-BR'),
      description: newTask,
      check: false,
      notificationId,
    };

    setTasks((prev) => [...prev, declaredTask]);
    setNewTask('');

    Toast.show({
      type: 'success',
      text1: 'Tarefa adicionada',
      text2: 'Sua tarefa foi salva com sucesso.',

      visibilityTime: 2500,
    });
  };
  // Apagar tudo
  const handleConfirmDelete = async () => {
    setTasks([]);
    await AsyncStorage.removeItem('tasks');
    await Notifications.cancelAllScheduledNotificationsAsync();
    setDialogVisible(false);
  };

  // Apagar tarefa individual
  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id);
    if (taskToDelete?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
    }

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
          <Text>Tema {theme === 'light' ? <Moon /> : <Sun />}</Text>
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
              setOnDateVisible={setShowPicker}
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
      {showPicker && (
        <DateTimePicker value={date} mode={mode} display="default" onChange={handleDateChange} />
      )}
      ;
    </>
  );
}