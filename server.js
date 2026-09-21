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
// ENVIRONMENT
// ============================================================

dotenv.config();


// ============================================================
// APP
// ============================================================

const app = express();

const PORT =
    process.env.PORT || 3000;

const MODEL =
    "gpt-5.6-luna";


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.static(__dirname)
);


// ============================================================
// OPENAI
// ============================================================

let openai = null;

if (process.env.OPENAI_API_KEY) {

    openai =
        new OpenAI({
            apiKey:
                process.env.OPENAI_API_KEY
        });

    console.log(
        "🤖 OpenAI: CONNECTED"
    );

} else {

    console.log(
        "⚠️ OpenAI API key was not found."
    );

}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

let knowledgeBase = [];

try {

    const knowledge =
        require("./knowledge.js");


    if (
        Array.isArray(knowledge)
    ) {

        knowledgeBase =
            knowledge;

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
        `✅ Knowledge base loaded: ${knowledgeBase.length} entries`
    );


} catch (error) {

    console.log(
        "❌ Could not load knowledge.js"
    );

    console.log(
        error.message
    );

}


// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectLanguage(question) {

    const text =
        String(question)
            .toLowerCase()
            .trim();


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
        "mbese",
        "kwemera",
        "ihohoterwa",
        "urubyaro",
        "gusama",
        "gusama inda",
        "kwipimisha",
        "umubiri",
        "uburenganzira",
        "gukingira",
        "kurinda",
        "kwirinda",
        "ubufasha",
        "muganga",
        "ibinini",
        "ururenda",
        "hiv yandura",
        "hiv",
        "stI",
        "pep",
        "prep"

    ];


    let score = 0;


    for (
        const word
        of kinyarwandaWords
    ) {

        if (
            text.includes(word)
        ) {

            score++;

        }

    }


    const kinyarwandaStarts = [

        "ni ",
        "ese ",
        "ninde ",
        "nizihe ",
        "nakora ",
        "nshobora ",
        "ese nshobora ",
        "ese nakora ",
        "ni ryari ",
        "ni gute ",
        "gute ",
        "ute "

    ];


    for (
        const start
        of kinyarwandaStarts
    ) {

        if (
            text.startsWith(start)
        ) {

            score += 2;

        }

    }


    if (score >= 1) {

        return "kinyarwanda";

    }


    return "english";

}


// ============================================================
// GET KNOWLEDGE ANSWER
// ============================================================

