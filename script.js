const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const knowledgeBase = require("./knowledge.js");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* =========================================================
   STATIC WEBSITE
========================================================= */

app.use(express.static(__dirname));

/* =========================================================
   LANGUAGE DETECTION
========================================================= */

function detectLanguage(question) {
    const text = question.toLowerCase().trim();

    const kinyarwandaWords = [
        "ni iki",
        "ni izihe",
        "nizihe",
        "iki",
        "ibiki",
        "ute",
        "nate",
        "nakora",
        "nkore",
        "kora",
        "gute",
        "igihe",
        "mbere",
        "nyuma",
        "imibonano",
        "mpuzabitsina",
        "indwara",
        "zandurira",
        "imihango",
        "gutwita",
        "inda",
        "umwana",
        "abana",
        "umugore",
        "umukobwa",
        "umugabo",
        "umuhungu",
        "ubuzima",
        "ubuzima bwimyororokere",
        "kuboneza urubyaro",
        "agakingirizo",
        "ibimenyetso",
        "ububabare",
        "amaraso",
        "inkari",
        "igitsina",
        "muburyo",
        "mu gihe",
        "ese",
        "hari",
        "bangahe",
        "byagenda",
        "nshobora",
        "mfite",
        "wakwibanda",
        "mbese",
        "ndashaka",
        "nkeneye",
        "nakora iki",
        "nabigenza nte",
        "ni gute",
        "ni gute nakora",
        "birashoboka"
    ];

    for (const word of kinyarwandaWords) {
        if (text.includes(word)) {
            return "kinyarwanda";
        }
    }

    const kinyarwandaStarts = [
        "ni ",
        "ese ",
        "ninde ",
        "nizihe ",
        "nakora ",
        "nshobora ",
        "mbese ",
        "mfite ",
        "ndashaka ",
        "nkeneye "
    ];

    for (const start of kinyarwandaStarts) {
        if (text.startsWith(start)) {
            return "kinyarwanda";
        }
    }

    return "english";
}

/* =========================================================
   KNOWLEDGE BASE HELPERS
========================================================= */

function getKnowledgeItems() {
    if (Array.isArray(knowledgeBase)) {
        return knowledgeBase;
    }

    if (knowledgeBase && Array.isArray(knowledgeBase.knowledgeBase)) {
        return knowledgeBase.knowledgeBase;
    }

    if (knowledgeBase && Array.isArray(knowledgeBase.knowledge)) {
        return knowledgeBase.knowledge;
    }

    if (knowledgeBase && Array.isArray(knowledgeBase.default)) {
        return knowledgeBase.default;
    }

    return [];
}

function getKnowledgeAnswer(item) {
    if (!item) return null;

    if (typeof item === "string") {
        return item;
    }

    return (
        item.answer ||
        item.content ||
        item.response ||
        item.text ||
        null
    );
}

/* =========================================================
   KNOWLEDGE BASE SEARCH
========================================================= */

