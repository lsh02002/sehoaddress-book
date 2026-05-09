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
      placeholder = " 추가...",
      debounceMs = 250,
      onError,
    },
    ref,
  ) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedMap, setSelectedMap] = useState<Map<string, Option>>(
      () => new Map(),
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const requestIdRef = useRef(0);

    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const query = input.trim();

      if (!query) {
        setLoading(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        const requestId = ++requestIdRef.current;

        try {
          setLoading(true);
          if (requestId !== requestIdRef.current) return;
        } catch (err) {
          onError?.(err);
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
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
        setCreateLoading(true);

        const created = await createOption(nextName);

        addId(created.id);
        setSelectedMap((prev) => new Map(prev).set(created.id, created));
        setInput("");
      } catch (err) {
        onError?.(err);
      } finally {
        setCreateLoading(false);
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
      <View style={styles.wrapper}>
        {title ? <Text style={styles.label}>{title}</Text> : null}

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
          <Pressable
            style={styles.createButton}
            onPress={handleCreate}
            disabled={createLoading}
          >
            {createLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.createText}>“{input.trim()}” 추가</Text>
            )}
          </Pressable>
        ) : null}
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
  tags: { flexDirection: "row", gap: 2, marginBottom: 8, flexWrap: "wrap" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,

    maxWidth: "100%",
  },
  tagText: {
    color: "white",
    flexShrink: 1,
  },
  removeText: { color: "white", fontSize: 12 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
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
});
