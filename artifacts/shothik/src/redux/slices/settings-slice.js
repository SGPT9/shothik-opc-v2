import { createSlice, current } from "@reduxjs/toolkit";

const LOCAL_STORAGE_KEY = "settings";

const defaultSetting = {
  theme: "dark",
  direction: "ltr",
  sidebar: "expanded",
  header: "expanded",
  layout: "vertical",

  // features settings
  demo: false,
  paraphraseOptions: {
    paraphraseQuotations: true,
    avoidContractions: true,
    preferActiveVoice: false,
    automaticStartParaphrasing: false,
    autoFreeze: false,
  },
  interfaceOptions: {
    useYellowHighlight: false,
    showTooltips: true,
    showChangedWords: true,
    showStructuralChanges: false,
    showLongestUnchangedWords: false,
  },
  humanizeOptions: {
    humanizeQuotations: true,
    avoidContractions: false,
    automaticStartHumanize: false,
  },
};

const initialState = { ...defaultSetting, _hydrated: false };

const saveState = (state) => {
  if (typeof window === "undefined") return;
  try {
    const rawState = current(state);
    const { _hydrated, ...rest } = rawState;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rest));
  } catch (e) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ theme: state.theme }));
    } catch (_) {}
  }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: initialState,
  reducers: {
    hydrateSettings(state) {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            Object.assign(state, saved);
          }
        } catch (e) {}
      }
      state._hydrated = true;
    },
    updateTheme(state, action) {
      state.theme = action.payload;
      saveState(state);
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveState(state);
    },

    updateSidebar(state, action) {
      state.sidebar = action.payload;
      saveState(state);
    },
    toggleSidebar(state) {
      state.sidebar = state.sidebar === "expanded" ? "compact" : "expanded";
      saveState(state);
    },

    updateHeader(state, action) {
      state.header = action.payload;
      saveState(state);
    },
    toggleHeader(state) {
      state.header = state.header === "expanded" ? "compact" : "expanded";
      saveState(state);
    },

    updateLayout(state, action) {
      state.layout = action.payload;
      saveState(state);
    },
    updateDirection(state, action) {
      state.direction = action.payload;
      saveState(state);
    },

    // features settings reducers
    setDemo(state, action) {
      state.demo = action.payload;
      saveState(state);
    },
    toggleParaphraseOption(state, action) {
      const optionName = action.payload;
      if (optionName in state.paraphraseOptions) {
        state.paraphraseOptions[optionName] =
          !state.paraphraseOptions[optionName];
        saveState(state);
      }
    },
    toggleHumanizeOption(state, action) {
      const optionName = action.payload;
      if (optionName in state.humanizeOptions) {
        state.humanizeOptions[optionName] = !state.humanizeOptions[optionName];
        saveState(state);
      }
    },
    toggleInterfaceOption(state, action) {
      const optionName = action.payload;
      if (optionName in state.interfaceOptions) {
        state.interfaceOptions[optionName] =
          !state.interfaceOptions[optionName];
        saveState(state);
      }
    },
    resetSettings(state) {
      Object.assign(state, defaultSetting);
      saveState(state);
    },
  },
});

export const {
  hydrateSettings,
  updateTheme,
  toggleTheme,
  updateSidebar,
  toggleSidebar,
  updateHeader,
  toggleHeader,
  updateLayout,
  updateDirection,
  setDemo,
  toggleParaphraseOption,
  toggleHumanizeOption,
  toggleInterfaceOption,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
