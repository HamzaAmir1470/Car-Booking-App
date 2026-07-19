import React, { useState } from "react";
import { Redirect } from "expo-router";

export default function index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Redirect href={ !isLoggedIn ? "/(routes)/onboarding" : "/(tabs)/home" } />  
  );
}
