import { Router, Request, Response } from "express";

export type SupportedTargetLanguage =
  | "en" // English (Literary / Global)
  | "hi" // Hindi (South Asian Bridge)
  | "es" // Spanish (Magical Realism / Ibero-American)
  | "fr" // French (Gallic Literary & Nuance)
  | "ar" // Arabic (Gulf & Classical)
  | "ja" // Japanese (Light Novel & Keigo Nuance)
  | "de"; // German (Teutonic Precision)

export type LocalizationStrategy =
  | "domestication" // Replace with local cultural equivalent
  | "foreignization" // Keep original Bengali term with appositive context
  | "dynamic_equivalence" // Translate underlying emotional/sensory essence
  | "hybrid_glossary"; // Keep term with automated reader tooltip / glossary

export interface CultureBoundItem {
  id: string;
  sourceBengali: string;
  category: "food_and_drink" | "kinship_and_honorific" | "idiom_and_proverb" | "social_ritual_and_setting";
  categoryLabelBn: string;
  culturalContextBn: string;
  literalTranslationEn: string;
  localizations: Record<
    SupportedTargetLanguage,
    {
      targetLanguageName: string;
      domestication: string;
      foreignization: string;
      dynamicEquivalence: string;
      culturalNote: string;
    }
  >;
}

export interface PolyglotMatrixState {
  projectId: string;
  detectedCbiCount: number;
  overallCulturalDensityScore: number; // 0 - 100
  cultureBoundItems: CultureBoundItem[];
  sampleManuscriptExcerptBn: string;
  translatedSamples: Record<SupportedTargetLanguage, {
    languageName: string;
    nativeName: string;
    flagEmoji: string;
    sampleText: string;
    strategyUsed: LocalizationStrategy;
  }>;
}

