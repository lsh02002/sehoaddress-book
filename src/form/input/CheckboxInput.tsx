import React, { forwardRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../themes/theme";
import { FieldLabel, FieldWrapper } from "./field";

type Props = {
  disabled?: boolean;
  name: string;
  title: string;
  checked: boolean;
  setChecked: (v: boolean) => void;
  opPressNext?: () => void;
};

const CheckboxInput = forwardRef<View, Props>(
  ({ disabled, title, checked, setChecked, opPressNext }, ref) => {
    return (
      <FieldWrapper>
        <FieldLabel title={title} />
        <Pressable
          ref={ref}
          disabled={disabled}
          focusable={true}
          onPress={() => {
            setChecked(!checked);
            opPressNext?.();
          }}
          style={[styles.row, disabled && styles.disabled]}
        >
          <View style={[styles.box, checked && styles.boxChecked]}>
            {checked ? <Text style={styles.check}>✓</Text> : null}
          </View>
        </Pressable>
      </FieldWrapper>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    alignSelf: "flex-start",
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    color: "white",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CheckboxInput;
