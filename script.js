/* ============================================================
   MENYA SRHR AI
   FRONTEND CHAT SYSTEM
   ============================================================

   FLOW:

   User Question
        ↓
   /api/chat
        ↓
   Knowledge Base FIRST
        ↓
   If no good match → OpenAI
        ↓
   Answer displayed in chatbot

   IMPORTANT:
   The OpenAI API key is NEVER stored in this file.
   It remains safely on the backend inside .env.
   ============================================================ */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const MENYA_API_URL = "/api/chat";

let isWaitingForAI = false;


/* ============================================================
   STARTUP
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    setupQuestionInput();

    showWelcomeMessage();

});


/* ============================================================
   QUESTION INPUT
   ============================================================ */

function setupQuestionInput() {

    const input = document.getElementById("question");

    if (!input) {
        console.warn("Menya SRHR: question input not found.");
        return;
    }

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendQuestion();

        }

    });

}


/* ============================================================
   WELCOME MESSAGE
   ============================================================ */

function showWelcomeMessage() {

    const answer = document.getElementById("answer");

    if (!answer) {
        return;
    }

    /*
       Do not overwrite an existing conversation.
    */

    if (answer.innerHTML.trim() !== "") {
        return;
    }

    answer.innerHTML = getWelcomeHTML();

}


/* ============================================================
   WELCOME HTML
   ============================================================ */

function getWelcomeHTML() {

    return `

        <div class="welcome-chat">

            <div class="welcome-chat-icon">
                🤍
            </div>

            <h2>
                Murakaza neza!
            </h2>

            <p>
                Ndi Menya SRHR.
                Ushobora kumbaza ikibazo
                mu Kinyarwanda cyangwa English.
            </p>

            <p>
                Hitamo ingingo ibumoso cyangwa
                wandike ikibazo cyawe hasi.
            </p>

        </div>

    `;

}


/* ============================================================
   SEND QUESTION
   ============================================================ */

async function sendQuestion() {

    const input = document.getElementById("question");

    const answer = document.getElementById("answer");

    if (!input || !answer) {
        return;
    }


    /* --------------------------------------------------------
       GET QUESTION
       -------------------------------------------------------- */

    const question = input.value.trim();

    if (!question) {
        return;
    }


    /* --------------------------------------------------------
       PREVENT MULTIPLE REQUESTS
       -------------------------------------------------------- */

    if (isWaitingForAI) {
        return;
    }

    isWaitingForAI = true;


    /* --------------------------------------------------------
       DISPLAY USER QUESTION
       -------------------------------------------------------- */

    addUserMessage(answer, question);


    /* --------------------------------------------------------
       CLEAR INPUT
       -------------------------------------------------------- */

    input.value = "";

    input.focus();


    /* --------------------------------------------------------
       DISPLAY THINKING INDICATOR
       -------------------------------------------------------- */

    const thinkingMessage = addThinkingMessage(answer);

    scrollChatToBottom();


    try {

        /* ----------------------------------------------------
           SEND QUESTION TO BACKEND
           ---------------------------------------------------- */

        const response = await fetch(MENYA_API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })

        });


        /* ----------------------------------------------------
           CHECK HTTP RESPONSE
           ---------------------------------------------------- */

        let data = null;

        try {

            data = await response.json();

        } catch (jsonError) {

            console.error(
                "Menya SRHR: Could not read server response.",
                jsonError
            );

        }


        /* ----------------------------------------------------
           REMOVE THINKING INDICATOR
           ---------------------------------------------------- */

        removeThinkingMessage(thinkingMessage);


        /* ----------------------------------------------------
           SERVER ERROR
           ---------------------------------------------------- */

        if (!response.ok) {

            console.error(
                "Menya SRHR API error:",
                data
            );

            const errorMessage =
                data && data.error
                    ? data.error
                    : getConnectionErrorMessage();

            addAIMessage(
                answer,
                formatErrorMessage(errorMessage)
            );

            scrollChatToBottom();

            return;
        }


        /* ----------------------------------------------------
           INVALID RESPONSE
           ---------------------------------------------------- */

        if (
            !data ||
            typeof data.answer !== "string" ||
            !data.answer.trim()
        ) {

            console.error(
                "Menya SRHR: Invalid API response.",
                data
            );

            addAIMessage(
                answer,
                getGenericErrorMessage()
            );

            scrollChatToBottom();

            return;
        }


        /* ----------------------------------------------------
           DISPLAY ANSWER
           ---------------------------------------------------- */

        const formattedAnswer =
            formatServerAnswer(
                data.answer,
                data.source
            );

        addAIMessage(
            answer,
            formattedAnswer
        );


        /* ----------------------------------------------------
           SCROLL
           ---------------------------------------------------- */

        scrollChatToBottom();


    } catch (error) {

        console.error(
            "Menya SRHR connection error:",
            error
        );


        /* ----------------------------------------------------
           REMOVE THINKING INDICATOR
           ---------------------------------------------------- */

        removeThinkingMessage(thinkingMessage);


        /* ----------------------------------------------------
           DISPLAY CONNECTION ERROR
           ---------------------------------------------------- */

        addAIMessage(
            answer,
            getConnectionErrorMessage()
        );


        scrollChatToBottom();


    } finally {

        isWaitingForAI = false;

        input.focus();

    }

}


