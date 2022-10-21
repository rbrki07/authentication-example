import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from 'expo-secure-store';
import { CLIENT_ID, CLIENT_SECRET } from "@env";
import { Lock } from "./components/Lock";

const ACCESS_TOKEN_STORE_KEY = "accessToken"

/**
 * @returns {Promise<String>} accessToken
 */
const readAccessTokenFromSecureStore = async () => {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_STORE_KEY)
}

/**
 * @param {String} accessToken 
 * @returns {Promise<void>}
 */
const writeAccessTokenToSecureStore = async (accessToken) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_STORE_KEY, accessToken)
}

// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${CLIENT_ID}`,
};

const App = () => {
  const [sessionCode, setSessionCode] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState({});
  const [localAuthenticationAvailable, setLocalAuthenticationAvailable] =
    useState(false);
  const [locked, setLocked] = useState(false);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["read:user"],
      redirectUri: makeRedirectUri({
        path: "oauth/github",
      }),
    },
    discovery
  );

  useEffect(() => {
    readAccessTokenFromSecureStore().then((accessToken) => setAccessToken(accessToken))
  }, [])

  useEffect(() => {
    if (response?.type === "success") {
      const { code: sessionCode } = response.params;
      setSessionCode(sessionCode);
    } else if (response?.type === "error") {
      console.log("Authentication error: ", response.error);
    }
  }, [response]);

  useEffect(() => {
    if (sessionCode !== null) {
      fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: sessionCode,
        }),
      }).then((response) => {
        response.json().then(({ access_token: accessToken }) => {
          writeAccessTokenToSecureStore(accessToken);
          setAccessToken(accessToken);
        });
      });
    }
  }, [sessionCode]);

  useEffect(() => {
    if (accessToken !== null) {
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }).then((response) => {
        response.json().then((data) => {
          if (data?.type === "User") {
            setUser(data);
          }
        });
      });
    }
  }, [accessToken]);

  useEffect(() => {
    const checkLocalAuthenticationAvailable = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setLocalAuthenticationAvailable(
        hasHardware === true && isEnrolled === true
      );
    };
    checkLocalAuthenticationAvailable();
  }, [user?.name]);

  return (
    <View style={styles.container}>
      {!user?.name && (
        <Button
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
          title={"Sign in with GitHub"}
        />
      )}
      {user?.name && locked === false && <Text>{`Hello ${user?.name}!`}</Text>}
      {user?.name && localAuthenticationAvailable === true && (
        <Lock
          locked={locked}
          onPress={async (locked) => {
            if (locked === true) {
              const { success, error } =
                await LocalAuthentication.authenticateAsync();
              if (success === true) {
                setLocked(false);
              } else if (error) {
                console.log("error", error);
              }
            } else {
              setLocked(true);
            }
          }}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
