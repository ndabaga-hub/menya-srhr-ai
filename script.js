/* =========================================================
   AI YAWE / MENYA SRHR
   COMPLETE FRONTEND SCRIPT
   FIXED ANSWER FORMATTING
========================================================= */


/* =========================================================
   1. WELCOME SCREEN
========================================================= */

function acceptWelcome() {

    const modal =
        document.getElementById(
            "welcome-modal"
        );

    if (modal) {

        modal.style.display =
            "none";

        modal.classList.add(
            "hidden"
        );

    }

    try {

        localStorage.setItem(
            "menyaWelcomeAccepted",
            "true"
        );

    } catch (error) {

        console.warn(
            "Could not save welcome preference:",
            error
        );

    }

}


/* =========================================================
   2. WELCOME SCREEN SETUP
========================================================= */

function setupWelcomeScreen() {

    const modal =
        document.getElementById(
            "welcome-modal"
        );

    if (!modal) {
        return;
    }

    let accepted = false;

    try {

        accepted =
            localStorage.getItem(
                "menyaWelcomeAccepted"
            ) === "true";

    } catch (error) {

        console.warn(
            "LocalStorage unavailable:",
            error
        );

    }

    if (accepted) {

        modal.style.display =
            "none";

        modal.classList.add(
            "hidden"
        );

    } else {

        modal.style.display =
            "flex";

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   3. INITIALIZATION
========================================================= */

function initializeAiYawe() {

    console.log(
        "Ai Yawe JavaScript loaded successfully."
    );

    setupWelcomeScreen();

    const input =
        document.getElementById(
            "question"
        );

    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendQuestion();

                }

            }
        );

    }

}


/* =========================================================
   4. START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAiYawe
    );

} else {

    initializeAiYawe();

}


/* =========================================================
   5. TOPIC QUESTIONS
========================================================= */

const topicQuestions = {

    imihango: [

        "Ese imihango isanzwe iza ryari?",

        "Ni ryari imihango iba idasanzwe?",

        "Ese kubabara mu gihe cy'imihango ni ibisanzwe?",

        "Nakora iki iyo imihango itinze?",

        "Ese nshobora gusama inda mu gihe cy'imihango?"

    ],


    gutwita: [

        "Ni ryari namenya ko ntwite?",

        "Ese nakwipima ko ntwite?",

        "Ese ndyamanye n'umuhungu natwita?",

        "Ni ibihe bimenyetso by'inda?",

        "Nakora iki niba ntwite ntari niteguye?"

    ],


    kuboneza: [

        "Ni ubuhe buryo bwo kuboneza urubyaro?",

        "Ese agakingirizo karinda gutwita?",

        "Ese nakoresha ibinini byo kuboneza urubyaro?",

        "Ese hari uburyo bwo kuboneza urubyaro bumara igihe kirekire?",

        "Nakora iki nyuma y'imibonano idakingiye?"

    ],


    hiv: [

        "HIV yandura ite?",

        "Nakora iki niba ntekereza ko naba naranduye HIV?",

        "Ni ryari nakwipimisha HIV?",

        "STI ni iki?",

        "Ese agakingirizo karinda HIV na STI?"

    ],


    consent: [

        "Kwemera imibonano mpuzabitsina bisobanura iki?",

        "Ese umuntu ashobora kuvuga oya?",

        "Ese kwemera bishobora gukurwaho?",

        "Nakora iki niba umuntu anshyiraho igitutu?"

    ],


    gbv: [

        "Ihohoterwa rishingiye ku gitsina ni iki?",

        "Nakora iki niba nafashwe ku ngufu?",

        "Nakora iki niba umuntu ankoresha imibonano ku gahato?",

        "Ni hehe nshobora gushakira ubufasha ku ihohoterwa?"

    ]

};


/* =========================================================
   6. SHOW TOPIC
========================================================= */

