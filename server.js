// ============================================================
// MENYA SRHR AI - SERVER
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// Load environment variables
dotenv.config();

// Load knowledge base
let knowledgeBase = [];

try {
    const kb = require("./knowledge.js");

    if (Array.isArray(kb)) {
        knowledgeBase = kb;
    } else if (Array.isArray(kb.knowledgeBase)) {
        knowledgeBase = kb.knowledgeBase;
    } else if (Array.isArray(kb.MENYA_KNOWLEDGE_BASE)) {
        knowledgeBase = kb.MENYA_KNOWLEDGE_BASE;
    }

    console.log("Knowledge base loaded: " + knowledgeBase.length + " entries");
} catch (error) {
    console.error("Could not load knowledge.js");
    console.error(error.message);
}

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================================
// OPENAI
// ============================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

if (process.env.OPENAI_API_KEY) {
    console.log("OpenAI: CONNECTED");
} else {
    console.log("OpenAI: API KEY NOT FOUND");
}

// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(text) {
    if (!text) return "";

    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s']/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectLanguage(question) {
    const text = normalizeText(question);

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
        "mbese"
    ];

    for (const word of kinyarwandaWords) {
        if (text.includes(word)) {
            return "kinyarwanda";
        }
    }

    // Common Kinyarwanda question structure
    if (
        text.startsWith("ni ") ||
        text.startsWith("ese ") ||
        text.startsWith("ninde ") ||
        text.startsWith("nizihe ") ||
        text.startsWith("nakora ") ||
        text.startsWith("nshobora ")
    ) {
        return "kinyarwanda";
    }

    return "english";
}

// ============================================================
// GET ANSWER FROM KNOWLEDGE BASE
// ============================================================

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

// ============================================================
// FIND KNOWLEDGE ITEM BY ID
// ============================================================

function findKnowledgeById(id) {
    if (!id) return null;

    return knowledgeBase.find(item => {
        return item && item.id === id;
    });
}

// ============================================================
// SPECIFIC INTENT DETECTION
// ============================================================

function detectSpecificIntent(question) {
    const text = normalizeText(question);

    // STI - What is it?
    if (
        text.includes("sti ni iki") ||
        text.includes("sti niki") ||
        text.includes("indwara zandurira mu mibonano ni izihe") ||
        text.includes("nizihe ndwara zandurira mumibonano") ||
        text.includes("nizihe ndwara zandurira mu mibonano") ||
        text.includes("ni izihe ndwara zandurira mu mibonano") ||
        text.includes("indwara zandurira mumibonano ni izihe") ||
        text.includes("indwara zandurira mu mibonano mpuzabitsina")
    ) {
        return [
            "sti_ni_iki",
            "sti_signs",
            "sti_testing"
        ];
    }

    // STI symptoms
    if (
        text.includes("ibimenyetso bya sti") ||
        text.includes("ibimenyetso byindwara zandurira") ||
        text.includes("sti ibimenyetso") ||
        text.includes("ni ibihe bimenyetso bya sti")
    ) {
        return [
            "sti_signs",
            "sti_testing"
        ];
    }

    // STI testing
    if (
        text.includes("napimisha sti") ||
        text.includes("napima sti") ||
        text.includes("kwipimisha sti") ||
        text.includes("kwipima sti") ||
        text.includes("test ya sti") ||
        text.includes("ipimwa ite sti")
    ) {
        return [
            "sti_testing",
            "sti_signs"
        ];
    }

    return [];
}

// ============================================================
// SEARCH KNOWLEDGE BASE
// ============================================================

function searchKnowledge(question) {
    const normalizedQuestion = normalizeText(question);

    if (!normalizedQuestion) {
        return null;
    }

    // First: specific intent
    const intentIds = detectSpecificIntent(question);

    for (const id of intentIds) {
        const item = findKnowledgeById(id);

        if (item) {
            const answer = getKnowledgeAnswer(item);

            if (answer) {
                return {
                    item,
                    answer,
                    score: 100
                };
            }
        }
    }

    // Normal knowledge search
    let bestItem = null;
    let bestScore = 0;

    const questionWords = normalizedQuestion
        .split(/\s+/)
        .filter(word => word.length >= 2);

    for (const item of knowledgeBase) {
        if (!item) continue;

        const questionText = normalizeText(item.question || "");
        const titleText = normalizeText(item.title || "");
        const topicText = normalizeText(item.topic || "");
        const answerText = normalizeText(getKnowledgeAnswer(item) || "");

        let keywordsText = "";

        if (Array.isArray(item.keywords)) {
            keywordsText = item.keywords
                .map(keyword => normalizeText(keyword))
                .join(" ");
        } else if (typeof item.keywords === "string") {
            keywordsText = normalizeText(item.keywords);
        }

        const searchableText = [
            questionText,
            titleText,
            topicText,
            keywordsText,
            answerText
        ].join(" ");

        let score = 0;

        // Exact full question match
        if (questionText === normalizedQuestion) {
            score += 100;
        }

        // Exact keyword/phrase match
        if (
            keywordsText.includes(normalizedQuestion) &&
            normalizedQuestion.length > 5
        ) {
            score += 50;
        }

        // Question phrase contained in searchable text
        if (
            normalizedQuestion.length > 8 &&
            searchableText.includes(normalizedQuestion)
        ) {
            score += 30;
        }

        // Word matching
        for (const word of questionWords) {
            if (searchableText.includes(word)) {
                score += 2;
            }
        }

        // Important phrase bonuses
        if (
            normalizedQuestion.includes("sti") &&
            searchableText.includes("sti")
        ) {
            score += 8;
        }

        if (
            normalizedQuestion.includes("mibonano") &&
            searchableText.includes("mibonano")
        ) {
            score += 8;
        }

        if (
            normalizedQuestion.includes("indwara") &&
            searchableText.includes("indwara")
        ) {
            score += 5;
        }

        if (score > bestScore) {
            bestScore = score;
            bestItem = item;
        }
    }

    // Require a meaningful match
    if (bestItem && bestScore >= 4) {
        return {
            item: bestItem,
            answer: getKnowledgeAnswer(bestItem),
            score: bestScore
        };
    }

    return null;
}