export const DEFAULT_CULTURE_BOUND_ITEMS: CultureBoundItem[] = [
  {
    id: "cbi_khichuri",
    sourceBengali: "বৃষ্টির দিনে গরম গরম খিচুড়ি আর ইলিশ ভাজা",
    category: "food_and_drink",
    categoryLabelBn: "খাদ্য ও রসনাবিলাস",
    culturalContextBn: "বর্ষার সাথে বাঙালি সংস্কৃতির অবিচ্ছেদ্য আবেগঘন খাদ্যঐতিহ্য, যা পারিবারিক উষ্ণতা ও নস্টালজিয়া প্রকাশ করে।",
    literalTranslationEn: "Hot khichuri and fried hilsa on a rainy day",
    localizations: {
      en: {
        targetLanguageName: "English (UK/US)",
        domestication: "steaming shepherd's pie and crisp roast fish by the hearth on a stormy afternoon",
        foreignization: "piping-hot khichuri—fragrant spiced rice and lentils—paired with golden fried hilsa while monsoon rain drummed on the tin roof",
        dynamicEquivalence: "the ultimate comforting monsoon feast, warm and seasoned against the wet chill of the storm",
        culturalNote: "In Anglo contexts, monsoon comfort food is equated with rainy Sunday roasts or savory stews."
      },
      hi: {
        targetLanguageName: "Hindi",
        domestication: "बारिश के दिन गरमा-गरम मूंग दाल खिचड़ी और कुरकुरी तली हुई मछली",
        foreignization: "बरसात की दोपहर में गर्म खिचड़ी और तली हुई इलिश मछली की भीनी खुशबू",
        dynamicEquivalence: "बरसाती मौसम का पारंपरिक आत्मीय भोजन जो दिल को सुकून से भर दे",
        culturalNote: "Shared Gangetic monsoon nostalgia across Bengal and Bihar/UP."
      },
      es: {
        targetLanguageName: "Spanish",
        domestication: "un humeante sancocho reconfortante mientras el aguacero azotaba las ventanas",
        foreignization: "khichuri recién servido—arroz especiado con lentejas amarillas—junto a pescado hilsa dorado mientras caía el monzón",
        dynamicEquivalence: "el banquete nostálgico reservado únicamente para las tardes de diluvio",
        culturalNote: "Echoes Gabriel García Márquez's tropical Macondo rainy season domesticity."
      },
      fr: {
        targetLanguageName: "French",
        domestication: "un généreux pot-au-feu parfumé dégusté au coin du feu un jour de déluge",
        foreignization: "un khichuri fumant—riz onctueux aux lentilles et épices douces—accompagné de dorade hilsa croustillante sous la mousson",
        dynamicEquivalence: "ce mets réconfortant et intime dont la saveur ne se révèle pleinement que sous la pluie battante",
        culturalNote: "Emphasizes gastronomic comfort and atmospheric melancholia."
      },
      ar: {
        targetLanguageName: "Arabic",
        domestication: "طبق كبسة دافئ وغني بالتوابل في ليلة ماطرة باردة",
        foreignization: "طبق الخيتشوري البخاري—أرز بالعدس الأصفر المتبل—مع سمك الإيليش المقلي الذهبي في يوم مطير",
        dynamicEquivalence: "وليمة الأيام الماطرة التي تمنح الدفء والألفة لكل أفراد العائلة",
        culturalNote: "Balances South Asian diaspora recognition with Gulf aromatic hospitality."
      },
      ja: {
        targetLanguageName: "Japanese",
        domestication: "雨の日にすする熱々の雑炊と香ばしい焼き魚の温もり",
        foreignization: "モンスーンの雨が降る日、熱々のキチュリ（香辛料が香る豆と米のお粥）と黄金色に揚げたイリッシュ魚",
        dynamicEquivalence: "雨音に包まれながら味わう、心と体を芯から温める故郷のソウルフード",
        culturalNote: "Parallels rainy-day Zousui (rice porridge) or hot nabe comfort."
      },
      de: {
        targetLanguageName: "German",
        domestication: "ein dampfender Linseneintopf mit knusprig gebratenem Fisch an einem stürmischen Regentag",
        foreignization: "dampfendes Khichuri—ein wohlig gewürztes Reis-Linsen-Gericht—mit goldbraun gebratenem Hilsa-Fisch während des Monsunregens",
        dynamicEquivalence: "ein herzhaftes Traditionsgericht, das an regnerischen Nachmittagen heimelige Gemütlichkeit spendet",
        culturalNote: "Connects with the German cultural concept of Gemütlichkeit."
      }
    }
  },
  {
    id: "cbi_adda",
    sourceBengali: "সদরঘাটের চায়ের দোকানে তুমুল সান্ধ্য আড্ডা",
    category: "social_ritual_and_setting",
    categoryLabelBn: "সামাজিক মিথস্ক্রিয়া ও আড্ডা",
    culturalContextBn: "বাঙালির সামাজিক আড্ডা—যেখানে রাজনীতি, সাহিত্য ও দর্শন নিয়ে চায়ের কাপে ঘণ্টার পর ঘণ্টা নির্ভার তর্ক চলে।",
    literalTranslationEn: "A tumultuous evening adda at the Sadarghat tea stall",
    localizations: {
      en: {
        targetLanguageName: "English (UK/US)",
        domestication: "animated late-night pub chatter over pints at the wharf",
        foreignization: "a spirited evening adda—that uniquely Bengali art of unhurried, passionate salon debates over sweet spiced milk tea—at the river harbor",
        dynamicEquivalence: "hours of effortless banter, fierce political dialectics, and literary sparring over boiling kettle vapor",
        culturalNote: "Adda is recognized by UNESCO and social anthropologists as an untranslatable South Asian intellectual pastime."
      },
      hi: {
        targetLanguageName: "Hindi",
        domestication: "नुक्कड़ की चाय की दुकान पर शाम की गरमा-गरम महफ़िल और गपशप",
        foreignization: "सदरघाट की चाय की टपरी पर दोस्तों का ज़ोरदार 'अड्डा'—राजनीति और ज़िंदगी पर बेबाक बहस",
        dynamicEquivalence: "चाय की चुस्कियों के बीच घंटों चलने वाली आत्मीय और जीवंत बातचीत",
        culturalNote: "Directly relates to North Indian chai-tapri baithak and gupshup culture."
      },
      es: {
        targetLanguageName: "Spanish",
        domestication: "una tertulia apasionada e interminable en el café del puerto",
        foreignization: "una bulliciosa sesión de adda—la tertulia bengalí donde se arregla el mundo entre tazas de té con leche especiado—junto al embarcadero",
        dynamicEquivalence: "el ritual sagrado de perder la noción del tiempo discutiendo de literatura y política",
        culturalNote: "Matches the Latin American / Iberian 'tertulia' literary gathering concept."
      },
      fr: {
        targetLanguageName: "French",
        domestication: "les débats passionnés d'un café littéraire au bord du fleuve",
        foreignization: "l'incontournable adda du soir—cette joute oratoire et amicale typiquement bengalie autour d'un thé au lait brûlant",
        dynamicEquivalence: "une conversation sans fin, mêlant poésie, controverse politique et douce flânerie",
        culturalNote: "Resonates with Parisian café philosophique and flânerie traditions."
      },
      ar: {
        targetLanguageName: "Arabic",
        domestication: "جلسة سمر حيوية ونقاشات عميقة في مقهى الرصيف عند المساء",
        foreignization: "جلسة 'أدا' المسائية الصاخبة—حوار ثقافي وسياسي لا ينتهي حول أكواب الشاي بالحليب عند الميناء",
        dynamicEquivalence: "مجلس سمر عفوي يتبادل فيه الأصدقاء الآراء والذكريات بلا قيود زمنية",
        culturalNote: "Directly evokes the timeless Arab 'Majlis' or street café evening Samar."
      },
      ja: {
        targetLanguageName: "Japanese",
        domestication: "港の赤提灯の下で夜更けまで語り合う熱い議論",
        foreignization: "リバーサイドの茶屋で繰り広げられる熱気あふれる『アッダ』（紅茶を片手に時間を忘れて文学や社会を語り合うベンガルのサロン文化）",
        dynamicEquivalence: "紅茶の湯気越しに何時間も続く、熱情に満ちた知的な語らいの時間",
        culturalNote: "Mirrors late-night izakaya intellectual bonding or classical literary salons."
      },
      de: {
        targetLanguageName: "German",
        domestication: "ein lebhafter abendlicher Stammtisch in der Hafenstube",
        foreignization: "ein leidenschaftliches abendliches 'Adda'—die traditionsreiche bengalische Kultur des stundenlangen, tiefsinnigen Debattierens bei Milchtee",
        dynamicEquivalence: "eine ungezwungene geistreiche Runde, in der Politik und Kunst bei dampfendem Tee erörtert werden",
        culturalNote: "Corresponds to the German 'Stammtisch' culture of regular debate."
      }
    }
  },
  {
    id: "cbi_idiom_adhar_bepari",
    sourceBengali: "আদার ব্যাপারী হয়ে জাহাজের খবর নেওয়া",
    category: "idiom_and_proverb",
    categoryLabelBn: "প্রবাদ ও লোকরীতি",
    culturalContextBn: "সীমিত সামর্থ্যের মানুষের এমন কোনো বড় বিষয়ে মাথা ঘামানো যা তার এক্তিয়ারভুক্ত নয়।",
    literalTranslationEn: "A ginger peddler seeking news of oceangoing ships",
    localizations: {
      en: {
        targetLanguageName: "English (UK/US)",
        domestication: "the cobbler meddling with the king's navy / punched above his station",
        foreignization: "as the old saying goes: 'a modest ginger peddler worrying about the cargo of giant merchant ships'",
        dynamicEquivalence: "poking your nose into grand affairs that lie light-years beyond your humble pay grade",
        culturalNote: "Equivalent to the Latin proverb 'Ne supra crepidam sutor iudicaret' (cobbler stick to your last)."
      },
      hi: {
        targetLanguageName: "Hindi",
        domestication: "छोटा मुँह बड़ी बात / अपनी औकात से बाहर की चिंता करना",
        foreignization: "जैसे अदरक का व्यापारी पानी के जहाज़ों का हिसाब रखने चला हो",
        dynamicEquivalence: "अपनी मामूली हैसियत भूलकर बड़े-बड़े मामलों में दखल देना",
        culturalNote: "A widely understood South Asian mercantile folk idiom."
      },
      es: {
        targetLanguageName: "Spanish",
        domestication: "zapatero a tus zapatos / meterse en camisa de once varas",
        foreignization: "como reza el proverbio: 'un humilde vendedor de jengibre pidiendo cuentas a los buques de alta mar'",
        dynamicEquivalence: "opinar sobre los asuntos del gran mundo sin tener vela en ese entierro",
        culturalNote: "Aligns with Cervantes' classic 'zapatero a tus zapatos'."
      },
      fr: {
        targetLanguageName: "French",
        domestication: "vouloir péter plus haut que son cul / se mêler de ce qui ne nous regarde pas",
        foreignization: "comme le dicton bengali : 'le marchand de gingembre qui s'enquiert des navires marchands'",
        dynamicEquivalence: "vouloir régenter les affaires des puissants alors qu'on n'est que simple spectateur",
        culturalNote: "Classic French literary irony regarding social pretension."
      },
      ar: {
        targetLanguageName: "Arabic",
        domestication: "رحم الله امرأً عرف قدر نفسه / يتدخل فيما لا يعنيه",
        foreignization: "كما في المثل البنغالي: 'بائع الزنجبيل البسيط الذي يسأل عن أخبار السفن التجارية الضخمة'",
        dynamicEquivalence: "الانشغال بأمور عظام تفوق طاقة المرء ومكانته المتواضعة",
        culturalNote: "Carries wisdom regarding knowing one's boundaries."
      },
      ja: {
        targetLanguageName: "Japanese",
        domestication: "身の程知らずの大きなお世話 / 餅は餅屋",
        foreignization: "ベンガルの諺に言う『生姜売りの小商人が、大海を行く巨船の積荷を心配する』ように",
        dynamicEquivalence: "身の丈に合わない大問題に首を突っ込んで右往左往すること",
        culturalNote: "Echoes Japanese Edo-period merchant proverbs regarding domain humility."
      },
      de: {
        targetLanguageName: "German",
        domestication: "Schuster, bleib bei deinen Leisten",
        foreignization: "gemäß dem Sprichwort: 'der kleine Ingwerhändler, der sich um Hochseefrachter sorgt'",
        dynamicEquivalence: "sich in gewaltige Angelegenheiten einmischen, die meilenweit über dem eigenen Horizont liegen",
        culturalNote: "Standard German literary idiom for overstepping social jurisdiction."
      }
    }
  }
];