/* ============================================================
   THINKING INDICATOR
   ============================================================ */

function addThinkingMessage(container) {

    const message =
        document.createElement("div");

    message.className =
        "ai-message thinking-message";


    message.innerHTML = `

        <div class="ai-icon">
            AI
        </div>

        <div class="thinking-content">

            <span>AI is thinking</span>

            <span class="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>

        </div>

    `;


    container.appendChild(message);


    scrollChatToBottom();


    return message;

}


/* ============================================================
   REMOVE THINKING INDICATOR
   ============================================================ */

function removeThinkingMessage(message) {

    if (!message) {
        return;
    }

    if (message.parentNode) {

        message.parentNode.removeChild(
            message
        );

    }

}


/* ============================================================
   FORMAT SERVER ANSWER
   ============================================================ */

function formatServerAnswer(
    answer,
    source
) {

    /*
       Knowledge-base answers already contain
       safe HTML formatting such as:

       <h3>
       <p>
       <ul>
       <li>
       <strong>

       Therefore we preserve them.

       OpenAI responses are normally plain text /
       Markdown, so they are safely converted below.
    */

    if (source === "knowledge-base") {

        return answer;

    }


    /*
       OpenAI answer

       Convert basic Markdown safely.
    */

    return formatAIText(answer);

}


/* ============================================================
   FORMAT OPENAI TEXT
   ============================================================ */

function formatAIText(text) {

    if (!text) {
        return "";
    }


    /*
       First escape HTML so AI-generated text
       cannot inject arbitrary HTML.
    */

    let safeText =
        escapeHTML(text);


    /*
       Bold:
       **text**
    */

    safeText =
        safeText.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
       Italic:
       *text*
    */

    safeText =
        safeText.replace(
            /(^|[^\*])\*([^*\n]+)\*(?!\*)/g,
            "$1<em>$2</em>"
        );


    /*
       Headings:
       ### Heading
    */

    safeText =
        safeText.replace(
            /^### (.+)$/gm,
            "<h4>$1</h4>"
        );

    safeText =
        safeText.replace(
            /^## (.+)$/gm,
            "<h3>$1</h3>"
        );

    safeText =
        safeText.replace(
            /^# (.+)$/gm,
            "<h3>$1</h3>"
        );


    /*
       Bullet points:
       - item
       * item
    */

    const lines =
        safeText.split("\n");


    let html = "";

    let inList = false;


    lines.forEach(function (line) {

        const trimmed =
            line.trim();


        if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ")
        ) {

            if (!inList) {

                html += "<ul>";

                inList = true;

            }


            html +=
                "<li>" +
                trimmed.substring(2) +
                "</li>";

            return;

        }


        if (inList) {

            html += "</ul>";

            inList = false;

        }


        if (!trimmed) {

            return;

        }


        /*
           Do not wrap headings again.
        */

        if (
            trimmed.startsWith("<h3>") ||
            trimmed.startsWith("<h4>")
        ) {

            html += trimmed;

        } else {

            html +=
                "<p>" +
                trimmed +
                "</p>";

        }

    });


    if (inList) {

        html += "</ul>";

    }


    return html;

}


/* ============================================================
   ERROR MESSAGE
   ============================================================ */