function showTopic(topic) {

    const answer =
        document.getElementById(
            "answer"
        );

    if (!answer) {
        return;
    }

    const questions =
        topicQuestions[topic];

    if (!questions) {
        return;
    }

    let title =
        "Ibibazo";

    if (topic === "imihango") {
        title = "Imihango";
    }

    if (topic === "gutwita") {
        title = "Gutwita";
    }

    if (topic === "kuboneza") {
        title =
            "Kuboneza urubyaro";
    }

    if (topic === "hiv") {
        title =
            "HIV na STI";
    }

    if (topic === "consent") {
        title =
            "Kwemera imibonano";
    }

    if (topic === "gbv") {
        title =
            "Ihohoterwa";
    }


    let html = `

        <div class="topic-question-list">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                Hitamo ikibazo ushaka kubaza:
            </p>

    `;


    questions.forEach(
        function(question) {

            html += `

                <button
                    class="topic-question-button"
                    type="button"
                    onclick="useTopicQuestion(${JSON.stringify(question)})"
                >
                    ${escapeHTML(question)}
                </button>

            `;

        }
    );


    html += `

        </div>

    `;


    answer.innerHTML =
        html;

    answer.scrollTop = 0;

}


/* =========================================================
   7. USE TOPIC QUESTION
========================================================= */

function useTopicQuestion(question) {

    const input =
        document.getElementById(
            "question"
        );

    if (!input) {
        return;
    }

    input.value =
        question;

    input.focus();

    sendQuestion();

}


/* =========================================================
   8. SEND QUESTION
========================================================= */

async function sendQuestion() {

    const input =
        document.getElementById(
            "question"
        );

    const answer =
        document.getElementById(
            "answer"
        );

    const sendButton =
        document.getElementById(
            "send-button"
        );


    if (!input || !answer) {

        console.error(
            "Question input or answer area not found."
        );

        return;

    }


    const question =
        input.value.trim();


    if (!question) {
        return;
    }


    /* -----------------------------------------------------
       REMOVE WELCOME MESSAGE
    ----------------------------------------------------- */

    const welcome =
        answer.querySelector(
            ".welcome-chat"
        );

    if (welcome) {
        welcome.remove();
    }


    /* -----------------------------------------------------
       SHOW USER QUESTION
    ----------------------------------------------------- */

    const userMessage =
        document.createElement(
            "div"
        );

    userMessage.className =
        "user-message";

    userMessage.innerHTML = `

        <div class="user-bubble">

            ${escapeHTML(question)}

        </div>

    `;

    answer.appendChild(
        userMessage
    );


    /* -----------------------------------------------------
       CLEAR INPUT
    ----------------------------------------------------- */

    input.value = "";


    /* -----------------------------------------------------
       DISABLE INPUT
    ----------------------------------------------------- */

    input.disabled = true;

    if (sendButton) {
        sendButton.disabled = true;
    }


    /* -----------------------------------------------------
       SHOW LOADING
    ----------------------------------------------------- */

    const loading =
        document.createElement(
            "div"
        );

    loading.className =
        "ai-message";

    loading.id =
        "ai-loading-" +
        Date.now();

    loading.innerHTML = `

        <div class="ai-icon">
            AI
        </div>

        <div>

            <p>
                Ndimo gushaka igisubizo...
                ⏳
            </p>

        </div>

    `;

    answer.appendChild(
        loading
    );


    scrollNewMessageToTop(
        loading
    );


    try {

        console.log(
            "Sending question to Ai Yawe:",
            question
        );


        /* -------------------------------------------------
           SEND TO BACKEND
        ------------------------------------------------- */

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                question
                        })
                }
            );


        console.log(
            "Backend response:",
            response.status
        );


        let data = {};

        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Could not read server JSON:",
                jsonError
            );

        }


        /* -------------------------------------------------
           REMOVE LOADING
        ------------------------------------------------- */

        if (loading) {
            loading.remove();
        }


        /* -------------------------------------------------
           SERVER ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Server returned HTTP " +
                response.status
            );

        }


        /* -------------------------------------------------
           GET ANSWER
        ------------------------------------------------- */

        let finalAnswer =
            data.answer ||
            data.response ||
            data.message;


        if (!finalAnswer) {

            finalAnswer =
                "Nta gisubizo cyabonetse. Ongera ugerageze.";

        }


        /* -------------------------------------------------
           CREATE AI MESSAGE
        ------------------------------------------------- */

        const aiMessage =
            document.createElement(
                "div"
            );

        aiMessage.className =
            "ai-message new-ai-answer";


        aiMessage.innerHTML = `

            <div class="ai-icon">
                AI
            </div>

            <div class="ai-answer-content">

                ${formatAnswer(finalAnswer)}

            </div>

        `;


        answer.appendChild(
            aiMessage
        );


        /* -------------------------------------------------
           POSITION NEW ANSWER
        ------------------------------------------------- */

        scrollNewMessageToTop(
            aiMessage
        );


    } catch (error) {

        console.error(
            "Ai Yawe error:",
            error
        );


        if (loading) {
            loading.remove();
        }


        const errorMessage =
            document.createElement(
                "div"
            );

        errorMessage.className =
            "ai-message new-ai-answer";


        errorMessage.innerHTML = `

            <div class="ai-icon">
                AI
            </div>

            <div>

                <h3>
                    Habaye ikibazo
                </h3>

                <p>
                    Ntibishoboye guhuza na
                    Ai Yawe AI.
                </p>

                <p>
                    Reba niba server iri gukora,
                    hanyuma wongere ugerageze.
                </p>

            </div>

        `;


        answer.appendChild(
            errorMessage
        );


        scrollNewMessageToTop(
            errorMessage
        );

    }


    /* -----------------------------------------------------
       ENABLE INPUT AGAIN
    ----------------------------------------------------- */

    input.disabled = false;

    if (sendButton) {
        sendButton.disabled = false;
    }

    input.focus();

}