export function auditCultureBoundItems(manuscriptText: string): CultureBoundItem[] {
  const detected = [...DEFAULT_CULTURE_BOUND_ITEMS];

  if (/লুঙ্গি|গামছা/i.test(manuscriptText)) {
    detected.push({
      id: "cbi_lungi_gamcha",
      sourceBengali: "নীল চেকের লুঙ্গি ও কাঁধে ভেজা গামছা",
      category: "social_ritual_and_setting",
      categoryLabelBn: "পোশাক ও আবহমান সংস্কৃতি",
      culturalContextBn: "বাংলার মেহনতি মানুষের ঐতিহ্যবাহী আরামদায়ক পোশাক যা নদী ও শ্রমে যুক্ত।",
      literalTranslationEn: "Blue checkered lungi and damp gamcha towel over the shoulder",
      localizations: {
        en: {
          targetLanguageName: "English (UK/US)",
          domestication: "faded working-class wrap and a coarse cotton cloth slung over his shoulder",
          foreignization: "a blue-checkered lungi—a breezy tubular cotton sarong—and a handwoven gamcha draped across his shoulder",
          dynamicEquivalence: "the timeless attire of the delta's river workers, weathered, practical, and unpretentious",
          culturalNote: "Lungi/sarong is universally worn across Indian Ocean coastal cultures."
        },
        hi: {
          targetLanguageName: "Hindi",
          domestication: "नीली चेकदार लुंगी और कंधे पर पसीने से भीगा अंगोछा",
          foreignization: "चेक वाली बंगाली लुंगी और कंधे पर देसी गमछा",
          dynamicEquivalence: "आम कामकाजी इंसान का सादगी भरा पारंपरिक पहनावा",
          culturalNote: "Shared Gangetic workwear lexicon (lungi/gamcha/angochha)."
        },
        es: {
          targetLanguageName: "Spanish",
          domestication: "una saya de trabajo a cuadros azules y una toalla de algodón al hombro",
          foreignization: "un lungi a cuadros azules—el sarong tradicional de algodón—con una tela gamcha sobre el hombro",
          dynamicEquivalence: "el ropaje honesto de los hombres que viven del río y el trabajo rudo",
          culturalNote: "Appeals to rustic, equatorial working clothes aesthetic."
        },
        fr: {
          targetLanguageName: "French",
          domestication: "un pagne d'étoffe bleue et un linge de coton passé sur l'épaule",
          foreignization: "un lungi à carreaux bleus—sarong traditionnel des mariniers—avec un tissu gamcha sur l'épaule",
          dynamicEquivalence: "la mise sobre et digne des travailleurs du delta",
          culturalNote: "Evokes French colonial maritime terminology like pagne."
        },
        ar: {
          targetLanguageName: "Arabic",
          domestication: "إزار أزرق مقلم وقطعة قماش قطنية مبللة على كتفه",
          foreignization: "لونغي أزرق مربعات—الإزار البنغالي التقليدي—مع فوطة غامتشا قطنية على كتفه",
          dynamicEquivalence: "لباس عمال النهر التقليدي البسيط الذي يعكس كفاح الحياة اليومية",
          culturalNote: "Familiar to Arab coastal communities as 'Izar'."
        },
        ja: {
          targetLanguageName: "Japanese",
          domestication: "青いチェックの腰巻きと肩に掛けた手ぬぐい",
          foreignization: "青いチェック柄のルンギ（筒状の木綿腰巻き）に、肩にかけた伝統の布ガムチャ",
          dynamicEquivalence: "川辺で働く人々の質素で実用的な労働着",
          culturalNote: "Directly relates to traditional Japanese tenugui towel and koschimaki."
        },
        de: {
          targetLanguageName: "German",
          domestication: "ein blau kariertes Wickeltuch und ein grobes Baumwolltuch über der Schulter",
          foreignization: "ein blau karierter Lungi—der traditionelle Wickelrock—mit einem handgewebten Gamcha-Tuch",
          dynamicEquivalence: "die ehrliche, wettergegerbte Tracht der Schiffsarbeiter des Deltas",
          culturalNote: "Described as maritime working apparel."
        }
      }
    });
  }

  return detected;
}