function formatErrorMessage(errorMessage) {

    const safe =
        escapeHTML(
            errorMessage ||
            getGenericErrorMessage()
        );


    return `

        <h3>
            ⚠️ Hari ikibazo
        </h3>

        <p>
            ${safe}
        </p>

        <p>
            Ongera ugerageze nyuma gato.
        </p>

        <div class="source-note">
            ℹ️ Niba ikibazo ari icyihutirwa,
            shaka ubufasha bw'umukozi w'ubuzima
            cyangwa serivisi zihutirwa.
        </div>

    `;

}


/* ============================================================
   CONNECTION ERROR
   ============================================================ */

function getConnectionErrorMessage() {

    return `

        <h3>
            ⚠️ Menya SRHR AI ntiri kuboneka
        </h3>

        <p>
            Habaye ikibazo cyo guhuza chatbot
            na server.
        </p>

        <p>
            Reba ko server ya Menya SRHR iri gukora,
            hanyuma wongere ugerageze.
        </p>

        <div class="source-note">
            ℹ️ Niba uri gukoresha chatbot kuri
            localhost, menya neza ko
            <strong>node server.js</strong>
            ikiri gukora.
        </div>

    `;

}


/* ============================================================
   GENERIC ERROR
   ============================================================ */

function getGenericErrorMessage() {

    return `

        <h3>
            ⚠️ Habaye ikibazo
        </h3>

        <p>
            AI ntiyagaruye igisubizo.
            Ongera ugerageze nyuma gato.
        </p>

        <div class="source-note">
            ℹ️ Menya SRHR itanga amakuru rusange.
            Ntabwo isimbura umukozi w'ubuzima.
        </div>

    `;

}


/* ============================================================
   ADD USER MESSAGE
   ============================================================ */

function addUserMessage(
    container,
    question
) {

    const message =
        document.createElement("div");


    message.className =
        "user-message";


    message.innerHTML = `

        <div class="user-bubble">
            ${escapeHTML(question)}
        </div>

    `;


    container.appendChild(message);

}


/* ============================================================
   ADD AI MESSAGE
   ============================================================ */

function addAIMessage(
    container,
    response
) {

    const message =
        document.createElement("div");


    message.className =
        "ai-message";


    message.innerHTML = `

        <div class="ai-icon">
            AI
        </div>

        <div>
            ${response}
        </div>

    `;


    container.appendChild(message);

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        String(text || "");


    return div.innerHTML;

}


/* ============================================================
   SCROLL CHAT
   ============================================================ */

function scrollChatToBottom() {

    const answer =
        document.getElementById("answer");


    if (!answer) {
        return;
    }


    answer.scrollTo({

        top:
            answer.scrollHeight,

        behavior:
            "smooth"

    });

}


/* ============================================================
   CLEAR CHAT
   ============================================================ */

function clearChat() {

    if (isWaitingForAI) {
        return;
    }


    const answer =
        document.getElementById("answer");


    if (!answer) {
        return;
    }


    answer.innerHTML =
        getWelcomeHTML();


    const input =
        document.getElementById("question");


    if (input) {

        input.value = "";

        input.focus();

    }

}


/* ============================================================
   WELCOME MODAL
   ============================================================ */

function acceptWelcome() {

    const modal =
        document.getElementById(
            "welcome-modal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    try {

        localStorage.setItem(
            "menyaWelcomeAccepted",
            "true"
        );

    } catch (error) {

        console.log(
            "Local storage unavailable."
        );

    }

}


/* ============================================================
   TOPIC CARD
   ============================================================ */

function toggleTopic(
    topic,
    button
) {

    const panels =
        document.querySelectorAll(
            ".topic-panel"
        );


    const cards =
        document.querySelectorAll(
            ".topic-card"
        );


    const selected =
        document.getElementById(
            "panel-" + topic
        );


    if (!selected) {
        return;
    }


    const alreadyOpen =
        selected.classList.contains(
            "active"
        );


    panels.forEach(
        function (panel) {

            panel.classList.remove(
                "active"
            );

        }
    );


    cards.forEach(
        function (card) {

            card.classList.remove(
                "active"
            );

        }
    );


    if (!alreadyOpen) {

        selected.classList.add(
            "active"
        );


        if (button) {

            button.classList.add(
                "active"
            );

        }

    }

}


/* ============================================================
   ASK TOPIC
   ============================================================ */

function askTopic(question) {

    const input =
        document.getElementById(
            "question"
        );


    if (!input) {
        return;
    }


    input.value =
        question;


    sendQuestion();

}


/* ============================================================
   HOME
   ============================================================ */

