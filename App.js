import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { CLIENT_ID, CLIENT_SECRET } from "@env";

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
      {user?.name && <Text>{`Hello ${user?.name}!`}</Text>}
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
