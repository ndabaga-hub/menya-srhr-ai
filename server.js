// ============================================================
// AI YAWE / MENYA SRHR AI
// COMPLETE BACKEND SERVER
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const path = require("path");

// ============================================================
// LOAD ENVIRONMENT
// ============================================================

dotenv.config();

// ============================================================
// APP SETTINGS
// ============================================================

const app = express();

const PORT = process.env.PORT || 3000;

const MODEL = "gpt-5.6-luna";

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(express.static(__dirname));

// ============================================================
// OPENAI
// ============================================================

let openai = null;

if (process.env.OPENAI_API_KEY) {

    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    console.log("🤖 OpenAI: CONNECTED");

} else {

    console.log("⚠️ OpenAI API key was not found.");

}

// ============================================================
// LOAD ORIGINAL KNOWLEDGE BASE
// ============================================================

let knowledgeBase = [];

try {

    const knowledge = require("./knowledge.js");

    if (Array.isArray(knowledge)) {

        knowledgeBase = knowledge;

    } else if (
        Array.isArray(
            knowledge.knowledgeBase
        )
    ) {

        knowledgeBase =
            knowledge.knowledgeBase;

    } else if (
        Array.isArray(
            knowledge.MENYA_KNOWLEDGE_BASE
        )
    ) {

        knowledgeBase =
            knowledge.MENYA_KNOWLEDGE_BASE;

    }

    console.log(
        `✅ Original knowledge base loaded: ${knowledgeBase.length} entries`
    );

} catch (error) {

    console.log(
        "❌ Could not load knowledge.js"
    );

    console.log(
        error.message
    );

    console.log(
        "⚠️ The AI can still work using OpenAI."
    );

}

// ============================================================
// LOAD RBC KNOWLEDGE BASE
// ============================================================

let rbcKnowledgeBase = [];

try {

    const rbcKnowledge =
        require("./rbc-knowledge.js");

    if (Array.isArray(rbcKnowledge)) {

        rbcKnowledgeBase =
            rbcKnowledge;

    } else if (
        Array.isArray(
            rbcKnowledge.knowledgeBase
        )
    ) {

        rbcKnowledgeBase =
            rbcKnowledge.knowledgeBase;

    } else if (
        Array.isArray(
            rbcKnowledge.RBC_KNOWLEDGE_BASE
        )
    ) {

        rbcKnowledgeBase =
            rbcKnowledge.RBC_KNOWLEDGE_BASE;

    }

    console.log(
        `✅ RBC knowledge base loaded: ${rbcKnowledgeBase.length} entries`
    );

} catch (error) {

    console.log(
        "⚠️ RBC knowledge base could not be loaded."
    );

    console.log(
        error.message
    );

}

// ============================================================
// COMBINED KNOWLEDGE
// ============================================================

const allKnowledgeBase = [
    ...knowledgeBase,
    ...rbcKnowledgeBase
];

console.log(
    `📚 Total knowledge entries: ${allKnowledgeBase.length}`
);

// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[^\p{L}\p{N}\s']/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

}

// ============================================================
// TOKENIZE
// ============================================================

function tokenize(value) {

    const normalized =
        normalizeText(value);

    if (!normalized) {
        return [];
    }

    return normalized
        .split(/\s+/)
        .filter(Boolean);

}

// ============================================================
// COMMON WORDS
//
// These words are too general to determine which medical
// topic the user is asking about.
// ============================================================

const STOP_WORDS = new Set([

    // Kinyarwanda

    "ese",
    "mbese",
    "ni",
    "iki",
    "ibiki",
    "nde",
    "ninde",
    "gute",
    "ute",
    "nte",
    "nakora",
    "nkore",
    "kuki",
    "ryari",
    "hehe",
    "he",
    "hari",
    "bimeze",
    "biki",
    "iki",
    "izihe",
    "niizihe",
    "nizihe",
    "umuntu",
    "abantu",
    "muntu",
    "mfite",
    "mfitiye",
    "mfiteho",
    "nshobora",
    "bishoboka",
    "ushobora",
    "ashobora",
    "nabigenza",
    "byagenda",
    "mbere",
    "nyuma",
    "muri",
    "mu",
    "ku",
    "kuri",
    "na",
    "cyangwa",
    "ko",
    "niyo",
    "niba",
    "ubwo",
    "iki",
    "iyi",
    "izo",
    "aya",
    "uyu",
    "uri",
    "ari",
    "buri",
    "kandi",
    "cyane",
    "rwose",
    "gusa",
    "nkora",
    "nakoze",
    "gukora",
    "gufata",
    "ufite",
    "ufiteho",

    // English

    "what",
    "what's",
    "is",
    "are",
    "am",
    "was",
    "were",
    "who",
    "how",
    "why",
    "when",
    "where",
    "can",
    "could",
    "should",
    "would",
    "do",
    "does",
    "did",
    "i",
    "me",
    "my",
    "you",
    "your",
    "he",
    "she",
    "they",
    "we",
    "a",
    "an",
    "the",
    "to",
    "of",
    "for",
    "in",
    "on",
    "at",
    "with",
    "and",
    "or",
    "if",
    "this",
    "that",
    "these",
    "those",
    "about",
    "please",
    "tell",
    "explain",
    "give",
    "need",
    "want"

]);

