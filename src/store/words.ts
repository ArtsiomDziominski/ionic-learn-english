import { defineStore } from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {ActiveFlowWords, FlowWords, VIEW_CARD_WORDS, ViewCardWords} from "@/const/flow";
import {words} from "@/content/words_level";

export const wordsStore = defineStore('wordsStore', () => {



	const wordsList: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);
	const wordNumber: Ref<UnwrapRef<number>> = ref(0);
	const cards: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);

	const activeFlowWords: Ref<UnwrapRef<ActiveFlowWords>> = ref(ActiveFlowWords.Card);
	const viewCardSelectWord = ref(VIEW_CARD_WORDS[ViewCardWords.List]);

	const randomWord = computed((): UnwrapRef<COMMON.Word> => {
		return cards.value[wordNumber.value];
	});

	const cardsLength = computed((): UnwrapRef<number> => {
		return cards.value.length;
	});

	const setRandomCards = (): void => {
		const wordsListLength = wordsList.value.length;
		const randomNumbers = [];
		for (let i = 0; i < 4; i++) {
			randomNumbers.push(Math.floor(Math.random() * wordsListLength));
		}
		cards.value = randomNumbers.map((number: number) => (wordsList.value[number]));
	}

	const setNextWord = (): void => {
		wordNumber.value = (Math.floor(Math.random() * cardsLength.value));
		setRandomCards();
		setRandomViewCardWordsValue();
	}

	const setRandomViewCardWordsValue = (): void => {
		const viewCardWordsNumber = (Math.floor(Math.random() * Object.values(ViewCardWords).length));
		const viewCardWordsValue = Object.values(ViewCardWords)[viewCardWordsNumber];
		viewCardSelectWord.value = VIEW_CARD_WORDS[ViewCardWords[viewCardWordsValue]];
	}

	const setWordsList = (flow: FlowWords): void => {
		if (FlowWords.Random === flow) wordsList.value = words;
		else wordsList.value = words.filter((word) => (word.levels.includes(flow)));
	}

	return {
		cards,
		randomWord,
		activeFlowWords,
		viewCardSelectWord,
		setNextWord,
		setRandomCards,
		setWordsList
	};
});