function goHome() {

    if (isWaitingForAI) {
        return;
    }


    const answer =
        document.getElementById(
            "answer"
        );


    if (answer) {

        answer.innerHTML =
            getWelcomeHTML();

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ============================================================
   ABOUT
   ============================================================ */

function showAbout() {

    if (isWaitingForAI) {
        return;
    }


    const answer =
        document.getElementById(
            "answer"
        );


    if (!answer) {
        return;
    }


    answer.innerHTML = `

        <div class="ai-message">

            <div class="ai-icon">
                AI
            </div>

            <div>

                <h3>
                    ℹ️ Abo turi bo
                </h3>

                <p>
                    Menya SRHR ni umushinga ugamije
                    gufasha abantu kubona amakuru
                    ku buzima bw'imyororokere
                    n'imibonano mpuzabitsina
                    mu Kinyarwanda.
                </p>

                <p>
                    Ushobora kubaza ibibazo ku mihango,
                    gutwita, pregnancy testing,
                    kuboneza urubyaro, HIV, STI,
                    ukwemera n'ihohoterwa.
                </p>

                <p>
                    Menya SRHR itanga amakuru rusange
                    kandi ntabwo isimbura umukozi
                    w'ubuzima.
                </p>

            </div>

        </div>

    `;


    scrollChatToBottom();

}


/* ============================================================
   PRIVACY
   ============================================================ */

function showPrivacy() {

    if (isWaitingForAI) {
        return;
    }


    const answer =
        document.getElementById(
            "answer"
        );


    if (!answer) {
        return;
    }


    answer.innerHTML = `

        <div class="ai-message">

            <div class="ai-icon">
                🔐
            </div>

            <div>

                <h3>
                    🔐 Ibanga n'umutekano
                </h3>

                <p>
                    Irinde gushyiramo amazina yawe,
                    aderesi, nimero ya telefoni cyangwa
                    andi makuru akuranga.
                </p>

                <p>
                    Baza ikibazo cyawe utagaragaje
                    umwirondoro wawe.
                </p>

                <p>
                    Niba ikibazo cyawe ari icyihutirwa,
                    ntutegereze AI. Shaka ubufasha
                    bw'umukozi w'ubuzima cyangwa
                    serivisi z'ubutabazi.
                </p>

            </div>

        </div>

    `;


    scrollChatToBottom();

}


/* ============================================================
   OPTIONAL CATEGORY DETECTION
   ============================================================

   This does NOT answer questions.

   It only helps the frontend understand the
   general language/topic when needed later.

   The actual authoritative answering order
   remains on the SERVER:

       1. Knowledge Base
       2. OpenAI
   ============================================================ */

function detectLanguage(question) {

    const q =
        normalizeText(question);


    const kinyarwandaWords = [

        "ni",
        "iki",
        "ikihe",
        "n gute",
        "gute",
        "ese",
        "nshobora",
        "nakora",
        "gutwita",
        "imihango",
        "urubyaro",
        "ihohoterwa",
        "ubwumvikane",
        "kwipima",
        "ubuzima"

    ];


    let score = 0;


    kinyarwandaWords.forEach(
        function (word) {

            if (
                q.includes(
                    normalizeText(word)
                )
            ) {

                score++;

            }

        }
    );


    if (score > 0) {
        return "kinyarwanda";
    }


    return "english";

}


/* ============================================================
   NORMALIZE TEXT
   ============================================================ */

function normalizeText(text) {

    return String(text || "")

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[’']/g,
            "'"
        )

        .replace(
            /[^\p{L}\p{N}\s']/gu,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* ============================================================
   MOBILE / RESPONSIVE SUPPORT
   ============================================================

   The existing HTML/CSS controls the mobile layout.

   These functions deliberately do not change
   your responsive design.

   When a user selects a topic, the existing
   topic panel behavior remains intact.
   ============================================================ */


/* ============================================================
   EXPOSE FUNCTIONS TO HTML
   ============================================================ */

window.sendQuestion =
    sendQuestion;


window.clearChat =
    clearChat;


window.acceptWelcome =
    acceptWelcome;


window.askTopic =
    askTopic;


window.toggleTopic =
    toggleTopic;


window.goHome =
    goHome;


window.showAbout =
    showAbout;


window.showPrivacy =
    showPrivacy;


window.detectLanguage =
    detectLanguage;


/* ============================================================
   END OF MENYA SRHR FRONTEND
   ============================================================ */