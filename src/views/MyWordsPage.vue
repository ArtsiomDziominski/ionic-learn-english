<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import { useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { plural } from '@/core/dates';
import { pickTextFile, shareFile } from '@/core/share';
import { groupFileName, parseGroupFile, serializeGroupFile, suggestTranslation, type WordGroup } from '@/core/myWords';
import { trackEvent } from '@/utils/analytics';
import { useSEO } from '@/composables/useSEO';
import PageTopBar from '@/components/PageTopBar.vue';
import AppSheet from '@/components/ui/AppSheet.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';

const progress = useProgressStore();
const toast = useToastStore();
const router = useIonRouter();

/* Тексты продублированы в scripts/prerender.mjs */
useSEO({
  title: 'Свои английские слова: учите слова из сериалов и книг | learnenglisheasy.ru',
  description: 'Добавляйте свои английские слова из сериалов, книг и работы, разбивайте их на группы и учите с интервальным повторением. Делитесь группами слов с друзьями. Бесплатно и без регистрации.',
  keywords: 'свои слова английский, добавить слова, учить слова из сериалов, списки слов английский, карточки со своими словами, интервальное повторение',
  url: 'https://www.learnenglisheasy.ru/my-words',
});

const groups = computed(() => progress.groups);
const words = (n: number): string => `${n} ${plural(n, 'слово', 'слова', 'слов')}`;

/* ——— Новая группа ——— */
const creating = ref(false);
const newName = ref('');
const openId = ref<string | null>(null);

const create = (): void => {
  const group = progress.createGroup(newName.value);
  if (!group) {
    toast.show('Групп уже слишком много', 'error');
    return;
  }
  trackEvent('mywords_group_create');
  creating.value = false;
  newName.value = '';
  openId.value = group.id;
};

/* ——— Слова ——— */
const draftWord = ref('');
const draftTranslation = ref('');
const hint = computed(() => suggestTranslation(draftWord.value));

const toggle = (id: string): void => {
  openId.value = openId.value === id ? null : id;
  draftWord.value = '';
  draftTranslation.value = '';
};

const addWord = (group: WordGroup): void => {
  const error = progress.addMyWord(group.id, draftWord.value, draftTranslation.value || hint.value);
  if (error) {
    toast.show(error, 'error');
    return;
  }
  trackEvent('mywords_word_add');
  draftWord.value = '';
  draftTranslation.value = '';
};

const learnedOf = (group: WordGroup): number => progress.groupLearned(group);

/* ——— Шаринг и загрузка ——— */
const share = async (group: WordGroup): Promise<void> => {
  try {
    const outcome = await shareFile({
      name: groupFileName(group),
      mime: 'application/json',
      content: serializeGroupFile(group),
      title: `Слова: ${group.name}`,
      text: `Группа слов «${group.name}». Откройте learnenglisheasy.ru → Практика → Мои слова → «Загрузить группу».`,
    });
    if (outcome === 'downloaded') toast.show('Файл группы сохранён в «Загрузки»', 'success', 'check');
    if (outcome !== 'cancelled') trackEvent('mywords_group_share', { words: group.words.length, outcome });
  } catch (error) {
    console.warn(error);
    toast.show('Не получилось. Попробуйте ещё раз', 'error');
  }
};

const load = async (): Promise<void> => {
  const file = await pickTextFile();
  if (!file) return;
  const parsed = parseGroupFile(file.text);
  if (!parsed.ok) {
    toast.show(parsed.error, 'error');
    return;
  }
  const group = progress.createGroup(parsed.name, parsed.words);
  if (!group) {
    toast.show('Групп уже слишком много', 'error');
    return;
  }
  openId.value = group.id;
  toast.show(`Группа «${group.name}»: ${words(group.words.length)}`, 'success', 'check');
  trackEvent('mywords_group_import', { words: group.words.length });
};

/* ——— Переименование и удаление ——— */
const renaming = ref<WordGroup | null>(null);
const renameValue = ref('');
const deleting = ref<WordGroup | null>(null);

const startRename = (group: WordGroup): void => {
  renaming.value = group;
  renameValue.value = group.name;
};

const rename = (): void => {
  if (renaming.value) progress.renameGroup(renaming.value.id, renameValue.value);
  renaming.value = null;
};

const remove = (): void => {
  if (deleting.value) progress.deleteGroup(deleting.value.id);
  deleting.value = null;
};

const learn = (group: WordGroup): void => {
  if (group.words.length) router.push(`/lesson/group-${group.id}`);
};
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Мои слова" back />
    </ion-header>

    <ion-content>
      <div class="page stack">
        <section class="hero card">
          <LexiMascot view="threeQuarter" mood="talk" :size="104" />
          <div class="grow">
            <h2 class="hero__title">Слова из жизни</h2>
            <p class="muted">Добавляйте слова из сериалов, книг и с работы. Выученные попадут в общее повторение, а группой можно поделиться файлом.</p>
          </div>
        </section>

        <div class="actions">
          <button type="button" class="btn btn--sm" @click="creating = true">Новая группа</button>
          <button type="button" class="btn btn--secondary btn--sm" @click="load">Загрузить группу</button>
        </div>

        <form v-if="creating" class="card new" @submit.prevent="create">
          <input v-model="newName" class="field" type="text" maxlength="40" placeholder="Название, например «Friends, 1 сезон»" aria-label="Название группы" autofocus />
          <div class="actions">
            <button type="submit" class="btn btn--green btn--sm">Создать</button>
            <button type="button" class="btn btn--ghost btn--sm" @click="creating = false">Отмена</button>
          </div>
        </form>

        <p v-if="!groups.length && !creating" class="empty muted">Групп пока нет. Создайте первую или загрузите файл, которым с вами поделились.</p>

        <section v-for="group in groups" :key="group.id" class="group card">
          <div class="group__head">
            <button type="button" class="group__toggle grow" :aria-expanded="openId === group.id" @click="toggle(group.id)">
              <span class="group__name">{{ group.name }}</span>
              <span class="group__meta muted">{{ words(group.words.length) }} · выучено {{ learnedOf(group) }}</span>
            </button>
            <button type="button" class="btn btn--green btn--sm" :disabled="!group.words.length" @click="learn(group)">Учить</button>
          </div>

          <div v-if="openId === group.id" class="group__body">
            <form class="add" @submit.prevent="addWord(group)">
              <input v-model="draftWord" class="field" type="text" lang="en" maxlength="60" placeholder="Слово по-английски" aria-label="Слово по-английски" autocapitalize="off" autocomplete="off" spellcheck="false" />
              <input v-model="draftTranslation" class="field" type="text" lang="ru" maxlength="120" :placeholder="hint || 'Перевод'" aria-label="Перевод" autocomplete="off" />
              <button type="submit" class="btn btn--sm" :disabled="!draftWord.trim() || !(draftTranslation.trim() || hint)">Добавить</button>
            </form>
            <p v-if="hint && !draftTranslation" class="add__hint muted">Перевод из словаря: {{ hint }}. Можно оставить или написать свой.</p>

            <ul v-if="group.words.length" class="words">
              <li v-for="w in group.words" :key="w.word" class="word">
                <span class="word__en" lang="en">{{ w.word }}</span>
                <span class="word__ru grow muted">{{ w.translation }}</span>
                <button type="button" class="word__del" :aria-label="`Удалить ${w.word}`" @click="progress.removeMyWord(group.id, w.word)">×</button>
              </li>
            </ul>

            <div class="actions">
              <button type="button" class="btn btn--secondary btn--sm" :disabled="!group.words.length" @click="share(group)">Поделиться</button>
              <button type="button" class="btn btn--secondary btn--sm" @click="startRename(group)">Переименовать</button>
              <button type="button" class="btn btn--secondary btn--sm danger" @click="deleting = group">Удалить</button>
            </div>
          </div>
        </section>
      </div>
    </ion-content>

    <AppSheet :open="!!renaming" label="Переименовать группу" @close="renaming = null">
      <form class="confirm" @submit.prevent="rename">
        <h2 class="confirm__title">Новое название</h2>
        <input v-model="renameValue" class="field" type="text" maxlength="40" aria-label="Название группы" />
        <button type="submit" class="btn btn--block">Сохранить</button>
        <button type="button" class="btn btn--block btn--ghost" @click="renaming = null">Отмена</button>
      </form>
    </AppSheet>

    <AppSheet :open="!!deleting" label="Удалить группу?" @close="deleting = null">
      <div class="confirm">
        <LexiMascot mood="sad" :size="110" />
        <h2 class="confirm__title">Удалить «{{ deleting?.name }}»?</h2>
        <p class="muted">Слова группы и их прогресс исчезнут, если их нет в других группах. Чтобы не потерять группу, сначала поделитесь ею.</p>
        <button type="button" class="btn btn--block btn--red" @click="remove">Удалить</button>
        <button type="button" class="btn btn--block btn--ghost" @click="deleting = null">Отмена</button>
      </div>
    </AppSheet>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.hero {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__title { font-size: 1.15rem; }

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.actions .btn { flex: 1; }

.new,
.group__body,
.confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  padding: 18px 4px;
  text-align: center;
}

.group { padding: 12px 14px; }

.group__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group__toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 4px 0;
  border: none;
  background: none;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.group__name {
  font-size: 1.05rem;
  font-weight: 900;
  word-break: break-word;
}

.group__meta { font-size: 0.86rem; }

.group__body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid var(--line);
}

.add {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.add__hint { font-size: 0.85rem; }

@media (max-width: 480px) {
  .add { grid-template-columns: 1fr; }
}

.words {
  margin: 0;
  padding: 0;
  list-style: none;
}

.word {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border-bottom: 2px solid var(--line);
}

.word:last-child { border-bottom: none; }

.word__en { font-weight: 800; }

.word__ru {
  font-size: 0.92rem;
  word-break: break-word;
}

.word__del {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-subtle);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.danger { --btn-fg: var(--red-ink); }

.confirm { align-items: center; text-align: center; }
.confirm .field { text-align: left; }
.confirm__title { font-size: 1.2rem; }
</style>
