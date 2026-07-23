import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

export const useGetUserData = () => {
  const [user, setUser] = useState<UserType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLoggedInUserData = async () => {
      try {
        let accessToken = await AsyncStorage.getItem("accessToken");

        // 1. Guard against missing/null token
        if (!accessToken) {
          setLoading(false);
          return;
        }

        // 2. Sanitize token string in case it was stored with quotes
        accessToken = accessToken.replace(/^"|"$/g, "").trim();

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        setUser(res.data.user);
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getLoggedInUserData();
  }, []);

  return { loading, user };
};
