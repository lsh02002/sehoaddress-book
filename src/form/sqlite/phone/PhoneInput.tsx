import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { useSQLiteContext } from "expo-sqlite";

import TextInput from "../../input/TextInput";
import { TwoDiv } from "../../input/TwoDiv";
import SelectInput, { Option } from "../../input/SelectInput";
import CheckboxInput from "../../input/CheckboxInput";

import { PhoneRepository } from "../../../repositories/phone/PhoneRepository";

type Props = {  
  onSaved?: () => void;
};

const PhoneInput = ({ onSaved }: Props) => {
  const db = useSQLiteContext();

  const phoneRepository = useMemo(() => new PhoneRepository(db), [db]);

  const [phoneType, setPhoneType] = useState("mobile");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [isPrimary, setIsPrimary] = useState(false);

  const [loading, setLoading] = useState(false);

  const phoneOptions: Option[] = [
    {
      label: "mobile",
      value: "mobile",
    },
    {
      label: "home",
      value: "home",
    },
    {
      label: "office",
      value: "office",
    },
    {
      label: "fax",
      value: "fax",
    },
  ];

  const onSave = async () => {
    try {
      if (!phoneNumber.trim()) {
        Alert.alert("전화번호를 입력하세요.");

        return;
      }

      setLoading(true);

      await phoneRepository.create({
        phoneType,
        phoneNumber,
        isPrimary,
      });

      Alert.alert("저장 완료", "전화번호가 저장되었습니다.");

      setPhoneNumber("");
      setPhoneType("mobile");
      setIsPrimary(false);

      onSaved?.();
    } catch (error) {
      console.error(error);

      Alert.alert("오류", "전화번호 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {"저혼자 쓸거기 때문에... 설정을 여러가지 방법으로 해보세요"}

      <TwoDiv>
        <TextInput
          disabled
          name="name"
          title="이름"
          data="이세호"
          setData={() => {}}
        />

        <TextInput
          disabled
          name="nickname"
          title="닉네임"
          data="lsh02002"
          setData={() => {}}
        />
      </TwoDiv>

      <TwoDiv>
        <SelectInput
          name="phonetype"
          title="전화타입"
          value={phoneType}
          setValue={setPhoneType}
          options={phoneOptions}
        />

        <TextInput
          name="phoneNumber"
          title="전화번호"
          data={phoneNumber}
          setData={setPhoneNumber}
        />
      </TwoDiv>

      <CheckboxInput
        name="isprimary"
        title="기본여부"
        checked={isPrimary}
        setChecked={setIsPrimary}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          loading && {
            opacity: 0.5,
          },
        ]}
        disabled={loading}
        onPress={onSave}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "저장중..." : "저장"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PhoneInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 32,
  },

  column: {
    display: "flex",
    width: "100%",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },

  memoInput: {
    height: 140,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