function getKnowledgeAnswer(item) {

    if (!item) {
        return null;
    }


    if (
        typeof item === "string"
    ) {

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
// KNOWLEDGE BASE SEARCH
// ============================================================

function searchKnowledge(question) {

    if (
        !Array.isArray(knowledgeBase) ||
        knowledgeBase.length === 0
    ) {

        return null;

    }


    const questionText =
        question
            .toLowerCase()
            .trim();


    if (!questionText) {
        return null;
    }


    const words =
        questionText
            .split(/\s+/)
            .filter(
                word =>
                    word.length > 2
            );


    let bestMatch = null;

    let bestScore = 0;


    for (
        const item
        of knowledgeBase
    ) {

        if (!item) {
            continue;
        }


        const searchableText = [

            item.id,
            item.question,
            item.title,
            item.topic,
            item.keywords,
            item.answer,
            item.content,
            item.response,
            item.text

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        if (!searchableText) {
            continue;
        }


        let score = 0;


        /*
           Exact question.
        */

        if (
            searchableText.includes(
                questionText
            )
        ) {

            score += 10;

        }


        /*
           Individual words.
        */

        for (
            const word
            of words
        ) {

            if (
                searchableText.includes(
                    word
                )
            ) {

                score++;

            }

        }


        /*
           Keywords.
        */

        if (
            Array.isArray(item.keywords)
        ) {

            for (
                const keyword
                of item.keywords
            ) {

                if (
                    questionText.includes(
                        String(keyword)
                            .toLowerCase()
                    )
                ) {

                    score += 5;

                }

            }

        }


        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestMatch =
                item;

        }

    }


    if (
        bestMatch &&
        bestScore >= 4
    ) {

        return {

            item:
                bestMatch,

            answer:
                getKnowledgeAnswer(
                    bestMatch
                ),

            score:
                bestScore

        };

    }


    return null;

}


// ============================================================
// DETECT ENGLISH
// ============================================================

function looksEnglish(text) {

    if (
        !text ||
        typeof text !== "string"
    ) {

        return false;

    }


    const lower =
        text.toLowerCase();


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
        "through",
        "when",
        "from",
        "with",
        "during",
        "blood",
        "mother",
        "child",
        "unprotected",
        "spread",
        "ways",
        "exposed",
        "body",
        "fluids",
        "especially",
        "sharing",
        "needles",
        "equipment",
        "infected",
        "transmission"

    ];


    let matches = 0;


    for (
        const word
        of englishWords
    ) {

        const regex =
            new RegExp(
                "\\b" +
                word +
                "\\b",
                "i"
            );


        if (
            regex.test(lower)
        ) {

            matches++;

        }

    }


    return matches >= 3;

}


// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

function buildSystemInstructions(language) {

    if (
        language === "kinyarwanda"
    ) {

        return `

Uri Ai Yawe / Menya SRHR AI.

Uri umufasha utanga amakuru yizewe ku buzima bw'imyororokere,
ubuzima bw'imibonano mpuzabitsina, uburenganzira bwa muntu
n'uburinganire.

Intego yawe ni ugufasha cyane cyane urubyiruko rwo mu Rwanda
kubona amakuru yumvikana, yizewe kandi yubaha umuntu.

AMATEGEKO AKOMEYE:

1. NIBA UMUKORESHAJI ABASHE MU KINYARWANDA,
   SUBIZA MU KINYARWANDA GUSA.

2. NTUGIRE IGISUBIZO CYAWE MU CYONGEREZA.

3. HIV, AIDS, STI, HPV, PEP, PrEP, ART na ARV
   bishobora kuguma uko byanditse.

4. Koresha Kinyarwanda cyoroshye kandi gisobanutse.

5. Ntukaseke cyangwa ngo ucire urubanza umukoresha.

6. Tanga amakuru yizewe ashingiye ku bumenyi bw'ubuzima.

7. Ntukihimbire amakuru cyangwa imibare.

8. Ntukore diagnosis nk'aho wasuzumye umuntu.

9. Niba ikibazo gishobora gushyira ubuzima mu kaga,
   shishikariza umuntu gushaka ubufasha bw'abaganga.

10. Ku bibazo bya GBV cyangwa sexual violence,
    ntushinje uwahohotewe.

11. Consent igomba kuba ku bushake,
    isobanutse kandi ishobora gukurwaho.

12. Ntutange prescription y'imiti.

13. Wubahe abantu bose.

14. Niba utazi igisubizo neza,
    vuga ko udafite amakuru ahagije.

15. Subiza mu buryo bugufi ariko bufite ibisobanuro bihagije.

16. Iyo bishoboka, koresha bullets na paragraphs ngufi.

17. IGISUBIZO CYAWE GITEGEREZWA KUBA MU KINYARWANDA GUSA.

`;

    }


    return `

You are Ai Yawe / Menya SRHR AI.

You provide reliable and respectful information about
sexual and reproductive health.

Use clear and simple language.

If the user asks in English, answer in English.

Do not judge the user.

Do not invent medical facts.

Do not diagnose users.

For urgent situations, encourage appropriate medical care.

For GBV or sexual violence, respond respectfully.

Consent must be voluntary and can be withdrawn.

Do not prescribe medication.

If you do not know something, say so.

Keep answers clear and reasonably concise.

`;

}


// ============================================================
// TRANSLATE ENGLISH → KINYARWANDA
// ============================================================

async function forceKinyarwanda(
    originalQuestion,
    answer
) {

    if (
        !openai ||
        !answer
    ) {

        return "";

    }


    try {

        const response =
            await openai.responses.create({

                model:
                    MODEL,

                instructions: `

Uri umusemuzi wihariye wa Ai Yawe.

Hindura igisubizo kiri hasi ugishyire
MU KINYARWANDA GUSA.

IKIBAZO:

${originalQuestion}

IGISUBIZO:

${answer}

AMATEGEKO:

- Koresha Kinyarwanda gusa.
- Ntusige interuro z'Icyongereza.
- Rinda ukuri kw'ubuvuzi.
- HIV, AIDS, STI, HPV, PEP, PrEP, ART na ARV
  bishobora kuguma uko biri.
- Niba igisubizo kirimo HTML,
  RINDA HTML tags.
- Hindura amagambo ari imbere muri HTML gusa.
- Ntukongeremo Markdown.
- Ntukongeremo ibisobanuro by'uko wahinduye.
- Garura igisubizo gusa.

`,

                input:
                    "QUESTION:\n" +
                    originalQuestion +
                    "\n\nANSWER:\n" +
                    answer

            });


        const translated =
            (
                response.output_text ||
                ""
            ).trim();


        if (!translated) {
            return "";
        }


        return translated;


    } catch (error) {

        console.error(
            "❌ Kinyarwanda translation error:",
            error.message
        );

        return "";

    }

}


// ============================================================
// GENERATE DIRECTLY IN KINYARWANDA
// ============================================================

async function generateKinyarwandaAnswer(
    question
) {

    if (!openai) {
        return "";
    }


    try {

        const response =
            await openai.responses.create({

                model:
                    MODEL,

                instructions:
                    buildSystemInstructions(
                        "kinyarwanda"
                    ),

                input:
                    question

            });


        const answer =
            (
                response.output_text ||
                ""
            ).trim();


        if (!answer) {
            return "";
        }


        return answer;


    } catch (error) {

        console.error(
            "❌ Kinyarwanda generation error:",
            error.message
        );

        return "";

    }

}


// ============================================================
// FINAL KINYARWANDA ENFORCEMENT
// ============================================================

async function ensureKinyarwanda(
    question,
    answer
) {

    if (!answer) {

        return (
            "Mbabarira, nta gisubizo cyabonetse."
        );

    }


    /*
       If the answer is already Kinyarwanda,
       leave it alone.
    */

    if (
        !looksEnglish(answer)
    ) {

        return answer;

    }


    console.log(
        "🌍 English answer detected."
    );


    /*
       FIRST ATTEMPT:
       Translate the existing answer.
    */

    const translated =
        await forceKinyarwanda(
            question,
            answer
        );


    if (
        translated &&
        !looksEnglish(translated)
    ) {

        console.log(
            "✅ Translation produced Kinyarwanda."
        );

        return translated;

    }


    /*
       SECOND ATTEMPT:
       Generate a completely new answer
       directly in Kinyarwanda.
    */

    console.log(
        "🔄 Generating fresh Kinyarwanda answer..."
    );


    const fresh =
        await generateKinyarwandaAnswer(
            question
        );


    /*
       IMPORTANT:

       The old code accepted the fresh answer
       without checking it.

       This version checks it again.
    */

    if (
        fresh &&
        !looksEnglish(fresh)
    ) {

        console.log(
            "✅ Fresh answer confirmed as Kinyarwanda."
        );

        return fresh;

    }


    /*
       THIRD SAFETY:

       Never send English to a Kinyarwanda user.
    */

    console.log(
        "⚠️ Could not produce a confirmed Kinyarwanda answer."
    );


    return (
        "Mbabarira, ubu sinashoboye kubona " +
        "igisubizo gihagije mu Kinyarwanda. " +
        "Ongera ugerageze nyuma."
    );

}


// ============================================================
// HOME PAGE
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status:
                "ok",

            service:
                "Ai Yawe / Menya SRHR AI",

            openai:
                !!openai,

            model:
                MODEL,

            knowledgeBaseEntries:
                knowledgeBase.length

        });

    }
);


