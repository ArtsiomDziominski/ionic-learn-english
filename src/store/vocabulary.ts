import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {VocabularyViews} from "@/const/vocabulary";
import {words} from "@/content/words_level";
import {STORAGE_KEY_FAVORITES_WORDS, STORAGE_KEY_STUDIED_WORDS} from "@/const/const";

export const vocabularyStore = defineStore('vocabularyStore', () => {
    const vocabularyView = ref(VocabularyViews.AllVocabulary);
    const studiedWords: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);
    const favoritesWords: Ref<UnwrapRef<COMMON.Word[]>> = ref([]);

    const vocabularyList = computed((): COMMON.Word[] => {
        switch (vocabularyView.value) {
            case VocabularyViews.AllVocabulary:
                return words;
            case VocabularyViews.StudiedWords:
                return studiedWords.value;
            case VocabularyViews.FavoritesWords:
                return favoritesWords.value;
            default:
                return words;
        }
    });

    const isStudiedView = computed((): boolean => {
        return vocabularyView.value === VocabularyViews.StudiedWords;
    })

    const setVocabularyView = (view: VocabularyViews) => {
        vocabularyView.value = view;
    }

    const setStudiedWords = () => {
        studiedWords.value = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDIED_WORDS) || '[]');
    };

    const updateStudiedWords = (word: COMMON.Word) => {
        studiedWords.value.push(word);
        localStorage.setItem(STORAGE_KEY_STUDIED_WORDS, JSON.stringify(studiedWords.value));
    };

    const updateStudiedList = (words: COMMON.Word[]) => {
        studiedWords.value = [...studiedWords.value, ...words];
        localStorage.setItem(STORAGE_KEY_STUDIED_WORDS, JSON.stringify(studiedWords.value));
    };

    const deleteStudiedWords = (word: COMMON.Word) => {
        studiedWords.value = studiedWords.value.filter((item: COMMON.Word) => item.word !== word.word);
        localStorage.setItem(STORAGE_KEY_STUDIED_WORDS, JSON.stringify(studiedWords.value));
    };

    const countStudiedWords = computed((): UnwrapRef<number> => {
        return studiedWords.value.length;
    });

    const setFavoritesWord = () => {
        favoritesWords.value = JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES_WORDS) || '[]');
    };

    const updateFavoritesWord = (word: COMMON.Word) => {
        favoritesWords.value.push(word);
        localStorage.setItem(STORAGE_KEY_FAVORITES_WORDS, JSON.stringify(favoritesWords.value));
    };

    const deleteFavoritesWord = (word: COMMON.Word) => {
        favoritesWords.value = favoritesWords.value.filter((item: COMMON.Word) => item.word !== word.word);
        localStorage.setItem(STORAGE_KEY_FAVORITES_WORDS, JSON.stringify(favoritesWords.value));
    };

    const countFavoritesWords = computed((): UnwrapRef<number> => {
        return favoritesWords.value.length;
    });

    const checkFavorite = (word: COMMON.Word): boolean => {
        return !!favoritesWords.value.find((item) => item.word === word.word);
    }

    return {
        vocabularyList,
        studiedWords,
        favoritesWords,
        isStudiedView,
        countFavoritesWords,
        countStudiedWords,
        updateFavoritesWord,
        setFavoritesWord,
        deleteFavoritesWord,
        updateStudiedWords,
        updateStudiedList,
        setStudiedWords,
        deleteStudiedWords,
        setVocabularyView,
        checkFavorite,
    };
});