// ============================================================
// MEANINGFUL TOKENS
// ============================================================

function meaningfulTokens(value) {

    return tokenize(value)
        .filter(function (word) {

            if (
                STOP_WORDS.has(word)
            ) {
                return false;
            }

            return word.length >= 3;

        });

}

// ============================================================
// ARRAY NORMALIZATION
// ============================================================

function toArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(function (item) {
                return String(item);
            })
            .filter(Boolean);

    }

    if (
        typeof value === "string"
    ) {

        return value
            .split(/[;,|]/)
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean);

    }

    return [];

}

// ============================================================
// GET SEARCH FIELDS
//
// IMPORTANT:
// NEVER SEARCH THE ANSWER TEXT.
//
// Searching the answer itself was one of the reasons unrelated
// answers were being selected.
// ============================================================

function getSearchFields(item) {

    if (!item) {
        return [];
    }

    const fields = [];

    if (item.id) {
        fields.push(
            String(item.id)
        );
    }

    if (item.question) {
        fields.push(
            String(item.question)
        );
    }

    if (item.title) {
        fields.push(
            String(item.title)
        );
    }

    if (item.topic) {
        fields.push(
            String(item.topic)
        );
    }

    if (item.keywords) {

        fields.push(
            ...toArray(
                item.keywords
            )
        );

    }

    if (item.phrases) {

        fields.push(
            ...toArray(
                item.phrases
            )
        );

    }

    return fields
        .filter(Boolean);

}

// ============================================================
// CHECK WHOLE PHRASE
// ============================================================

function containsPhrase(
    question,
    phrase
) {

    const q =
        normalizeText(question);

    const p =
        normalizeText(phrase);

    if (!q || !p) {
        return false;
    }

    return (
        ` ${q} `.includes(
            ` ${p} `
        )
    );

}

// ============================================================
// CHECK WHOLE WORD
//
// This prevents problems such as:
//
// pep
// being confused with
// prep
// ============================================================

function containsWholeWord(
    question,
    word
) {

    const q =
        normalizeText(question);

    const w =
        normalizeText(word);

    if (!q || !w) {
        return false;
    }

    const escaped =
        w.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    const regex =
        new RegExp(
            `(^|\\s)${escaped}(?=\\s|$)`,
            "u"
        );

    return regex.test(q);

}

// ============================================================
// EXACT QUESTION MATCH
// ============================================================

function exactQuestionMatch(
    question,
    item
) {

    const q =
        normalizeText(question);

    if (!q) {
        return false;
    }

    const possibleQuestions = [];

    if (item.question) {
        possibleQuestions.push(
            item.question
        );
    }

    if (item.title) {
        possibleQuestions.push(
            item.title
        );
    }

    return possibleQuestions.some(
        function (value) {

            return (
                normalizeText(value) === q
            );

        }
    );

}

// ============================================================
// SPECIAL TOPIC RULES
//
// These protect similar medical topics from being mixed.
//
// Example:
//
// PEP != PrEP
// HIV testing != PEP
// STI testing != STI treatment
// HPV vaccine != cervical cancer screening
// ============================================================

