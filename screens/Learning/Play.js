import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";

import { selectWordsToLearn } from "../../store/wordsLearningSlice";
import WordDeck from "../../components/WordDeck";
import { wordsLearningActions } from "../../store/wordsLearningSlice";

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width / 2.3;

function Play() {
  const wordsToStudy = useSelector(selectWordsToLearn);
  const colors = useSelector((state) => state.theme.colors);
  const dispatch = useDispatch();
  const styles = useMemo(() => getStyles(colors), [colors]);

  if (wordsToStudy.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { alignSelf: "center" }]}>Congrats!</Text>
        <Text style={styles.text}>For now you have learnt all the words</Text>
        <Image style={styles.image} source={require("../../assets/well-done-icon.png")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WordDeck wordsToStudy={wordsToStudy} />
    </View>
  );
}

export default Play;

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.appBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.fontMain,
      fontSize: 22,
      margin: 10,
      marginTop: 25,
    },
    image: {
      width: "100%",
      height: undefined,
      aspectRatio: 1,
      alignSelf: "center",
      resizeMode: "contain",
    },
  });
}