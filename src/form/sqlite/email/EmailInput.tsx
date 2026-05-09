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

import { EmailRepository } from "../../../repositories/email/EmailRepository";

type Props = {
  contactId: number;
  onSaved?: () => void;
};

const EmailInput = ({ contactId, onSaved }: Props) => {
  const db = useSQLiteContext();

  const emailRepository = useMemo(() => new EmailRepository(db), [db]);

  const [emailType, setEmailType] = useState("personal");
  const [emailAddress, setEmailAddress] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailOptions: Option[] = [
    { label: "personal", value: "personal" },
    { label: "work", value: "work" },
    { label: "school", value: "school" },
    { label: "etc", value: "etc" },
  ];

  const onSave = async () => {
    try {
      if (!contactId) {
        Alert.alert("연락처 정보가 없습니다.");
        return;
      }

      if (!emailAddress.trim()) {
        Alert.alert("이메일을 입력하세요.");
        return;
      }

      if (!emailAddress.includes("@")) {
        Alert.alert("올바른 이메일 형식이 아닙니다.");
        return;
      }

      setLoading(true);

      await emailRepository.create({
        contactId,
        emailType,
        emailAddress,
        isPrimary,
      });

      Alert.alert("저장 완료", "이메일이 저장되었습니다.");

      setEmailAddress("");
      setEmailType("personal");
      setIsPrimary(false);

      onSaved?.();
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "이메일 저장 실패");
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
          name="emailType"
          title="이메일타입"
          value={emailType}
          setValue={setEmailType}
          options={emailOptions}
        />

        <TextInput
          name="emailAddress"
          title="이메일"
          data={emailAddress}
          setData={setEmailAddress}
        />
      </TwoDiv>

      <CheckboxInput
        name="isPrimary"
        title="기본여부"
        checked={isPrimary}
        setChecked={setIsPrimary}
      />

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.5 }]}
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

export default EmailInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 32,
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
