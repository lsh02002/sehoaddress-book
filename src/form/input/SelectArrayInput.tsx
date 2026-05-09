import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectArrayInputProps = {
  name: string;
  title: string;
  values: string[];
  setValues: (v: string[]) => void;
  options: Option[];
  placeholder?: string;
  maxMenuHeight?: number;
};

export type SelectArrayInputRef = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  focus: () => void;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  placedAbove: boolean;
  maxH: number;
};

const MIN_MENU_HEIGHT = 160;
const SCREEN_PADDING = 8;

const SelectArrayInput = forwardRef<SelectArrayInputRef, SelectArrayInputProps>(
  (
    {
      name,
      title,
      values,
      setValues,
      options,
      placeholder,
      maxMenuHeight = 220,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

    const triggerRef = useRef<View | null>(null);
    const { height: viewportH, width: viewportW } = useWindowDimensions();

    const mapByValue = useMemo(
      () => new Map(options.map((o) => [o.value, o])),
      [options]
    );

    const isPlaceholder = values.length === 0;

    const selectedChips = useMemo(
      () => values.map((v) => mapByValue.get(v)?.label || v).filter(Boolean),
      [values, mapByValue]
    );

    const toggleValue = useCallback(
      (v: string) => {
        if (mapByValue.get(v)?.disabled) return;

        setValues(
          values.includes(v)
            ? values.filter((x) => x !== v)
            : [...values, v]
        );
      },
      [mapByValue, setValues, values]
    );

    const computeMenuPosition = useCallback(() => {
      if (!triggerRef.current) return;

      triggerRef.current.measureInWindow((x, y, width, height) => {
        const rectTop = y;
        const rectBottom = y + height;

        const spaceBelow = viewportH - rectBottom - SCREEN_PADDING;
        const spaceAbove = rectTop - SCREEN_PADDING;

        const desiredBelowH = Math.min(
          maxMenuHeight,
          Math.max(spaceBelow, MIN_MENU_HEIGHT)
        );

        const shouldFlip =
          desiredBelowH < MIN_MENU_HEIGHT && spaceAbove > spaceBelow;

        const heightIfAbove = Math.min(
          maxMenuHeight,
          Math.max(spaceAbove, MIN_MENU_HEIGHT)
        );

        const finalMaxH = shouldFlip
          ? heightIfAbove
          : Math.max(desiredBelowH, MIN_MENU_HEIGHT);

        const rawLeft = Math.round(x);
        const clampedLeft = Math.max(
          SCREEN_PADDING,
          Math.min(rawLeft, viewportW - width - SCREEN_PADDING)
        );

        const top = shouldFlip
          ? Math.max(SCREEN_PADDING, Math.round(rectTop - finalMaxH - 8))
          : Math.round(rectBottom + 8);

        setMenuPos({
          left: clampedLeft,
          top,
          width: Math.round(width),
          placedAbove: shouldFlip,
          maxH: finalMaxH,
        });
      });
    }, [maxMenuHeight, viewportH, viewportW]);

    const openMenu = useCallback(() => {
      setOpen(true);
      setFocusedIndex(0);
      requestAnimationFrame(() => {
        computeMenuPosition();
      });
    }, [computeMenuPosition]);

    const closeMenu = useCallback(() => {
      setOpen(false);
      setFocusedIndex(-1);
    }, []);

    const toggleMenu = useCallback(() => {
      setOpen((prev) => {
        const next = !prev;
        if (next) {
          setFocusedIndex(0);
          requestAnimationFrame(() => {
            computeMenuPosition();
          });
        } else {
          setFocusedIndex(-1);
        }
        return next;
      });
    }, [computeMenuPosition]);

    useImperativeHandle(
      ref,
      () => ({
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        focus: openMenu,
      }),
      [openMenu, closeMenu, toggleMenu]
    );

    useEffect(() => {
      if (!open) return;
      const id = requestAnimationFrame(() => {
        computeMenuPosition();
      });
      return () => cancelAnimationFrame(id);
    }, [open, computeMenuPosition, viewportH, viewportW]);

    const renderItem = ({ item, index }: { item: Option; index: number }) => {
      const checked = values.includes(item.value);
      const disabled = !!item.disabled;
      const focused = index === focusedIndex;

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: checked, disabled }}
          onPress={() => {
            if (disabled) return;
            setFocusedIndex(index);
            toggleValue(item.value);
          }}
          onPressIn={() => setFocusedIndex(index)}
          style={[
            styles.optionItem,
            focused && styles.optionItemFocused,
            disabled && styles.optionItemDisabled,
          ]}
        >
          <View
            style={[
              styles.checkbox,
              checked && styles.checkboxChecked,
              disabled && styles.checkboxDisabled,
            ]}
          >
            {checked ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text
            style={[
              styles.optionLabel,
              disabled && styles.optionLabelDisabled,
              focused && styles.optionLabelFocused,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{title}</Text>

        <View ref={triggerRef} collapsable={false}>
          <Pressable
            nativeID={name}
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={toggleMenu}
            style={styles.trigger}
          >
            <View style={styles.triggerContent}>
              {isPlaceholder ? (
                <Text style={styles.placeholderText}>
                  {placeholder || `${title}을(를) 선택하세요`}
                </Text>
              ) : (
                <View style={styles.chipsWrap}>
                  {selectedChips.map((label, i) => (
                    <View key={`${label}-${i}`} style={styles.chip}>
                      <Text style={styles.chipText}>{label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.chevron}>▾</Text>
          </Pressable>
        </View>

        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.overlay} onPress={closeMenu}>
            {menuPos && (
              <Pressable
                onPress={(e) => e.stopPropagation()}
                style={[
                  styles.menu,
                  {
                    left: menuPos.left,
                    top: menuPos.top,
                    width: menuPos.width,
                    maxHeight: menuPos.maxH,
                  },
                ]}
              >
                {options.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>
                      해당 {title}이 없습니다.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
    );
  }
);

SelectArrayInput.displayName = "SelectArrayInput";

export default SelectArrayInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  triggerContent: {
    flex: 1,
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 14,
  },
  chevron: {
    fontSize: 14,
    color: "#374151",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: "#111827",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  menu: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  emptyWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  optionItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  optionItemFocused: {
    backgroundColor: "#F3F4F6",
  },
  optionItemDisabled: {
    opacity: 0.45,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  checkboxDisabled: {},
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  optionLabelFocused: {
    fontWeight: "600",
  },
  optionLabelDisabled: {
    color: "#6B7280",
  },
});