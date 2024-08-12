import WordsCardSelect from "@/components/words/card/WordsCardSelect.vue";
import WordsListSelect from "@/components/words/list/WordsListSelect.vue";
import WordsLetterSelect from "@/components/words/letter/WordsLetterSelect.vue";
import WordsMatchSelect from "@/components/words/match/WordsMatchSelect.vue";

export enum ActiveFlowWords {
    Random = 'Random',
    Card = 'Card',
    List = 'List',
    Img = 'Img',
}

export enum ViewCardWords {
    Card = 'Card',
    List = 'List',
    Words = 'Words',
    Match = 'Match'
}

export const VIEW_CARD_WORDS = {
    [ViewCardWords.Card]: WordsCardSelect,
    [ViewCardWords.List]: WordsListSelect,
    [ViewCardWords.Words]: WordsLetterSelect,
    [ViewCardWords.Match]: WordsMatchSelect
}

export enum FlowWords {
    Random = 'Random',
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
}

export const VIEW_WORDS_TRANSLATION = [ViewCardWords.Words, ViewCardWords.List];