/* ============================================================
   AI YAWE / MENYA SRHR
   RBC KNOWLEDGE LAYER
   Rwanda Biomedical Centre
   Kinyarwanda + English keywords
============================================================ */


const rbcKnowledgeBase = [


    /* ========================================================
       FAMILY PLANNING
    ======================================================== */

    {
        id: "rbc_family_planning_services",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "rbc",
            "family planning",
            "kuboneza urubyaro",
            "uburyo bwo kuboneza urubyaro",
            "contraception",
            "contraceptive",
            "birth control",
            "serivisi zo kuboneza urubyaro",
            "aho nakura uburyo bwo kuboneza urubyaro",
            "family planning rwanda",
            "kuboneza urubyaro mu rwanda"
        ],

        answer: `
            <h3>💊 Kuboneza urubyaro mu Rwanda</h3>

            <p>
                Kuboneza urubyaro bifasha umuntu cyangwa umuryango
                guteganya niba kandi igihe bashaka kubyara.
            </p>

            <p>
                Mu Rwanda, serivisi zo kuboneza urubyaro zitangwa
                ahantu hatandukanye harimo ibigo nderabuzima,
                ibitaro, abajyanama b'ubuzima babihuguriwe
                n'amavuriro yigenga yabiherewe uburenganzira.
            </p>

            <p>
                Uburyo bwo kuboneza urubyaro burimo udukingirizo,
                ibinini, inshinge, implants, IUD n'ubundi buryo
                butangwa n'abakozi b'ubuzima.
            </p>

            <p>
                Uburyo bukubereye bushobora guterwa n'ubuzima bwawe,
                ibyo ukunda, niba ushaka kubyara vuba cyangwa nyuma
                n'izindi mpamvu. Umukozi w'ubuzima ashobora kugufasha
                guhitamo uburyo bukubereye.
            </p>
        `
    },


    {
        id: "rbc_family_planning_methods",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "uburyo bwo kuboneza urubyaro",
            "methods of contraception",
            "contraceptive methods",
            "family planning methods",
            "ibinini",
            "inshinge",
            "implant",
            "iud",
            "condom",
            "agakingirizo",
            "kuboneza urubyaro uburyo"
        ],

        answer: `
            <h3>💊 Uburyo bwo kuboneza urubyaro</h3>

            <p>
                Hari uburyo butandukanye bwo kuboneza urubyaro.
                Buri buryo bugira imikoreshereze, ibyiza,
                ingaruka zishobora kubaho n'igihe bumara.
            </p>

            <ul>
                <li>🛡️ Udukingirizo.</li>
                <li>💊 Ibinini byo kuboneza urubyaro.</li>
                <li>💉 Inshinge zo kuboneza urubyaro.</li>
                <li>🌱 Implants.</li>
                <li>🔹 IUD.</li>
                <li>Uburyo bw'igihe gito cyangwa kirekire
                    butangwa n'abakozi b'ubuzima.</li>
            </ul>

            <p>
                Niba utazi uburyo bukubereye, ganira n'umukozi
                w'ubuzima aho utuye kugira ngo ubone amakuru
                ahagije mbere yo guhitamo.
            </p>
        `
    },


    {
        id: "rbc_family_planning_side_effects",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "ingaruka zo kuboneza urubyaro",
            "side effects contraception",
            "contraceptive side effects",
            "ibinini birambabaza",
            "inshinge zimbabaza",
            "implant side effects",
            "iud side effects",
            "kuboneza urubyaro ingaruka"
        ],

        answer: `
            <h3>💊 Impinduka zishobora guterwa no kuboneza urubyaro</h3>

            <p>
                Uburyo butandukanye bwo kuboneza urubyaro bushobora
                kugira impinduka cyangwa ingaruka zitandukanye ku bantu.
            </p>

            <p>
                Urugero, umuntu ashobora kubona impinduka mu mihango
                cyangwa kugira ibindi bimenyetso bitewe n'uburyo
                akoresha.
            </p>

            <p>
                Niba impinduka zikubangamiye cyane, zidakira,
                cyangwa ufite ikibazo ku buryo ukoresha bwo kuboneza
                urubyaro, ganira n'umukozi w'ubuzima.
            </p>

            <p>
                Ntuhagarike cyangwa ngo uhindure uburyo bw'imiti
                utabanje kubona inama y'umukozi w'ubuzima igihe
                ibyo bikenewe.
            </p>
        `
    },


    /* ========================================================
       ADOLESCENT SRHR
    ======================================================== */

    {
        id: "rbc_adolescent_srhr_services",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "urubyiruko",
            "abangavu",
            "ingimbi",
            "adolescent srhr",
            "adolescent sexual reproductive health",
            "youth srhr",
            "youth friendly services",
            "serivisi z'urubyiruko",
            "icyumba cy'urubyiruko",
            "amakuru y'imyororokere",
            "srhr rwanda"
        ],

        answer: `
            <h3>👩🏾‍🎓👨🏾‍🎓 Serivisi z'ubuzima bw'imyororokere ku rubyiruko</h3>

            <p>
                Urubyiruko rushobora gushaka amakuru yizewe ku buzima
                bw'imyororokere no ku mibonano mpuzabitsina ku bigo
                nderabuzima no mu zindi serivisi zagenewe urubyiruko.
            </p>

            <p>
                Amakuru ashobora kuba ajyanye no kuboneza urubyaro,
                HIV na STI, gutwita, imihango, ubuzima bw'imibonano
                mpuzabitsina n'ihohoterwa.
            </p>

            <p>
                Niba ufite ikibazo cyihariye, ushobora kugana umukozi
                w'ubuzima cyangwa umujyanama w'ubuzima ukakubwira
                amakuru y'ibanga n'ubufasha bukwiye.
            </p>
        `
    },


    /* ========================================================
       ANTENATAL CARE
    ======================================================== */

    {
        id: "rbc_antenatal_care",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "antenatal care",
            "anc",
            "kwisuzumisha inda",
            "kwisuzumisha utwite",
            "pregnancy checkup",
            "pregnancy clinic",
            "muganga utwite",
            "gutwita kwisuzumisha",
            "ubuvuzi bw'umubyeyi utwite"
        ],

        answer: `
            <h3>🤰 Kwisuzumisha igihe utwite</h3>

            <p>
                Iyo umuntu atwite, kwisuzumisha kwa muganga ni ingenzi
                kugira ngo umubyeyi n'umwana bakurikiranwe.
            </p>

            <p>
                Mu gihe cyo gutwita, umukozi w'ubuzima ashobora gukurikirana
                ubuzima bw'umubyeyi, imikurire y'umwana no kumenya
                ibibazo bishobora gukenera ubufasha.
            </p>

            <p>
                Niba ukeka ko utwite, ganira n'umukozi w'ubuzima
                kugira ngo utangire gukurikiranwa hakiri kare.
            </p>
        `
    },


    {
        id: "rbc_pregnancy_danger_signs",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "pregnancy danger signs",
            "danger signs pregnancy",
            "ibimenyetso biteje akaga utwite",
            "utwite ndababara",
            "utwite ndava amaraso",
            "kuva amaraso utwite",
            "ububabare bukomeye utwite",
            "pregnancy emergency",
            "emergency pregnancy"
        ],

        answer: `
            <h3>🚨 Ibimenyetso bisaba ubufasha bw'ubuvuzi mu gihe utwite</h3>

            <p>
                Mu gihe utwite, ibimenyetso bimwe bishobora gusaba
                kujya kwa muganga cyangwa ku kigo nderabuzima vuba.
            </p>

            <ul>
                <li>🩸 Kuva amaraso menshi cyangwa adasanzwe.</li>
                <li>😣 Ububabare bukomeye cyangwa budasanzwe.</li>
                <li>🤕 Kunanirwa cyane, isereri cyangwa gucika intege.</li>
                <li>🔥 Umuriro cyangwa ibindi bimenyetso bikomeye.</li>
                <li>💨 Kugira ikibazo cyo guhumeka.</li>
            </ul>

            <p>
                Niba ufite ikibazo gikomeye cyangwa wumva ubuzima bwawe
                buri mu kaga, shaka ubufasha bw'ubuvuzi bwihuse.
            </p>
        `
    },


    /* ========================================================
       POSTPARTUM
    ======================================================== */

    {
        id: "rbc_postpartum_care",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "postpartum",
            "postnatal care",
            "postnatal",
            "nyuma yo kubyara",
            "umubyeyi umaze kubyara",
            "kwisuzumisha nyuma yo kubyara",
            "postpartum checkup",
            "postpartum care rwanda"
        ],

        answer: `
            <h3>👩🏾‍🍼 Kwisuzumisha nyuma yo kubyara</h3>

            <p>
                Nyuma yo kubyara, umubyeyi n'umwana bakenera gukurikiranwa
                kugira ngo harebwe niba ubuzima bwabo bumeze neza.
            </p>

            <p>
                Umubyeyi ashobora gukenera kwisuzumisha nyuma yo kubyara,
                kandi umwana na we agomba gukurikiranwa no guhabwa
                serivisi z'ubuzima zikenewe.
            </p>

            <p>
                Niba umubyeyi amaze kubyara akagira kuva amaraso menshi,
                ububabare bukomeye, umuriro, isereri cyangwa guhumeka nabi,
                ni ngombwa gushaka ubufasha bw'ubuvuzi.
            </p>
        `
    },


    /* ========================================================
       HIV
    ======================================================== */

    {
        id: "rbc_hiv_testing",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "hiv testing",
            "kwipimisha hiv",
            "gupima hiv",
            "hiv test",
            "hiv testing rwanda",
            "where to test hiv",
            "nakwipimisha hiv he",
            "kwipimisha sida",
            "sida test"
        ],

        answer: `
            <h3>🧪 Kwipimisha HIV</h3>

            <p>
                Kwipimisha HIV ni uburyo bwo kumenya niba umuntu
                yaranduye HIV cyangwa atarayandura.
            </p>

            <p>
                Niba waragize imibonano ishobora kuba yaraguteye
                ibyago byo kwandura HIV, ganira n'umukozi w'ubuzima
                ku gihe gikwiye cyo kwipimisha no ku yindi serivisi
                wakenera.
            </p>

            <p>
                Kwipimisha HIV ni ingenzi kuko umuntu ashobora kuba
                afite HIV atagaragaza ibimenyetso.
            </p>
        `
    },


    {
        id: "rbc_hiv_prep",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "prep",
            "hiv prep",
            "pre exposure prophylaxis",
            "kwirinda hiv mbere",
            "umuti wo kwirinda hiv",
            "prep rwanda",
            "prep ni iki",
            "nkoresha prep"
        ],

        answer: `
            <h3>💊 PrEP ni iki?</h3>

            <p>
                PrEP ni uburyo bwo gukoresha imiti kugira ngo umuntu
                utanduye HIV agabanye cyane ibyago byo kwandura HIV
                igihe afite ibyago byo guhura n'ubwandu.
            </p>

            <p>
                PrEP igomba gukoreshwa hakurikijwe amabwiriza y'umukozi
                w'ubuzima. Umukozi w'ubuzima ashobora kugufasha kumenya
                niba PrEP ikubereye n'uburyo bwo kuyikoresha.
            </p>

            <p>
                PrEP ntabwo isimbura udukingirizo mu gukumira izindi STI
                cyangwa gutwita.
            </p>
        `
    },


    {
        id: "rbc_hiv_pep",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "pep",
            "hiv pep",
            "post exposure prophylaxis",
            "pep rwanda",
            "pep nyuma y'imibonano",
            "pep nyuma yimibonano",
            "kwirinda hiv nyuma",
            "hiv exposure",
            "exposed to hiv"
        ],

        answer: `
            <h3>🚨 PEP ni iki?</h3>

            <p>
                PEP ni imiti ikoreshwa nyuma y'uko umuntu ashobora
                kuba yarahuye na HIV, mu rwego rwo kugabanya ibyago
                byo kwandura.
            </p>

            <p>
                Iyo utekereza ko ushobora kuba warahuye na HIV,
                ntutegereze ibimenyetso. Jya ku kigo nderabuzima
                cyangwa kwa muganga vuba ubaze niba PEP ikubereye.
            </p>

            <p>
                Umukozi w'ubuzima ni we usuzuma uko guhura n'ubwandu
                byagenze akamenya niba PEP ikwiye gukoreshwa.
            </p>

            <div class="important-warning">
                ⚠️ Iyo habayeho ibyago byo guhura na HIV, shaka
                ubufasha bw'ubuvuzi vuba bishoboka.
            </div>
        `
    },


    /* ========================================================
       STIs
    ======================================================== */

    {
        id: "rbc_sti_testing",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "sti",
            "stis",
            "kwipimisha sti",
            "gupima sti",
            "sti testing",
            "indwara zandurira mu mibonano",
            "test y'indwara zandurira",
            "sti rwanda"
        ],

        answer: `
            <h3>🦠 Kwipimisha indwara zandurira mu mibonano</h3>

            <p>
                Indwara zandurira mu mibonano mpuzabitsina (STIs)
                zishobora gutera ibimenyetso cyangwa umuntu akagira
                infection atabizi.
            </p>

            <p>
                Ibimenyetso bishobora kuba harimo ibintu bidasanzwe
                bisohoka mu gitsina, kubabara cyangwa gutwika igihe
                wihagarika, ibisebe, uduheri, kubabara mu nda cyangwa
                kubabara mu gihe cy'imibonano.
            </p>

            <p>
                Niba ukeka ko ushobora kuba waranduye STI, ganira
                n'umukozi w'ubuzima kugira ngo umenye ibipimo
                n'ubuvuzi bukwiye.
            </p>
        `
    },


    {
        id: "rbc_sti_treatment",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "sti treatment",
            "kuvura sti",
            "kuvura indwara zandurira mu mibonano",
            "umuti wa sti",
            "sti medicine",
            "indwara zandurira zivurwa",
            "antibiotics sti"
        ],

        answer: `
            <h3>💊 Kuvura STI</h3>

            <p>
                Indwara zandurira mu mibonano zishobora kuvurwa cyangwa
                gucungwa bitewe n'ubwoko bw'indwara.
            </p>

            <p>
                Ni ngombwa kubanza gupimwa cyangwa gusuzumwa kugira ngo
                umukozi w'ubuzima amenye ubuvuzi bukwiye.
            </p>

            <p>
                Ntukifashishe antibiotics cyangwa indi miti utabanje
                kugisha inama umukozi w'ubuzima.
            </p>

            <p>
                Ku ndwara zimwe, uwo mwakoranye imibonano ashobora
                na we gukenera gupimwa cyangwa kuvurwa.
            </p>
        `
    },


    /* ========================================================
       CERVICAL CANCER / HPV
    ======================================================== */

    {
        id: "rbc_cervical_cancer",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "cervical cancer",
            "cervix cancer",
            "kanseri y'inkondo y'umura",
            "kanseri y'inkondo",
            "cervical cancer rwanda",
            "cervical screening",
            "screening inkondo y'umura",
            "kwisuzumisha kanseri y'inkondo"
        ],

        answer: `
            <h3>🎗️ Kanseri y'inkondo y'umura</h3>

            <p>
                Kanseri y'inkondo y'umura ni kanseri ifata inkondo
                y'umura. Ubwandu bwa HPV bushobora kugira uruhare
                runini mu gutera impinduka zishobora kuvamo iyi kanseri.
            </p>

            <p>
                Kwisuzumisha hakiri kare bishobora gufasha kumenya
                impinduka z'inkondo y'umura mbere y'uko ziba kanseri
                cyangwa kumenya kanseri hakiri kare.
            </p>

            <p>
                Niba ufite imyaka cyangwa ibindi byangombwa byo
                kwisuzumisha, ganira n'umukozi w'ubuzima cyangwa
                ujye ku kigo gitanga serivisi zo kwisuzumisha.
            </p>
        `
    },


    {
        id: "rbc_hpv_vaccine",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "hpv",
            "hpv vaccine",
            "urukingo rwa hpv",
            "gukingirwa hpv",
            "human papillomavirus",
            "hpv vaccination",
            "hpv rwanda",
            "urukingo rwa kanseri y'inkondo"
        ],

        answer: `
            <h3>💉 Urukingo rwa HPV</h3>

            <p>
                HPV ni virusi ishobora kwandura cyane cyane binyuze
                mu mibonano mpuzabitsina. Ubwoko bumwe bwa HPV bushobora
                gutera impinduka zishobora kuvamo kanseri y'inkondo y'umura
                n'izindi kanseri.
            </p>

            <p>
                Urukingo rwa HPV rufasha kurinda umuntu ubwoko bumwe
                bwa HPV butera indwara.
            </p>

            <p>
                Niba ushaka kumenya niba wowe cyangwa umwana wawe
                mukeneye urukingo rwa HPV, ganira n'umukozi w'ubuzima
                cyangwa ukurikize gahunda y'ikingira itangwa mu Rwanda.
            </p>
        `
    },


    /* ========================================================
       GBV
    ======================================================== */

    {
        id: "rbc_gbv_services",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "gbv rwanda",
            "ihohoterwa rishingiye ku gitsina",
            "gender based violence rwanda",
            "serivisi z'ihohoterwa",
            "aho nakura ubufasha ku ihohoterwa",
            "gbv support",
            "gbv services",
            "sexual violence rwanda"
        ],

        answer: `
            <h3>🛡️ Ubufasha ku ihohoterwa rishingiye ku gitsina</h3>

            <p>
                Umuntu wakorewe ihohoterwa rishingiye ku gitsina
                ashobora gushaka ubufasha ku kigo nderabuzima,
                ku bitaro cyangwa ahandi hatangirwa serivisi
                z'ubufasha ku ihohoterwa.
            </p>

            <p>
                Rwanda Biomedical Centre igaragaza kandi ISANGE
                ONE STOP CENTRE nk'ahantu hashobora gutangirwa
                serivisi ku bantu bakorewe ihohoterwa rishingiye ku gitsina.
            </p>

            <p>
                Niba ihohoterwa ryabaye vuba, ni byiza gushaka
                ubufasha bw'ubuvuzi vuba kugira ngo hakorwe isuzuma
                kandi hagaragazwe serivisi zishobora gukenerwa,
                harimo gukumira HIV cyangwa gutwita bitewe n'uko
                ibyabaye byagenze.
            </p>

            <div class="important-warning">
                ❤️ Ihohoterwa si amakosa y'uwahohotewe.
            </div>
        `
    },


    {
        id: "rbc_sexual_violence_72_hours",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "72 hours",
            "amasaha 72",
            "sexual violence 72 hours",
            "rape 72 hours",
            "gufatwa ku ngufu amasaha 72",
            "ihohoterwa amasaha 72",
            "pep 72 hours",
            "hiv pep sexual assault"
        ],

        answer: `
            <h3>🚨 Nyuma y'ihohoterwa rishingiye ku gitsina</h3>

            <p>
                Niba umuntu yakorewe ihohoterwa rishingiye ku gitsina,
                ni byiza kujya kwa muganga cyangwa ku kigo nderabuzima
                vuba bishoboka.
            </p>

            <p>
                RBC itanga inama yo gushaka ubufasha bw'ubuvuzi vuba,
                kandi umuntu wakorewe ihohoterwa rishingiye ku gitsina
                ashobora gukenera serivisi zo gukumira HIV, STI cyangwa
                gutwita bitewe n'uko ibyabaye byagenze.
            </p>

            <p>
                Ku byerekeye PEP, igihe cyo kuyitangira ni ingenzi cyane,
                bityo ntutegereze ibimenyetso bya HIV mbere yo gushaka
                ubufasha.
            </p>

            <p>
                Ushobora kandi kugana ISANGE ONE STOP CENTRE cyangwa
                ikigo nderabuzima/ibitaro bikwegereye.
            </p>

            <div class="important-warning">
                ⚠️ Niba uri mu kaga ako kanya, banza ujye ahantu
                hatekanye ushake ubufasha bwihuse.
            </div>
        `
    },


    /* ========================================================
       EMERGENCY / CONTACT
    ======================================================== */

    {
        id: "rbc_health_contact",

        source: "Rwanda Biomedical Centre (RBC)",

        keywords: [
            "rbc contact",
            "rbc phone",
            "rbc number",
            "numero rbc",
            "rbc call center",
            "114",
            "call center rwanda",
            "ubufasha rbc"
        ],

        answer: `
            <h3>📞 Rwanda Biomedical Centre</h3>

            <p>
                Rwanda Biomedical Centre ni ikigo cy'igihugu gishinzwe
                gushyira mu bikorwa ibikorwa byinshi by'ubuzima mu Rwanda.
            </p>

            <p>
                RBC igaragaza nimero ya Call Center itishyuzwa:
                <strong>114</strong>.
            </p>

            <p>
                Ku butabazi bwihutirwa bw'ambulance, RBC igaragaza:
                <strong>912</strong>.
            </p>
        `
    }

];


module.exports = {
    rbcKnowledgeBase
};