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

import { AddressRepository } from "../../../repositories/address/AddressRepository";

type Props = {
  contactId: number;
  onSaved?: () => void;
};

const AddressInput = ({ contactId, onSaved }: Props) => {
  const db = useSQLiteContext();

  const addressRepository = useMemo(() => new AddressRepository(db), [db]);

  const [addressType, setAddressType] = useState("home");

  const [postalCode, setPostalCode] = useState("");

  const [addressLine1, setAddressLine1] = useState("");

  const [addressLine2, setAddressLine2] = useState("");

  const [city, setCity] = useState("");

  const [region, setRegion] = useState("");

  const [country, setCountry] = useState("KR");

  const [isPrimary, setIsPrimary] = useState(false);

  const [loading, setLoading] = useState(false);

  const addressOptions: Option[] = [
    {
      label: "home",
      value: "home",
    },
    {
      label: "office",
      value: "office",
    },
    {
      label: "etc",
      value: "etc",
    },
  ];

  const onSave = async () => {
    try {
      if (!addressLine1.trim()) {
        Alert.alert("주소를 입력하세요.");

        return;
      }

      setLoading(true);

      await addressRepository.create({
        contactId,
        addressType,
        postalCode,
        addressLine1,
        addressLine2,
        city,
        region,
        country,
        isPrimary,
      });

      Alert.alert("저장 완료", "주소가 저장되었습니다.");

      setPostalCode("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setRegion("");
      setCountry("KR");
      setIsPrimary(false);

      onSaved?.();
    } catch (error) {
      console.error(error);

      Alert.alert("오류", "주소 저장 실패");
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
      <TwoDiv>
        <SelectInput
          name="addressType"
          title="주소타입"
          value={addressType}
          setValue={setAddressType}
          options={addressOptions}
        />

        <TextInput
          name="postalCode"
          title="우편번호"
          data={postalCode}
          setData={setPostalCode}
        />
      </TwoDiv>

      <TextInput
        name="addressLine1"
        title="기본주소"
        data={addressLine1}
        setData={setAddressLine1}
      />

      <TextInput
        name="addressLine2"
        title="상세주소"
        data={addressLine2}
        setData={setAddressLine2}
      />

      <TwoDiv>
        <TextInput name="city" title="도시" data={city} setData={setCity} />

        <TextInput
          name="region"
          title="지역"
          data={region}
          setData={setRegion}
        />
      </TwoDiv>

      <TextInput
        name="country"
        title="국가"
        data={country}
        setData={setCountry}
      />

      <CheckboxInput
        name="isPrimary"
        title="기본주소"
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

export default AddressInput;

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
