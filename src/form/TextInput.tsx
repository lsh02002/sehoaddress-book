import React, { forwardRef } from "react";
import {
  ReturnKeyTypeOptions,
  Text,
  TextInput as RNTextInput,
  TextInputSubmitEditingEvent,
  View,
  StyleSheet,
} from "react-native";
import { colors } from "../themes/theme";

export type Props = {
  disabled?: boolean;
  name: string;
  title: string;
  data: string;
  setData: (v: string) => void;
  returnKeyType?: ReturnKeyTypeOptions | undefined;
  onSubmitEditing?: ((e: TextInputSubmitEditingEvent) => void) | undefined;
};

const TextInput = forwardRef<RNTextInput, Props>(
  ({ disabled, title, data, setData, returnKeyType, onSubmitEditing }, ref) => {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{title}</Text>
        <RNTextInput
          ref={ref}
          editable={!disabled}
          value={data}
          onChangeText={setData}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          placeholder={`${title}을(를) 입력하세요`}
          style={[styles.input, disabled && styles.disabled]}
        />
      </View>
    );
  },
);

export default TextInput;

export const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.6,
  },
});