const TOPIC_RULES = [

    {
        ids: [
            "rbc_pep",
            "pep"
        ],

        strong: [
            "pep",
            "post exposure prophylaxis",
            "post-exposure prophylaxis",
            "ubwirinzi nyuma yo guhura na hiv",
            "imiti nyuma yo guhura na hiv",
            "nyuma yo guhura na hiv",
            "nyuma y'imibonano ishobora kuba yaranduje hiv"
        ],

        supporting: [
            "amasaha 72",
            "hours",
            "72",
            "exposure",
            "guhura",
            "imibonano"
        ],

        blocked: [
            "prep",
            "pre exposure prophylaxis",
            "pre-exposure prophylaxis"
        ]
    },

    {
        ids: [
            "rbc_prep",
            "prep"
        ],

        strong: [
            "prep",
            "pre exposure prophylaxis",
            "pre-exposure prophylaxis",
            "ubwirinzi mbere yo guhura na hiv",
            "imiti yo kwirinda hiv mbere"
        ],

        supporting: [
            "kwirinda hiv",
            "prevention",
            "prevention hiv"
        ],

        blocked: [
            "pep",
            "post exposure prophylaxis",
            "post-exposure prophylaxis",
            "amasaha 72"
        ]
    },

    {
        ids: [
            "rbc_hiv_testing",
            "hiv_testing",
            "hiv_test"
        ],

        strong: [
            "kwipimisha hiv",
            "gupima hiv",
            "hiv test",
            "hiv testing",
            "test ya hiv",
            "ikizamini cya hiv",
            "nshaka kwipimisha hiv"
        ],

        supporting: [
            "kwipimisha",
            "gupima",
            "test",
            "testing",
            "ikizamini"
        ],

        blocked: [
            "pep",
            "prep"
        ]
    },

    {
        ids: [
            "rbc_sti_testing",
            "sti_testing",
            "sti_test"
        ],

        strong: [
            "gupima sti",
            "kwipimisha sti",
            "sti test",
            "sti testing",
            "gupima indwara zandurira mu mibonano",
            "kwipimisha indwara zandurira mu mibonano"
        ],

        supporting: [
            "sti",
            "std",
            "kwipimisha",
            "gupima",
            "test"
        ],

        blocked: [
            "kuvura",
            "treatment",
            "umuti",
            "imiti"
        ]
    },

    {
        ids: [
            "rbc_sti_treatment",
            "sti_treatment"
        ],

        strong: [
            "kuvura sti",
            "umuti wa sti",
            "imiti ya sti",
            "sti treatment",
            "kuvura indwara zandurira mu mibonano",
            "umuti w'indwara zandurira mu mibonano"
        ],

        supporting: [
            "sti",
            "std",
            "kuvura",
            "umuti",
            "imiti",
            "treatment"
        ],

        blocked: [
            "kwipimisha",
            "gupima",
            "testing",
            "test"
        ]
    },

    {
        ids: [
            "rbc_hpv_vaccine"
        ],

        strong: [
            "urukingo rwa hpv",
            "gukingirwa hpv",
            "hpv vaccine",
            "hpv vaccination",
            "urukingo rwa kanseri y'inkondo",
            "vaccine hpv"
        ],

        supporting: [
            "hpv",
            "urukingo",
            "vaccine",
            "gukingirwa",
            "vaccination"
        ],

        blocked: [
            "screening",
            "kwisuzumisha kanseri",
            "kanseri y'inkondo y'umura"
        ]
    },

    {
        ids: [
            "rbc_cervical_cancer"
        ],

        strong: [
            "cervical cancer",
            "cervix cancer",
            "kanseri y'inkondo y'umura",
            "kanseri y'inkondo",
            "cervical screening",
            "screening inkondo y'umura",
            "kwisuzumisha kanseri y'inkondo"
        ],

        supporting: [
            "cervical",
            "inkondo",
            "kanseri",
            "screening",
            "kwisuzumisha"
        ],

        blocked: [
            "urukingo",
            "vaccine",
            "gukingirwa"
        ]
    },

    {
        ids: [
            "rbc_family_planning_methods",
            "family_planning_methods"
        ],

        strong: [
            "uburyo bwo kuboneza urubyaro",
            "methods of family planning",
            "family planning methods",
            "uburyo bwo kwirinda gutwita",
            "uburyo bwo kuboneza"
        ],

        supporting: [
            "kuboneza urubyaro",
            "contraception",
            "contraceptive",
            "method",
            "methods"
        ],

        blocked: [
            "ingaruka",
            "side effects",
            "serivisi",
            "services"
        ]
    },

    {
        ids: [
            "rbc_family_planning_services",
            "family_planning_services"
        ],

        strong: [
            "serivisi zo kuboneza urubyaro",
            "family planning services",
            "aho nakura serivisi zo kuboneza urubyaro",
            "serivisi za kuboneza urubyaro"
        ],

        supporting: [
            "kuboneza urubyaro",
            "serivisi",
            "services"
        ],

        blocked: [
            "ingaruka",
            "side effects"
        ]
    },

    {
        ids: [
            "rbc_family_planning_side_effects",
            "family_planning_side_effects"
        ],

        strong: [
            "ingaruka zo kuboneza urubyaro",
            "ingaruka z'uburyo bwo kuboneza urubyaro",
            "side effects of contraception",
            "contraceptive side effects",
            "ingaruka z'ibinini",
            "ingaruka z'inshinge",
            "ingaruka za implant"
        ],

        supporting: [
            "kuboneza urubyaro",
            "ingaruka",
            "side effects",
            "contraception"
        ],

        blocked: []
    },

    {
        ids: [
            "rbc_anc",
            "rbc_antenatal_care",
            "antenatal_care"
        ],

        strong: [
            "kwitabwaho kwa muganga igihe utwite",
            "antenatal care",
            "prenatal care",
            "kwipimisha utwite",
            "serivisi z'abagore batwite",
            "kujya kwa muganga utwite"
        ],

        supporting: [
            "utwite",
            "gutwita",
            "pregnancy",
            "antenatal",
            "prenatal"
        ],

        blocked: [
            "amaraso",
            "danger signs",
            "ibimenyetso by'akaga"
        ]
    },

    {
        ids: [
            "rbc_pregnancy_danger_signs",
            "pregnancy_danger_signs"
        ],

        strong: [
            "ibimenyetso by'akaga mu gihe utwite",
            "pregnancy danger signs",
            "danger signs in pregnancy",
            "amaraso menshi utwite",
            "kuva amaraso utwite",
            "ibimenyetso by'akaga ku mugore utwite"
        ],

        supporting: [
            "utwite",
            "gutwita",
            "pregnancy",
            "amaraso",
            "ibimenyetso",
            "danger signs"
        ],

        blocked: []
    },

    {
        ids: [
            "rbc_postpartum",
            "postpartum_care"
        ],

        strong: [
            "kwitabwaho nyuma yo kubyara",
            "postpartum care",
            "postnatal care",
            "nyuma yo kubyara",
            "serivisi nyuma yo kubyara"
        ],

        supporting: [
            "nyuma",
            "kubyara",
            "postpartum",
            "postnatal"
        ],

        blocked: []
    },

    {
        ids: [
            "rbc_sexual_violence_72_hours",
            "sexual_violence_72_hours"
        ],

        strong: [
            "amasaha 72",
            "72 hours",
            "gufatwa ku ngufu",
            "gusambanywa ku gahato",
            "sexual assault",
            "rape",
            "nyuma yo gufatwa ku ngufu"
        ],

        supporting: [
            "ihohoterwa",
            "sexual violence",
            "rape",
            "assault",
            "72"
        ],

        blocked: []
    },

    {
        ids: [
            "rbc_gbv_services",
            "gbv_services"
        ],

        strong: [
            "serivisi z'ihohoterwa",
            "aho nakura ubufasha ku ihohoterwa",
            "gbv support",
            "gbv services",
            "gender based violence",
            "ihohoterwa rishingiye ku gitsina"
        ],

        supporting: [
            "gbv",
            "ihohoterwa",
            "violence",
            "ubufasha"
        ],

        blocked: [
            "72 hours",
            "amasaha 72",
            "gufatwa ku ngufu",
            "rape"
        ]
    },

    {
        ids: [
            "rbc_contact",
            "rbc_contact_us",
            "rbc"
        ],

        strong: [
            "numero ya rbc",
            "nimero ya rbc",
            "rbc contact",
            "rbc number",
            "contact rbc",
            "aho nabona rbc",
            "nabona nte rbc"
        ],

        supporting: [
            "rbc",
            "nimero",
            "numero",
            "contact",
            "telefone",
            "phone"
        ],

        blocked: []
    }

];

