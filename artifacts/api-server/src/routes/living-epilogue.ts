import { Router, Request, Response } from "express";

export interface RadioBroadcast {
  id: string;
  station: string;
  frequencyMhz: number;
  broadcastDate: string;
  headline: string;
  audioDurationSec: number;
  staticNoiseRatio: number; // 0.0 - 1.0
  speaker: string;
  transcriptBn: string;
  transcriptEn: string;
}

export interface NewspaperClipping {
  id: string;
  newspaperName: string;
  newspaperNameBn: string;
  date: string;
  issueNo: string;
  priceText: string;
  headline: string;
  headlineBn: string;
  byline: string;
  columnTextBn: string;
  leadParagraph: string;
  clippingStyle: "yellowed_vintage" | "modern_tabloid" | "underground_leaflet";
}

export interface SeasonalEpilogueLetter {
  id: string;
  title: string;
  titleBn: string;
  seasonOrFestival: "monsoon" | "pohela_boishakh" | "winter_mist" | "eid_reunion";
  seasonLabelBn: string;
  sender: string;
  recipient: string;
  unlockCondition: string;
  isUnlocked: boolean;
  letterProseBn: string;
}

export const MOCK_RADIO_BROADCASTS: RadioBroadcast[] = [
  {
    id: "radio_betar_bulletin",
    station: "বাংলাদেশ বেতার (Dhaka 'Ka' Waveband)",
    frequencyMhz: 100.8,
    broadcastDate: "১৬ সেপ্টেম্বর, রাত ১০:৩০",
    headline: "বুড়িগঙ্গার ডকইয়ার্ডে মধ্যরাতের রহস্যময় বন্দুকযুদ্ধ: লাল শালু মোড়ানো সিন্ধুকের সন্ধান",
    audioDurationSec: 48,
    staticNoiseRatio: 0.25,
    speaker: "সংবাদ পাঠক: নাসির আহমেদ",
    transcriptBn: "এইমাত্র পাওয়া সংবাদে জানা গেছে, সদরঘাটের তিন নম্বর পন্টুনের কাছে নোঙর করা একটি মালবাহী ট্রলারে মধ্যরাতে আকস্মিক গোলাগুলির ঘটনা ঘটেছে। প্রত্যক্ষদর্শীদের ভাষ্যমতে, হলুদ পাঞ্জাবি পরিহিত এক ভবঘুরেকে নদীর ঘাটে দেখা যাওয়ার পরপরই সদরঘাট পুলিশ ফাঁড়ির একটি দল ঘটনাস্থলে পৌঁছায়। একটি প্রাচীন তাম্রলিপিযুক্ত ভারী সিন্ধুক নদীগর্ভ থেকে উদ্ধার করা হয়েছে বলে অসমর্থিত সূত্রে জানা গেছে। বিস্তারিত শুনবেন আগামীকালের প্রাত্যহিকী সংবাদে।",
    transcriptEn: "Breaking bulletin: Midnight gunshots reported near Sadarghat Pontoon #3. Witnesses report seeing a wandering man in a yellow panjabi right before harbor police secured a sunken brass-bound relic chest from the Buriganga."
  },
  {
    id: "radio_police_scanner",
    station: "Dhaka Metropolitan Police VHF Band 4",
    frequencyMhz: 154.2,
    broadcastDate: "১৭ সেপ্টেম্বর, ভোর ০৪:১৫",
    headline: "ওয়ারলেস ইন্টারসেপ্ট: চকবাজার থেকে লালবাগ রোড নাশকতাবিরোধী অ্যালার্ট",
    audioDurationSec: 32,
    staticNoiseRatio: 0.42,
    speaker: "কন্ট্রোল রুম ডিসপ্যাচ ও ওসি রফিক",
    transcriptBn: "কন্ট্রোল টু টাইগার-ওয়ান... টাইগার-ওয়ান, রেসপন্ড করুন... কিন ব্রিজের দিকে একটি কালো টয়োটা মাইক্রোবাস তীব্র গতিতে বেরিয়ে গেছে... সন্দেহভাজনদের কাছে ওয়েবলি রিভলভার থাকতে পারে... ওভার অ্যান্ড আউট!",
    transcriptEn: "Control to Tiger-One... Tiger-One, respond... Black Toyota microbus fled towards Keane Bridge at high velocity... suspects may be armed with Webley revolvers... Over and out!"
  }
];