/* =========================================================
   9. NEW ANSWER SCROLLING
========================================================= */

function scrollNewMessageToTop(
    message
) {

    const answer =
        document.getElementById(
            "answer"
        );

    if (!answer || !message) {
        return;
    }


    setTimeout(
        function() {

            const answerRect =
                answer.getBoundingClientRect();

            const messageRect =
                message.getBoundingClientRect();


            const relativeTop =
                messageRect.top -
                answerRect.top;


            const target =
                answer.scrollTop +
                relativeTop -
                20;


            const maxScroll =
                Math.max(
                    0,
                    answer.scrollHeight -
                    answer.clientHeight
                );


            const safeTarget =
                Math.max(
                    0,
                    Math.min(
                        target,
                        maxScroll
                    )
                );


            answer.scrollTo({

                top:
                    safeTarget,

                behavior:
                    "smooth"

            });


        },
        80
    );

}


/* =========================================================
   10. FORMAT AI ANSWER
========================================================= */

/*
   IMPORTANT:

   The AI may return either:

   1. Normal Markdown
      ### Heading
      **bold**
      - bullet

   OR

   2. HTML
      <h3>Heading</h3>
      <p>Paragraph</p>
      <ul><li>Bullet</li></ul>

   This function supports both.

   We first sanitize the HTML so that
   dangerous scripts and attributes cannot
   be executed.
*/

function formatAnswer(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    let raw =
        String(text);


    /*
       Check whether the answer contains
       HTML-like tags.
    */

    const containsHTML =
        /<\/?[a-z][\s\S]*>/i.test(
            raw
        );


    /*
       If HTML is present, sanitize it.
    */

    if (containsHTML) {

        return sanitizeAnswerHTML(
            raw
        );

    }


    /*
       Otherwise format Markdown/text.
    */

    let safe =
        escapeHTML(
            raw
        );


    /* Normalize line endings */

    safe =
        safe.replace(
            /\r\n/g,
            "\n"
        );

    safe =
        safe.replace(
            /\r/g,
            "\n"
        );


    /* Bold */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* Headings */

    safe =
        safe.replace(
            /^### (.*?)$/gm,
            "<h3>$1</h3>"
        );

    safe =
        safe.replace(
            /^## (.*?)$/gm,
            "<h3>$1</h3>"
        );

    safe =
        safe.replace(
            /^# (.*?)$/gm,
            "<h3>$1</h3>"
        );


    /*
       Bullet lists
    */

    safe =
        safe.replace(
            /^[•\-*]\s+(.*?)$/gm,
            "<li>$1</li>"
        );


    /*
       Numbered lists
    */

    safe =
        safe.replace(
            /^\d+\.\s+(.*?)$/gm,
            "<li>$1</li>"
        );


    /*
       Convert consecutive <li> items
       into an unordered list.
    */

    safe =
        safe.replace(
            /((?:<li>.*?<\/li>\s*)+)/gs,
            function(match) {

                return (
                    "<ul>" +
                    match +
                    "</ul>"
                );

            }
        );


    /*
       Paragraphs
    */

    safe =
        safe.replace(
            /\n\n+/g,
            "</p><p>"
        );


    /*
       Single line breaks
    */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return `

        <div class="answer-text">

            <p>
                ${safe}
            </p>

        </div>

    `;

}


