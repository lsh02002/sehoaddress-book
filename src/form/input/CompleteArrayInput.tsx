import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  ActivityIndicator,  
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../themes/theme";
import { FieldLabel, FieldWrapper } from "./field";

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
  debounceMs?: number;
  maxMenuHeight?: number;
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
      fetchOptions,
      createOption,
      hydrateSelected,
      placeholder = "추가...",
      debounceMs = 250,
      onError,
    },
    ref,
  ) => {
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMap, setSelectedMap] = useState<Map<string, Option>>(
      () => new Map(),
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const list = await fetchOptions(input.trim());
          setOptions(list);
        } catch (err) {
          onError?.(err);
        } finally {
          setLoading(false);
        }
      }, debounceMs);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [input, fetchOptions, debounceMs, onError]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          if (hydrateSelected) {
            const hydrated = await hydrateSelected(values);
            if (cancelled) return;
            const next = new Map<string, Option>();
            hydrated.forEach((item) => next.set(item.id, item));
            setSelectedMap(next);
          }
        } catch (err) {
          onError?.(err);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [values, hydrateSelected, onError]);

    const toggleId = useCallback(
      (id: string) => {
        setValues((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
      },
      [setValues],
    );

    const addId = useCallback(
      (id: string) => {
        setValues((prev) => (prev.includes(id) ? prev : [...prev, id]));
      },
      [setValues],
    );

    const removeId = useCallback(
      (id: string) => {
        setValues((prev) => prev.filter((x) => x !== id));
      },
      [setValues],
    );

    const handleCreate = useCallback(async () => {
      if (!createOption) return;
      const nextName = input.trim();
      if (!nextName) return;

      try {
        setLoading(true);
        const created = await createOption(nextName);
        setOptions((prev) =>
          prev.some((o) => o.id === created.id) ? prev : [created, ...prev],
        );
        addId(created.id);
        setSelectedMap((prev) => new Map(prev).set(created.id, created));
        setInput("");
      } catch (err) {
        onError?.(err);
      } finally {
        setLoading(false);
      }
    }, [createOption, input, addId, onError]);

    const selectedItems = useMemo(
      () =>
        values.map((id) => ({
          id,
          label: selectedMap.get(id)?.name ?? id,
        })),
      [values, selectedMap],
    );

    return (
      <FieldWrapper>
        {title ? <FieldLabel title={title} /> : null}

        {selectedItems.length > 0 ? (
          <View style={styles.tags}>
            {selectedItems.map((item) => (
              <View key={item.id} style={styles.tag}>
                <Text style={styles.tagText}>{item.label}</Text>
                <Pressable onPress={() => removeId(item.id)}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <TextInput
          ref={ref}
          value={input}
          focusable={true}
          onChangeText={setInput}
          placeholder={placeholder}
          style={styles.input}
        />

        {createOption && input.trim() ? (
          <Pressable style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createText}>“{input.trim()}” 추가</Text>
          </Pressable>
        ) : null}

        <View style={styles.menu}>
          {loading ? <ActivityIndicator /> : null}

          {options.map((item) => {
            const selected = values.includes(item.id);

            return (
              <Pressable
                key={item.id}
                onPress={() => toggleId(item.id)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={styles.optionText}>{item.name}</Text>
                {selected ? <Text style={styles.selectedMark}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </FieldWrapper>
    );
  },
);

const styles = StyleSheet.create({
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6B7280",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: { color: "white" },
  removeText: { color: "white", fontSize: 12 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.background,
    color: colors.text,
  },
  createButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createText: { color: colors.primary, fontWeight: "600" },
  menu: { marginTop: 8, maxHeight: 240 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: { color: colors.text },
  selectedMark: { color: colors.primary, fontWeight: "700" },
});