// ============================================================
// GET TOPIC RULE
// ============================================================

function getTopicRule(item) {

    if (!item) {
        return null;
    }

    const id =
        normalizeText(
            item.id || ""
        );

    if (!id) {
        return null;
    }

    return TOPIC_RULES.find(
        function (rule) {

            return rule.ids.some(
                function (ruleId) {

                    return (
                        normalizeText(ruleId) === id
                    );

                }
            );

        }
    ) || null;

}

// ============================================================
// TOPIC RULE SCORE
// ============================================================

function scoreTopicRule(
    question,
    item
) {

    const rule =
        getTopicRule(item);

    if (!rule) {
        return {
            matched: false,
            score: 0,
            blocked: false
        };
    }

    const q =
        normalizeText(question);

    // --------------------------------------------------------
    // BLOCKED TOPICS
    // --------------------------------------------------------

    for (
        const blocked of
        rule.blocked || []
    ) {

        if (
            containsPhrase(q, blocked) ||
            containsWholeWord(q, blocked)
        ) {

            return {
                matched: false,
                score: 0,
                blocked: true
            };

        }

    }

    let score = 0;

    let strongMatches = 0;

    let supportingMatches = 0;

    // --------------------------------------------------------
    // STRONG PHRASES
    // --------------------------------------------------------

    for (
        const phrase of
        rule.strong || []
    ) {

        if (
            containsPhrase(q, phrase) ||
            containsWholeWord(q, phrase)
        ) {

            strongMatches++;

            score += 50;

        }

    }

    // --------------------------------------------------------
    // SUPPORTING TERMS
    // --------------------------------------------------------

    for (
        const term of
        rule.supporting || []
    ) {

        if (
            containsPhrase(q, term) ||
            containsWholeWord(q, term)
        ) {

            supportingMatches++;

            score += 8;

        }

    }

    if (strongMatches > 0) {

        return {
            matched: true,
            score: score,
            blocked: false
        };

    }

    // A supporting term by itself is NOT enough for sensitive
    // overlapping topics.

    if (
        supportingMatches >= 2
    ) {

        return {
            matched: true,
            score: score,
            blocked: false
        };

    }

    return {
        matched: false,
        score: 0,
        blocked: false
    };

}

// ============================================================
// GENERIC KNOWLEDGE MATCHER
//
// This is intentionally conservative.
//
// It DOES NOT search answer/content/response/text.
// ============================================================