function searchKnowledge(question) {
    const items = getKnowledgeItems();

    if (!items.length) {
        console.log("Knowledge base is empty or could not be read.");
        return null;
    }

    const q = question.toLowerCase().trim();

    let bestItem = null;
    let bestScore = 0;

    /* -----------------------------------------
       1. Exact / specific intent search
    ----------------------------------------- */

    for (const item of items) {
        if (!item || typeof item !== "object") continue;

        const keywords = Array.isArray(item.keywords)
            ? item.keywords
            : [];

        for (const keyword of keywords) {
            if (!keyword) continue;

            const k = String(keyword).toLowerCase().trim();

            if (q === k) {
                return {
                    item,
                    answer: getKnowledgeAnswer(item),
                    score: 100
                };
            }

            if (q.includes(k) && k.length >= 5) {
                const score = 50 + k.length;

                if (score > bestScore) {
                    bestScore = score;
                    bestItem = item;
                }
            }
        }
    }

    if (bestItem) {
        return {
            item: bestItem,
            answer: getKnowledgeAnswer(bestItem),
            score: bestScore
        };
    }

    /* -----------------------------------------
       2. General keyword / title / topic search
    ----------------------------------------- */

    const questionWords = q
        .split(/\s+/)
        .map(word => word.replace(/[^\p{L}\p{N}]/gu, ""))
        .filter(word => word.length >= 3);

    for (const item of items) {
        if (!item || typeof item !== "object") continue;

        let score = 0;

        const searchableParts = [];

        if (Array.isArray(item.keywords)) {
            searchableParts.push(
                item.keywords.join(" ")
            );
        }

        if (item.title) {
            searchableParts.push(String(item.title));
        }

        if (item.topic) {
            searchableParts.push(String(item.topic));
        }

        const answer = getKnowledgeAnswer(item);

        if (answer) {
            searchableParts.push(String(answer));
        }

        const searchableText = searchableParts
            .join(" ")
            .toLowerCase();

        for (const word of questionWords) {
            if (searchableText.includes(word)) {
                score += 1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestItem = item;
        }
    }

    if (bestItem && bestScore >= 4) {
        return {
            item: bestItem,
            answer: getKnowledgeAnswer(bestItem),
            score: bestScore
        };
    }

    return null;
}

/* =========================================================
   ENGLISH DETECTION
========================================================= */

function looksEnglish(text) {
    if (!text) return false;

    const normalized = String(text)
        .replace(/<[^>]*>/g, " ")
        .toLowerCase();

    const englishWords = [
        "the",
        "are",
        "is",
        "can",
        "you",
        "your",
        "what",
        "which",
        "this",
        "that",
        "some",
        "people",
        "sexual",
        "infection",
        "infections",
        "transmitted",
        "symptoms",
        "testing",
        "health",
        "contact",
        "when",
        "through",
        "with",
        "from",
        "into",
        "and",
        "or",
        "for",
        "to"
    ];

    let matches = 0;

    for (const word of englishWords) {
        const regex = new RegExp(
            `\\b${word}\\b`,
            "i"
        );

        if (regex.test(normalized)) {
            matches++;
        }
    }

    return matches >= 3;
}

/* =========================================================
   SYSTEM INSTRUCTIONS
========================================================= */

function buildSystemInstructions(language) {
    if (language === "kinyarwanda") {
        return `
Uri Menya SRHR AI, umufasha utanga amakuru yizewe ku buzima bw'imyororokere n'imibonano mpuzabitsina.

AMATEGEKO AKOMEYE:

1. NIBA UMUKORESHAJI ABASHE MU KINYARWANDA, SUBIZA MU KINYARWANDA GUSA.
2. NTUKORESHE IGISUBIZO CY'ICYONGEREZA KU IKIBAZO CYA KINYARWANDA.
3. Koresha Kinyarwanda cyoroshye kandi gisobanutse.
4. Ntugaseke cyangwa ngo ucire urubanza umukoresha.
5. Tanga amakuru yizewe kandi ashingiye ku buzima.
6. Ntutange diagnosis y'indwara nk'aho ari muganga wasuzumye umuntu.
7. Niba ikibazo gisaba ubufasha bwihutirwa, saba umuntu gushaka ubufasha bw'abaganga cyangwa serivisi z'ubutabazi.
8. Ku bibazo bya GBV, saba umuntu gushaka ubufasha bwizewe kandi wubahirize umutekano we.
9. Ku bijyanye na consent, garagaza ko kwemera bigomba kuba ku bushake kandi bishobora kuvaho.
10. Ntutange amabwiriza ashobora gushyira umuntu mu kaga.
11. Ntuhimbe amakuru.
12. Niba utazi igisubizo neza, vuga ko udafite amakuru ahagije.
13. Subiza mu buryo bugufi kandi bwumvikana.
14. Koresha bullets cyangwa paragraphs ngufi igihe bikwiye.
15. NIBA UMUKORESHAJI YANDITSE MU KINYARWANDA, NTUGASUBIZE MU CYONGEREZA.

IGISUBIZO CYAWE GITEGEREZWA KUBA MU KINYARWANDA GUSA.
`;
    }

    return `
You are Menya SRHR AI, an assistant providing reliable sexual and reproductive health information.

RULES:

1. Provide accurate and understandable information.
2. Do not judge or shame the user.
3. Do not diagnose a medical condition as if you examined the person.
4. For emergencies, encourage appropriate professional or emergency support.
5. For GBV-related questions, prioritize safety and trusted support.
6. For consent, explain that consent must be voluntary and can be withdrawn.
7. Do not invent information.
8. If you are unsure, clearly say that you do not have enough information.
9. Keep answers clear and reasonably concise.
`;
}

/* =========================================================
   KINYARWANDA TRANSLATION
========================================================= */

async function forceKinyarwanda(originalQuestion, englishAnswer) {
    try {
        console.log("Translating answer to Kinyarwanda...");

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",

            instructions: `
Uri umusemuzi wa nyuma wa Menya SRHR AI.

Hindura igisubizo gikurikira ukivane mu Cyongereza ugishyire mu Kinyarwanda gisanzwe, cyoroshye kandi cyumvikana.

IKIBAZO CY'UMUKORESHAJI:
${originalQuestion}

IGISUBIZO CY'IBANZE:
${englishAnswer}

AMATEGEKO AKOMEYE:

- SUBIZA MU KINYARWANDA GUSA.
- Rinda ibisobanuro by'ubuvuzi uko biri.
- Ntuhindure ukuri k'ubuvuzi.
- Amagambo y'ubuvuzi mpuzamahanga nka HIV, AIDS, PEP, PrEP, STI, HPV, ART na ARV ashobora kuguma uko ari.
- Niba igisubizo kirimo HTML nka <h1>, <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <div>, <span>, <br>, <blockquote> cyangwa <hr>, RINDA izo HTML tags.
- Hindura gusa amagambo ari imbere muri izo HTML tags.
- Ntukureho HTML formatting.
- Ntukongeremo Markdown.
- Ntukongeremo ibisobanuro by'uko wahinduye.
- Garura IGISUBIZO GUSA.
`,

            input:
                "QUESTION:\n" +
                originalQuestion +
                "\n\nANSWER:\n" +
                englishAnswer
        });

        const translated =
            (response.output_text || "").trim();

        if (!translated) {
            throw new Error(
                "Kinyarwanda translation returned empty."
            );
        }

        console.log("Kinyarwanda translation completed.");

        return translated;

    } catch (error) {
        console.error(
            "Kinyarwanda translation error:",
            error.message
        );

        return "";
    }
}