export function createPolyglotMatrixRouter(): Router {
  const router = Router();

  const getPaths = [
    "/v1/projects/:projectId/polyglot-matrix",
    "/api/v1/projects/:projectId/polyglot-matrix"
  ];

  router.get(getPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";

    const state: PolyglotMatrixState = {
      projectId,
      detectedCbiCount: DEFAULT_CULTURE_BOUND_ITEMS.length,
      overallCulturalDensityScore: 84,
      cultureBoundItems: DEFAULT_CULTURE_BOUND_ITEMS,
      sampleManuscriptExcerptBn:
        "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে। সদরঘাটের চায়ের দোকানে তখন তুমুল আড্ডা—বৃষ্টির দিনে গরম গরম খিচুড়ি আর ইলিশ ভাজার কথা উঠতেই এক বুড়ো হেঁকে উঠল, 'আরে মিয়া, আদার ব্যাপারী হয়ে জাহাজের খবর নিয়ে লাভ কী!'",
      translatedSamples: {
        en: {
          languageName: "English",
          nativeName: "English (Literary)",
          flagEmoji: "🇬🇧",
          sampleText:
            "Sodium light slipped across glistening droplets cascading down the cracked stone steps of Sadarghat. Inside the harbor tea stall, a spirited adda was in full swing. When talk turned to piping-hot khichuri and golden fried hilsa under the monsoon rain, an old boatman chided, 'Why is a humble ginger peddler fretting over the manifests of oceangoing ships!'",
          strategyUsed: "foreignization"
        },
        hi: {
          languageName: "Hindi",
          nativeName: "हिन्दी",
          flagEmoji: "🇮🇳",
          sampleText:
            "सदरघाट की टूटी सीढ़ियों पर सोडियम लैंप की पीली रोशनी फिसल रही थी। चाय की टपरी पर ज़ोरदार अड्डा जमा था। जब बरसात के दिन गरमा-गरम खिचड़ी और तली हुई इलिश की बात छिड़ी, तो एक बुज़ुर्ग हँसते हुए बोले, 'अरे भाई, अदरक के व्यापारी को पानी के जहाज़ों की चिंता करने से क्या हासिल!'",
          strategyUsed: "dynamic_equivalence"
        },
        es: {
          languageName: "Spanish",
          nativeName: "Español",
          flagEmoji: "🇪🇸",
          sampleText:
            "La luz amarilla de sodio resbalaba sobre los escalones rotos de Sadarghat. En el cafetín del muelle ardía una apasionada tertulia; y cuando alguien evocó el humeante khichuri con pescado frito bajo el monzón, un viejo marinero exclamó: '¡Zapatero a tus zapatos! ¿Qué hace un vendedor de jengibre pidiendo cuentas a los buques de alta mar!'",
          strategyUsed: "domestication"
        },
        fr: {
          languageName: "French",
          nativeName: "Français",
          flagEmoji: "🇫🇷",
          sampleText:
            "La lueur jaune sodium ruisselait sur les marches dévalées du quai de Sadarghat. Au kiosque à thé, un vibrant adda battait son plein. Dès que fut mentionné le khichuri fumant et l'hilsa doré au son de la pluie battante, un vieux flâneur lança : 'Pourquoi le marchand de gingembre s'inquiète-t-il du chargement des navires marchands !'",
          strategyUsed: "hybrid_glossary"
        },
        ar: {
          languageName: "Arabic",
          nativeName: "العربية",
          flagEmoji: "🇸🇦",
          sampleText:
            "كان الضوء الأصفر الخافت ينزلق على درجات رصيف سادارغات المتصدعة. وفي مقهى الشاي، كانت جلسة 'أدا' المسائية في أوج حماسها. وحين ذُكر طبق الخيتشوري الدافئ مع سمك الإيليش في يوم المطر، صاح شيخٌ مسن: 'يا رجل، رحم الله امرأً عرف قدره، ما لشاحذ الزنجبيل وأخبار السفن العظيمة!'",
          strategyUsed: "domestication"
        },
        ja: {
          languageName: "Japanese",
          nativeName: "日本語",
          flagEmoji: "🇯🇵",
          sampleText:
            "サダルガートの欠けた石段に、ナトリウム灯の鈍い黄光が濡れて滑っていた。茶屋では熱気あふれる『アッダ』が夜更けまで続いていた。雨の日の熱々キチュリと揚げイリッシュ魚の話が出るや、老船乗りが笑った。『おいおい、生姜売りの小商人が大海を行く巨船の積荷を気にしてどうする！』",
          strategyUsed: "foreignization"
        },
        de: {
          languageName: "German",
          nativeName: "Deutsch",
          flagEmoji: "🇩🇪",
          sampleText:
            "Gelbes Natriumlicht glitt über die nassen, geborstenen Stufen von Sadarghat. In der Teestube herrschte ausgelassenes Adda-Treiben. Als die Rede auf dampfendes Khichuri und knusprigen Hilsa-Fisch im Monsunregen kam, lachte ein alter Seemann: 'Schuster, bleib bei deinen Leisten! Was kümmert den Ingwerhändler das Logbuch der Hochseefrachter!'",
          strategyUsed: "dynamic_equivalence"
        }
      }
    };

    res.json({
      success: true,
      projectId,
      state
    });
  });

  const auditPaths = [
    "/v1/projects/:projectId/polyglot-matrix/audit",
    "/api/v1/projects/:projectId/polyglot-matrix/audit"
  ];
  router.post(auditPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { manuscriptText } = req.body || {};

    const text = typeof manuscriptText === "string" ? manuscriptText : "";
    const items = auditCultureBoundItems(text);

    res.json({
      success: true,
      projectId,
      detectedItemsCount: items.length,
      culturalDensityScore: Math.min(95, 60 + items.length * 8),
      items
    });
  });

  const glossaryPaths = [
    "/v1/projects/:projectId/polyglot-matrix/glossary",
    "/api/v1/projects/:projectId/polyglot-matrix/glossary"
  ];
  router.post(glossaryPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { targetLanguage } = req.body || {};

    const lang: SupportedTargetLanguage = (targetLanguage as SupportedTargetLanguage) || "en";

    const glossarySnippet =
      `\n\n<!-- ====================================================== -->\n` +
      `<!-- SHOTHIK POLYGLOT CULTURAL GLOSSARY (${lang.toUpperCase()}) -->\n` +
      `<!-- ====================================================== -->\n` +
      `### Appendix: Cultural Notes & Glossary for International Readers\n\n` +
      DEFAULT_CULTURE_BOUND_ITEMS.map((item) => {
        const loc = item.localizations[lang] || item.localizations.en;
        return (
          `* **${item.sourceBengali}** (*${item.literalTranslationEn}*):\n` +
          `  - **Cultural Meaning**: ${item.culturalContextBn}\n` +
          `  - **Contextual Equivalent**: ${loc.foreignization}\n` +
          `  - **Translator's Note**: ${loc.culturalNote}\n`
        );
      }).join("\n") +
      `<!-- ====================================================== -->\n`;

    res.json({
      success: true,
      projectId,
      targetLanguage: lang,
      glossarySnippet
    });
  });

  return router;
}

export const polyglotMatrixRouter = createPolyglotMatrixRouter();
