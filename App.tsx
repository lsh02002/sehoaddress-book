// App.tsx
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ContactListScreen } from "./src/screens/contact/ContactListScreen";
import { ContactFormScreen } from "./src/screens/contact/ContactFormScreen";
import { migrateDb } from "./src/db/migrate";
import AddressInput from "./src/form/sqlite/address/AddressInput";
import EmailInput from "./src/form/sqlite/email/EmailInput";
import GroupInput from "./src/form/sqlite/group/GroupInput";
import PhoneInput from "./src/form/sqlite/phone/PhoneInput";
import TagInput from "./src/form/sqlite/tag/TagInput";

export type RootStackParamList = {
  ContactList: undefined;
  ContactForm: { id?: number } | undefined;
  AddressInput: { contactId?: number } | undefined;
  EmailInput: { contactId?: number } | undefined;
  GroupInput: { contactId?: number } | undefined;
  PhoneInput: { contactId?: number } | undefined;
  TagInput: { contactId?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SQLiteProvider databaseName="addressbook.db" onInit={migrateDb}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="ContactList"
            component={ContactListScreen}
            options={{ title: "주소록" }}
          />
          <Stack.Screen
            name="ContactForm"
            component={ContactFormScreen}
            options={{ title: "연락처" }}
          />
          <Stack.Screen
            name="AddressInput"
            component={AddressInput}
            options={{ title: "주소추가" }}
          />
          <Stack.Screen
            name="EmailInput"
            component={EmailInput}
            options={{ title: "이메일추가" }}
          />
          <Stack.Screen
            name="GroupInput"
            component={GroupInput}
            options={{ title: "그룹추가" }}
          />
          <Stack.Screen
            name="PhoneInput"
            component={PhoneInput}
            options={{ title: "전화번호추가" }}
          />
          <Stack.Screen
            name="TagInput"
            component={TagInput}
            options={{ title: "태그추가" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
