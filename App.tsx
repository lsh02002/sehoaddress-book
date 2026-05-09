// App.tsx
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ContactListScreen } from "./src/screens/contact/ContactListScreen";
import { ContactFormScreen } from "./src/screens/contact/ContactFormScreen";
import { migrateDb } from "./src/db/migrate";

export type RootStackParamList = {
  ContactList: undefined;
  ContactForm: { id?: number } | undefined;
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
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