export const MOCK_NEWSPAPER_CLIPPINGS: NewspaperClipping[] = [
  {
    id: "clip_ittefaq_1994",
    newspaperName: "The Daily Ittefaq",
    newspaperNameBn: "দৈনিক ইত্তেফাক",
    date: "১৮ আশ্বিন, ১৪০১ বঙ্গাব্দ",
    issueNo: "বর্ষ ৪২, সংখ্যা ২৫৪",
    priceText: "মূল্য: চার টাকা মাত্র",
    headline: "Mystery Deepens Around Buriganga Dockyard Vault",
    headlineBn: "বুড়িগঙ্গার তলদেশ থেকে উদ্ধারকৃত জমিদারি সিন্দুক ঘিরে তোলপাড়: প্রত্নতত্ত্ব অধিদপ্তরের জরুরি তদন্ত",
    byline: "বিশেষ প্রতিবেদক, পুরান ঢাকা ব্যুরো",
    leadParagraph: "গতকাল বিকেলে বুড়িগঙ্গা নদীর গভীর জলরাশি থেকে নৌবাহিনীর ডুবুরি দলের সহায়তায় উদ্ধার করা হয়েছে শতবর্ষ প্রাচীন এক তাম্রফলকযুক্ত সিন্ধুক।",
    columnTextBn: "পুলিশ প্রশাসন নিশ্চিত করেছে যে উদ্ধারকৃত সিন্ধুকের গায়ে খোদাই করা রয়েছে ১৯২৪ সালের জমিদার দেবেন্দ্রনাথ রায়ের রাজকীয় প্রতীক। ধারণা করা হচ্ছে, এর ভেতরে নিহিত রয়েছে ব্রিটিশ বিরোধী বিপ্লবীদের গোপন তহবিল সংক্রান্ত দলিল। স্থানীয়দের একাংশের দাবি, গত এক সপ্তাহ ধরে বুড়িগঙ্গার তীরে এক রহস্যময় জোছনা-সন্ধানী তরুণকে খালি পায়ে হাঁটতে দেখা গিয়েছিল। সে-ই নাকি মাঝিদের নদীর তলদেশে এই ডুবন্ত গুপ্তধনের অবস্থান বাতলে দেয়। ওসি রফিক জানিয়েছেন, তদন্ত স্বার্থে সিন্ধুকটি লালবাগ দুর্গার মালখানায় কড়া পুলিশি পাহারায় স্থানান্তর করা হয়েছে।",
    clippingStyle: "yellowed_vintage"
  },
  {
    id: "clip_dainik_bangla",
    newspaperName: "Dainik Bangla",
    newspaperNameBn: "দৈনিক বাংলা",
    date: "১৯ আশ্বিন, ১৪০১ বঙ্গাব্দ",
    issueNo: "বর্ষ ৩০, সংখ্যা ১২০",
    priceText: "মূল্য: তিন টাকা পঞ্চাশ পয়সা",
    headline: "Police Foil Smuggling Ring at Surma River Gate",
    headlineBn: "সুরমা নদী থেকে নিষিদ্ধ প্রত্নসম্পদ পাচারচক্রের দুই সদস্য আটক",
    byline: "সিলেট প্রতিনিধি",
    leadParagraph: "সিলেটের কিন ব্রিজের তলদেশে ভোররাতে অভিযান চালিয়ে পুলিশ ঐতিহাসিক মুদ্রা ও দলিলের একটি চালান জব্দ করেছে।",
    columnTextBn: "চা বাগান সংলগ্ন নদীপথে চোরাইপথে সীমান্ত পাচারের আগেই জেলা পুলিশের স্পেশাল স্কোয়াড তাদের ঘেরাও করে। উদ্ধারকৃত মালামালের আনুমানিক আন্তর্জাতিক মূল্য কয়েক কোটি টাকা। আটকদের একজন নিজেকে জমিদারের সাবেক খাস দেওয়ানের বংশধর বলে দাবি করেছে।",
    clippingStyle: "yellowed_vintage"
  }
];

export const MOCK_SEASONAL_LETTERS: SeasonalEpilogueLetter[] = [
  {
    id: "letter_monsoon_rain",
    title: "Monsoon Downpour at Nilkhet Footpath",
    titleBn: "শ্রাবণের অঝোর ধারায় নীলক্ষেতের পুরান বইয়ের দোকান",
    seasonOrFestival: "monsoon",
    seasonLabelBn: "বর্ষাকালীন বিশেষ পরিশিষ্ট (Monsoon Living Epilogue)",
    sender: "হিমু (Himu)",
    recipient: "রূপা (Rupa)",
    unlockCondition: "উপন্যাসের দ্বাদশ অধ্যায় সম্পূর্ণ পাঠ করার পর আনলক",
    isUnlocked: true,
    letterProseBn: "রূপা,\nশ্রাবণ মাসের বৃষ্টিতে নীলক্ষেতের ফুটপাতে দাঁড়িয়ে আছি। টিনের চাল দিয়ে টপটপ করে পানি পড়ছে একটা পুরনো লাল কভারের উপন্যাসের ওপর। দোকানের বুড়ো লোকটি কেরোসিনের চুলায় চা বসাচ্ছে। আজ রাতে আকাশ ভেঙে বৃষ্টি নামবে। যদি পারো, তোমার বেলকনির নীল পর্দাটা একটু সরিয়ে দেখো—মেঘের আড়ালে একটা অদ্ভুত হলুদ ছায়া ভেসে বেড়াচ্ছে। আমি হয়তো কাল ভোরে ট্রেনে উঠে পড়ব। সুরমা নদীর জল এখন নিশ্চয়ই ঘোলাটে।"
  },
  {
    id: "letter_winter_mist",
    title: "Midnight Encounter in Winter Mist",
    titleBn: "কুয়াশাচ্ছন্ন ধানমন্ডি লেকের পাড়ে শেষ পদধ্বনি",
    seasonOrFestival: "winter_mist",
    seasonLabelBn: "শীতকালীন পরিশিষ্ট (Winter Mist Living Epilogue)",
    sender: "ওসি রফিক (OC Rafiq)",
    recipient: "আরাফাত (Arafat)",
    unlockCondition: "রিয়েল-ওয়ার্ল্ড ডিসেম্বর/জানুয়ারি মাসের রিডিং সেশনে আনলক",
    isUnlocked: false,
    letterProseBn: "আরাফাত,\nশীতের কুয়াশায় পুরান ঢাকার অলিগলি এখন রাত দশটা বাজতেই শুনশান হয়ে যায়। আমি রিভলভারটা ডিউটি টেবিলে রেখে ধোঁয়া ওঠা চায়ের কাপে চুমুক দিচ্ছি। সেই রাতের সিন্ধুকের রহস্য হয়তো আমরা পুরোপুরি উন্মোচন করতে পারিনি, তবে নদীর বাতাসে আজও যেন বারুদের হালকা গন্ধ রয়ে গেছে..."
  }
];

