import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  slideContainer: {
    ...commonStyles.flexContainer,
    backgroundColor: color.whiteColor, // Match the main view background
  },
  imageBackground: {
    width: "100%",
    height: windowHeight(280), // Balanced slightly for small screen safety
    resizeMode: "stretch",
  },
  imageBgView: {
    ...commonStyles.flexContainer,
    ...external.js_end,
    paddingBottom: windowHeight(80), // Pushes the whole bottom card container above the dots safely
  },
  img: {
    width: "100%",
    height: windowHeight(220), // Increased height slightly to accommodate card layout + overlapping bottom button
    justifyContent: "space-between", // Spaces out Title/Description and your Action Button naturally
    paddingBottom: windowHeight(25), // Creates room for the absolute negative bottom positioning of your arrow
  },
  title: {
    ...commonStyles.mediumText23,
    marginTop: windowHeight(20),
    ...external.ti_center,
  },
  description: {
    ...commonStyles.regularText,
    paddingTop: windowHeight(12),
    width: "75%",
    ...external.as_center,
    fontSize: fontSizes.FONT19,
    lineHeight: windowHeight(24), // Fixed: Height must be greater than font size (FONT19) so text lines don't smash
    ...external.ti_center,
    marginBottom: windowHeight(20), // Safe spacing padding before the button area
  },
  backArrow: {
    width: windowHeight(50), // Standard size up from 34 for a clean floating touch target
    height: windowHeight(50),
    borderRadius: windowHeight(25),
    backgroundColor: color.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: windowHeight(-25), // Safely pulls the button halfway out of the card boundary without breaking layout
    zIndex: 10,
  },
  activeStyle: {
    width: "7%",
    backgroundColor: color.buttonBg,
  },
  paginationStyle: {
    bottom: windowHeight(25), // Fixed: Dropped the raw percentage; anchor it safely to the bottom instead
  },
  flagImage: {
    height: windowHeight(20),
    width: windowWidth(30),
    borderRadius: 15,
  },
  downArrow: {
    paddingVertical: windowHeight(4),
    paddingHorizontal: windowWidth(5),
  },
  dropdownManu: {
    borderRadius: 5,
    borderWidth: 0,
  },
  dropdownContainer: {
    width: windowWidth(180),
    borderWidth: 0,
    color: color.alertRed,
  },
  labelStyle: {
    fontFamily: fonts.medium,
  },
  dropdown: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  skipText: {
    color: color.regularText,
    paddingVertical: windowHeight(4),
    fontFamily: fonts.regular,
  },
});

export { styles };