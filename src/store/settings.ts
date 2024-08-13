import {defineStore} from 'pinia';
import {ref} from "vue";
import {STORAGE_KEY_THEME, ThemeType} from "@/const/const";

export const settingsStore = defineStore('settingsStore', () => {
	const isDarkMode = ref(true);

	const toggleMode = () => {
		isDarkMode.value = !isDarkMode.value;
		setClassMode();
	};

	const setMode = (theme: ThemeType) => {
		isDarkMode.value = theme === ThemeType.Dark;
		setClassMode();
	};

	const setClassMode = () => {
		document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value);
		document.documentElement.classList.toggle('ion-palette-light', !isDarkMode.value);
		const theme = isDarkMode.value ? ThemeType.Dark : ThemeType.Light;
		localStorage.setItem(STORAGE_KEY_THEME, theme);
	};



	return {
		isDarkMode,
		toggleMode,
		setMode
	};
});
