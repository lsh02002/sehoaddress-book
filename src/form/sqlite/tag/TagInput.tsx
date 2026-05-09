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

import { TagRepository } from "../../../repositories/tag/TagRepository";

type Props = {
  contactId?: number;
  onSaved?: () => void;
};

const TagInput = ({ contactId, onSaved }: Props) => {
  const db = useSQLiteContext();

  const tagRepository = useMemo(() => new TagRepository(db), [db]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);

  const colorOptions: Option[] = [
    { label: "blue", value: "#3B82F6" },
    { label: "red", value: "#EF4444" },
    { label: "green", value: "#10B981" },
    { label: "purple", value: "#8B5CF6" },
    { label: "orange", value: "#F97316" },
    { label: "gray", value: "#6B7280" },
  ];

  const onSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("태그명을 입력하세요.");
        return;
      }

      setLoading(true);

      if (contactId) {
        await tagRepository.createAndAddToContact(contactId, {
          name,
          color,
        });
      } else {
        await tagRepository.create({
          name,
          color,
        });
      }

      Alert.alert("저장 완료", "태그가 저장되었습니다.");

      setName("");
      setColor("#3B82F6");

      onSaved?.();
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "태그 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TextInput name="tagName" title="태그명" data={name} setData={setName} />

      <SelectInput
        name="tagColor"
        title="태그색상"
        value={color}
        setValue={setColor}
        options={colorOptions}
      />

      <View style={[styles.preview, { backgroundColor: color }]}>
        <Text style={styles.previewText}>#{name || "preview"}</Text>
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

export default TagInput;

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