export function generateLivingEpilogueProse(
  type: "radio_broadcast" | "newspaper_clipping" | "seasonal_letter",
  character = "হিমু",
  topic = "বুড়িগঙ্গার রহস্য"
): string {
  if (type === "radio_broadcast") {
    return `[বেতার স্ট্যাটিক ঘড়ঘড় শব্দ... টিউন করা হচ্ছে ১০০.৮ মেগাহার্টজ]\n\n"শ্রোতাবন্ধুরা, বাংলাদেশ বেতারের নৈশ বুলেটিনে আপনাদের স্বাগত। আজ মধ্যরাতে ${topic}-কে ঘিরে সদরঘাট টার্মিনালে যে শ্বাসরুদ্ধকর পরিস্থিতির সৃষ্টি হয়েছিল, তার নেপথ্যে ${character}-এর উপস্থিতি নতুন মাত্রা যোগ করেছে..."`;
  }
  if (type === "newspaper_clipping") {
    return `[দৈনিক ইত্তেফাক • বিশেষ ক্রাইম ডেস্ক]\n\nশিরোনাম: ${topic} ও রাতের শেষ ট্রলার\nপ্রতিবেদক: স্টাফ রিপোর্টার\n\nগত মধ্যরাতে ঘন কুয়াশায় নিমজ্জিত নদীঘাট থেকে উদ্ধার করা হয়েছে এক বিস্ময়কর আলামত। স্থানীয় বাসিন্দারা জানান, ${character}-এর একটি চিরকুট নদীর ঘাটে ফেলে যাওয়া হয়েছিল, যা তদন্তকারী কর্মকর্তাদের নজরে এসেছে...`;
  }
  return `${character}-এর চিঠি:\n\n"প্রিয় পাঠক,\nউপন্যাসের শেষ পৃষ্ঠাটি হয়তো আপনি উল্টে ফেলেছেন, কিন্তু নদীর জল এখনও বয়ে চলেছে। কুয়াশার চাদর ভেদ করে দূর থেকে শোনা যাচ্ছে জাহাজের ভেঁপু। গল্প হয়তো এখানেই শেষ, কিন্তু নদীর গল্প কখনো থামে না..."`;
}

export function createLivingEpilogueRouter(): Router {
  const router = Router();

  const statePaths = ["/v1/projects/:projectId/living-epilogue", "/api/v1/projects/:projectId/living-epilogue"];
  router.get(statePaths, (req: Request, res: Response) => {
    res.json({
      success: true,
      projectId: req.params.projectId,
      radioBroadcasts: MOCK_RADIO_BROADCASTS,
      newspaperClippings: MOCK_NEWSPAPER_CLIPPINGS,
      seasonalLetters: MOCK_SEASONAL_LETTERS,
      currentSeason: "monsoon",
      unlockedCount: 3,
      totalCount: 5
    });
  });

  const genPaths = [
    "/v1/projects/:projectId/living-epilogue/generate",
    "/api/v1/projects/:projectId/living-epilogue/generate"
  ];
  router.post(genPaths, (req: Request, res: Response) => {
    const { epilogueType, character, topic } = req.body || {};
    const generatedProse = generateLivingEpilogueProse(
      epilogueType || "radio_broadcast",
      character || "হিমু",
      topic || "বুড়িগঙ্গার প্রাচীন দলিল"
    );

    res.json({
      success: true,
      projectId: req.params.projectId,
      epilogueType,
      generatedProse
    });
  });

  return router;
}

export const livingEpilogueRouter = createLivingEpilogueRouter();
