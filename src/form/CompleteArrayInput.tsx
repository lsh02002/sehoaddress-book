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
      if (!name || loading) return;

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
    }, [input, loading, createOption, setValues, onError]);

    return (
      <View style={styles.wrapper}>
        {title ? <Text style={styles.label}>{title}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.field, pressed && styles.pressed]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.fieldTextBox}>
            <Text style={styles.fieldTitle}>
              {selectedItems.length > 0
                ? `${selectedItems.length}개 선택됨`
                : placeholder}
            </Text>

            <Text numberOfLines={1} style={styles.previewText}>
              {selectedItems.length > 0
                ? selectedItems.map((item) => item.label).join(", ")
                : "눌러서 입력"}
            </Text>
          </View>

          <View style={styles.plusCircle}>
            <Text style={styles.plusText}>＋</Text>
          </View>
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
                <View style={styles.modalTitleBox}>
                  <Text style={styles.modalTitle}>{title ?? "항목 입력"}</Text>
                  <Text style={styles.modalSubtitle}>
                    원하는 항목을 추가해 주세요
                  </Text>
                </View>

                <Pressable
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  ref={ref}
                  value={input}
                  onChangeText={setInput}
                  placeholder={placeholder}
                  placeholderTextColor={colors.text + "66"}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    !input.trim() && styles.addButtonDisabled,
                    pressed && input.trim() && !loading && styles.pressed,
                  ]}
                  onPress={handleAdd}
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
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

                        <Pressable
                          hitSlop={8}
                          onPress={() => removeId(item.id)}
                        >
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>＋</Text>
                    <Text style={styles.emptyText}>
                      아직 추가된 항목이 없습니다.
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.doneButton,
                  pressed && styles.pressed,
                ]}
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

CompleteArrayInput.displayName = "CompleteArrayInput";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 12,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  field: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fieldTextBox: {
    flex: 1,
    marginRight: 12,
  },

  fieldTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  previewText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.text + "99",
  },

  plusCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary + "14",
  },

  plusText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "800",
    lineHeight: 24,
  },

  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalBox: {
    maxHeight: "82%",
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitleBox: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.text + "99",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text + "10",
  },

  closeIcon: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text + "99",
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.text + "12",
    borderRadius: 14,
    backgroundColor: colors.text + "08",
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },

  addButton: {
    minWidth: 72,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  addButtonDisabled: {
    backgroundColor: colors.text + "20",
  },

  addText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  modalContent: {
    minHeight: 120,
    maxHeight: 260,
    marginBottom: 18,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    paddingLeft: 13,
    paddingRight: 10,
    borderRadius: 999,
    backgroundColor: colors.primary + "14",
    borderWidth: 1,
    borderColor: colors.primary + "22",
  },

  tagText: {
    maxWidth: 220,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    flexShrink: 1,
  },

  removeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text + "88",
  },

  emptyBox: {
    flex: 1,
    minHeight: 120,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text + "06",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.text + "18",
  },

  emptyIcon: {
    fontSize: 24,
    color: colors.text + "55",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: colors.text + "88",
  },

  doneButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
  },

  doneText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
