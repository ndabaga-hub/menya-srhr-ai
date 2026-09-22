// ============================================================
// AI YAWE / MENYA SRHR AI
// COMPLETE BACKEND WITH RBC KNOWLEDGE LAYER
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
// LOAD EXISTING KNOWLEDGE BASE
// ============================================================

let knowledgeBase = [];

try {

    const knowledge =
        require("./knowledge.js");


    if (
        Array.isArray(
            knowledge
        )
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
        `✅ Existing knowledge base loaded: ${knowledgeBase.length} entries`
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
// LOAD RBC KNOWLEDGE BASE
// ============================================================

let rbcKnowledgeBase = [];

try {

    const rbcKnowledge =
        require(
            "./rbc-knowledge.js"
        );


    if (
        Array.isArray(
            rbcKnowledge
        )
    ) {

        rbcKnowledgeBase =
            rbcKnowledge;

    } else if (
        Array.isArray(
            rbcKnowledge.rbcKnowledgeBase
        )
    ) {

        rbcKnowledgeBase =
            rbcKnowledge.rbcKnowledgeBase;

    }


    console.log(
        `🇷🇼 RBC knowledge loaded: ${rbcKnowledgeBase.length} entries`
    );


} catch (error) {

    console.log(
        "⚠️ RBC knowledge layer could not be loaded."
    );

    console.log(
        error.message
    );

}


// ============================================================
// COMBINE KNOWLEDGE
// ============================================================

const allKnowledgeBase = [

    ...knowledgeBase,

    ...rbcKnowledgeBase

];


console.log(
    `📚 Total knowledge entries: ${allKnowledgeBase.length}`
);


// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectLanguage(question) {

    const text =
        question
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
        "indwara zandurira",
        "ururenda",
        "urubyiruko",
        "abangavu",
        "ingimbi",
        "utwite",
        "kubyara",
        "umubyeyi",
        "kanseri",
        "inkondo",
        "inkondo y'umura",
        "urukingo",
        "kanseri y'inkondo",
        "kwisuzumisha",
        "umujyanama",
        "ikigo nderabuzima",
        "ibitaro",
        "ubuzima bw'imyororokere"

    ];


    let score = 0;


    for (
        const word
        of kinyarwandaWords
    ) {

        if (
            text.includes(
                word
            )
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
            text.startsWith(
                start
            )
        ) {

            score += 2;

        }

    }


    if (
        score >= 1
    ) {

        return "kinyarwanda";

    }


    return "english";

}


// ============================================================
// KNOWLEDGE SEARCH
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
        of allKnowledgeBase
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

            item.text,

            item.source

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        if (!searchableText) {
            continue;
        }


        let score = 0;


        /* Exact question */

        if (
            searchableText.includes(
                questionText
            )
        ) {

            score += 10;

        }


        /* Word matching */

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


        /* Keyword matching */

        if (
            Array.isArray(
                item.keywords
            )
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


        /* Prefer RBC when the question is Rwanda-specific */

        const rwandaWords = [

            "rwanda",
            "mu rwanda",
            "rbc",
            "ikigo nderabuzima",
            "umujyanama",
            "isange",
            "urubyiruko",
            "serivisi"

        ];


        for (
            const word
            of rwandaWords
        ) {

            if (
                questionText.includes(
                    word
                ) &&
                item.source &&
                String(
                    item.source
                )
                    .toLowerCase()
                    .includes("rwanda biomedical centre")
            ) {

                score += 4;

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
// GET ANSWER FROM KNOWLEDGE ITEM
// ============================================================

function getKnowledgeAnswer(item) {

    if (!item) {
        return null;
    }


    if (
        typeof item ===
        "string"
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
        "treatment",
        "pregnancy",
        "pregnant",
        "vaccine",
        "screening",
        "provider"

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
            regex.test(
                lower
            )
        ) {

            matches++;

        }

    }


    return (
        matches >= 3
    );

}


// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

function buildSystemInstructions(
    language
) {

    if (
        language ===
        "kinyarwanda"
    ) {

        return `

Uri Ai Yawe / Menya SRHR AI.

Uri umufasha utanga amakuru yizewe ku buzima bw'imyororokere,
ubuzima bw'imibonano mpuzabitsina, HIV, STI, gutwita,
kuboneza urubyaro, GBV, consent n'ubuzima bw'urubyiruko.

Uri AI igenewe cyane cyane abantu bo mu Rwanda.

AMATEGEKO AKOMEYE:

1. NIBA UMUKORESHAJI ABASHE MU KINYARWANDA,
   SUBIZA MU KINYARWANDA.

2. Ntugasubize mu Cyongereza keretse amagambo y'ubuvuzi
   mpuzamahanga nka HIV, AIDS, STI, HPV, PEP, PrEP, ART,
   ARV cyangwa izina ry'umuti/serivisi bikenewe kuguma uko biri.

3. Koresha Kinyarwanda cyoroshye kandi gisobanutse.

4. Ntugire uwo ucira urubanza.

5. Ntukihimbire amakuru.

6. Ntukore diagnosis y'umuntu nk'aho wamupimye.

7. Ntutange prescription y'umuti.

8. Iyo ikibazo gisaba ubuvuzi bwihuse, shishikariza umuntu
   kujya ku kigo nderabuzima, kwa muganga cyangwa ku butabazi.

9. Ku ihohoterwa cyangwa sexual violence,
   ntushinje uwahohotewe.

10. Consent igomba kuba ku bushake, isobanutse kandi
    ishobora gukurwaho igihe icyo ari cyo cyose.

11. Iyo utazi igisubizo, vuga ko udafite amakuru ahagije.

12. Ku bibazo byihariye by'u Rwanda, nka serivisi,
    uburyo bwo kuboneza urubyaro, HIV/STI, GBV,
    adolescent SRHR cyangwa cervical screening,
    koresha amakuru yizewe ajyanye n'u Rwanda.

13. Iyo amakuru ya RBC ari yo y'ingenzi ku kibazo,
    shyira ku musozo:
    📚 Isoko: Rwanda Biomedical Centre (RBC).

14. Ntukavangavange amakuru y'umuntu ku giti cye.

15. Subiza mu buryo bufite ibisobanuro bihagije,
    ukoreshe headings na bullets igihe biboneye.

IGISUBIZO CY'UMUKORESHAJI UKORESHE KINYARWANDA
KERETSE AMAGAMBO MPUZAMAHANGA Y'UBUVUZI AKENEWE.

`;

    }


    return `

You are Ai Yawe / Menya SRHR AI.

You provide reliable and respectful sexual and reproductive
health information, with a focus on Rwanda.

Use clear language.

If the user asks in English, answer in English.

For Rwanda-specific questions, use the Rwanda-specific
knowledge available to you.

Do not diagnose users.

Do not prescribe medication.

Do not invent medical facts.

For urgent situations, encourage appropriate medical care.

For GBV or sexual violence, never blame the survivor.

Consent must be voluntary, informed and withdrawable.

If you do not know something, say so.

`;


}


// ============================================================
// FORCE KINYARWANDA
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

Uri umusemuzi wa nyuma wa Ai Yawe / Menya SRHR AI.

Hindura igisubizo gikurikira ukivane mu Cyongereza
ugishyire mu Kinyarwanda gisanzwe kandi cyumvikana.

IKIBAZO:

${originalQuestion}

IGISUBIZO:

${answer}

AMATEGEKO:

- SUBIZA MU KINYARWANDA.
- RINDA UKURI KW'UBUVUZI.
- NTUHINDURE ibisobanuro by'ingenzi.
- HIV, AIDS, STI, HPV, PEP, PrEP, ART, ARV
  bishobora kuguma uko biri.
- RINDA HTML tags niba zihari.
- Ntukongeremo Markdown.
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
// GENERATE KINYARWANDA ANSWER
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


        return (
            response.output_text ||
            ""
        ).trim();


    } catch (error) {

        console.error(
            "❌ Kinyarwanda generation error:",
            error.message
        );

        return "";

    }

}