function scoreKnowledgeItem(
    question,
    item
) {

    if (!item) {
        return {
            score: 0,
            confident: false
        };
    }

    const q =
        normalizeText(question);

    if (!q) {
        return {
            score: 0,
            confident: false
        };
    }

    // --------------------------------------------------------
    // SPECIAL TOPIC RULE FIRST
    // --------------------------------------------------------

    const topicResult =
        scoreTopicRule(
            question,
            item
        );

    if (topicResult.blocked) {

        return {
            score: 0,
            confident: false,
            blocked: true
        };

    }

    if (topicResult.matched) {

        return {
            score:
                100 +
                topicResult.score,
            confident: true
        };

    }

    // --------------------------------------------------------
    // EXACT QUESTION
    // --------------------------------------------------------

    if (
        exactQuestionMatch(
            question,
            item
        )
    ) {

        return {
            score: 120,
            confident: true
        };

    }

    // --------------------------------------------------------
    // SEARCH ONLY QUESTION METADATA
    // --------------------------------------------------------

    const fields =
        getSearchFields(item);

    if (
        fields.length === 0
    ) {

        return {
            score: 0,
            confident: false
        };

    }

    // --------------------------------------------------------
    // PHRASE MATCHING
    // --------------------------------------------------------

    let phraseScore = 0;

    let phraseMatches = 0;

    for (
        const field of fields
    ) {

        const normalizedField =
            normalizeText(field);

        if (!normalizedField) {
            continue;
        }

        if (
            normalizeText(field) === q
        ) {

            phraseScore += 100;

            phraseMatches++;

            continue;

        }

        // Full field appearing in question

        if (
            containsPhrase(
                q,
                normalizedField
            )
        ) {

            // Long phrases are much stronger.
            const fieldWords =
                meaningfulTokens(
                    normalizedField
                );

            if (
                fieldWords.length >= 2
            ) {

                phraseScore +=
                    35 +
                    (
                        fieldWords.length * 4
                    );

                phraseMatches++;

            }

        }

    }

    // --------------------------------------------------------
    // TOKEN MATCHING
    // --------------------------------------------------------

    const questionTokens =
        meaningfulTokens(question);

    if (
        questionTokens.length === 0
    ) {

        return {
            score: phraseScore,
            confident:
                phraseScore >= 60
        };

    }

    let tokenMatches = 0;

    let weightedTokenScore = 0;

    for (
        const field of fields
    ) {

        const fieldTokens =
            new Set(
                meaningfulTokens(field)
            );

        for (
            const token of
            questionTokens
        ) {

            if (
                fieldTokens.has(token)
            ) {

                tokenMatches++;

                weightedTokenScore += 3;

            }

        }

    }

    // --------------------------------------------------------
    // IMPORTANT:
    // ONE COMMON WORD IS NOT A MATCH.
    // --------------------------------------------------------

    let score =
        phraseScore +
        weightedTokenScore;

    // Require either:
    //
    // 1. a meaningful phrase match
    // 2. several meaningful token matches
    //
    // Otherwise return no match.

    const confident =
        phraseMatches >= 1 ||
        tokenMatches >= 3;

    if (!confident) {

        return {
            score: 0,
            confident: false
        };

    }

    // --------------------------------------------------------
    // MULTIPLE MEANINGFUL TERMS
    // --------------------------------------------------------

    if (
        tokenMatches >= 4
    ) {

        score += 15;

    }

    return {
        score: score,
        confident: true
    };

}

// ============================================================
// SEARCH KNOWLEDGE BASE
// ============================================================

function searchKnowledge(question) {

    if (
        !Array.isArray(
            allKnowledgeBase
        ) ||
        allKnowledgeBase.length === 0
    ) {

        return null;

    }

    const results = [];

    for (
        const item of
        allKnowledgeBase
    ) {

        if (!item) {
            continue;
        }

        const result =
            scoreKnowledgeItem(
                question,
                item
            );

        if (
            result.blocked
        ) {
            continue;
        }

        if (
            result.confident &&
            result.score > 0
        ) {

            results.push({
                item: item,
                score: result.score
            });

        }

    }

    if (
        results.length === 0
    ) {

        return null;

    }

    results.sort(
        function (a, b) {
            return b.score - a.score;
        }
    );

    const best =
        results[0];

    const second =
        results[1];

    // --------------------------------------------------------
    // CONFIDENCE REQUIREMENT
    //
    // If two different answers are nearly tied, do not guess.
    // Let OpenAI answer instead.
    // --------------------------------------------------------

    if (
        second &&
        best.score < 120 &&
        (
            best.score -
            second.score
        ) < 15
    ) {

        console.log(
            "⚠️ Knowledge match uncertain. Using AI instead."
        );

        return null;

    }

    // Additional safety threshold.

    if (
        best.score < 30
    ) {

        return null;

    }

    console.log(
        "📚 Knowledge match:",
        best.item.id ||
        best.item.title ||
        "unknown",
        "| score:",
        best.score
    );

    return best.item;

}

// ============================================================
// REMOVE SOURCE-NOTE HTML
//
// Source metadata remains in the knowledge file, but visible
// source-note blocks are removed from the answer shown to users.
// ============================================================

