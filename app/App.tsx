import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ScrollView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const STORAGE_KEY = '@auto_log_vehicles';

function HomeScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', plate: '', make: '', model: '', year: '', mileage: '' });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setVehicles(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  const saveVehicles = async (list: any[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setVehicles(list);
  };

  const addVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate) {
      Alert.alert('Error', 'Nombre y patente son obligatorios');
      return;
    }
    const vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      year: parseInt(newVehicle.year) || 2020,
      mileage: parseInt(newVehicle.mileage) || 0,
      maintenances: [],
    };
    const updated = [...vehicles, vehicle];
    await saveVehicles(updated);
    setNewVehicle({ name: '', plate: '', make: '', model: '', year: '', mileage: '' });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Vehículos</Text>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No hay vehículos. Agrega el primero.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetail', { vehicle: item, onUpdate: loadVehicles })}
          >
            <Text style={styles.vehicleName}>{item.name}</Text>
            <Text style={styles.plate}>{item.plate}</Text>
            <Text style={styles.mileage}>{item.mileage?.toLocaleString() || 0} km</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Agregar Vehículo</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>Nuevo Vehículo</Text>
          <TextInput style={styles.input} placeholder="Nombre (ej: Mi Toyota)" value={newVehicle.name} onChangeText={(t) => setNewVehicle({ ...newVehicle, name: t })} />
          <TextInput style={styles.input} placeholder="Patente" value={newVehicle.plate} onChangeText={(t) => setNewVehicle({ ...newVehicle, plate: t })} />
          <TextInput style={styles.input} placeholder="Marca" value={newVehicle.make} onChangeText={(t) => setNewVehicle({ ...newVehicle, make: t })} />
          <TextInput style={styles.input} placeholder="Modelo" value={newVehicle.model} onChangeText={(t) => setNewVehicle({ ...newVehicle, model: t })} />
          <TextInput style={styles.input} placeholder="Año" keyboardType="numeric" value={newVehicle.year} onChangeText={(t) => setNewVehicle({ ...newVehicle, year: t })} />
          <TextInput style={styles.input} placeholder="Kilometraje actual" keyboardType="numeric" value={newVehicle.mileage} onChangeText={(t) => setNewVehicle({ ...newVehicle, mileage: t })} />
          <TouchableOpacity style={styles.addButton} onPress={addVehicle}>
            <Text style={styles.addButtonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#999' }]} onPress={() => setModalVisible(false)}>
            <Text style={styles.addButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
}

function VehicleDetailScreen({ route, navigation }: any) {
  const { vehicle: initialVehicle, onUpdate } = route.params;
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMaint, setNewMaint] = useState({ type: '', date: '', mileage: '', description: '' });

  const addMaintenance = async () => {
    if (!newMaint.type || !newMaint.date) {
      Alert.alert('Error', 'Tipo y fecha son obligatorios');
      return;
    }
    const maint = { id: Date.now().toString(), ...newMaint, mileage: parseInt(newMaint.mileage) || vehicle.mileage };
    const updatedVehicle = {
      ...vehicle,
      maintenances: [...(vehicle.maintenances || []), maint],
      mileage: Math.max(vehicle.mileage, maint.mileage),
    };
    setVehicle(updatedVehicle);

    // Update in storage
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let vehicles = data ? JSON.parse(data) : [];
      vehicles = vehicles.map((v: any) => v.id === vehicle.id ? updatedVehicle : v);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
    }
    setNewMaint({ type: '', date: '', mileage: '', description: '' });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{vehicle.name}</Text>
      <Text style={styles.subtitle}>{vehicle.make} {vehicle.model} · {vehicle.year}</Text>
      <Text style={styles.mileage}>Kilometraje: {vehicle.mileage?.toLocaleString() || 0} km</Text>
      <Text style={styles.section}>Historial de mantenciones</Text>
      <FlatList
        data={vehicle.maintenances || []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay registros</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.vehicleName}>{item.type}</Text>
            <Text>{item.date} · {item.mileage} km</Text>
            <Text style={{ color: '#555', marginTop: 4 }}>{item.description}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Registrar Mantención</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>Nueva Mantención</Text>
          <TextInput style={styles.input} placeholder="Tipo (aceite, filtros, frenos...)" value={newMaint.type} onChangeText={(t) => setNewMaint({ ...newMaint, type: t })} />
          <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={newMaint.date} onChangeText={(t) => setNewMaint({ ...newMaint, date: t })} />
          <TextInput style={styles.input} placeholder="Kilometraje" keyboardType="numeric" value={newMaint.mileage} onChangeText={(t) => setNewMaint({ ...newMaint, mileage: t })} />
          <TextInput style={styles.input} placeholder="Descripción" multiline value={newMaint.description} onChangeText={(t) => setNewMaint({ ...newMaint, description: t })} />
          <TouchableOpacity style={styles.addButton} onPress={addMaintenance}>
            <Text style={styles.addButtonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#999' }]} onPress={() => setModalVisible(false)}>
            <Text style={styles.addButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Auto-Log' }} />
        <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Detalle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#111' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 4 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleName: { fontSize: 18, fontWeight: '600' },
  plate: { color: '#666', marginTop: 2 },
  mileage: { fontSize: 16, color: '#007AFF', marginTop: 6, fontWeight: '500' },
  empty: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modal: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});
