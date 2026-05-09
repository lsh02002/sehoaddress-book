import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import { RootStackParamList } from "../../../App";
import { ContactRepository } from "../../repositories/contact/ContactRepository";
import { TwoDiv } from "../../form/input/TwoDiv";
import SelectInput, { Option } from "../../form/input/SelectInput";
import { Address, Email, Phone } from "../../domain/Contact";
import SelectArrayInput from "../../form/input/SelectArrayInput";
import TextInput from "../../form/input/TextInput";

type RouteProps = RouteProp<RootStackParamList, "ContactForm">;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContactFormScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const db = useSQLiteContext();
  const repository = new ContactRepository(db);

  const contactId = route.params?.id;

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [memo, setMemo] = useState("");

  const [phoneOptions, setPhoneOptions] = useState<Option[]>([]);
  const [emailOptions, setEmailOptions] = useState<Option[]>([]);
  const [addressOptions, setAddressOptions] = useState<Option[]>([]);
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    if (!contactId) return;

    const contact = await repository.findById(contactId);

    if (!contact) return;

    setName(contact.name);
    setNickname(contact.nickname || "");
    setPhone(contact.phones[0]?.phoneNumber || "");
    setEmail(contact.emails[0]?.emailAddress || "");
    setAddress(contact.addresses[0]?.addressLine1 || "");
    setTags(contact.tags);
    setGroups(contact.groups);
    setMemo(contact.memo ?? "");

    setPhoneOptions(
      contact.phones.map((phone: Phone) => ({
        label: phone.phoneNumber,
        value: phone.phoneNumber,
      })),
    );
    setEmailOptions(
      contact.emails.map((email: Email) => ({
        label: email.emailAddress,
        value: email.emailAddress,
      })),
    );
    setAddressOptions(
      contact.addresses.map((address: Address) => ({
        label: address.addressLine1 ?? "",
        value: address.addressLine1 ?? "",
      })),
    );
    setTagOptions(
      contact.tags.map((tag: string) => ({ label: tag, value: tag })),
    );
    setGroupOptions(
      contact.groups.map((group: string) => ({ label: group, value: group })),
    );
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("이름을 입력하세요.");
      return;
    }

    const payload = {
      name,
      nickname,
      memo,
      phone,
      email,
      address,
      tags,
      groups,
    };

    if (contactId) {
      await repository.update(contactId, payload);
    } else {
      await repository.create(payload);
    }

    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/*"저혼자 쓸거기 때문에... 설정을 여러가지 방법으로 해보세요"*/}
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
          name="phone"
          title="전화번호"
          value={phone}
          setValue={setPhone}
          options={phoneOptions}
        />

        <SelectInput
          name="email"
          title="이메일"
          value={email}
          setValue={setEmail}
          options={emailOptions}
        />
      </TwoDiv>

      <SelectInput
        name="address"
        title="주소"
        value={address}
        setValue={setAddress}
        options={addressOptions}
      />

      <TwoDiv>
        <SelectArrayInput
          name="tag"
          title="태그"
          values={tags}
          setValues={setTags}
          options={tagOptions}
        />

        <SelectArrayInput
          name="group"
          title="그룹"
          values={groups}
          setValues={setGroups}
          options={groupOptions}
        />
      </TwoDiv>

      <TextInput name="memo" title="메모" data={memo} setData={setMemo} />

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
