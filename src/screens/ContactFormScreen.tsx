import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import { RootStackParamList } from "../../App";
import { ContactRepository } from "../repositories/ContactRepository";

type RouteProps = RouteProp<RootStackParamList, "ContactForm">;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContactFormScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const db = useSQLiteContext();
  const repository = new ContactRepository(db);

  const contactId = route.params?.id;

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState("");
  const [groups, setGroups] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    if (!contactId) return;

    const contact = await repository.findById(contactId);

    if (!contact) return;

    setName(contact.name);
    setNickname(contact.nickname || "");
    setPhone(contact.phones[0]?.phoneNumber || "");
    setEmail(contact.emails[0]?.emailAddress || "");
    setAddress(contact.addresses[0]?.addressLine1 || "");
    setTags(contact.tags.join(", "));
    setGroups(contact.groups.join(", "));
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("이름을 입력하세요.");
      return;
    }

    const payload = {
      name,
      nickname,
      memo,
      phone,
      email,
      address,
      tags: tags
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      groups: groups
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };

    if (contactId) {
      await repository.update(contactId, payload);
    } else {
      await repository.create(payload);
    }

    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <Text style={styles.label}>이름</Text>
      <TextInput
        placeholder="이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>닉네임</Text>
      <TextInput
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />

      <Text style={styles.label}>전화번호</Text>
      <TextInput
        placeholder="전화번호"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>이메일</Text>
      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>메모</Text>
      <TextInput
        placeholder="메모"
        value={memo}
        onChangeText={setMemo}
        multiline
        style={[styles.input, styles.memoInput]}
      />

      <Text style={styles.label}>주소</Text>
      <TextInput
        placeholder="주소"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <Text style={styles.label}>태그</Text>
      <TextInput
        placeholder="태그 예: 친구, 회사, 가족"
        value={tags}
        onChangeText={setTags}
        style={styles.input}
      />

      <Text style={styles.label}>그룹</Text>
      <TextInput
        placeholder="그룹 예: 동창, 거래처"
        value={groups}
        onChangeText={setGroups}
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 32,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },

  memoInput: {
    height: 140,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
