import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../themes/theme";
import { FieldLabel, FieldWrapper } from "./field";

export type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type Props = {
  disabled?: boolean;
  name: string;
  title: string;
  value: string;
  setValue: (v: string) => void;
  options: Option[];
  placeholder?: string;
  onPressNext?: () => void;
};

export type SelectInputRef = {
  focus: () => void;
  open: () => void;
  close: () => void;
};

const SelectInput = forwardRef<SelectInputRef, Props>(
  (
    { disabled, title, value, setValue, options, placeholder, onPressNext },
    ref,
  ) => {
    const triggerRef = useRef<View>(null);

    const [open, setOpen] = useState(false);

    const [layout, setLayout] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    const selectedLabel = useMemo(
      () => options.find((opt) => opt.value === value)?.label,
      [options, value],
    );

    const openSelect = () => {
      if (disabled) return;

      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setLayout({
          x,
          y,
          width,
          height,
        });

        setOpen(true);
      });
    };

    useImperativeHandle(ref, () => ({
      focus: openSelect,
      open: openSelect,
      close: () => setOpen(false),
    }));

    return (
      <FieldWrapper>
        <FieldLabel title={title} />

        <Pressable
          ref={triggerRef}
          disabled={disabled}
          focusable
          onPress={openSelect}
          style={[styles.trigger, disabled && styles.disabled]}
        >
          <Text style={!value ? styles.placeholder : styles.valueText}>
            {disabled
              ? `${title}이(가) 비어있습니다.`
              : (selectedLabel ?? placeholder ?? `${title}을(를) 선택하세요`)}
          </Text>

          <Text style={styles.chevron}>▾</Text>
        </Pressable>

        <Modal
          transparent
          visible={open}
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable
              style={[
                styles.dropdown,
                {
                  top: layout.y + layout.height + 24,
                  left: layout.x,
                  width: layout.width,
                },
              ]}
              onPress={() => undefined}
            >
              <ScrollView>
                {options.length === 0 && (
                  <View style={styles.emptyWrap}>
                    <Text
                      style={styles.emptyText}
                    >{`해당 ${title}이(가) 없습니다`}</Text>
                  </View>
                )}
                {options.map((opt) => {
                  const selected = value === opt.value;

                  return (
                    <Pressable
                      key={opt.value}
                      disabled={opt.disabled}
                      onPress={() => {
                        setValue(opt.value);
                        setOpen(false);
                        onPressNext?.();
                      }}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                        opt.disabled && styles.disabled,
                      ]}
                    />
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </FieldWrapper>
    );
  },
);

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  placeholder: {
    color: colors.muted,
  },

  valueText: {
    color: colors.text,
  },

  chevron: {
    color: colors.muted,
    fontSize: 16,
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  dropdown: {
    position: "absolute",
    maxHeight: 260,
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 4,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  optionSelected: {
    backgroundColor: colors.primarySoft,
  },

  optionText: {
    color: colors.text,
  },

  disabled: {
    opacity: 0.5,
  },
  emptyWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default SelectInput;