function cleanKnowledgeAnswer(
    answer
) {

    if (!answer) {
        return "";
    }

    return String(answer)
        .replace(
            /<div\s+class=["']source-note["'][^>]*>[\s\S]*?<\/div>/gi,
            ""
        )
        .trim();

}

// ============================================================
// DETECT HEALTH / SRHR QUESTION
// ============================================================

function isHealthQuestion(
    question
) {

    const q =
        normalizeText(question);

    const healthTerms = [

        // HIV
        "hiv",
        "aids",
        "sida",
        "pep",
        "prep",
        "arv",
        "art",
        "virusi",
        "ubwandu bwa hiv",

        // STI
        "sti",
        "std",
        "syphilis",
        "gonorrhea",
        "gonorrhoea",
        "chlamydia",
        "hpv",
        "herpes",
        "trichomoniasis",

        // Sexual health
        "imibonano",
        "imibonano mpuzabitsina",
        "igitsina",
        "sex",
        "sexual",
        "agakingirizo",
        "condom",

        // Pregnancy
        "inda",
        "gutwita",
        "gutwara inda",
        "pregnancy",
        "pregnant",
        "umugore utwite",
        "umukobwa utwite",

        // Family planning
        "kuboneza urubyaro",
        "family planning",
        "contraception",
        "contraceptive",
        "ikinini",
        "inshinge",
        "implant",
        "sterilization",

        // Menstruation
        "imihango",
        "period",
        "menstruation",
        "amaraso y'imihango",

        // SRHR
        "srhr",
        "ubuzima bw'imyororokere",
        "reproductive health",
        "sexual and reproductive health",

        // General health
        "ibimenyetso",
        "symptoms",
        "indwara",
        "disease",
        "ubwandu",
        "infection",
        "umuti",
        "imiti",
        "medicine",
        "treatment",
        "kwipimisha",
        "test",
        "kwivuza",
        "ivuriro",
        "ibitaro",
        "health center",
        "doctor",
        "umuganga",

        // GBV
        "ihohoterwa",
        "ihohoterwa rishingiye ku gitsina",
        "sexual violence",
        "sexual assault",
        "rape",
        "gusambanya ku gahato",
        "ubwumvikane",
        "consent",

        // Other
        "ubugumba",
        "infertility",
        "ovulation",
        "intanga",
        "ovary",
        "uterus",
        "nyababyeyi",
        "vagina",
        "penis",
        "amabere"

    ];

    return healthTerms.some(
        function (term) {

            return (
                containsPhrase(
                    q,
                    term
                ) ||
                containsWholeWord(
                    q,
                    term
                )
            );

        }
    );

}

// ============================================================
// DETECT KINYARWANDA
// ============================================================

function isKinyarwanda(
    question
) {

    const q =
        normalizeText(question);

    const words = [

        "ni iki",
        "ni izihe",
        "nizihe",
        "iki",
        "ibiki",
        "ute",
        "nte",
        "nakora",
        "nkore",
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
        "kuboneza urubyaro",
        "agakingirizo",
        "ibimenyetso",
        "kwipimisha",
        "umuti",
        "imiti",
        "umuganga",
        "ivuriro",
        "ibitaro",
        "ihohoterwa",
        "urubyiruko",
        "ubufasha",
        "ryari",
        "kuki",
        "ese",
        "mbese",
        "umuntu",
        "abantu",
        "bimenyetso",
        "ubwandu"

    ];

    return words.some(
        function (word) {

            return containsPhrase(
                q,
                word
            );

        }
    );

}

// ============================================================
// OPENAI WEB SEARCH ANSWER
// ============================================================

async function searchAndAnswer(
    question
) {

    console.log("");
    console.log(
        "======================================"
    );
    console.log(
        "MENYA SRHR QUESTION"
    );
    console.log(
        "======================================"
    );
    console.log(
        "QUESTION:",
        question
    );
    console.log(
        "KINYARWANDA:",
        isKinyarwanda(question)
    );
    console.log(
        "HEALTH/SRHR:",
        isHealthQuestion(question)
    );
    console.log(
        "SEARCHING TRUSTED SOURCES..."
    );
    console.log(
        "======================================"
    );

    const response =
        await openai.responses.create({

            model: MODEL,

            tools: [

                {
                    type: "web_search",

                    filters: {
                        allowed_domains: [

                            "rbc.gov.rw",
                            "moh.gov.rw",
                            "who.int",
                            "unaids.org",
                            "unfpa.org",
                            "unicef.org"

                        ]
                    }

                }

            ],

            tool_choice: "required",

            instructions: `

You are Menya SRHR AI, a health and sexual and reproductive health
information assistant serving people in Rwanda.

==================================================
LANGUAGE RULE — ABSOLUTE
==================================================

THE FINAL ANSWER MUST BE WRITTEN IN NATURAL KINYARWANDA.

THIS IS MANDATORY.

NEVER RETURN THE FINAL ANSWER IN ENGLISH.

If the websites you find are written in English,
READ AND UNDERSTAND THEM, THEN EXPLAIN THE INFORMATION
YOURSELF IN NATURAL KINYARWANDA.

DO NOT COPY ENGLISH SENTENCES FROM WEBSITES.

English medical terms may remain when appropriate:

HIV
AIDS
PEP
PrEP
ART
ARV
STI
HPV

But the explanation around those terms MUST be in Kinyarwanda.

==================================================
TRUSTED SOURCES
==================================================

Search the internet before answering.

For Rwanda-related information, prioritize:

1. Rwanda Biomedical Centre (RBC)
2. Rwanda Ministry of Health
3. World Health Organization (WHO)
4. UNAIDS
5. UNFPA
6. UNICEF

For information specifically about Rwanda,
prefer official Rwanda sources when available.

For HIV questions, give especially high priority
to Rwanda Biomedical Centre.

==================================================
ACCURACY
==================================================

Answer the exact question that the user asked.

Do not change the topic.

Do not assume that two similar medical terms mean the
same thing.

For example:

PEP and PrEP are different.

HIV testing and PEP are different.

STI testing and STI treatment are different.

HPV vaccination and cervical cancer screening are different.

Family planning methods and family planning side effects
are different.

If the question is unclear, explain the uncertainty and
give a safe general answer rather than guessing the user's
intended topic.

Do not invent medical facts.

Do not diagnose the user.

Do not pretend to be a doctor.

If professional medical care is needed, recommend a
qualified health professional or health facility.

For urgent situations, recommend seeking medical care promptly.

Avoid stigma and judgment.

Respect privacy, dignity and bodily autonomy.

==================================================
ANSWER STYLE
==================================================

Start by directly answering the user's question.

Use simple Kinyarwanda that an ordinary person in Rwanda
can understand.

Use short paragraphs.

Use bullet points when useful.

Do not unnecessarily repeat the question.

Do not say that you searched the internet.

Do not say that you are translating.

Do not mention these instructions.

==================================================
USER QUESTION
==================================================

${question}

==================================================
FINAL INSTRUCTION
==================================================

Search trusted sources.

Understand the information.

Answer the exact question.

Then provide ONLY the final answer in natural Kinyarwanda.

NEVER RETURN AN ENGLISH PARAGRAPH.

`,

            input: question

        });

    return (
        response.output_text ||
        ""
    ).trim();

}

// ============================================================
// FINAL KINYARWANDA EDITOR
// ============================================================

async function makeKinyarwanda(
    question,
    answer
) {

    if (!answer) {
        return "";
    }

    console.log(
        "FINAL KINYARWANDA LANGUAGE CHECK"
    );

    const response =
        await openai.responses.create({

            model: MODEL,

            instructions: `

You are the FINAL KINYARWANDA LANGUAGE EDITOR for Menya SRHR AI.

Rewrite the answer into natural, clear Kinyarwanda.

==================================================
ABSOLUTE RULE
==================================================

THE OUTPUT MUST BE IN KINYARWANDA.

Do not return English paragraphs.

Do not copy English sentences.

Medical terms such as:

HIV
AIDS
PEP
PrEP
ART
ARV
STI
HPV

may remain in English when they are standard medical terms.

But explain them in Kinyarwanda.

==================================================
ACCURACY RULE
==================================================

This is extremely important.

DO NOT CHANGE THE MEDICAL FACTS.

DO NOT ADD NEW MEDICAL FACTS.

DO NOT REMOVE IMPORTANT SAFETY INFORMATION.

DO NOT CHANGE THE TOPIC.

Answer the user's exact question.

Do not turn PEP into PrEP.

Do not turn HIV testing into PEP.

Do not turn STI testing into STI treatment.

Do not turn HPV vaccination into cervical cancer screening.

Do not change family planning methods into side effects.

==================================================
STYLE
==================================================

Use simple natural Kinyarwanda.

Use short paragraphs.

Use bullet points when useful.

Be respectful.

Avoid stigma.

Return ONLY the final answer.

Do not say:

"Here is the translation."

"Translation:"

"According to the English text..."

Just give the final Kinyarwanda answer.

==================================================
USER QUESTION
==================================================

${question}

==================================================
ANSWER
==================================================

${answer}

==================================================
FINAL TASK
==================================================

Rewrite the answer above into accurate natural Kinyarwanda.

THE OUTPUT MUST BE KINYARWANDA.

`,

            input:
                "QUESTION:\n" +
                question +
                "\n\nANSWER:\n" +
                answer

        });

    const finalAnswer =
        response.output_text || "";

    return (
        finalAnswer.trim() ||
        answer
    );

}

// ============================================================
// DIRECT KNOWLEDGE ANSWER
// ============================================================

async function getKnowledgeAnswer(
    question,
    item
) {

    if (!item) {
        return null;
    }

    let answer =
        cleanKnowledgeAnswer(
            item.answer ||
            item.content ||
            item.response ||
            item.text ||
            ""
        );

    if (!answer) {
        return null;
    }

    // If the answer is already Kinyarwanda,
    // we still run it through the language editor so
    // the final output remains consistent.

    try {

        answer =
            await makeKinyarwanda(
                question,
                answer
            );

    } catch (error) {

        console.log(
            "⚠️ Kinyarwanda editor failed for knowledge answer."
        );

        console.log(
            error.message
        );

    }

    return answer.trim();

}

// ============================================================
// GENERAL OPENAI ANSWER
// ============================================================

async function getGeneralAnswer(
    question
) {

    const response =
        await openai.responses.create({

            model: MODEL,

            instructions: `

You are Ai Yawe / Menya SRHR AI.

Answer the user's question clearly and respectfully.

If the user asks a health, sexual health, reproductive health,
HIV, STI, pregnancy, contraception, menstruation, GBV or
other SRHR-related question, provide accurate educational
information.

If the question is written in Kinyarwanda, answer in
natural Kinyarwanda.

If the question is written in English, you may understand
the English question but the final answer should still be
natural Kinyarwanda because this assistant is designed for
Rwanda.

Do not diagnose.

Do not invent facts.

Do not claim to be a doctor.

If professional care is needed, recommend a qualified
health professional or health facility.

Use simple language.

`,

            input: question

        });

    return (
        response.output_text ||
        ""
    ).trim();

}

// ============================================================
// CHAT API
// ============================================================

app.post(
    "/api/chat",
    async function (req, res) {

        try {

            const question =
                String(
                    req.body.question ||
                    ""
                ).trim();

            if (!question) {

                return res.status(400).json({

                    error:
                        "Nta kibazo cyatanzwe."

                });

            }

            if (!openai) {

                return res.status(500).json({

                    error:
                        "OpenAI API key ntabwo yabonetse."

                });

            }

            console.log("");
            console.log(
                "======================================"
            );
            console.log(
                "NEW USER QUESTION"
            );
            console.log(
                "======================================"
            );
            console.log(
                question
            );

            // ==================================================
            // STEP 1
            // Try the fixed knowledge base ONLY when the
            // question matches strongly.
            // ==================================================

            const matchedKnowledge =
                searchKnowledge(
                    question
                );

            let answer = "";

            let knowledgeUsed = false;

            let webSearchUsed = false;

            // ==================================================
            // STEP 2
            // If there is a confident knowledge match,
            // use it.
            // ==================================================

            if (matchedKnowledge) {

                console.log(
                    "✅ USING CONFIDENT KNOWLEDGE BASE ANSWER"
                );

                answer =
                    await getKnowledgeAnswer(
                        question,
                        matchedKnowledge
                    );

                knowledgeUsed = true;

            }

            // ==================================================
            // STEP 3
            // If there is NO confident match, use live trusted
            // web search for health/SRHR questions.
            // ==================================================

            if (
                !answer &&
                isHealthQuestion(question)
            ) {

                console.log(
                    "🌐 NO CONFIDENT KNOWLEDGE MATCH"
                );

                console.log(
                    "🌐 USING TRUSTED WEB SEARCH"
                );

                answer =
                    await searchAndAnswer(
                        question
                    );

                webSearchUsed = true;

            }

            // ==================================================
            // STEP 4
            // General questions that are not health/SRHR.
            // ==================================================

            if (!answer) {

                console.log(
                    "🤖 USING GENERAL AI ANSWER"
                );

                answer =
                    await getGeneralAnswer(
                        question
                    );

            }

            // ==================================================
            // STEP 5
            // Final Kinyarwanda safety/language pass.
            // ==================================================

            if (answer) {

                try {

                    answer =
                        await makeKinyarwanda(
                            question,
                            answer
                        );

                } catch (error) {

                    console.log(
                        "⚠️ Final Kinyarwanda editor failed."
                    );

                    console.log(
                        error.message
                    );

                }

            }

            if (!answer) {

                throw new Error(
                    "OpenAI ntiyagaruye igisubizo."
                );

            }

            // ==================================================
            // FINAL RESPONSE
            // ==================================================

            console.log("");
            console.log(
                "======================================"
            );
            console.log(
                "ANSWER READY"
            );
            console.log(
                "======================================"
            );

            return res.json({

                answer: answer,

                language: "rw",

                knowledgeUsed:
                    knowledgeUsed,

                webSearchUsed:
                    webSearchUsed,

                preferredSource:
                    "Rwanda Biomedical Centre"

            });

        } catch (error) {

            console.error("");
            console.error(
                "======================================"
            );
            console.error(
                "MENYA SRHR ERROR"
            );
            console.error(
                "======================================"
            );
            console.error(
                error
            );
            console.error(
                "======================================"
            );

            return res.status(500).json({

                error:
                    "Habaye ikibazo mu gushaka igisubizo. Ongera ugerageze."

            });

        }

    }
);

// ============================================================
// API 404
// ============================================================

app.use(
    "/api",
    function (req, res) {

        res.status(404).json({

            error:
                "API endpoint ntabwo ibonetse."

        });

    }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    function () {

        console.log("");
        console.log(
            "======================================"
        );
        console.log(
            "MENYA SRHR AI IS RUNNING"
        );
        console.log(
            "======================================"
        );

        console.log(
            "Website: http://localhost:" +
            PORT
        );

        console.log(
            "Health: http://localhost:" +
            PORT +
            "/api/health"
        );

        console.log(
            "OpenAI: " +
            (
                process.env.OPENAI_API_KEY
                    ? "CONNECTED"
                    : "MISSING"
            )
        );

        console.log(
            "Model: " +
            MODEL
        );

        console.log(
            "Original Knowledge: " +
            knowledgeBase.length
        );

        console.log(
            "RBC Knowledge: " +
            rbcKnowledgeBase.length
        );

        console.log(
            "Total Knowledge: " +
            allKnowledgeBase.length
        );

        console.log(
            "Smart Knowledge Matching: ENABLED"
        );

        console.log(
            "Answer-Text Matching: DISABLED"
        );

        console.log(
            "RBC Priority: ENABLED"
        );

        console.log(
            "Trusted Web Search: ENABLED"
        );

        console.log(
            "Kinyarwanda: ENFORCED"
        );

        console.log(
            "======================================"
        );

    }
);