/* =========================================================
   DIRECT KINYARWANDA ANSWER FALLBACK
========================================================= */

async function generateKinyarwandaAnswer(question) {
    try {
        console.log(
            "Generating direct Kinyarwanda answer..."
        );

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",

            instructions:
                buildSystemInstructions("kinyarwanda"),

            input: question
        });

        const answer =
            (response.output_text || "").trim();

        if (!answer) {
            throw new Error(
                "OpenAI returned an empty Kinyarwanda answer."
            );
        }

        return answer;

    } catch (error) {
        console.error(
            "Direct Kinyarwanda answer error:",
            error.message
        );

        return "";
    }
}

/* =========================================================
   ENSURE KINYARWANDA
========================================================= */

async function ensureKinyarwanda(
    question,
    answer
) {
    if (!answer) {
        return "";
    }

    if (!looksEnglish(answer)) {
        return answer;
    }

    console.log(
        "Answer appears to be English. Kinyarwanda conversion required."
    );

    /* -----------------------------------------
       First attempt: translate existing answer
    ----------------------------------------- */

    let translated =
        await forceKinyarwanda(
            question,
            answer
        );

    if (
        translated &&
        !looksEnglish(translated)
    ) {
        return translated;
    }

    /* -----------------------------------------
       Second attempt: generate directly
    ----------------------------------------- */

    console.log(
        "Translation did not produce clear Kinyarwanda. Trying direct generation..."
    );

    translated =
        await generateKinyarwandaAnswer(
            question
        );

    if (
        translated &&
        !looksEnglish(translated)
    ) {
        return translated;
    }

    /* -----------------------------------------
       Never return the original English answer
    ----------------------------------------- */

    return `
<p>Mbabarira, ubu sinabashije gutanga igisubizo mu Kinyarwanda.</p>
<p>Ongera ubaze ikibazo cyawe mu magambo make, ndagerageza kugufasha.</p>
`;
}

/* =========================================================
   CHAT API
========================================================= */

app.post("/api/chat", async (req, res) => {
    try {
        const question =
            typeof req.body.question === "string"
                ? req.body.question
                : "";

        if (!question.trim()) {
            return res.status(400).json({
                error: "Question is required."
            });
        }

        const cleanQuestion =
            question.trim();

        const language =
            detectLanguage(cleanQuestion);

        console.log(
            "----------------------------------------"
        );

        console.log(
            "Question:",
            cleanQuestion
        );

        console.log(
            "Detected language:",
            language
        );

        /* -----------------------------------------
           SEARCH KNOWLEDGE BASE FIRST
        ----------------------------------------- */

        const knowledgeResult =
            searchKnowledge(cleanQuestion);

        if (
            knowledgeResult &&
            knowledgeResult.answer
        ) {
            console.log(
                "Knowledge base match found. Score:",
                knowledgeResult.score
            );

            let answer =
                knowledgeResult.answer;

            /* -------------------------------------
               KINYARWANDA PROTECTION
            ------------------------------------- */

            if (language === "kinyarwanda") {
                answer =
                    await ensureKinyarwanda(
                        cleanQuestion,
                        answer
                    );
            }

            return res.json({
                answer,
                source: "knowledge-base",
                language
            });
        }

        /* -----------------------------------------
           NO KNOWLEDGE BASE MATCH
        ----------------------------------------- */

        console.log(
            "No knowledge base match. Asking OpenAI..."
        );

        const response =
            await openai.responses.create({
                model: "gpt-5.6-luna",

                instructions:
                    buildSystemInstructions(
                        language
                    ),

                input: cleanQuestion
            });

        let answer =
            (response.output_text || "").trim();

        /* -----------------------------------------
           KINYARWANDA PROTECTION
        ----------------------------------------- */

        if (language === "kinyarwanda") {
            answer =
                await ensureKinyarwanda(
                    cleanQuestion,
                    answer
                );
        }

        return res.json({
            answer,
            source: "openai",
            language
        });

    } catch (error) {
        console.error(
            "Chat API error:",
            error
        );

        return res.status(500).json({
            error:
                "Habaye ikibazo kuri seriveri. Ongera ugerageze."
        });
    }
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "Menya SRHR AI",
        languageSupport: [
            "Kinyarwanda",
            "English"
        ]
    });
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
    console.log(
        `Menya SRHR AI server is running on http://localhost:${PORT}`
    );

    console.log(
        "Knowledge base loaded:",
        getKnowledgeItems().length,
        "items"
    );
});
