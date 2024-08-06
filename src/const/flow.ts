import WordsCardSelect from "@/components/words/card/WordsCardSelect.vue";
import WordsListSelect from "@/components/words/list/WordsListSelect.vue";

export enum ActiveFlowWords {
    Random = 'Random',
    Card = 'Card',
    List = 'List',
    Img = 'Img',
}

export enum ViewCardWords {
    Card = 'Card',
    List = 'List'
}

export const VIEW_CARD_WORDS = {
    Card: WordsCardSelect,
    List: WordsListSelect
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