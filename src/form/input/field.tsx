import React, { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors } from "../../themes/theme";

export const fieldStyles = StyleSheet.create({
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
  textarea: {
    textAlignVertical: "top",
  },
  disabled: {
    opacity: 0.6,
  },
  helper: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 12,
  },
});

export const FieldLabel = ({ title }: { title: string }) => (
  <Text style={fieldStyles.label}>{title}</Text>
);

export const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
  <View style={fieldStyles.wrapper}>{children}</View>
);

export const BaseInput = forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => {
    return <RNTextInput ref={ref} {...props} />;
  },
);
