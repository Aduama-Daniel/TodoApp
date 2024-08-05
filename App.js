import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim().length > 0) {
      setTasks([...tasks, { id: Math.random().toString(), value: task, priority: 'medium', completed: false }]);
      setTask('');
    }
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const editTask = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const updateTask = () => {
    setTasks(tasks.map((t) => (t.id === editingTask.id ? editingTask : t)));
    setModalVisible(false);
  };

  const toggleComplete = (taskId) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return task.priority === filter;
  });

  const renderTask = ({ item }) => (
    <View style={[styles.task, { opacity: item.completed ? 0.5 : 1 }]}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <Text style={[styles.taskText, item.completed && styles.completedTask]}>{item.value}</Text>
      </TouchableOpacity>
      <View style={styles.taskActions}>
        <Text style={[styles.priority, { color: getPriorityColor(item.priority) }]}>
          {item.priority}
        </Text>
        <TouchableOpacity onPress={() => editTask(item)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeTask(item.id)}>
          <Text style={styles.deleteButton}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced Todo App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setTask}
          value={task}
          placeholder="Enter a task"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filter}
          style={styles.filterPicker}
          onValueChange={(itemValue) => setFilter(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Active" value="active" />
          <Picker.Item label="Completed" value="completed" />
          <Picker.Item label="High Priority" value="high" />
          <Picker.Item label="Medium Priority" value="medium" />
          <Picker.Item label="Low Priority" value="low" />
        </Picker>
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
      />
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={editingTask?.value}
              onChangeText={(text) => setEditingTask({ ...editingTask, value: text })}
            />
            <Picker
              selectedValue={editingTask?.priority}
              style={styles.priorityPicker}
              onValueChange={(itemValue) =>
                setEditingTask({ ...editingTask, priority: itemValue })
              }
            >
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Low" value="low" />
            </Picker>
            <TouchableOpacity style={styles.updateButton} onPress={updateTask}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'black';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingTop: 50,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#5cb85c',
    padding: 10,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priority: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
    fontSize: 18,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterPicker: {
    height: 50,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 18,
    marginBottom: 10,
  },
  priorityPicker: {
    height: 50,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#5cb85c',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
});