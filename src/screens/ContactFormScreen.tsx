import { useEffect, useMemo, useState } from "react";
import {
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import { RootStackParamList } from "../../App";
import { ContactRepository } from "../repositories/ContactRepository";
import { TwoDiv } from "../form/input/TwoDiv";
import { Option } from "../form/input/SelectInput";
import TextInput from "../form/input/TextInput";
import { CompleteArrayInput } from "../form/input/CompleteArrayInput";

type RouteProps = RouteProp<RootStackParamList, "ContactForm">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContactFormScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const db = useSQLiteContext();
  const repository = useMemo(() => new ContactRepository(db), [db]);

  const contactId = route.params?.id;

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [memo, setMemo] = useState("");

  const [phoneOptions, setPhoneOptions] = useState<string[]>([]);
  const [emailOptions, setEmailOptions] = useState<string[]>([]);
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);

  type Option = {
    id: string;
    name: string;
  };

  useEffect(() => {
    if (contactId) {
      loadContact(contactId);
    }
  }, [contactId]);

  const loadContact = async (id: number) => {
    const contact = await repository.findById(id);

    if (!contact) return;

    const phoneValues = contact.phones.map((phone) => phone.phoneNumber);
    const emailValues = contact.emails.map((email) => email.emailAddress);
    const addressValues = contact.addresses
      .map((address) => address.addressLine1 ?? "")
      .filter(Boolean);

    setName(contact.name);
    setNickname(contact.nickname ?? "");
    setPhones(phoneValues);
    setEmails(emailValues);
    setAddresses(addressValues);
    setTags(contact.tags ?? []);
    setGroups(contact.groups ?? []);
    setMemo(contact.memo ?? "");

    setPhoneOptions(phoneValues);
    setEmailOptions(emailValues);
    setAddressOptions(addressValues);
    setTagOptions(contact.tags ?? []);
    setGroupOptions(contact.groups ?? []);
  };

  const makeFetchOptions =
    (options: string[]) =>
    async (query: string): Promise<Option[]> => {
      const q = query.trim().toLowerCase();

      return options
        .filter((value) => value.toLowerCase().includes(q))
        .map((value) => ({
          id: value,
          name: value,
        }));
    };

  const makeCreateOption =
    (setOptions: React.Dispatch<React.SetStateAction<string[]>>) =>
    async (name: string): Promise<Option> => {
      const value = name.trim();

      setOptions((prev) => (prev.includes(value) ? prev : [value, ...prev]));

      return {
        id: value,
        name: value,
      };
    };

  const makeHydrateSelected =
    (options: string[]) =>
    async (ids: string[]): Promise<Option[]> => {
      return ids.map((id) => ({
        id: id,
        name: id,
      }));
    };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("이름을 입력하세요.");
      return;
    }

    const payload = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      memo: memo.trim() || undefined,
      phones,
      emails,
      addresses,
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
        paddingBottom: 200,
      }}
    >
      <TwoDiv>
        <TextInput name="name" title="이름" data={name} setData={setName} />

        <TextInput
          name="nickname"
          title="닉네임"
          data={nickname}
          setData={setNickname}
        />
      </TwoDiv>

      <TwoDiv>
        <CompleteArrayInput
          name="phones"
          title="전화번호"
          values={phones}
          setValues={setPhones}
          fetchOptions={makeFetchOptions(phoneOptions)}
          createOption={makeCreateOption(setPhoneOptions)}
          hydrateSelected={makeHydrateSelected(phoneOptions)}
        />

        <CompleteArrayInput
          name="emails"
          title="이메일"
          values={emails}
          setValues={setEmails}
          fetchOptions={makeFetchOptions(emailOptions)}
          createOption={makeCreateOption(setEmailOptions)}
          hydrateSelected={makeHydrateSelected(emailOptions)}
        />
      </TwoDiv>

      <CompleteArrayInput
        name="addresses"
        title="주소"
        values={addresses}
        setValues={setAddresses}
        fetchOptions={makeFetchOptions(addressOptions)}
        createOption={makeCreateOption(setAddressOptions)}
        hydrateSelected={makeHydrateSelected(addressOptions)}
      />

      <TwoDiv>
        <CompleteArrayInput
          name="tags"
          title="태그"
          values={tags}
          setValues={setTags}
          fetchOptions={makeFetchOptions(tagOptions)}
          createOption={makeCreateOption(setTagOptions)}
          hydrateSelected={makeHydrateSelected(tagOptions)}
        />

        <CompleteArrayInput
          name="groups"
          title="그룹"
          values={groups}
          setValues={setGroups}
          fetchOptions={makeFetchOptions(groupOptions)}
          createOption={makeCreateOption(setGroupOptions)}
          hydrateSelected={makeHydrateSelected(groupOptions)}
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
