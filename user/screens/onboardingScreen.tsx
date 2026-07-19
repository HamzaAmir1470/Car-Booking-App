import { View, Text, ImageBackground, TouchableOpacity, Image } from "react-native";
import React from "react";
import color from "@/themes/app.colors";
import Swiper from "react-native-swiper";
import { styles } from "./styles";
import { slides } from "@/configs/constants";
import Images from "@/utils/images";
import { router } from "expo-router";
import { BackArrow } from "@/utils/icons";

// Define a quick interface for your slides to replace 'any'
interface SlideItem {
  image: any; // or ImageSourcePropType from 'react-native'
  text: string;
  description: string;
}

export default function OnBoardingScreen() {
  const handleNavigation = () => {
    // Double check if your expo-router path needs the "(routes)" group prefix or just "/login"
    router.push("/(routes)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.whiteColor }}>
      <Swiper
        activeDotStyle={styles.activeStyle}
        removeClippedSubviews={true}
        paginationStyle={styles.paginationStyle}
        loop={false} // Typically onboarding screens shouldn't loop infinitely
      >
        {slides.map((slide: SlideItem, index: number) => (
          <View style={styles.slideContainer} key={index}>
            <Image style={styles.imageBackground} source={slide.image} />
            
            <View style={styles.imageBgView}>
              <ImageBackground
                resizeMode="stretch"
                style={styles.img}
                source={Images.bgOnboarding}
              >
                <Text style={styles.title}>{slide.text}</Text>
                <Text style={styles.description}>{slide.description}</Text>
                
                {/* Fixed: Removed the redundant nested <Text> tag around the icon */}
                <TouchableOpacity
                  style={styles.backArrow}
                  onPress={handleNavigation}
                  activeOpacity={0.8}
                >
                  <BackArrow
                    colors={color.whiteColor}
                    width={21}
                    height={21}
                  />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
}