// ============================================================
// DETECT ENGLISH OUTPUT
// ============================================================

function looksEnglish(text) {
    if (!text) return false;

    const normalized = normalizeText(text);

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
        "contact"
    ];

    let matches = 0;

    for (const word of englishWords) {
        const regex = new RegExp("\\b" + word + "\\b", "i");

        if (regex.test(normalized)) {
            matches++;
        }
    }

    return matches >= 3;
}

// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

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

IGISUBIZO CYAWE GITEGEREZWA KUBA MU KINYARWANDA GUSA.
`;
    }

    return `
You are Menya SRHR AI, a respectful sexual and reproductive health information assistant.

Answer in clear English.

Provide reliable health information.
Do not diagnose users.
Do not shame or judge.
Respect consent and bodily autonomy.
For urgent situations, recommend appropriate professional or emergency help.
For GBV situations, prioritize safety and trusted support.
Do not fabricate information.
If you are unsure, say so.
Keep answers clear and reasonably concise.
`;
}

// ============================================================
// FORCE KINYARWANDA
// ============================================================

async function forceKinyarwanda(originalQuestion, englishAnswer) {
    try {
        const response = await openai.responses.create({
            model: "gpt-5.6-luna",
            instructions: `
Hindura igisubizo gikurikira mu Kinyarwanda cyumvikana neza.

IKIBAZO CY'UMUKORESHAJI:
${originalQuestion}

IGISUBIZO:
${englishAnswer}

AMATEGEKO:
- Subiza MU KINYARWANDA GUSA.
- Ntusige interuro z'Icyongereza keretse amazina y'indwara cyangwa amagambo ya siyansi bidakwiye guhindurwa.
- Ntuhindure igisobanuro cy'igisubizo.
- Koresha amagambo yoroshye.
`,
            input: englishAnswer
        });

        return response.output_text;
    } catch (error) {
        console.error("Kinyarwanda translation error:", error.message);

        return englishAnswer;
    }
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        openai: !!process.env.OPENAI_API_KEY,
        knowledgeBase: knowledgeBase.length
    });
});

// ============================================================
// CHAT API
// ============================================================

app.post("/api/chat", async (req, res) => {
    try {
        const question = req.body.question;

        if (!question || typeof question !== "string") {
            return res.status(400).json({
                error: "Question is required."
            });
        }

        const cleanQuestion = question.trim();

        console.log("");
        console.log("User:", cleanQuestion);

        const language = detectLanguage(cleanQuestion);

        console.log("Detected language:", language);

        // ====================================================
        // SEARCH LOCAL KNOWLEDGE BASE FIRST
        // ====================================================

        const knowledgeResult = searchKnowledge(cleanQuestion);

        if (knowledgeResult && knowledgeResult.answer) {
            let answer = knowledgeResult.answer;

            // If user asked in Kinyarwanda but KB somehow returned
            // English, translate it.
            if (
                language === "kinyarwanda" &&
                looksEnglish(answer)
            ) {
                console.log("KB answer appears English. Translating...");
                answer = await forceKinyarwanda(
                    cleanQuestion,
                    answer
                );
            }

            console.log(
                "Source: knowledge-base | Score:",
                knowledgeResult.score
            );

            return res.json({
                answer,
                source: "knowledge-base"
            });
        }

        // ====================================================
        // OPENAI FALLBACK
        // ====================================================

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                error: "OpenAI API key is not configured."
            });
        }

        console.log("No strong KB match. Asking OpenAI...");

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",
            instructions: buildSystemInstructions(language),
            input: cleanQuestion
        });

        let answer = response.output_text;

        // ====================================================
        // FINAL LANGUAGE SAFETY CHECK
        // ====================================================

        if (
            language === "kinyarwanda" &&
            looksEnglish(answer)
        ) {
            console.log(
                "OpenAI returned English for Kinyarwanda question."
            );

            console.log("Converting answer to Kinyarwanda...");

            answer = await forceKinyarwanda(
                cleanQuestion,
                answer
            );
        }

        console.log("Source: openai");

        return res.json({
            answer,
            source: "openai"
        });

    } catch (error) {
        console.error("");
        console.error("CHAT ERROR:");
        console.error(error);

        return res.status(500).json({
            error: "Something went wrong while processing your question."
        });
    }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log("");
    console.log("==============================================");
    console.log("MENYA SRHR AI");
    console.log("==============================================");
    console.log("Website: http://localhost:" + PORT);
    console.log("Health:  http://localhost:" + PORT + "/api/health");
    console.log("==============================================");
    console.log("");
});