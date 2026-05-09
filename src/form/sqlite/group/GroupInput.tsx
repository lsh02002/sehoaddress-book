import React, { useMemo, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSQLiteContext } from "expo-sqlite";

import TextInput from "../../input/TextInput";
import SelectInput, { Option } from "../../input/SelectInput";

import { GroupRepository } from "../../../repositories/group/GroupRepository";

type Props = {
  contactId?: number;
  onSaved?: () => void;
};

const GroupInput = ({ contactId, onSaved }: Props) => {
  const db = useSQLiteContext();

  const groupRepository = useMemo(() => new GroupRepository(db), [db]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [loading, setLoading] = useState(false);

  const colorOptions: Option[] = [
    { label: "blue", value: "#2563EB" },
    { label: "red", value: "#DC2626" },
    { label: "green", value: "#059669" },
    { label: "purple", value: "#7C3AED" },
    { label: "orange", value: "#EA580C" },
    { label: "gray", value: "#6B7280" },
  ];

  const onSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("그룹명을 입력하세요.");
        return;
      }

      setLoading(true);

      if (contactId) {
        await groupRepository.createAndAddToContact(contactId, {
          name,
          description,
          color,
        });
      } else {
        await groupRepository.create({
          name,
          description,
          color,
        });
      }

      Alert.alert("저장 완료", "그룹이 저장되었습니다.");

      setName("");
      setDescription("");
      setColor("#2563EB");

      onSaved?.();
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "그룹 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TextInput
        name="groupName"
        title="그룹명"
        data={name}
        setData={setName}
      />

      <TextInput
        name="description"
        title="설명"
        data={description}
        setData={setDescription}
      />

      <SelectInput
        name="groupColor"
        title="그룹색상"
        value={color}
        setValue={setColor}
        options={colorOptions}
      />

      <View style={[styles.preview, { backgroundColor: color }]}>
        <Text style={styles.previewText}>{name || "GROUP"}</Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={onSave}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "저장중..." : "저장"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GroupInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 32,
  },

  preview: {
    marginTop: 24,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },

  previewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 24,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
