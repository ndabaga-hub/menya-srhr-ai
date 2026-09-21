/* =========================================================
   AI YAWE / MENYA SRHR
   COMPLETE FRONTEND SCRIPT
========================================================= */


/* =========================================================
   1. WELCOME SCREEN
========================================================= */

function acceptWelcome() {

    const modal =
        document.getElementById(
            "welcome-modal"
        );

    if (!modal) {
        return;
    }

    /*
       Hide the welcome message after
       the user clicks the start button.
    */

    modal.style.display =
        "none";

    modal.classList.add(
        "hidden"
    );

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

    /*
       IMPORTANT:

       Always show the welcome message
       whenever Ai Yawe is opened or refreshed.

       We intentionally do NOT use localStorage
       here, so the welcome screen will not
       permanently disappear.
    */

    modal.style.display =
        "flex";

    modal.classList.remove(
        "hidden"
    );

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

        title =
            "Imihango";

    }


    if (topic === "gutwita") {

        title =
            "Gutwita";

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
       SHOW USER QUESTION
    ----------------------------------------------------- */

    const welcome =
        answer.querySelector(
            ".welcome-chat"
        );


    if (welcome) {

        welcome.remove();

    }


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

    input.disabled =
        true;


    if (sendButton) {

        sendButton.disabled =
            true;

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


    /*
       Scroll the loading message
       to the visible area.
    */

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

                    method:
                        "POST",

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

            <div>

                ${formatAnswer(finalAnswer)}

            </div>

        `;


        answer.appendChild(
            aiMessage
        );


        /*
           Scroll ONLY the answer area.
        */

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

    input.disabled =
        false;


    if (sendButton) {

        sendButton.disabled =
            false;

    }


    input.focus();

}


/* =========================================================
   9. NEW ANSWER SCROLLING
========================================================= */

/*
   This function scrolls ONLY the #answer area.

   It does NOT scroll the whole webpage.

   It positions the beginning of the new AI answer
   near the top of the visible chat area.
*/

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


    requestAnimationFrame(
        function() {

            requestAnimationFrame(
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


                    answer.scrollTop =
                        safeTarget;

                }
            );

        }
    );

}


/* =========================================================
   10. FORMAT ANSWER
========================================================= */

function formatAnswer(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    let safe =
        escapeHTML(
            String(text)
        );


    /* Bold markdown */

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


    /* Bullet points */

    safe =
        safe.replace(
            /^[•\-] (.*?)$/gm,
            "<div>• $1</div>"
        );


    /* Paragraph breaks */

    safe =
        safe.replace(
            /\n\n+/g,
            "</p><p>"
        );


    /* Single line breaks */

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
   11. ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   12. CLEAR CHAT
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


    answer.scrollTop =
        0;

}


/* =========================================================
   13. NEW CHAT
========================================================= */

function newChat() {

    clearChat();


    const input =
        document.getElementById(
            "question"
        );


    if (input) {

        input.value =
            "";

        input.focus();

    }

}


/* =========================================================
   14. MAKE FUNCTIONS AVAILABLE
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