import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { useState, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { wordsLearningActions } from "../store/wordsLearningSlice";
import { playSound } from "../services/soundHandler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { selectWordsToLearn } from "../store/wordsLearningSlice";

function WordCard({ wordText, updateCards, zindex }) {
  const [showFullInfo, setShowFullInfo] = useState(false);
  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const wordsToStudy = useSelector(selectWordsToLearn);
  const [wordInfo, setWordInfo] = useState(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateY = useSharedValue(Math.PI);
  const start = useSharedValue({ x: 0, y: 0 });

  const onShow = () => {
    rotateY.value = withTiming(0, { duration: 1500 });
    setWordInfo(wordsToStudy.find(el => el.word === wordText));
    setTimeout(() => setShowFullInfo(true), 750);
  };

  const onDoNotRemember = () => {
    updateCards();
  };

  const onRemember = () => {
    updateCards();
    dispatch(wordsLearningActions.updateWordLearnInfo(wordInfo.word));
  };

  const setCoordinatesAfterDelay = (x, y, delay) => {
    setTimeout(() => {
      translateX.value = x;
      translateY.value = y;
    }, delay);
  };

  const panGesture = Gesture.Pan()
    .enabled(showFullInfo)
    .onUpdate((event) => {
      translateX.value = event.translationX + start.value.x;
      translateY.value = event.translationY + start.value.y;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) < width / 2.3) {
        translateX.value = withSpring(start.value.x);
        translateY.value = withSpring(start.value.y);
        return;
      }

      runOnJS(setShowFullInfo)(false);
      const functoExecute = translateX.value < 0 ? onDoNotRemember : onRemember;

      runOnJS(functoExecute)();
      translateX.value = withTiming(translateX.value * 2, undefined, () => {
        if (translateX.value < 0) {
          translateX.value = withTiming(start.value.x);
          translateY.value = withTiming(start.value.y);
        } else {
          runOnJS(setCoordinatesAfterDelay)(start.value.x, start.value.y, 1000);
        }
        rotateY.value = Math.PI;
      });
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${-translateX.value / 15}deg` },
        { rotateY: `${rotateY.value}rad` },
      ],
    };
  });

  const rRightTipsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-width / 2, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const rLeftTipsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, width / 2],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.wordContainer, { zIndex: zindex }, rStyle]}>
        <Pressable
          style={styles.pressable}
          onPress={onShow}
          disabled={showFullInfo}
        >
          {showFullInfo && wordInfo && wordInfo.image && (
            <Image style={styles.image} source={{ uri: wordInfo.image }} />
          )}
          <Text
            style={[
              styles.word,
              showFullInfo ? {} : styles.wordInitialTransform,
            ]}
          >
            {wordText}
          </Text>
          {showFullInfo && wordInfo && (
            <>
              <Text style={styles.phonetics}>{wordInfo.phonetics}</Text>
              <Pressable
                style={styles.playPressable}
                onPress={() => playSound(wordInfo.audio)}
              >
                <Ionicons
                  name="volume-medium-outline"
                  size={28}
                  color={colors.primary900}
                />
              </Pressable>
              <Text style={styles.meaning}>{wordInfo.meaning}</Text>
            </>
          )}
        </Pressable>
        {showFullInfo && (
          <>
            <Animated.View style={[styles.tipLeft, rLeftTipsStyle]}>
              <Text style={styles.tipLeftText}>I know it</Text>
            </Animated.View>
            <Animated.View style={[styles.tipRight, rRightTipsStyle]}>
              <Text style={styles.tipRightText}>Learn again</Text>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    },
    wordContainer: {
      flex: 4,
      borderColor: colors.primary200,
      margin: 10,
      borderWidth: 1,
      borderRadius: 4,
      alignItems: "center",
      paddingVertical: 140,
      justifyContent: "space-evenly",
    },
    pressable: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    word: {
      fontSize: 28,
      color: colors.fontMain,
      fontWeight: "800",
      paddingVertical: 15,
    },
    playPressable: {
      paddingVertical: 15,
    },
    phonetics: {
      fontSize: 18,
      color: colors.fontMain,
      paddingVertical: 15,
    },
    meaning: {
      fontSize: 18,
      color: colors.fontMain,
      padding: 5,
    },
    remember: {
      flex: 1,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      margin: 10,
    },
    rememberText: {
      fontSize: 20,
      color: colors.fontInverse,
    },
    buttonsContainer: {
      flex: 1,
      flexDirection: "row",
      marginBottom: 10,
    },
    image: {
      width: 150,
      aspectRatio: 1,
      // marginBottom: 30,
    },
    tipLeft: {
      position: "absolute",
      left: 8,
      top: 20,
      padding: 3,
      borderColor: "red",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "-17deg" }],
    },
    tipLeftText: {
      color: "red",
      fontSize: 27,
    },
    tipRight: {
      position: "absolute",
      right: 8,
      top: 25,
      padding: 3,
      borderColor: "green",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "17deg" }],
    },
    tipRightText: {
      color: "green",
      fontSize: 27,
    },
    wordInitialTransform: {
      transform: [{ rotateY: `${-Math.PI}rad` }],
    },
    emptyCard: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      zIndex: -1,
      padding: 10,
    },
  });
}

export default WordCard;
