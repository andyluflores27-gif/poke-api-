import { useAudioPlayer } from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File, Paths } from 'expo-file-system'; // <-- Nueva importación
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [pokemon, setPokemon] = useState<any[]>([]);
  const player = useAudioPlayer();

  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0') 
      .then(res => res.json())
      .then(async (data) => {
        const detalles = await Promise.all(
          data.results.map((p: any) => fetch(p.url).then(r => r.json()))
        );
        setPokemon(detalles);
      })
      .catch(() => alert("No se pudieron cargar los Pokémon. Revisa tu internet."));
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  function playCry(id: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    player.replace(cryUrl);
    player.play();
  }

  const tomarFoto = async () => {
  if (cameraRef.current && permission?.granted) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const photo = await cameraRef.current.takePictureAsync();
    if (photo) {
      try {
        
        const sourceFile = new File(photo.uri);
        
       
        const newFile = new File(Paths.document, `pokemon_${Date.now()}.jpg`);
        
        
        await sourceFile.copy(newFile);
        
        alert('¡Foto guardada en el dispositivo!');
        console.log('Foto guardada en:', newFile.uri);
      } catch (error) {
        alert('Error al guardar la foto');
        console.error(error);
      }
      setMostrarCamara(false);
    }
  }
};

  if (mostrarCamara) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={{ color: '#fff', marginBottom: 20 }}>Necesitamos permiso para la cámara</Text>
          <Button title="Dar permiso" onPress={requestPermission} />
          <Button title="Volver" color="red" onPress={() => setMostrarCamara(false)} />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} ref={cameraRef} />
        <View style={{ position: 'absolute', bottom: 40, width: '100%', padding: 20, gap: 10 }}>
          <Button title="📸 Tomar Foto y Vibrar" onPress={tomarFoto} />
          <Button title="Cancelar" color="red" onPress={() => setMostrarCamara(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: 50, flex: 1 }}>
      <View style={{ padding: 10 }}>
        <Button title="📸 Abrir Cámara" onPress={() => setMostrarCamara(true)} />
      </View>

      <FlatList
        data={pokemon}
        renderItem={({ item }) => {
          const id: number = item.id;
          const imageUrl: string = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
          const tipos: string = item.types.map((t: any) => t.type.name).join(', ');

          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Image source={{ uri: imageUrl }} style={{ width: 50, height: 50 }} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 18, textTransform: 'capitalize' }}>{item.name}</Text>
                <Text>Tipo: {tipos}</Text>
                <Text>Altura: {item.height / 10} m</Text>
                <Text>Peso: {item.weight / 10} kg</Text>
              </View>
              <Button title="Cantar" onPress={() => playCry(id)} />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#000',
  },
});