import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import { ContactRepository } from "../repositories/ContactRepository";
import { Contact } from "../domain/Contact";
import { RootStackParamList } from "../../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContactListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();

  const repository = new ContactRepository(db);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [keyword, setKeyword] = useState("");

  const loadContacts = async () => {
    const data = await repository.findAll(keyword);
    setContacts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [keyword]),
  );

  const onDelete = (id: number) => {
    Alert.alert("삭제", "연락처를 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await repository.delete(id);
          loadContacts();
        },
      },
    ]);
  };

  const onToggleFavorite = async (contact: Contact) => {
    await repository.toggleFavorite(contact.id, !contact.isFavorite);
    loadContacts();
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const phoneText = item.phones
      .map((phone) => phone.phoneNumber)
      .filter(Boolean)
      .join(", ");

    const emailText = item.emails
      .map((email) => email.emailAddress)
      .filter(Boolean)
      .join(", ");

    const addressText = item.addresses
      .map((address) => address.addressLine1)
      .filter(Boolean)
      .join(", ");

    return (
      <>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ContactForm", { id: item.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity onPress={() => onToggleFavorite(item)}>
              <Text style={styles.favorite}>{item.isFavorite ? "★" : "☆"}</Text>
            </TouchableOpacity>
          </View>

          {!!phoneText && <Text style={styles.text}>{phoneText}</Text>}

          {!!emailText && <Text style={styles.text}>{emailText}</Text>}

          {!!addressText && <Text style={styles.text}>{addressText}</Text>}

          {item.tags.length > 0 && (
            <Text style={styles.memo}>#{item.tags.join(" #")}</Text>
          )}

          {item.groups.length > 0 && (
            <Text style={styles.memo}>그룹: {item.groups.join(", ")}</Text>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="검색"
        value={keyword}
        onChangeText={setKeyword}
        style={styles.searchInput}
      />

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("ContactForm")}
      >
        <Text style={styles.floatingButtonText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 100,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
  },

  favorite: {
    fontSize: 24,
  },

  menuText: {
    fontSize: 16,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    margin: 8,
  },

  text: {
    marginTop: 8,
    fontSize: 16,
  },

  memo: {
    marginTop: 8,
    color: "#666",
  },

  deleteButton: {
    marginTop: 16,
    alignSelf: "flex-end",
  },

  deleteButtonText: {
    color: "red",
    fontWeight: "700",
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  floatingButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
});
