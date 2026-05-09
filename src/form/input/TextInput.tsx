import React, { forwardRef } from 'react';
import {
  ReturnKeyTypeOptions,
  TextInput as RNTextInput,
  TextInputSubmitEditingEvent,
} from 'react-native';
import { FieldLabel, FieldWrapper, BaseInput, fieldStyles } from './field';

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
      <FieldWrapper>
        <FieldLabel title={title} />
        <BaseInput
          ref={ref}
          editable={!disabled}
          value={data}
          onChangeText={setData}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          placeholder={`${title}을(를) 입력하세요`}
          style={[fieldStyles.input, disabled && fieldStyles.disabled]}
        />
      </FieldWrapper>
    );
  },
);

export default TextInput;
