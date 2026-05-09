import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text } from "react-native";
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
    const [open, setOpen] = useState(false);

    const selectedLabel = useMemo(
      () => options.find((opt) => opt.value === value)?.label,
      [options, value],
    );

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (!disabled) setOpen(true);
      },
      open: () => {
        if (!disabled) setOpen(true);
      },
      close: () => setOpen(false),
    }));

    return (
      <FieldWrapper>
        <FieldLabel title={title} />

        <Pressable
          disabled={disabled}
          focusable={true}
          onPress={() => {
            if (!disabled) setOpen(true);
          }}
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
            <Pressable style={styles.sheet} onPress={() => undefined}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <ScrollView>
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
                    >
                      <Text style={styles.optionText}>{opt.label}</Text>
                    </Pressable>
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
  placeholder: { color: colors.muted },
  valueText: { color: colors.text },
  chevron: { color: colors.muted, fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: 20,
    backgroundColor: colors.background,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: { color: colors.text },
  disabled: { opacity: 0.5 },
});

export default SelectInput;
