import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sharedDraft: "",
  paraphrase: { input: {}, output: {} },
  humanize: { input: {}, output: {} },
  grammarFix: { input: {}, output: {} },
  summarize: { input: {}, output: {} },
  translator: { input: {}, output: {} },
};

const inputOutputSlice = createSlice({
  name: "inputOutput",
  initialState,
  reducers: {
    setSharedDraft: (state, action) => {
      state.sharedDraft = action.payload || "";
    },
    setParaphraseValues: (state, action) => {
      state.paraphrase[action.payload.type] = { ...action.payload.values };
    },
    setHumanizedValues: (state, action) => {
      state.humanize[action.payload.type] = { ...action.payload.values };
    },
    setGrammarFixValues: (state, action) => {
      state.grammarFix[action.payload.type] = { ...action.payload.values };
    },
    setSummarizeValues: (state, action) => {
      state.summarize[action.payload.type] = { ...action.payload.values };
    },
    setTranslatorValues: (state, action) => {
      state.translator[action.payload.type] = { ...action.payload.values };
    },
  },
});

export const {
  setSharedDraft,
  setParaphraseValues,
  setHumanizedValues,
  setGrammarFixValues,
  setSummarizeValues,
  setTranslatorValues,
} = inputOutputSlice.actions;
export default inputOutputSlice.reducer;
