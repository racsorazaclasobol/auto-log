import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Datos de ejemplo (luego se reemplazan por SQLite)
const mockVehicles = [
  { id: '1', name: 'Toyota Corolla', plate: 'ABCD12', mileage: 45200, make: 'Toyota', model: 'Corolla', year: 2020 },
  { id: '2', name: 'Honda CR-V', plate: 'EFGH34', mileage: 28700, make: 'Honda', model: 'CR-V', year: 2022 },
];

function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Vehículos</Text>
      <FlatList
        data={mockVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
          >
            <Text style={styles.vehicleName}>{item.name}</Text>
            <Text style={styles.plate}>{item.plate}</Text>
            <Text style={styles.mileage}>{item.mileage.toLocaleString()} km</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Agregar Vehículo</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

function VehicleDetailScreen({ route }: any) {
  const { vehicle } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{vehicle.name}</Text>
      <Text style={styles.subtitle}>{vehicle.make} {vehicle.model} · {vehicle.year}</Text>
      <Text style={styles.mileage}>Kilometraje: {vehicle.mileage.toLocaleString()} km</Text>
      <Text style={styles.section}>Historial de mantenciones</Text>
      <Text style={styles.empty}>Aún no hay registros</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Registrar Mantención</Text>
      </TouchableOpacity>
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
  empty: { color: '#999', fontStyle: 'italic' },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