// ============================================================
// CHAT API
// ============================================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const question =
                req.body.question;


            /* ------------------------------------------------
               VALIDATE
            ------------------------------------------------ */

            if (
                !question ||
                typeof question !== "string"
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Nta kibazo cyatanzwe."

                    });

            }


            const cleanQuestion =
                question.trim();


            if (!cleanQuestion) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Andika ikibazo mbere yo kohereza."

                    });

            }


            console.log("");
            console.log(
                "=============================================="
            );
            console.log(
                "👤 USER:",
                cleanQuestion
            );


            /* ------------------------------------------------
               LANGUAGE
            ------------------------------------------------ */

            const language =
                detectLanguage(
                    cleanQuestion
                );


            console.log(
                "🌍 LANGUAGE:",
                language
            );


            /* ------------------------------------------------
               KNOWLEDGE BASE
            ------------------------------------------------ */

            const knowledgeResult =
                searchKnowledge(
                    cleanQuestion
                );


            if (
                knowledgeResult &&
                knowledgeResult.answer
            ) {

                console.log(
                    "📚 Knowledge base match:",
                    knowledgeResult.item.id ||
                    "unknown"
                );


                let answer =
                    knowledgeResult.answer;


                /*
                   VERY IMPORTANT:

                   Kinyarwanda question =
                   Kinyarwanda answer.

                   This applies even when the
                   knowledge base answer itself
                   is English.
                */

                if (
                    language === "kinyarwanda"
                ) {

                    answer =
                        await ensureKinyarwanda(
                            cleanQuestion,
                            answer
                        );

                }


                console.log(
                    "✅ Returning knowledge-base answer."
                );


                return res.json({

                    success:
                        true,

                    answer:
                        answer,

                    source:
                        "knowledge-base",

                    language:
                        language

                });

            }


            /* ------------------------------------------------
               OPENAI REQUIRED
            ------------------------------------------------ */

            if (!openai) {

                return res
                    .status(503)
                    .json({

                        success:
                            false,

                        error:
                            "Ai Yawe ntabwo iri connected kuri OpenAI. Reba OPENAI_API_KEY muri .env."

                    });

            }


            /* ------------------------------------------------
               OPENAI
            ------------------------------------------------ */

            console.log(
                "🤖 Asking OpenAI..."
            );


            const response =
                await openai.responses.create({

                    model:
                        MODEL,

                    instructions:
                        buildSystemInstructions(
                            language
                        ),

                    input:
                        cleanQuestion

                });


            let answer =
                (
                    response.output_text ||
                    ""
                ).trim();


            if (!answer) {

                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        error:
                            "AI ntiyagaruye igisubizo."

                    });

            }


            /* ------------------------------------------------
               FINAL LANGUAGE CHECK
            ------------------------------------------------ */

            if (
                language === "kinyarwanda"
            ) {

                answer =
                    await ensureKinyarwanda(
                        cleanQuestion,
                        answer
                    );

            }


            console.log(
                "✅ AI answered."
            );


            console.log(
                "=============================================="
            );
            console.log("");


            return res.json({

                success:
                    true,

                answer:
                    answer,

                source:
                    "openai",

                language:
                    language

            });


        } catch (error) {

            console.error("");
            console.error(
                "❌ CHAT ERROR:"
            );
            console.error(
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Habaye ikibazo mu kubona igisubizo. Ongera ugerageze nyuma."

                });

        }

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            "🤖 AI YAWE / MENYA SRHR AI"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `🌐 Website: http://localhost:${PORT}`
        );

        console.log(
            `❤️ Health:  http://localhost:${PORT}/api/health`
        );

        console.log(
            `🧠 Model:   ${MODEL}`
        );

        console.log(
            `📚 Knowledge entries: ${knowledgeBase.length}`
        );

        console.log(
            "=============================================="
        );

        console.log("");

    }
);