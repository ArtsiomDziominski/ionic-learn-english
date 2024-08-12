import {defineStore} from 'pinia';
import {ref} from "vue";
import {ThemeType} from "@/const/const";

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
		console.log('se');
		document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value);
		document.documentElement.classList.toggle('ion-palette-light', !isDarkMode.value);
	};



	return {
		isDarkMode,
		toggleMode,
		setMode
	};
});
