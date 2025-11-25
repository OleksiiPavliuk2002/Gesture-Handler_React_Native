import { View, StyleSheet } from 'react-native';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import WordCard from './WordCard';

function WordDeck({ wordsToStudy }) {
    const [nextWordText, setNextWordText] = useState(() => {
        wordsToStudy.length > 1 ? wordsToStudy[1].word : null
    });
    const [currentWordText, setCurrentWordText] = useState(() => {
        wordsToStudy.length > 0 ? wordsToStudy[0].word : null
    });
    const colors = useSelector((state) => state.theme.colors);
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [{ zindex, nextZindex }, setZindexes] = useState({
        zindex: 1,
        nextZindex: 0,
    });

    useEffect(() => {
        if (nextZindex === 0) {
            const nextRandomWord = getRandomWord(wordsToStudy, currentWordText);
            setNextWordText(nextRandomWord);
        } else {
            const currentRandomWord = getRandomWord(wordsToStudy, nextWordText);
            setCurrentWordText(currentRandomWord);
        }
    }, [nextZindex, wordsToStudy]);

    function getRandomWord(list, existingWord) {
        if (list.length <= 1) return null;
        let randomWord;
        do {
            const randomIndex = Math.floor(Math.random() * list.length);
            randomWord = list[randomIndex].word;
        } while (randomWord === existingWord);
        return randomWord;
    }

    const updateCards = useCallback(() => {
        if (wordsToStudy.length < 2) return;
        setZindexes((prev) => ({
            zindex: prev.nextZindex,
            nextZindex: prev.zindex,
        }));
    }, []);

    return (
        <View style={styles.container}>
            {currentWordText && (
                <WordCard
                    wordText={currentWordText}
                    updateCards={updateCards}
                    zindex={zindex}
                />
            )}
            {nextWordText && (
                <WordCard
                    wordText={nextWordText}
                    updateCards={updateCards}
                    zindex={nextZindex}
                />
            )}
            {wordsToStudy.length > 2 && (
                <View style={[styles.wordContainer, styles.emptyCard, { transform: [{ rotate: "3deg" }] }]} />
            )}
            {wordsToStudy.length > 3 && (
                <View style={[styles.wordContainer, styles.emptyCard, { transform: [{ rotate: "-3deg" }] }]} />
            )}
        </View>
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

export default WordDeck;