/* =========================================================
   11. SAFE HTML SANITIZER
========================================================= */

function sanitizeAnswerHTML(
    html
) {

    const template =
        document.createElement(
            "template"
        );


    template.innerHTML =
        html;


    /*
       Tags that Ai Yawe is allowed
       to display.
    */

    const allowedTags = new Set([

        "H1",
        "H2",
        "H3",
        "H4",

        "P",

        "BR",

        "STRONG",
        "B",
        "EM",
        "I",

        "UL",
        "OL",
        "LI",

        "DIV",

        "SPAN",

        "BLOCKQUOTE",

        "HR"

    ]);


    /*
       Attributes that are allowed.

       We intentionally do NOT allow
       onclick, onerror, javascript,
       style, or other dangerous
       event attributes.
    */

    const allowedAttributes =
        new Set([

            "class"

        ]);


    function cleanNode(
        node
    ) {

        /*
           Remove comments.
        */

        if (
            node.nodeType ===
            Node.COMMENT_NODE
        ) {

            node.remove();

            return;

        }


        /*
           Text nodes are safe.
        */

        if (
            node.nodeType !==
            Node.ELEMENT_NODE
        ) {

            return;

        }


        /*
           Remove dangerous tags.
        */

        if (
            !allowedTags.has(
                node.tagName
            )
        ) {

            /*
               Keep the text inside
               the tag, but remove
               the actual tag.
            */

            const parent =
                node.parentNode;

            if (parent) {

                while (
                    node.firstChild
                ) {

                    parent.insertBefore(
                        node.firstChild,
                        node
                    );

                }

                parent.removeChild(
                    node
                );

            }

            return;

        }


        /*
           Remove all attributes
           except approved ones.
        */

        Array.from(
            node.attributes
        ).forEach(
            function(attribute) {

                if (
                    !allowedAttributes.has(
                        attribute.name.toLowerCase()
                    )
                ) {

                    node.removeAttribute(
                        attribute.name
                    );

                }

            }
        );


        /*
           Clean child nodes.
        */

        Array.from(
            node.childNodes
        ).forEach(
            cleanNode
        );

    }


    Array.from(
        template.content.childNodes
    ).forEach(
        cleanNode
    );


    /*
       Return safe HTML.
    */

    return `

        <div class="answer-text">

            ${template.innerHTML}

        </div>

    `;

}


/* =========================================================
   12. ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   13. CLEAR CHAT
========================================================= */

function clearChat() {

    const answer =
        document.getElementById(
            "answer"
        );

    if (!answer) {
        return;
    }


    answer.innerHTML = `

        <div class="welcome-chat">

            <div class="welcome-chat-icon">
                🤍
            </div>

            <h2>
                Murakaza neza!
            </h2>

            <p>
                Ndi Ai Yawe. Ushobora kumbaza
                ikibazo mu Kinyarwanda.
            </p>

            <p>
                Hitamo ingingo ibumoso cyangwa
                wandike ikibazo cyawe hasi.
            </p>

        </div>

    `;


    answer.scrollTop = 0;

}


/* =========================================================
   14. NEW CHAT
========================================================= */

function newChat() {

    clearChat();

    const input =
        document.getElementById(
            "question"
        );

    if (input) {

        input.value = "";

        input.focus();

    }

}


/* =========================================================
   15. MAKE FUNCTIONS AVAILABLE
========================================================= */

window.acceptWelcome =
    acceptWelcome;

window.setupWelcomeScreen =
    setupWelcomeScreen;

window.showTopic =
    showTopic;

window.useTopicQuestion =
    useTopicQuestion;

window.sendQuestion =
    sendQuestion;

window.clearChat =
    clearChat;

window.newChat =
    newChat;

window.formatAnswer =
    formatAnswer;

window.escapeHTML =
    escapeHTML;

window.scrollNewMessageToTop =
    scrollNewMessageToTop;
