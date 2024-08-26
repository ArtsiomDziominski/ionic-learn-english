import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {ActiveFlowWords, FlowWords, VIEW_CARD_WORDS, ViewCardWords} from "@/const/flow";
import {words} from "@/content/words_level";
import {STORAGE_KEY_STUDIED_WORDS} from "@/const/const";

export const wordsStore = defineStore('wordsStore', () => {
    const wordsList: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);
    const currentWordIndex: Ref<UnwrapRef<number>> = ref(0);
    const randomCards: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);
    const flowWords: Ref<UnwrapRef<WORDS.FlowWords[]>> = ref([]);
    const currentFlow: Ref<UnwrapRef<FlowWords>> = ref(FlowWords.Random);
    const isRepeatingFlowWords: Ref<UnwrapRef<boolean>> = ref(false);
    const studyWords: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);

    const activeFlowWords: Ref<UnwrapRef<ActiveFlowWords>> = ref(ActiveFlowWords.Card);
    const selectedCardView = ref(ViewCardWords.Card);

    const currentWord = computed((): UnwrapRef<COMMON.Word> => {
        return studyWords.value[currentWordIndex.value];
    });

    const selectedCardViewWord = computed((): UnwrapRef<any> => {
        return VIEW_CARD_WORDS[selectedCardView.value];
    });

    const activeCardSelectWordIndex = computed((): UnwrapRef<number> => {
        return Object.values(ViewCardWords).indexOf(selectedCardView.value);
    });

    const viewCardWordsLength = computed((): UnwrapRef<number> => {
        return Object.values(ViewCardWords).length;
    });

    const isCompleted = computed((): UnwrapRef<boolean> => {
        return !!flowWords.value.length && !!studyWords.value
            && flowWords.value.length >= studyWords.value.length
            && flowWords.value.every((item) => item.isCorrect.length >= studyWords.value.length);
    });

    const progressBarStudyCount = computed((): UnwrapRef<number> => {
        return flowWords.value.reduce((acc, flow) => acc + flow.isCorrect.length, 0) * 6.3 / 100;
    });

    const countAllWords = computed((): UnwrapRef<number> => {
        return words.length;
    });

    const setRandomCards = (randomLength: number = 3): void => {
        if (selectedCardView.value === ViewCardWords.Match) {
            randomCards.value = studyWords.value;
        } else {
            const studiedWords = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDIED_WORDS) || '[]');
            const wordsListFilter = studiedWords.length ?
                wordsList.value
                    .filter((w) => !studiedWords
                        .find((s: COMMON.Word) => w.word === s.word))
                : wordsList.value;
            const wordsListLength = wordsListFilter.length;
            const randomNumbers = [];
            for (let i = 0; i < randomLength; i++) {
                randomNumbers.push(Math.floor(Math.random() * wordsListLength));
            }
            randomCards.value = randomNumbers.map((number: number) => (wordsListFilter[number]));

            const randomIndex = Math.floor(Math.random() * (randomCards.value.length + 1));
            randomCards.value.splice(randomIndex, 0, currentWord.value);
        }
    }

    const setStudyCards = (randomLength: number = 4): void => {
        const wordsListLength = wordsList.value.length;
        const randomNumbers = [];
        for (let i = 0; i < randomLength; i++) {
            randomNumbers.push(Math.floor(Math.random() * wordsListLength));
        }
        studyWords.value = randomNumbers.map((number: number) => (wordsList.value[number]));
    }

    const nextWord = () => {
        if (isRepeatingFlowWords.value) repeatFlowWords();
        else if (currentWordIndex.value < 3 && selectedCardView.value !== ViewCardWords.Match)
            currentWordIndex.value++;
        else {
            currentWordIndex.value = 0;
            nextComponent();
        }
    }

    const nextComponent = () => {
        const viewCardWordsValues = Object.values(ViewCardWords);

        if (activeCardSelectWordIndex.value < viewCardWordsLength.value - 1) selectedCardView.value = viewCardWordsValues[activeCardSelectWordIndex.value + 1];
        else if (selectedCardView.value === ViewCardWords.Match && !isCompleted.value) {
            isRepeatingFlowWords.value = true;
            repeatFlowWords();
        } else selectedCardView.value = viewCardWordsValues[0];
    }

    const repeatFlowWords = () => {
        currentWordIndex.value = 10;
        const flowWordCard = flowWords.value.find((item) => item.isCorrect.length < studyWords.value.length);
        if (flowWordCard) {
            selectedCardView.value = flowWordCard.studyCard as ViewCardWords;
            const studyWordsCard = studyWords.value.filter((item) => flowWordCard.isCorrect.findIndex((w) => item.word === w.word) === -1);
            if (studyWordsCard.length) currentWordIndex.value = studyWords.value.findIndex(item => item.word === studyWordsCard[0].word);
            else isRepeatingFlowWords.value = false;
        } else isRepeatingFlowWords.value = false;
    }

    const setNextWord = (): void => {
        nextWord();
        setRandom();
    }

    const setRandom = (): void => {
        setRandomCards();
    }

    const setAnswer = (word: COMMON.Word | null, isCorrect: boolean): void => {
        if (!word || selectedCardView.value === ViewCardWords.Match) {
            flowWords.value.push({
                studyCard: selectedCardView.value,
                isCorrect: studyWords.value,
            })
        } else if (isCorrect) {
            const flowWordsIndex = flowWords.value.findIndex((item) => item.studyCard === selectedCardView.value);
            if (flowWordsIndex > -1)
                flowWords.value[flowWordsIndex]
                    .isCorrect.push(word)
            else flowWords.value.push({
                studyCard: selectedCardView.value,
                isCorrect: [word],
            })
        }
    }

    const initializeWordsList = (flow: FlowWords): void => {
        currentFlow.value = flow;
        console.log(flow);
        if (FlowWords.Random === flow) wordsList.value = words;
        else wordsList.value = words.filter((word) => (word.levels.includes(flow)));
        console.log(wordsList.value);
        setStudyCards();
        setRandom();
    }

    const resetFlow = () => {
        currentWordIndex.value = 0;
        flowWords.value = [];
        isRepeatingFlowWords.value = false;
        studyWords.value = [];
        activeFlowWords.value = ActiveFlowWords.Card;
        selectedCardView.value = ViewCardWords.Card;
    }

    return {
        cards: randomCards,
        currentWord,
        currentFlow,
        activeFlowWords,
        selectedCardViewWord,
        selectedCardView,
        isCompleted,
        progressBarStudyCount,
        flowWords,
        studyWords,
        countAllWords,
        setNextWord,
        setRandomCards,
        initializeWordsList,
        setAnswer,
        resetFlow
    };
});
