import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../themes/theme";

type Option = { id: string; name: string };

export type CompleteArrayInputPropsType = {
  name?: string;
  title?: string;
  values: string[];
  setValues: React.Dispatch<React.SetStateAction<string[]>>;
  fetchOptions: (query: string) => Promise<Option[]>;
  createOption?: (name: string) => Promise<Option>;
  hydrateSelected?: (ids: string[]) => Promise<Option[]>;
  placeholder?: string;
  onError?: (err: unknown) => void;
};

export const CompleteArrayInput = forwardRef<
  TextInput,
  CompleteArrayInputPropsType
>(
  (
    {
      title,
      values,
      setValues,
      createOption,
      hydrateSelected,
      placeholder = "추가하기",
      onError,
    },
    ref,
  ) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedMap, setSelectedMap] = useState<Map<string, Option>>(
      () => new Map(),
    );

    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          if (!hydrateSelected) return;

          const hydrated = await hydrateSelected(values);
          if (cancelled) return;

          const next = new Map<string, Option>();
          hydrated.forEach((item) => next.set(item.id, item));
          setSelectedMap(next);
        } catch (err) {
          onError?.(err);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [values, hydrateSelected, onError]);

    const selectedItems = useMemo(
      () =>
        values.map((id) => ({
          id,
          label: selectedMap.get(id)?.name ?? id,
        })),
      [values, selectedMap],
    );

    const removeId = useCallback(
      (id: string) => {
        setValues((prev) => prev.filter((x) => x !== id));
      },
      [setValues],
    );

    const handleAdd = useCallback(async () => {
      const name = input.trim();
      if (!name) return;

      try {
        setLoading(true);

        if (createOption) {
          const created = await createOption(name);

          setValues((prev) =>
            prev.includes(created.id) ? prev : [...prev, created.id],
          );

          setSelectedMap((prev) => {
            const next = new Map(prev);
            next.set(created.id, created);
            return next;
          });
        } else {
          setValues((prev) => (prev.includes(name) ? prev : [...prev, name]));

          setSelectedMap((prev) => {
            const next = new Map(prev);
            next.set(name, { id: name, name });
            return next;
          });
        }

        setInput("");
      } catch (err) {
        onError?.(err);
      } finally {
        setLoading(false);
      }
    }, [input, createOption, setValues, onError]);

    return (
      <View style={styles.wrapper}>
        {title ? <Text style={styles.label}>{title}</Text> : null}

        <Pressable style={styles.field} onPress={() => setModalVisible(true)}>
          <View style={styles.fieldTextBox}>
            <Text style={styles.fieldTitle}>
              {selectedItems.length > 0
                ? `${selectedItems.length}개 선택됨`
                : placeholder}
            </Text>

            {selectedItems.length > 0 ? (
              <Text numberOfLines={1} style={styles.previewText}>
                {selectedItems.map((item) => item.label).join(", ")}
              </Text>
            ) : (
              <Text style={styles.previewText}>눌러서 입력</Text>
            )}
          </View>

          <Text style={styles.plusText}>＋</Text>
        </Pressable>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalDim}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title ?? "항목 입력"}</Text>

                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  ref={ref}
                  value={input}
                  onChangeText={setInput}
                  placeholder={placeholder}
                  placeholderTextColor={colors.text + "80"}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                />

                <Pressable
                  style={[
                    styles.addButton,
                    !input.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={handleAdd}
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.addText}>추가</Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.modalContent}>
                {selectedItems.length > 0 ? (
                  <View style={styles.tags}>
                    {selectedItems.map((item) => (
                      <View key={item.id} style={styles.tag}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.tagText}
                        >
                          {item.label}
                        </Text>

                        <Pressable onPress={() => removeId(item.id)}>
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      아직 추가된 항목이 없습니다.
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneText}>완료</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldTextBox: {
    flex: 1,
    marginRight: 12,
  },
  fieldTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  previewText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  plusText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "600",
  },
  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    maxHeight: "80%",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.text,
  },
  addButton: {
    minWidth: 64,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addText: {
    color: "white",
    fontWeight: "700",
  },
  modalContent: {
    minHeight: 120,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6B7280",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "100%",
  },
  tagText: {
    color: "white",
    flexShrink: 1,
  },
  removeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyBox: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.text,
    opacity: 0.5,
  },
  doneButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