// ============================================================
// ENSURE KINYARWANDA
// ============================================================

async function ensureKinyarwanda(
    question,
    answer
) {

    if (!answer) {
        return "";
    }


    if (
        !looksEnglish(answer)
    ) {

        return answer;

    }


    console.log(
        "🌍 Translating answer to Kinyarwanda..."
    );


    const translated =
        await forceKinyarwanda(
            question,
            answer
        );


    if (
        translated &&
        !looksEnglish(
            translated
        )
    ) {

        return translated;

    }


    console.log(
        "🔄 Generating fresh Kinyarwanda answer..."
    );


    const fresh =
        await generateKinyarwandaAnswer(
            question
        );


    if (fresh) {

        return fresh;

    }


    return (
        "Mbabarira, ubu sinashoboye kubona " +
        "igisubizo gihagije mu Kinyarwanda. " +
        "Ongera ugerageze nyuma."
    );

}


// ============================================================
// HOME
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

            existingKnowledgeEntries:
                knowledgeBase.length,

            rbcKnowledgeEntries:
                rbcKnowledgeBase.length,

            knowledgeBaseEntries:
                allKnowledgeBase.length

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


            console.log(
                "👤 User:",
                cleanQuestion
            );


            // =================================================
            // LANGUAGE
            // =================================================

            const language =
                detectLanguage(
                    cleanQuestion
                );


            console.log(
                "🌍 Language:",
                language
            );


            // =================================================
            // SEARCH KNOWLEDGE
            // =================================================

            const knowledgeResult =
                searchKnowledge(
                    cleanQuestion
                );


            if (
                knowledgeResult &&
                knowledgeResult.answer
            ) {

                let answer =
                    knowledgeResult.answer;


                const source =
                    knowledgeResult.item &&
                    knowledgeResult.item.source
                        ? knowledgeResult.item.source
                        : "knowledge-base";


                console.log(
                    "📚 Knowledge match:",
                    source
                );


                if (
                    language ===
                    "kinyarwanda"
                ) {

                    answer =
                        await ensureKinyarwanda(
                            cleanQuestion,
                            answer
                        );

                }


                return res.json({

                    success:
                        true,

                    answer:
                        answer,

                    source:
                        source,

                    language:
                        language

                });

            }


            // =================================================
            // OPENAI
            // =================================================

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


            // =================================================
            // FINAL LANGUAGE CHECK
            // =================================================

            if (
                language ===
                "kinyarwanda"
            ) {

                answer =
                    await ensureKinyarwanda(
                        cleanQuestion,
                        answer
                    );

            }


            console.log(
                "✅ AI answered"
            );


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
            `📚 Existing knowledge: ${knowledgeBase.length}`
        );

        console.log(
            `🇷🇼 RBC knowledge: ${rbcKnowledgeBase.length}`
        );

        console.log(
            `📚 Total knowledge: ${allKnowledgeBase.length}`
        );

        console.log(
            "=============================================="
        );

        console.log("");

    }
);