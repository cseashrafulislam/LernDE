import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

levels=[
 {"id":"FOUNDATION","title":"Foundation","subtitle":"Zero থেকে German sound, alphabet ও survival basics","goal":"German লেখা/শব্দ চিনে basic greeting, number, time ও পরিচয় বলতে পারা","badge":"START"},
 {"id":"A1","title":"A1","subtitle":"Beginner — everyday survival German","goal":"নিজের পরিচয়, shopping, food, travel, basic daily life সামলানো","badge":"CEFR A1"},
 {"id":"A2","title":"A2","subtitle":"Elementary — daily life with more independence","goal":"routine, health, housing, appointments, simple workplace কথোপকথন","badge":"CEFR A2"},
 {"id":"B1","title":"B1","subtitle":"Independent user — connected German","goal":"অভিজ্ঞতা, opinion, formal email, work/life situations independently handle করা","badge":"CEFR B1"},
 {"id":"B2","title":"B2","subtitle":"Upper-intermediate — clear, detailed and professional communication","goal":"complex texts, discussion, argument, workplace communication ও B2-style exam tasks","badge":"CEFR B2"},
]

lesson_titles={
"FOUNDATION":[
("Alphabet & Spelling","A–Z, Ä Ö Ü, ß; letter names, spelling names and email addresses"),
("Vowels: Long vs Short","German vowel length, closed/open quality and why Stadt ≠ Staat"),
("Umlauts Ä Ö Ü","mouth position, tongue placement and high-frequency examples"),
("Diphthongs","ei/ai, ie, eu/äu, au — reliable sound patterns"),
("CH: ich-Laut vs ach-Laut","ich/mich vs Bach/machen; hear and produce the contrast"),
("SCH, SP, ST, Z, TSCH","sch, word-initial sp/st, z=/ts/ and tsch=/tʃ/"),
("R, H & Final Devoicing","German r variants, audible h, and b/d/g → p/t/k at word end"),
("PF, KN, GN & Consonant Clusters","German clusters without inserting extra Bangla vowels"),
("Word Stress","compound stress, unstressed endings and keeping syllables compact"),
("Sentence Rhythm & Melody","statement/question intonation, sentence stress and reduction"),
("Minimal-Pair Listening","hear small sound differences before trying to speak fast"),
("Shadowing Bootcamp","listen → pause → copy → record → compare, first slowly then naturally"),
("Greetings & Politeness","Hallo, Guten Morgen, Danke, Bitte, Entschuldigung"),
("Numbers, Phone & Money","0–1,000+, phone numbers, prices and digit-by-digit listening"),
("Date, Day & Time","weekday, month, date, clock time and appointment language"),
("Introduce Yourself","name, country, language, profession and a 30-second self-introduction"),
("Survival Clarification","repeat, slow down, spell, confirm and say what you did not understand"),
("Foundation Checkpoint","sound recognition, spelling, shadowing, survival dialogue and readiness for A1")],
"A1":[
("People & Personal Information","name, age, country, language, contact"),
("Family & Friends","family members, possessives, describing people"),
("Daily Routine","wake up, work, study, separable verbs"),
("Food & Drinks","ordering, quantities, likes/dislikes"),
("Shopping & Prices","clothes, sizes, price questions, Akkusativ basics"),
("Home & Furniture","rooms, furniture, location basics"),
("City & Directions","places, asking/giving simple directions"),
("Transport & Travel","ticket, station, bus/train, modal verbs"),
("Weather & Free Time","weather, hobbies, frequency"),
("Health Basics","body, simple symptoms, doctor/pharmacy"),
("Appointments & Plans","time, invitations, meeting arrangements"),
("A1 Review & Exam Skills","reading notices, short messages, speaking basics")],
"A2":[
("Past Experiences","Perfekt with haben/sein"),
("Housing & Neighbourhood","rent, rooms, moving, local services"),
("Workplace Basics","tasks, schedules, colleagues, simple requests"),
("Health & Doctor","symptoms, advice, appointments, reflexive forms"),
("Travel Problems","delay, lost item, hotel, complaint basics"),
("Education & Learning","courses, skills, goals, comparisons"),
("Media & Technology","devices, internet, communication"),
("Services & Administration","bank, post, forms, appointments"),
("Reasons & Conditions","weil, dass, wenn; subordinate clauses"),
("Comparing & Describing","comparative, superlative, adjective basics"),
("Polite Wishes & Advice","würde, könnte, sollte, wäre, hätte"),
("A2 Review & Exam Skills","connected everyday tasks and short formal writing")],
"B1":[
("Work & Career","job duties, experience, application vocabulary"),
("Opinions & Reasons","structured opinion, connectors, discussion"),
("Formal Email","request, complaint, explanation, closing conventions"),
("News & Media","main idea, detail, reported information"),
("Environment & Society","cause/effect, advantages/disadvantages"),
("Technology & Internet","digital life, privacy, problem solving"),
("Travel & Experiences","narration, Plusquamperfekt basics, sequencing"),
("Relationships & Communication","advice, conflict, emotions"),
("Passive Voice","process descriptions and formal style"),
("Relative Clauses","add precise information about people/things"),
("Presentation & Planning","structured speaking and planning together"),
("B1 Review & Exam Skills","reading, listening, writing, speaking integration")],
"B2":[
("Advanced Word Order","Mittelfeld, sentence bracket, information focus"),
("Complex Connectors","dennoch, hingegen, insofern, je…desto, sowohl…als auch"),
("Argumentation","claim, reason, evidence, counterargument, conclusion"),
("Formal & Professional Writing","register, concise workplace messages, reports"),
("Advanced Passive","Vorgang/Zustand, modal passive, alternatives"),
("Konjunktiv I & II","reported speech, hypothetical situations, diplomacy"),
("Nominalisation","formal written style and noun-verb transformations"),
("Nomen-Verb-Verbindungen","eine Entscheidung treffen, Einfluss haben etc."),
("Advanced Relative Clauses","prepositions, dessen/deren, complex references"),
("Discussion & Negotiation","agree, disagree, clarify, compromise"),
("Presentations","signposting, examples, responding to questions"),
("Workplace German","meetings, status updates, incidents, deadlines"),
("Job Interview & IT German","professional self-presentation and technical discussion"),
("B2 Review & Full Mock Skills","exam timing, strategy, integrated B2 tasks")],
}

lesson_icons={"FOUNDATION":"🚀","A1":"🌱","A2":"🌿","B1":"🌳","B2":"🎯"}
lessons=[]
for level in levels:
    lid=level["id"]
    for i,(title,desc) in enumerate(lesson_titles[lid],1):
        lessons.append({
            "id":f"{lid}-{i:02}","level":lid,"order":i,"title":title,"description":desc,"icon":lesson_icons[lid],
            "minutes":10 if lid=="FOUNDATION" else 12 if lid in ("A1","A2") else 15,
            "steps":["Warm-up","Learn","Memory Tip","Listen","Speak","Practice","Quick Check"]
        })

grammar=[]
def g(level,title,rule,memory,good,bad="",note=""):
    grammar.append({"id":f"g{len(grammar)+1:02}","level":level,"title":title,"rule":rule,"memory":memory,"good":good,"bad":bad,"note":note})
# Foundation/A1
g("FOUNDATION","Verb in position 2","A normal German statement usually places the finite verb in position 2.","একটা slot সামনে যাই থাকুক, finite verb সাধারণত 2 নম্বর জায়গা ধরে রাখে।","Heute gehe ich ins Büro.","Heute ich gehe ins Büro.")
g("A1","sein — to be","sein: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, Sie/sie sind.","BIN–BIST–IST / SIND–SEID–SIND rhythm করে বলুন।","Ich bin Ashraful Islam.")
g("A1","haben — to have","haben: ich habe, du hast, er/sie/es hat, wir haben, ihr habt, Sie/sie haben.","HABE–HAST–HAT / HABEN–HABT–HABEN","Ich habe heute Zeit.")
g("A1","Nominativ articles","der/die/das mark masculine/feminine/neuter nouns in dictionary form.","Noun কখনও article ছাড়া আলাদা করে শিখবেন না।","der Tisch, die Lampe, das Buch")
g("A1","Akkusativ basics","In Akkusativ, masculine der/ein changes to den/einen; die/das remain unchanged.","Akkusativ-এ সবচেয়ে visible change: DER → DEN.","Ich kaufe einen Kaffee.")
g("A1","Negation: nicht / kein","kein negates an indefinite noun; nicht generally negates verbs, adjectives or definite content.","Noun-এর সামনে ein/eine থাকলে kein/keine ভাবুন।","Ich habe kein Auto. / Ich komme heute nicht.")
g("A1","Modal verbs","Modal verb is finite in position 2; the second verb goes to the end in infinitive.","Modal সামনে, action verb শেষে।","Ich kann heute kommen.")
g("A1","Separable verbs","In main clauses the prefix moves to the end: aufstehen → Ich stehe ... auf.","Prefix আলাদা হয়ে sentence-এর শেষ বাসে ওঠে।","Ich stehe um sieben Uhr auf.")
g("A1","W-questions","Question word + finite verb + subject + ...","W-word প্রথমে, verb এরপর।","Wo wohnst du?")
g("A1","Yes/no questions","Finite verb comes first.","হ্যাঁ/না question = verb আগে।","Kommst du morgen?")
g("A1","Imperative basics","Use command forms appropriate to du/ihr/Sie.","Formal command-এ Verb + Sie.","Kommen Sie bitte herein.")
g("A1","Time–manner–place","A useful default order is time before manner before place, though German word order is flexible.","Wann → Wie → Wo: safe default, absolute law নয়।","Ich fahre morgen mit dem Bus nach Berlin.")
g("FOUNDATION","German nouns start with capital letters","Common nouns are capitalised in German: das Haus, die Arbeit, der Termin.","German noun দেখলেই Capital letter আশা করুন।","Ich lerne Deutsch. Das Buch ist neu.")
g("FOUNDATION","Noun + article as one learning unit","Learn a concrete noun together with its article and plural whenever possible.","শুধু Tisch নয়—der Tisch, die Tische একসাথে শিখুন।","der Tisch – die Tische")
g("FOUNDATION","Personal pronouns","Core subject pronouns: ich, du, er/sie/es, wir, ihr, Sie/sie.","Formal Sie সবসময় capital S; verb plural form নেয়।","Ich lerne. Sie lernen.")
g("FOUNDATION","Infinitive and verb stem","Many infinitives end in -en; removing -en often reveals the stem used for present-tense endings.","lernen → lern-; machen → mach-। Irregular verbs আলাদা করে শিখুন।","Ich lerne Deutsch.")
g("FOUNDATION","Basic present-tense endings","For many regular verbs: ich -e, du -st, er/sie/es -t, wir/Sie/sie -en, ihr -t.","E–ST–T / EN–T–EN rhythm করে বলুন।","Ich lerne, du lernst, er lernt.")
# A2
g("A2","Dativ articles","der/das→dem, die→der, plural die→den (+n where possible).","MIT-এর সাথে Dativ FIT — mit dem/der/den.","Ich fahre mit dem Bus.")
g("A2","Two-way prepositions","With an/auf/in/über/unter/vor/hinter/neben/zwischen: location often uses Dativ; destination/change of location often Akkusativ.","Wo? → Dativ; Wohin? → Akkusativ — useful learner rule.","Das Buch liegt auf dem Tisch. / Ich lege es auf den Tisch.")
g("A2","Perfekt","Most spoken past uses haben/sein + Partizip II at the end.","Helper verb সামনে, Partizip শেষে।","Ich habe gearbeitet. / Ich bin gefahren.")
g("A2","Präteritum of sein/haben/modals","war/hatte and modal Präteritum are common in everyday German.","war = was, hatte = had — এগুলো খুব high-frequency।","Gestern war ich krank.")
g("A2","Reflexive verbs","Some verbs require a reflexive pronoun: mich/dich/sich/uns/euch/sich.","Verb-এর dictionary entry-তে sich থাকলে pronoun-ও শিখুন।","Ich interessiere mich für Deutsch.")
g("A2","weil clauses","weil introduces a subordinate clause; finite verb goes to the end.","WEIL এলে finite verb 🏁 শেষে।","Ich bleibe zu Hause, weil ich krank bin.","weil ich bin krank")
g("A2","dass clauses","dass introduces a content clause; finite verb goes to the end.","DASS = reported thought/content, verb শেষে।","Ich glaube, dass Deutsch interessant ist.")
g("A2","wenn clauses","wenn commonly expresses repeated/present/future conditions or 'when'. Verb goes to the end in the subordinate clause.","WENN-এর clause-এ verb শেষ; main clause আগে এলে inversion মনে রাখুন।","Wenn ich Zeit habe, lerne ich Deutsch.")
g("A2","Comparative & superlative","Often adjective + -er for comparative; am + -sten for adverbial superlative, with irregular forms such as gut→besser→am besten.","gut–besser–am besten আলাদা করে মনে রাখুন।","Deutsch ist leichter als ich dachte.")
g("A2","Konjunktiv II polite forms","würde, könnte, hätte, wäre and sollte help express politeness, wishes and advice.","কঠিন request soft করতে könnte/würde ব্যবহার করুন।","Könnten Sie mir bitte helfen?")
# B1
g("B1","Relative clauses","Relative pronouns connect extra information; case depends on function inside the relative clause.","Noun-এর gender article দেয়; clause-এর কাজ case ঠিক করে।","Das ist der Kollege, der mir geholfen hat.")
g("B1","Passive present","werden + Partizip II describes a process without focusing on the actor.","Process focus = werden + Partizip II.","Die Software wird getestet.")
g("B1","Passive past","Präteritum passive commonly uses wurde + Partizip II.","wird → present process; wurde → past process।","Der Fehler wurde gestern behoben.")
g("B1","um ... zu","Use um ... zu when the subject is the same and you express purpose.","Same subject + purpose = um...zu.","Ich lerne Deutsch, um in Deutschland zu arbeiten.")
g("B1","damit","Use damit for purpose, especially when subjects differ.","Subject বদলালে purpose-এর জন্য damit useful।","Ich spreche langsam, damit du mich verstehst.")
g("B1","obwohl","obwohl introduces a concession; finite verb goes to the end.","OBWOHL = যদিও; obstacle আছে, action তবুও হয়।","Obwohl es regnet, gehe ich spazieren.")
g("B1","trotzdem","trotzdem is an adverb in a main clause; finite verb remains position 2.","obwohl = subordinate; trotzdem = main clause. দুটো mix করবেন না।","Es regnet. Trotzdem gehe ich spazieren.")
g("B1","Plusquamperfekt","hatte/war + Partizip II expresses an event before another past event.","Past-এরও আগে = hatte/war + participle।","Nachdem ich gegessen hatte, ging ich los.")
g("B1","Genitive basics","Genitive can express possession; masculine/neuter articles often become des and nouns may take -(e)s.","Formal লেখা/phrases-এ Genitiv বেশি দেখা যায়।","Das ist das Ende des Projekts.")
g("B1","Pronominal adverbs","da(r)+preposition often replaces a thing: darüber, darauf, damit; wo(r)+preposition asks about it.","Thing হলে da-/wo- family মনে রাখুন।","Worauf wartest du? – Darauf.")
# B2
g("B2","Advanced connector pairs","Pairs such as sowohl…als auch, weder…noch, zwar…aber, einerseits…andererseits structure complex arguments.","Connector pair-কে দুই টুকরো Lego হিসেবে মনে রাখুন।","Einerseits spart KI Zeit, andererseits entstehen neue Risiken.")
g("B2","je ... desto","je + comparative subordinate clause, desto/umso + comparative main clause.","যত…তত = je…desto।","Je mehr ich übe, desto sicherer spreche ich.")
g("B2","Konjunktiv I reported speech","Konjunktiv I is used especially in formal reporting to distance the reporter from a statement.","News/report style: তিনি বলেছেন → sei/habe/werde forms দেখা যায়।","Er sagte, das Projekt sei abgeschlossen.")
g("B2","Advanced Konjunktiv II","Use hätte/wäre/würde + forms for unreal past, hypothetical consequences and diplomatic wording.","Unreal past = hätte/wäre + Partizip II.","Wenn ich mehr Zeit gehabt hätte, hätte ich früher angefangen.")
g("B2","Zustandspassiv","sein + Partizip II describes a resulting state; werden + Partizip II describes the process.","werden = process; sein = result state।","Die Tür ist geschlossen. / Die Tür wird geschlossen.")
g("B2","Passive with modal verbs","Modal finite verb + Partizip II + werden at the end.","Modal + participle + werden — double ending শুনতে অভ্যাস করুন।","Der Bericht muss heute fertiggestellt werden.")
g("B2","Nominalisation","Formal texts often turn verbs/adjectives into nouns, e.g. entscheiden→die Entscheidung.","B2 formal text-এ verbs অনেক সময় noun suit পরে।","Nach der Einführung des Systems stieg die Produktivität.")
g("B2","Nomen-Verb-Verbindungen","Fixed noun-verb combinations carry formal meaning, e.g. eine Entscheidung treffen, Einfluss nehmen.","একেকটা unit হিসেবে শিখুন; word-by-word translate করবেন না।","Wir müssen eine Entscheidung treffen.")
g("B2","Relative clauses with prepositions","The preposition appears before the relative pronoun and determines its case.","Preposition সামনে বসে case ঠিক করে।","Das ist das Thema, über das wir gesprochen haben.")
g("B2","dessen / deren","Genitive relative pronouns whose form follows the antecedent's gender/number: dessen for masculine/neuter, deren for feminine/plural.","whose = dessen/deren family।","Der Kollege, dessen Laptop kaputt ist, arbeitet heute zu Hause.")
g("B2","indem","indem explains the method by which something happens.","How/by doing what? → indem.","Wir sparen Zeit, indem wir Prozesse automatisieren.")
g("B2","dadurch, dass","dadurch, dass expresses means/cause in a more explicit structure.","dadurch...dass = এর মাধ্যমে যে…","Die Qualität steigt dadurch, dass wir früher testen.")
g("B2","Formal hedging","Expressions like meines Erachtens, es scheint, tendenziell, vermutlich make claims appropriately cautious.","Professional German = সব কথা absolute না; evidence অনুযায়ী strength দিন।","Meines Erachtens wäre eine schrittweise Einführung sinnvoll.")
g("B2","Information structure","German word order can shift known/new information while finite-verb rules remain; avoid treating every order as a rigid formula.","V2 rule শক্ত; বাকিরা context অনুযায়ী নড়াচড়া করতে পারে।","Dieses Problem haben wir gestern bereits besprochen.")

# Vocabulary: curated, visual-first. pronunciation is a Bengali approximation, audio remains source of truth.
vocab=[]
def v(level,de,bn_pr,bn,en,emoji,article="",plural="",pos="noun",cat="General",example="",ex_bn="",memory=""):
    vocab.append({"id":f"v{len(vocab)+1:03}","level":level,"de":de,"article":article,"plural":plural,"bnPron":bn_pr,"bn":bn,"en":en,"emoji":emoji,"pos":pos,"category":cat,"example":example or de,"exampleBn":ex_bn,"memory":memory})
# Foundation 32
foundation=[
("Hallo","হালো","হ্যালো","hello","👋"),("Guten Morgen","গুটেন মর্গেন","সুপ্রভাত","good morning","🌅"),("Guten Tag","গুটেন টাক","শুভ দিন/হ্যালো","good day","☀️"),("Guten Abend","গুটেন আবেন্ট","শুভ সন্ধ্যা","good evening","🌆"),("Tschüss","চুস","বিদায়","bye","👋"),("Danke","ডাঙ্কে","ধন্যবাদ","thank you","🙏"),("Bitte","বিটে","অনুগ্রহ করে/স্বাগতম","please/you're welcome","🙂"),("Entschuldigung","এন্টশুল্ডিগুং","মাফ করবেন","excuse me/sorry","🙇"),("Ja","ইয়া","হ্যাঁ","yes","✅"),("Nein","নাইন","না","no","❌"),("vielleicht","ফিলাইখ্ট","হয়তো","perhaps","🤔"),("Deutsch","ডয়চ","জার্মান ভাষা","German","🇩🇪"),("Bangladesch","বাংলাদেশ","বাংলাদেশ","Bangladesh","🇧🇩"),("eins","আইন্স","এক","one","1️⃣"),("zwei","ৎসভাই","দুই","two","2️⃣"),("drei","ড্রাই","তিন","three","3️⃣"),("heute","হয়টে","আজ","today","📅"),("morgen","মর্গেন","আগামীকাল/সকাল","tomorrow/morning","🌄"),("gestern","গেস্টার্ন","গতকাল","yesterday","↩️"),("jetzt","ইয়েট্স্ট","এখন","now","⏱️"),("Uhr","উর","ঘণ্টা/টা বাজে","o'clock","🕒"),("Montag","মোন্টাক","সোমবার","Monday","📆"),("Freitag","ফ্রাইটাক","শুক্রবার","Friday","📆"),("Januar","ইয়ানুয়ার","জানুয়ারি","January","🗓️"),("Name","নামে","নাম","name","🏷️"),("heißen","হাইসেন","নাম হওয়া","to be called","🪪"),("sprechen","শপ্রেখেন","কথা বলা","to speak","💬"),("verstehen","ফেয়ারশ্টেহেন","বুঝতে পারা","to understand","🧠"),("wiederholen","ভিডারহোলেন","পুনরাবৃত্তি করা","to repeat","🔁"),("langsam","লাংজাম","ধীরে","slowly","🐢"),("schnell","শ্নেল","দ্রুত","quickly","⚡"),("Hilfe","হিলফে","সাহায্য","help","🆘")]
for de,bp,bn,en,e in foundation: v("FOUNDATION",de,bp,bn,en,e,pos="phrase" if " " in de else "word",cat="Foundation")
# A1 36
A1=[
("Mann","মান","পুরুষ","man","👨","der","Männer"),("Frau","ফ্রাউ","নারী/মিসেস","woman","👩","die","Frauen"),("Kind","কিন্ট","শিশু","child","🧒","das","Kinder"),("Familie","ফামিলিয়ে","পরিবার","family","👨‍👩‍👧","die","Familien"),("Freund","ফ্রয়ন্ট","বন্ধু","friend","🤝","der","Freunde"),("Haus","হাউস","বাড়ি","house","🏠","das","Häuser"),("Wohnung","ভোনুং","ফ্ল্যাট/বাসস্থান","apartment","🏢","die","Wohnungen"),("Zimmer","ৎসিমার","কক্ষ","room","🚪","das","Zimmer"),("Tisch","টিশ","টেবিল","table","🪑","der","Tische"),("Stuhl","শ্টুল","চেয়ার","chair","🪑","der","Stühle"),("Buch","বুখ","বই","book","📘","das","Bücher"),("Wasser","ভাসার","পানি","water","💧","das",""),("Kaffee","কাফে","কফি","coffee","☕","der",""),("Brot","ব্রোট","রুটি/ব্রেড","bread","🍞","das","Brote"),("Apfel","আপ্‌ফেল","আপেল","apple","🍎","der","Äpfel"),("Banane","বানানে","কলা","banana","🍌","die","Bananen"),("Essen","এসেন","খাবার","food","🍽️","das",""),("Schule","শুলে","স্কুল","school","🏫","die","Schulen"),("Arbeit","আরবাইট","কাজ","work","💼","die","Arbeiten"),("Beruf","বেরুফ","পেশা","profession","🧑‍💼","der","Berufe"),("Büro","ব্যুরো","অফিস","office","🏢","das","Büros"),("Auto","আউতো","গাড়ি","car","🚗","das","Autos"),("Bus","বুস","বাস","bus","🚌","der","Busse"),("Bahnhof","বানহোফ","রেলস্টেশন","station","🚉","der","Bahnhöfe"),("Ticket","টিকেট","টিকিট","ticket","🎫","das","Tickets"),("Straße","শ্ট্রাসে","রাস্তা","street","🛣️","die","Straßen"),("Stadt","শ্টাট","শহর","city","🏙️","die","Städte"),("Arzt","আর্ট্স্ট","ডাক্তার","doctor","👨‍⚕️","der","Ärzte"),("Apotheke","আপোতেকে","ফার্মেসি","pharmacy","💊","die","Apotheken"),("Kopf","কপ্‌ফ","মাথা","head","🙂","der","Köpfe"),("kaufen","কাউফেন","কেনা","to buy","🛍️","",""),("essen","এসেন","খাওয়া","to eat","🍴","",""),("trinken","ট্রিঙ্কেন","পান করা","to drink","🥤","",""),("arbeiten","আরবাইটেন","কাজ করা","to work","💼","",""),("lernen","লের্নেন","শেখা","to learn","📚","",""),("fahren","ফারেন","যানবাহনে যাওয়া/চালানো","to travel/drive","🚗","","")]
for de,bp,bn,en,e,a,p in A1: v("A1",de,bp,bn,en,e,a,p,pos="verb" if de in {"kaufen","essen","trinken","arbeiten","lernen","fahren"} else "noun",cat="Everyday")
# A2 36
A2=[
("Termin","টেরমিন","অ্যাপয়েন্টমেন্ট","appointment","📅","der","Termine"),("Nachbar","নাখবার","প্রতিবেশী","neighbour","🏘️","der","Nachbarn"),("Miete","মিতে","ভাড়া","rent","🏠","die","Mieten"),("Konto","কোন্টো","ব্যাংক হিসাব","account","🏦","das","Konten"),("Formular","ফর্মুলার","ফর্ম","form","📝","das","Formulare"),("Reise","রাইজে","ভ্রমণ","journey","✈️","die","Reisen"),("Verspätung","ফেয়ারশ্পেটুং","বিলম্ব","delay","⏰","die","Verspätungen"),("Hotel","হোটেল","হোটেল","hotel","🏨","das","Hotels"),("Krankheit","ক্রাংখাইট","অসুস্থতা","illness","🤒","die","Krankheiten"),("Gesundheit","গেজুন্ডহাইট","স্বাস্থ্য","health","❤️","die",""),("Medikament","মেডিকামেন্ট","ওষুধ","medicine","💊","das","Medikamente"),("Kollege","কোলেগে","সহকর্মী","colleague","👥","der","Kollegen"),("Aufgabe","আউফগাবে","কাজ/দায়িত্ব","task","✅","die","Aufgaben"),("Besprechung","বেশপ্রেখুং","মিটিং","meeting","🗣️","die","Besprechungen"),("Nachricht","নাখরিশ্ট","বার্তা/খবর","message","📩","die","Nachrichten"),("Internet","ইন্টারনেট","ইন্টারনেট","internet","🌐","das",""),("Gerät","গেরেট","ডিভাইস","device","📱","das","Geräte"),("Problem","প্রোব্লেম","সমস্যা","problem","⚠️","das","Probleme"),("Lösung","ল্যোজুং","সমাধান","solution","💡","die","Lösungen"),("Erfahrung","এরফারুং","অভিজ্ঞতা","experience","🧭","die","Erfahrungen"),("früher","ফ্রুয়ার","আগে/পূর্বে","earlier","⏮️","",""),("später","শ্পেটার","পরে","later","⏭️","",""),("gemeinsam","গেমাইনজাম","একসাথে","together","🤝","",""),("wichtig","ভিশ্টিশ","গুরুত্বপূর্ণ","important","❗","",""),("möglich","ম্যোগলিশ","সম্ভব","possible","✅","",""),("erklären","এরক্লেয়ারেন","ব্যাখ্যা করা","to explain","🗨️","",""),("vereinbaren","ফেয়ারআইনবারেন","ঠিক/নির্ধারণ করা","to arrange","📅","",""),("bestellen","বেশ্টেলেন","অর্ডার করা","to order","🛒","",""),("vergessen","ফেরগেসেন","ভুলে যাওয়া","to forget","🧠","",""),("beginnen","বেগিনেন","শুরু করা","to begin","▶️","",""),("enden","এন্ডেন","শেষ হওয়া","to end","⏹️","",""),("sich interessieren","জিশ ইন্টারেসিরেন","আগ্রহী হওয়া","to be interested","✨","",""),("sich erinnern","জিশ এরইনার্ন","মনে করা","to remember","🧠","",""),("deshalb","দেশহাল্প","তাই/এই কারণে","therefore","➡️","",""),("trotzdem","ট্রোট্সডেম","তবুও","nevertheless","🌧️➡️🙂","",""),("obwohl","অবভোল","যদিও","although","↔️","","")]
for de,bp,bn,en,e,a,p in A2: v("A2",de,bp,bn,en,e,a,p,pos="verb" if de.endswith("en") or de.startswith("sich ") else "word",cat="Daily Life")
# B1 36
B1=[
("Bewerbung","বেভেরবুং","চাকরির আবেদন","application","📄","die","Bewerbungen"),("Lebenslauf","লেবেন্সলাউফ","সিভি","CV","📑","der","Lebensläufe"),("Stelle","শ্টেলে","পদ/চাকরি","position","💼","die","Stellen"),("Gehalt","গেহাল্ট","বেতন","salary","💶","das","Gehälter"),("Vertrag","ফেরট্রাক","চুক্তি","contract","📝","der","Verträge"),("Verantwortung","ফেরআন্টভোর্টুং","দায়িত্ব","responsibility","🎯","die","Verantwortungen"),("Vorteil","ফোরটাইল","সুবিধা","advantage","➕","der","Vorteile"),("Nachteil","নাখটাইল","অসুবিধা","disadvantage","➖","der","Nachteile"),("Meinung","মাইনুং","মতামত","opinion","💭","die","Meinungen"),("Grund","গ্রুন্ড","কারণ","reason","🧩","der","Gründe"),("Umwelt","উমভেল্ট","পরিবেশ","environment","🌍","die",""),("Gesellschaft","গেজেলশাফ্ট","সমাজ","society","👥","die","Gesellschaften"),("Datenschutz","ডাটেনশুট্স","ডেটা সুরক্ষা","data protection","🔐","der",""),("Entwicklung","এন্টভিকলুং","উন্নয়ন/বিকাশ","development","📈","die","Entwicklungen"),("Fortschritt","ফোর্টশ্রিট","অগ্রগতি","progress","📊","der","Fortschritte"),("Entscheidung","এন্টশাইডুং","সিদ্ধান্ত","decision","⚖️","die","Entscheidungen"),("Möglichkeit","ম্যোগলিশকাইট","সম্ভাবনা/সুযোগ","possibility","🚪","die","Möglichkeiten"),("Zukunft","ৎসুকুনফ্ট","ভবিষ্যৎ","future","🔮","die",""),("erreichen","এররাইখেন","অর্জন/পৌঁছানো","to achieve/reach","🏁","",""),("verbessern","ফেরবেসার্ন","উন্নত করা","to improve","📈","",""),("vermeiden","ফেরমাইডেন","এড়িয়ে চলা","to avoid","🚫","",""),("entscheiden","এন্টশাইডেন","সিদ্ধান্ত নেওয়া","to decide","⚖️","",""),("sich bewerben","জিশ বেভেরবেন","চাকরির আবেদন করা","to apply","📨","",""),("teilnehmen","টাইলনেমেন","অংশগ্রহণ করা","to participate","🙋","",""),("unterstützen","উন্টারশ্টুট্সেন","সহায়তা করা","to support","🤝","",""),("zuverlässig","ৎসুফেয়ারলেসিশ","নির্ভরযোগ্য","reliable","🛡️","",""),("selbstständig","জেলবস্টশ্টেন্ডিশ","স্বনির্ভর/স্বতন্ত্রভাবে","independently","🧑‍💻","",""),("wahrscheinlich","ভারশাইনলিশ","সম্ভবত","probably","📌","",""),("allerdings","আলারডিংস","তবে/অবশ্য","however","↩️","",""),("während","ভেয়ারেন্ট","যখন/অন্যদিকে","while/whereas","↔️","",""),("nachdem","নাখডেম","পরে যে/এর পর","after","⏭️","",""),("bevor","বেফোর","আগে যে/এর আগে","before","⏮️","",""),("darüber","দারিউবার","এ বিষয়ে/তার ওপর","about it","💬","",""),("darauf","দারআউফ","তার ওপর/সেটির জন্য","on it/for it","👉","",""),("damit","দামিট","এর সাথে/যাতে","with it/so that","🔗","",""),("außerdem","আউসারডেম","এছাড়াও","in addition","➕","","")]
for de,bp,bn,en,e,a,p in B1: v("B1",de,bp,bn,en,e,a,p,pos="noun" if a else "word",cat="Independent German")
# B2 40
B2=[
("Anforderung","আনফোর্ডেরুং","প্রয়োজনীয়তা/রেকোয়ারমেন্ট","requirement","📋","die","Anforderungen"),("Auswirkung","আউসভিরকুং","প্রভাব/ফলাফল","impact","💥","die","Auswirkungen"),("Herausforderung","হেরআউসফোর্ডেরুং","চ্যালেঞ্জ","challenge","🧗","die","Herausforderungen"),("Zusammenhang","ৎসুজামেনহাং","সম্পর্ক/প্রেক্ষিত","connection/context","🔗","der","Zusammenhänge"),("Maßnahme","মাসনামে","ব্যবস্থা/পদক্ষেপ","measure/action","🛠️","die","Maßnahmen"),("Voraussetzung","ফোরআউসজেট্সুং","পূর্বশর্ত","prerequisite","✅","die","Voraussetzungen"),("Ergebnis","এরগেবনিস","ফলাফল","result","📊","das","Ergebnisse"),("Ansatz","আনজাট্স","পদ্ধতি/অ্যাপ্রোচ","approach","🧭","der","Ansätze"),("Umsetzung","উমজেট্সুং","বাস্তবায়ন","implementation","🚀","die","Umsetzungen"),("Rückmeldung","রুকমেল্ডুং","ফিডব্যাক/প্রতিক্রিয়া","feedback","💬","die","Rückmeldungen"),("Frist","ফ্রিস্ট","সময়সীমা","deadline","⏳","die","Fristen"),("Störung","শ্ট্যোরুং","বিঘ্ন/ত্রুটি","disruption/incident","🚨","die","Störungen"),("Verfügbarkeit","ফেরফ্যুগবারকাইট","উপলব্ধতা","availability","🟢","die",""),("Sicherheit","জিশারহাইট","নিরাপত্তা","security","🔒","die",""),("Datensatz","ডাটেনজাট্স","ডেটা রেকর্ড","data record","🗃️","der","Datensätze"),("Schnittstelle","শ্নিটশ্টেলে","ইন্টারফেস/API boundary","interface","🔌","die","Schnittstellen"),("Bereitstellung","বেরাইটশ্টেলুং","ডিপ্লয়মেন্ট/প্রদান","deployment/provision","🚀","die","Bereitstellungen"),("Fehlerbehebung","ফেলারবেহেবুং","ত্রুটি সমাধান","troubleshooting/fix","🧰","die",""),("Skalierbarkeit","স্কালিরবারকাইট","স্কেল করার সক্ষমতা","scalability","📈","die",""),("Zuverlässigkeit","ৎসুফেয়ারলেসিশকাইট","নির্ভরযোগ্যতা","reliability","🛡️","die",""),("berücksichtigen","বেরুকজিশ্টিগেন","বিবেচনায় নেওয়া","to consider","🧠","",""),("gewährleisten","গেভেয়ারলাইস্টেন","নিশ্চিত করা","to ensure","✅","",""),("beurteilen","বেউরটাইলেন","মূল্যায়ন করা","to assess","📏","",""),("nachvollziehen","নাখফোলৎসিয়েন","অনুসরণ/বোঝা","to trace/understand","🔍","",""),("erläutern","এরলয়টার্ন","বিশদ ব্যাখ্যা করা","to explain/elaborate","🗣️","",""),("voraussetzen","ফোরআউসজেট্সেন","পূর্বশর্ত ধরা","to presuppose","📌","",""),("beeinflussen","বেআইনফ্লুসেন","প্রভাবিত করা","to influence","🌊","",""),("überwiegend","উবারভিগেন্ট","প্রধানত","predominantly","📊","",""),("hingegen","হিংগেগেন","অন্যদিকে","in contrast","↔️","",""),("dennoch","ডেনোখ","তবুও","nevertheless","🧱➡️","",""),("insofern","ইনজোফের্ন","এই অর্থে/যতদূর","insofar","🔎","",""),("sofern","জোফের্ন","যদি/শর্তসাপেক্ষে","provided that","✅","",""),("einerseits","আইনারজাইট্স","একদিকে","on the one hand","1️⃣","",""),("andererseits","আন্ডারারজাইট্স","অন্যদিকে","on the other hand","2️⃣","",""),("tendenziell","টেনডেনৎসিয়েল","প্রবণতাগতভাবে","tendentially","📈","",""),("vermutlich","ফেরমুটলিশ","সম্ভবত","presumably","🤔","",""),("sinnvoll","জিনফোল","যুক্তিযুক্ত/উপযোগী","sensible","💡","",""),("nachhaltig","নাখহাল্টিশ","টেকসই","sustainable","🌱","",""),("schrittweise","শ্রিটভাইজে","ধাপে ধাপে","step by step","🪜","",""),("umfangreich","উমফাংরাইখ","বিস্তৃত","extensive","📚","","")]
for de,bp,bn,en,e,a,p in B2: v("B2",de,bp,bn,en,e,a,p,pos="noun" if a else "word",cat="Professional/B2")

# Add selected examples and memory cues by word
examples={
"heißen":("Ich heiße Ashraful Islam.","আমার নাম আশরাফুল ইসলাম।"),
"Deutsch":("Ich lerne Deutsch jeden Tag.","আমি প্রতিদিন জার্মান শিখি।"),
"Apfel":("Ashraful isst einen Apfel.","আশরাফুল একটি আপেল খায়।"),
"Büro":("Ashraful arbeitet heute im Büro.","আশরাফুল আজ অফিসে কাজ করে।"),
"Termin":("Ich möchte einen Termin vereinbaren.","আমি একটি অ্যাপয়েন্টমেন্ট ঠিক করতে চাই।"),
"trotzdem":("Es regnet. Trotzdem gehe ich spazieren.","বৃষ্টি হচ্ছে। তবুও আমি হাঁটতে যাই।"),
"Bewerbung":("Ashraful schreibt eine Bewerbung für eine .NET-Stelle.","আশরাফুল একটি .NET পদের জন্য আবেদন লিখছে।"),
"Datenschutz":("Datenschutz ist für unsere Anwendung wichtig.","আমাদের অ্যাপের জন্য ডেটা সুরক্ষা গুরুত্বপূর্ণ।"),
"Anforderung":("Wir müssen die Anforderung zuerst klären.","আমাদের আগে requirement পরিষ্কার করতে হবে।"),
"Schnittstelle":("Die Schnittstelle verbindet zwei Systeme.","ইন্টারফেস দুটি সিস্টেমকে যুক্ত করে।"),
"Fehlerbehebung":("Die Fehlerbehebung muss nachvollziehbar dokumentiert werden.","ত্রুটি সমাধান ট্রেস করা যায় এমনভাবে নথিবদ্ধ করতে হবে।")
}
for item in vocab:
    if item["de"] in examples:
        item["example"],item["exampleBn"]=examples[item["de"]]
    elif item["article"]:
        item["example"]=f"Das Wort ist: {item['article']} {item['de']}."
        item["exampleBn"]=f"শব্দটি article সহ শিখুন: {item['article']} {item['de']}।"
    else:
        item["example"]=f"Heute übe ich das Wort „{item['de']}“."
        item["exampleBn"]=f"আজ আমি „{item['de']}“ শব্দটি অনুশীলন করছি।"

phrases=[]
def p(level,de,bn_pr,bn,en,context="General",register="Neutral",memory=""):
    phrases.append({"id":f"p{len(phrases)+1:03}","level":level,"de":de,"bnPron":bn_pr,"bn":bn,"en":en,"context":context,"register":register,"memory":memory})
# 64 phrases
phrase_rows=[
("FOUNDATION","Wie heißen Sie?","ভি হাইসেন জি?","আপনার নাম কী?","What is your name?","Introduction","Formal"),
("FOUNDATION","Ich heiße Ashraful Islam.","ইশ হাইসে আশরাফুল ইসলাম","আমার নাম আশরাফুল ইসলাম।","My name is Ashraful Islam.","Introduction","Neutral"),
("FOUNDATION","Ich komme aus Bangladesch.","ইশ কোমে আউস বাংলাদেশ","আমি বাংলাদেশ থেকে এসেছি।","I come from Bangladesh.","Introduction","Neutral"),
("FOUNDATION","Ich lerne Deutsch.","ইশ লের্নে ডয়চ","আমি জার্মান শিখছি।","I am learning German.","Learning","Neutral"),
("FOUNDATION","Ich verstehe das nicht.","ইশ ফেয়ারশ্টেহে দাস নিশ্ট","আমি এটা বুঝি না।","I do not understand that.","Survival","Neutral"),
("FOUNDATION","Können Sie das bitte wiederholen?","ক্যোনেন জি দাস বিটে ভিডারহোলেন?","আপনি কি দয়া করে আবার বলতে পারেন?","Could you repeat that, please?","Survival","Formal"),
("A1","Ich möchte einen Kaffee, bitte.","ইশ ম্যোশটে আইনেন কাফে, বিটে","আমি একটি কফি চাই।","I would like a coffee, please.","Restaurant","Polite"),
("A1","Wie viel kostet das?","ভি ফিল কোস্টেট দাস?","এটার দাম কত?","How much does that cost?","Shopping","Neutral"),
("A1","Wo ist der Bahnhof?","ভো ইস্ট ডেয়ার বানহোফ?","স্টেশন কোথায়?","Where is the station?","Travel","Neutral"),
("A1","Ich brauche Hilfe.","ইশ ব্রাউখে হিলফে","আমার সাহায্য দরকার।","I need help.","Survival","Neutral"),
("A1","Ich habe heute keine Zeit.","ইশ হাবে হয়টে কাইনে ৎসাইট","আজ আমার সময় নেই।","I have no time today.","Daily life","Neutral"),
("A1","Wann beginnt der Termin?","ভান বেগিন্ট ডেয়ার টেরমিন?","অ্যাপয়েন্টমেন্ট কখন শুরু হবে?","When does the appointment begin?","Appointments","Neutral"),
("A1","Ich fahre mit dem Bus.","ইশ ফারে মিট ডেম বুস","আমি বাসে যাই।","I go by bus.","Transport","Neutral"),
("A1","Mir geht es nicht gut.","মিয়ার গেট এস নিশ্ট গুট","আমার ভালো লাগছে না।","I do not feel well.","Health","Neutral"),
("A2","Ich würde gerne einen Termin vereinbaren.","ইশ ভ্যুর্দে গের্নে আইনেন টেরমিন ফেয়ারআইনবারেন","আমি একটি অ্যাপয়েন্টমেন্ট ঠিক করতে চাই।","I would like to arrange an appointment.","Appointments","Polite"),
("A2","Könnten Sie mir bitte helfen?","ক্যোন্টেন জি মিয়ার বিটে হেলফেন?","আপনি কি দয়া করে আমাকে সাহায্য করতে পারেন?","Could you please help me?","Requests","Formal"),
("A2","Ich bin zu spät gekommen, weil der Zug Verspätung hatte.","ইশ বিন ৎসু শ্পেট গেকোমেন, ভাইল ডেয়ার ৎসুগ ফেয়ারশ্পেটুং হাটে","ট্রেন দেরি করায় আমি দেরিতে এসেছি।","I arrived late because the train was delayed.","Travel","Neutral"),
("A2","Ich interessiere mich für Softwareentwicklung.","ইশ ইন্টারেসিরে মিশ ফ্যুর সফটভেয়ারএন্টভিকলুং","আমি সফটওয়্যার ডেভেলপমেন্টে আগ্রহী।","I am interested in software development.","Work","Neutral"),
("A2","Wenn ich Zeit habe, übe ich Deutsch.","ভেন ইশ ৎসাইট হাবে, ইউবে ইশ ডয়চ","সময় পেলে আমি জার্মান অনুশীলন করি।","When I have time, I practise German.","Learning","Neutral"),
("A2","Obwohl es schwierig ist, mache ich weiter.","অবভোল এস শভিয়ারিশ ইস্ট, মাখে ইশ ভাইটার","কঠিন হলেও আমি চালিয়ে যাই।","Although it is difficult, I continue.","Motivation","Neutral"),
("B1","Meiner Meinung nach ist diese Lösung sinnvoll.","মাইনার মাইনুং নাখ ইস্ট ডিজে ল্যোজুং জিনফোল","আমার মতে এই সমাধানটি যুক্তিযুক্ত।","In my opinion, this solution is sensible.","Opinion","Neutral"),
("B1","Einer der wichtigsten Vorteile ist die Zeitersparnis.","আইনার ডেয়ার ভিশ্টিশস্টেন ফোরটাইল ইস্ট ডি ৎসাইটএরশ্পারনিস","সবচেয়ে গুরুত্বপূর্ণ সুবিধাগুলোর একটি হলো সময় সাশ্রয়।","One of the most important advantages is saving time.","Argument","Formal"),
("B1","Ich möchte mich für die Stelle bewerben.","ইশ ম্যোশটে মিশ ফ্যুর ডি শ্টেলে বেভেরবেন","আমি পদটির জন্য আবেদন করতে চাই।","I would like to apply for the position.","Job","Formal"),
("B1","Könnten Sie mir weitere Informationen zusenden?","ক্যোন্টেন জি মিয়ার ভাইটারে ইনফর্মাৎসিওনেন ৎসুজেন্ডেন?","আপনি কি আমাকে আরও তথ্য পাঠাতে পারেন?","Could you send me further information?","Email","Formal"),
("B1","Vielen Dank für Ihre Rückmeldung.","ফিলেন ডাঙ্ক ফ্যুর ইরে রুকমেল্ডুং","আপনার প্রতিক্রিয়ার জন্য অনেক ধন্যবাদ।","Thank you very much for your feedback.","Email","Formal"),
("B1","Das Problem wurde gestern behoben.","দাস প্রোব্লেম ভুর্দে গেস্টার্ন বেহোবেন","সমস্যাটি গতকাল সমাধান করা হয়েছে।","The problem was fixed yesterday.","Work","Neutral"),
("B1","Wir sollten zuerst die Ursache analysieren.","ভিয়ার শোল্টেন ৎসুয়ের্স্ট ডি উরজাখে আনালিজিরেন","আমাদের আগে কারণ বিশ্লেষণ করা উচিত।","We should analyse the cause first.","Problem solving","Professional"),
("B1","Ich stimme Ihnen teilweise zu.","ইশ শ্টিমে ইনেন টাইলভাইজে ৎসু","আমি আপনার সাথে আংশিকভাবে একমত।","I partly agree with you.","Discussion","Formal"),
("B2","Meines Erachtens sollten wir schrittweise vorgehen.","মাইনেস এরআখ্টেন্স শোল্টেন ভিয়ার শ্রিটভাইজে ফোরগেহেন","আমার বিবেচনায় আমাদের ধাপে ধাপে এগোনো উচিত।","In my view, we should proceed step by step.","Discussion","Professional"),
("B2","Einerseits spart die Automatisierung Zeit, andererseits entstehen neue Risiken.","আইনারজাইট্স শ্পার্ট ডি আউটোমাটিজিরুং ৎসাইট, আন্ডারারজাইট্স এন্টশ্টেহেন নয়য়ে রিজিকেন","একদিকে অটোমেশন সময় বাঁচায়, অন্যদিকে নতুন ঝুঁকি তৈরি হয়।","On the one hand automation saves time; on the other hand new risks arise.","Argument","Professional"),
("B2","Die Entscheidung sollte auf nachvollziehbaren Daten beruhen.","ডি এন্টশাইডুং শোল্টে আউফ নাখফোলৎসিব্যারেন ডাটেন বেরুহেন","সিদ্ধান্তটি যাচাইযোগ্য ডেটার ওপর ভিত্তি করা উচিত।","The decision should be based on traceable data.","Work","Professional"),
("B2","Könnten Sie bitte erläutern, welche Anforderungen Priorität haben?","ক্যোন্টেন জি বিটে এরলয়টার্ন, ভেলখে আনফোর্ডেরুংগেন প্রিওরিটেট হাবেন?","কোন requirements অগ্রাধিকার পাবে তা কি ব্যাখ্যা করবেন?","Could you explain which requirements have priority?","Meeting","Professional"),
("B2","Wir haben die Ursache identifiziert und eine nachhaltige Lösung umgesetzt.","ভিয়ার হাবেন ডি উরজাখে আইডেন্টিফিৎসিয়ার্ট উন্ট আইনে নাখহাল্টিগে ল্যোজুং উমগেজেট্স্ট","আমরা মূল কারণ শনাক্ত করে টেকসই সমাধান বাস্তবায়ন করেছি।","We identified the root cause and implemented a sustainable solution.","Incident","Professional"),
("B2","Aus Sicherheitsgründen müssen alle Zugriffe protokolliert werden.","আউস জিশারহাইট্সগ্রুন্ডেন মুসেন আলে ৎসুগ্রিফে প্রোটোকোলিয়ার্ট ভের্ডেন","নিরাপত্তার কারণে সব access log করতে হবে।","For security reasons, all access must be logged.","IT","Professional"),
("B2","Die Schnittstelle muss rückwärtskompatibel bleiben.","ডি শ্নিটশ্টেলে মুস রুকভেয়ার্ট্সকমপাটিবেল ব্লাইবেন","ইন্টারফেসটি backward compatible থাকতে হবে।","The interface must remain backward compatible.","IT","Professional"),
("B2","Falls erforderlich, können wir die Einführung in zwei Phasen aufteilen.","ফাল্স এরফোর্ডারলিশ, ক্যোনেন ভিয়ার ডি আইনফ্যুরুং ইন ৎসভাই ফাজেন আউফটাইলেন","প্রয়োজনে আমরা rollout দুই ধাপে ভাগ করতে পারি।","If necessary, we can split the rollout into two phases.","Planning","Professional"),
("B2","Ich würde zunächst die Datenintegrität und anschließend die Performance prüfen.","ইশ ভ্যুর্দে ৎসুনেখস্ট ডি ডাটেনইন্টেগ্রিটেট উন্ট আনশলিসেন্ড ডি পারফর্মান্স প্রুফেন","আমি প্রথমে data integrity এবং পরে performance পরীক্ষা করব।","I would first check data integrity and then performance.","IT Interview","Professional")]
for row in phrase_rows: p(*row)

# Pronunciation curriculum. Bengali hints are approximations; German audio and articulatory instructions take priority.
pronunciation_drills=[
 {"id":"pr01","group":"Vowels","symbol":"/iː/ vs /ɪ/","title":"Long i vs short i","examples":["bieten","bitten","Miete","Mitte"],"bn":"দীর্ঘ ই বনাম ছোট ই","mouth":"Long /iː/: lips lightly spread, tongue high/front; hold longer. Short /ɪ/: relax and shorten.","trap":"Bangla ই দিয়ে দুটোকেই একই দৈর্ঘ্যে বলবেন না।"},
 {"id":"pr02","group":"Vowels","symbol":"/uː/ vs /ʊ/","title":"Long u vs short u","examples":["Schule","Schuld","gut","Mutter"],"bn":"দীর্ঘ উ বনাম ছোট উ","mouth":"Round the lips. Long /uː/ is tighter and longer; /ʊ/ is shorter and more relaxed.","trap":"শব্দের spelling দেখে vowel length অনুমান না করে audio শুনুন।"},
 {"id":"pr03","group":"Umlauts","symbol":"/yː, ʏ/","title":"Ü","examples":["Tür","fünf","müde","zurück"],"bn":"ই বলার tongue + উ বলার rounded lips","mouth":"Say German /i/ while rounding the lips without pulling the tongue back.","trap":"উ/ই-তে collapse করলে native contrast হারায়।"},
 {"id":"pr04","group":"Umlauts","symbol":"/øː, œ/","title":"Ö","examples":["schön","möchte","können","zwölf"],"bn":"এ/ও মাঝামাঝি rounded sound","mouth":"Front tongue position with rounded lips; do not turn it into plain o.","trap":"schön কে ‘শোন’ বললে ভুল contrast তৈরি হয়।"},
 {"id":"pr05","group":"Diphthongs","symbol":"/aɪ̯/","title":"ei / ai","examples":["mein","nein","Mai","Arbeit"],"bn":"আই-এর কাছাকাছি","mouth":"Start open and glide toward a high front vowel in one syllable.","trap":"দুই syllable করবেন না।"},
 {"id":"pr06","group":"Diphthongs","symbol":"/ɔʏ̯/","title":"eu / äu","examples":["heute","Leute","Häuser","Deutsch"],"bn":"অয়/ওই-এর কাছাকাছি","mouth":"Start rounded/open, glide forward; keep it one syllable.","trap":"‘ইউ’ হিসেবে পড়বেন না।"},
 {"id":"pr07","group":"Diphthongs","symbol":"/aʊ̯/","title":"au","examples":["Haus","Auto","auch","brauchen"],"bn":"আও-এর কাছাকাছি","mouth":"Open a → rounded u glide in a single syllable.","trap":"English-style flat ‘aw’ নয়।"},
 {"id":"pr08","group":"Consonants","symbol":"/ç/","title":"ich-Laut","examples":["ich","mich","nicht","Milch"],"bn":"নরম হ্‌য/খ-এর মাঝামাঝি; বাংলা exact sound নেই","mouth":"Raise the middle/front of the tongue near the hard palate; friction is light, no hard k contact.","trap":"ইখ/ইশ বলবেন না।"},
 {"id":"pr09","group":"Consonants","symbol":"/x/","title":"ach-Laut","examples":["Bach","machen","Buch","auch"],"bn":"গলার পেছনের খ-এর কাছাকাছি","mouth":"Back of tongue approaches the soft palate; friction, not a full stop.","trap":"English k বা Bangla ক বানাবেন না।"},
 {"id":"pr10","group":"Consonants","symbol":"/ʃ/","title":"sch","examples":["Schule","schön","Fisch","sprechen"],"bn":"শ-এর কাছাকাছি","mouth":"Lips slightly rounded, tongue blade raised; steady friction.","trap":"s হিসেবে পড়বেন না।"},
 {"id":"pr11","group":"Consonants","symbol":"/ʃp, ʃt/","title":"Initial sp / st","examples":["sprechen","Sport","Straße","stehen"],"bn":"শ্প / শ্ট (শব্দের শুরুতে)","mouth":"At the beginning of a native German word, sp/st usually start with /ʃ/.","trap":"সব position-এ mechanically শ্প/শ্ট করবেন না।"},
 {"id":"pr12","group":"Consonants","symbol":"/ts/","title":"z","examples":["Zeit","zehn","Zug","bezahlen"],"bn":"ৎস","mouth":"Release t directly into s without adding a vowel between them.","trap":"জ বা জ় নয়।"},
 {"id":"pr13","group":"Consonants","symbol":"/pf/","title":"pf cluster","examples":["Apfel","Pferd","Kopf","Pflicht"],"bn":"প্‌ফ","mouth":"Close for p and immediately release into f; keep it compact.","trap":"পিফ বা ফ আলাদা syllable করবেন না।"},
 {"id":"pr14","group":"Consonants","symbol":"/ʁ, ɐ/","title":"German r","examples":["rot","Reise","Arbeit","besser"],"bn":"standard German-এ r-এর একাধিক acceptable realization আছে","mouth":"Use a natural German r available in your voice model; final -er often reduces toward /ɐ/.","trap":"একটি মাত্র r-কে ‘official’ ধরে অতিরিক্ত force করবেন না।"},
 {"id":"pr15","group":"Consonants","symbol":"final devoicing","title":"b/d/g at word end","examples":["Tag","Hund","lieb","Weg"],"bn":"শেষে গ/দ/ব অনেক সময় ক/ত/প-এর মতো শোনা যায়","mouth":"German neutralises final voiced obstruents: spelling stays b/d/g, sound is voiceless.","trap":"Tag-কে English ‘tag’ এর voiced g দিয়ে শেষ করবেন না।"},
 {"id":"pr16","group":"Rhythm","symbol":"stress","title":"Word stress","examples":["Arbeit","lernen","Softwareentwicklung","Bahnhof"],"bn":"জোরের syllable পরিষ্কার, বাকিগুলো compact","mouth":"Do not give every syllable equal Bangla-style weight; copy the model stress.","trap":"সব syllable সমান লম্বা করলে German rhythm বদলে যায়।"},
 {"id":"pr17","group":"Rhythm","symbol":"sentence stress","title":"Sentence focus","examples":["ICH lerne Deutsch.","Ich lerne DEUTSCH.","Heute arbeite ich ZU HAUSE."],"bn":"নতুন/গুরুত্বপূর্ণ তথ্য বেশি stress পায়","mouth":"Keep function words lighter and place nuclear stress on the intended focus.","trap":"প্রতিটি word-কে একই জোর দেবেন না।"},
 {"id":"pr18","group":"Listening","symbol":"minimal pairs","title":"Hear before speaking","examples":["bieten / bitten","Ofen / offen","schon / schön","Staat / Stadt"],"bn":"আগে পার্থক্য শুনুন, পরে imitate করুন","mouth":"Alternate AB–AB, then randomise and identify before repeating.","trap":"শুনতে না পেলে দ্রুত বলার practice করবেন না।"}
]

shadowing_sets=[
 {"level":"FOUNDATION","title":"Greeting","text":"Guten Tag. Ich heiße Ashraful Islam. Ich lerne Deutsch.","bn":"শুভ দিন। আমার নাম Ashraful Islam। আমি জার্মান শিখছি।"},
 {"level":"FOUNDATION","title":"Clarification","text":"Entschuldigung, können Sie das bitte langsam wiederholen?","bn":"মাফ করবেন, আপনি কি দয়া করে এটা ধীরে আবার বলতে পারেন?"},
 {"level":"A1","title":"Daily life","text":"Heute fahre ich mit dem Bus zur Arbeit und kaufe danach ein.","bn":"আজ আমি বাসে কাজে যাই এবং পরে কেনাকাটা করি।"},
 {"level":"A2","title":"Reason","text":"Ich komme etwas später, weil mein Zug Verspätung hat.","bn":"আমার ট্রেন দেরি করছে বলে আমি একটু পরে আসছি।"},
 {"level":"B1","title":"Opinion","text":"Meiner Meinung nach ist regelmäßiges Üben wichtiger als sehr lange Lerneinheiten.","bn":"আমার মতে খুব দীর্ঘ সেশনের চেয়ে নিয়মিত অনুশীলন বেশি গুরুত্বপূর্ণ।"},
 {"level":"B2","title":"Professional","text":"Ich verstehe den Ansatz, sehe allerdings ein Risiko bei der Datenkonsistenz und würde deshalb eine zusätzliche Validierung vorschlagen.","bn":"আমি পদ্ধতিটি বুঝি, তবে data consistency-তে ঝুঁকি দেখি এবং তাই অতিরিক্ত validation প্রস্তাব করব।"}
]

germany_life_topics=[
 {"title":"Anmeldung","level":"A2","icon":"🏠","de":"Ich möchte meinen Wohnsitz anmelden.","bn":"আমি আমার বাসার ঠিকানা নিবন্ধন করতে চাই।","note":"Language practice only; actual administrative rules can change and should be checked from current official sources."},
 {"title":"Bürgeramt","level":"A2","icon":"🏛️","de":"Ich habe einen Termin beim Bürgeramt.","bn":"আমার Bürgeramt-এ একটি appointment আছে।","note":"Practise appointment, documents and clarification language."},
 {"title":"Wohnung & Mietvertrag","level":"A2","icon":"🔑","de":"Wie hoch ist die Kaution und welche Nebenkosten sind enthalten?","bn":"ডিপোজিট কত এবং কোন অতিরিক্ত খরচ অন্তর্ভুক্ত?","note":"Vocabulary: Miete, Kaution, Nebenkosten, Übergabeprotokoll."},
 {"title":"Krankenkasse & Arzt","level":"A2","icon":"🩺","de":"Ich bin versichert und möchte einen Termin vereinbaren.","bn":"আমি insured এবং একটি appointment করতে চাই।","note":"Practise symptoms, insurance card and appointment language."},
 {"title":"Bank & Payment","level":"A2","icon":"🏦","de":"Ich möchte ein Konto eröffnen und meine Adresse aktualisieren.","bn":"আমি একটি account খুলতে এবং ঠিকানা update করতে চাই।","note":"Practise IBAN, Überweisung, Karte, Kontoauszug."},
 {"title":"Deutsche Bahn & Transport","level":"A2","icon":"🚆","de":"Mein Zug hat Verspätung. Welche Verbindung kann ich jetzt nehmen?","bn":"আমার ট্রেন দেরি করেছে। এখন কোন connection নিতে পারি?","note":"Practise platform, transfer, delay and ticket language."},
 {"title":"Ausländerbehörde vocabulary","level":"B1","icon":"📄","de":"Welche Unterlagen muss ich zu meinem Termin mitbringen?","bn":"আমার appointment-এ কোন documents আনতে হবে?","note":"Language module only; never treat static lesson text as current immigration/legal advice."},
 {"title":"Workplace small talk","level":"B1","icon":"☕","de":"Wie war Ihr Wochenende? Haben Sie etwas Schönes unternommen?","bn":"আপনার weekend কেমন ছিল? ভালো কিছু করেছিলেন?","note":"Short, polite and context-appropriate workplace conversation."}
]

exam_profiles={
 "A1":{"skills":["Hören","Lesen","Schreiben","Sprechen"],"focus":"very short everyday messages, basic personal information and simple interaction"},
 "A2":{"skills":["Hören","Lesen","Schreiben","Sprechen"],"focus":"everyday notices, messages, routine situations and simple joint planning"},
 "B1":{"skills":["Lesen","Hören","Schreiben","Sprechen"],"focus":"independent communication, formal/personal writing, opinions and paired speaking"},
 "B2":{"skills":["Lesen","Hören","Schreiben","Sprechen"],"focus":"complex texts, structured writing, short presentation and discussion"}
}

# Generic memory guidance
memory_rules=[
 {"title":"Chunk, not sentence","text":"পুরো sentence মুখস্থ না করে reusable chunk শিখুন: ‘Ich würde gerne…’, ‘Meiner Meinung nach…’."},
 {"title":"Picture → word","text":"Concrete noun-এ আগে visual দেখুন, তারপর article + noun বলুন। Article-সহ recall করুন।"},
 {"title":"Listen → shadow","text":"Audio ১বার শুনুন, ২বার text দেখে repeat করুন, ১বার text ছাড়া shadow করুন।"},
 {"title":"Active recall","text":"উত্তর দেখার আগে অন্তত 3–5 সেকেন্ড নিজে মনে করার চেষ্টা করুন।"},
 {"title":"Small daily review","text":"নতুন 20টা না শিখে, weak 10টা + new 5টা অনেক বেশি কার্যকর।"},
 {"title":"Mistake notebook","text":"একই ভুল ২বার হলে My Mistakes-এ রাখুন এবং 3টি correct example বানান।"},
]

professional_topics=[
 {"title":"Introduce yourself professionally","level":"B1","prompt":"Stellen Sie sich bitte kurz vor.","model":"Guten Tag. Ich heiße Ashraful Islam. Ich arbeite im Bereich Softwareentwicklung und beschäftige mich vor allem mit .NET, APIs und Datenbanken.","tip":"Name → role → core skills → current focus. 30–45 seconds."},
 {"title":"Explain experience","level":"B1","prompt":"Welche Berufserfahrung haben Sie?","model":"Ich habe praktische Erfahrung in der Entwicklung und Wartung von Geschäftsanwendungen. Dabei lege ich besonderen Wert auf Datenintegrität, Sicherheit und wartbaren Code.","tip":"Years না জানলে invent করবেন না; domain + responsibility + quality focus বলুন।"},
 {"title":"Clarify a requirement","level":"B2","prompt":"Wie klären Sie unklare Anforderungen?","model":"Zunächst fasse ich die Anforderung in eigenen Worten zusammen. Danach kläre ich Geschäftsregeln, Randfälle, Berechtigungen und Erfolgskriterien, bevor die Umsetzung beginnt.","tip":"Professional answer = process + risk control + outcome."},
 {"title":"Production incident","level":"B2","prompt":"Wie gehen Sie mit einem Produktionsfehler um?","model":"Ich sichere zuerst den Betrieb und begrenze die Auswirkungen. Anschließend analysiere ich Logs und Daten, behebe die Ursache kontrolliert und dokumentiere die Korrektur sowie vorbeugende Maßnahmen.","tip":"Stabilise → diagnose → fix → verify → prevent."},
 {"title":"Database integrity","level":"B2","prompt":"Warum ist Datenintegrität wichtig?","model":"Datenintegrität stellt sicher, dass Geschäftsregeln auch bei Fehlern, parallelen Zugriffen und Wiederholungen eingehalten werden. Kritische Regeln sollten deshalb server- und datenbankseitig abgesichert sein.","tip":"Use terms: Geschäftsregel, Transaktion, paralleler Zugriff, Wiederholung."},
 {"title":"Meeting status update","level":"B2","prompt":"Geben Sie ein kurzes Status-Update.","model":"Die Kernfunktion ist umgesetzt und getestet. Offen sind noch zwei Randfälle in der Berechtigungsprüfung. Ich kläre sie heute und plane danach den finalen Regressionstest.","tip":"Done → open → next → risk/date."},
 {"title":"Disagree professionally","level":"B2","prompt":"Wie widersprechen Sie höflich?","model":"Ich verstehe den Ansatz. Ich sehe allerdings ein Risiko bei der Datenkonsistenz. Daher würde ich vorschlagen, die Validierung serverseitig abzusichern.","tip":"Acknowledge → concern → reason → alternative."},
 {"title":"Ask for clarification","level":"B2","prompt":"Bitten Sie um eine Präzisierung.","model":"Könnten Sie bitte präzisieren, ob diese Regel für alle Mandanten gilt oder nur für bestimmte Unternehmen?","tip":"präzisieren / erläutern / konkretisieren are useful B2 verbs."},
]

# rule-based corrector patterns
corrector=[
 {"pattern":"weil ich bin","message":"weil-clause-এ finite verb শেষে যায়.","example":"weil ich müde bin"},
 {"pattern":"mit den Bus","message":"mit সবসময় Dativ নেয়; masculine der Bus → dem Bus.","example":"mit dem Bus"},
 {"pattern":"für dem","message":"für সাধারণত Akkusativ নেয়.","example":"für den Kunden / für das Projekt"},
 {"pattern":"ich habe gefahren","message":"fahren (movement) Perfekt-এ সাধারণত sein নেয়.","example":"ich bin gefahren"},
 {"pattern":"ich bin gearbeitet","message":"arbeiten Perfekt-এ haben নেয়.","example":"ich habe gearbeitet"},
 {"pattern":"obwohl es regnet, trotzdem","message":"একই simple structure-এ obwohl এবং trotzdem দুটো একসাথে না দিলেও চলে; একটি construction বেছে নিন.","example":"Obwohl es regnet, gehe ich spazieren. / Es regnet. Trotzdem gehe ich spazieren."},
]

# Mock exams. Audio text uses browser TTS.
mock_exams=[
 {"id":"A1-MOCK","level":"A1","title":"A1 Full Practice Mock","minutes":35,"note":"Original LernDE practice — official Goethe/telc paper নয়।","questions":[
  {"skill":"Reading","q":"Schild: ‘Heute geschlossen.’ Was bedeutet das?","options":["আজ খোলা","আজ বন্ধ","আজ সস্তা","আজ দেরি"],"answer":1},
  {"skill":"Grammar","q":"Ich ___ Ashraful Islam.","options":["heiße","heißt","heißen","bist"],"answer":0},
  {"skill":"Grammar","q":"Ich kaufe ___ Kaffee.","options":["ein","einen","einem","einer"],"answer":1},
  {"skill":"Vocabulary","q":"‘der Bahnhof’ মানে কী?","options":["হাসপাতাল","রেলস্টেশন","বাজার","অফিস"],"answer":1},
  {"skill":"Listening","audio":"Der Termin ist um neun Uhr.","q":"Wann ist der Termin?","options":["7 Uhr","8 Uhr","9 Uhr","10 Uhr"],"answer":2},
  {"skill":"Reading","q":"‘Bitte warten Sie hier.’ কী করতে বলা হচ্ছে?","options":["এখানে অপেক্ষা করুন","এখানে বসবেন না","দরজা বন্ধ করুন","টিকিট কিনুন"],"answer":0},
  {"skill":"Grammar","q":"___ du morgen?","options":["Kommst","Kommen","Kommt","Komme"],"answer":0},
  {"skill":"Vocabulary","q":"‘die Apotheke’ কোথায় যাবেন?","options":["ওষুধ কিনতে","ট্রেন ধরতে","বই কিনতে","কাপড় কিনতে"],"answer":0}
 ]},
 {"id":"A2-MOCK","level":"A2","title":"A2 Full Practice Mock","minutes":45,"note":"Original LernDE practice — official exam paper নয়।","questions":[
  {"skill":"Grammar","q":"Ich bleibe zu Hause, weil ich krank ___.","options":["bin","bist","ist","sein"],"answer":0},
  {"skill":"Grammar","q":"Ich fahre ___ dem Bus.","options":["für","mit","durch","gegen"],"answer":1},
  {"skill":"Grammar","q":"Gestern ___ ich nach Berlin gefahren.","options":["habe","bin","war","werde"],"answer":1},
  {"skill":"Vocabulary","q":"‘Verspätung’ মানে কী?","options":["বুকিং","বিলম্ব","ছুটি","নির্দেশনা"],"answer":1},
  {"skill":"Listening","audio":"Der Zug kommt heute zwanzig Minuten später.","q":"Was ist passiert?","options":["Der Zug ist früher.","Der Zug hat Verspätung.","Der Zug fällt immer aus.","Der Zug ist kostenlos."],"answer":1},
  {"skill":"Grammar","q":"___ ich Zeit habe, übe ich Deutsch.","options":["Dass","Wenn","Denn","Oder"],"answer":1},
  {"skill":"Reading","q":"E-Mail: ‘Könnten wir den Termin auf Freitag verschieben?’ Was möchte die Person?","options":["Termin absagen","Termin verschieben","neuen Job","Preis reduzieren"],"answer":1},
  {"skill":"Grammar","q":"Könnten Sie mir bitte ___?","options":["helfen","hilft","geholfen","half"],"answer":0}
 ]},
 {"id":"B1-MOCK","level":"B1","title":"B1 Full Practice Mock","minutes":55,"note":"Original CEFR-aligned practice; not an official exam paper.","questions":[
  {"skill":"Grammar","q":"Das Problem ___ gestern behoben.","options":["wird","wurde","ist werden","hat"],"answer":1},
  {"skill":"Grammar","q":"Ich lerne Deutsch, ___ in Deutschland zu arbeiten.","options":["damit","um","obwohl","denn"],"answer":1},
  {"skill":"Reading","q":"‘Die Bewerbungsfrist endet am 15. Oktober.’ Was ist wichtig?","options":["Bewerbung danach schicken","spätestens bis 15. Oktober bewerben","Interview ist am 15.","Stelle beginnt am 15."],"answer":1},
  {"skill":"Vocabulary","q":"‘Vorteil’ ist das Gegenteil von …","options":["Nachteil","Grund","Zukunft","Fortschritt"],"answer":0},
  {"skill":"Listening","audio":"Wir müssen die Ursache zuerst analysieren, bevor wir eine dauerhafte Lösung umsetzen.","q":"Was kommt zuerst?","options":["Lösung deployen","Ursache analysieren","Meeting absagen","Dokument löschen"],"answer":1},
  {"skill":"Grammar","q":"Das ist der Kollege, ___ mir geholfen hat.","options":["den","dem","der","dessen"],"answer":2},
  {"skill":"Discussion","q":"Welche Formulierung klingt sachlich?","options":["Das ist total falsch!","Ich sehe das anders, weil …","Du verstehst gar nichts.","Niemals!"],"answer":1},
  {"skill":"Email","q":"Welche Anrede ist formell?","options":["Hey Leute","Hallo Bruder","Sehr geehrte Damen und Herren","Na?"],"answer":2}
 ]},
 {"id":"B2-MOCK","level":"B2","title":"B2 Full Practice Mock","minutes":70,"note":"Original LernDE B2 practice. Format trains B2 skills but does not copy official papers.","questions":[
  {"skill":"Grammar","q":"Je mehr wir automatisieren, ___ wichtiger wird Monitoring.","options":["denn","desto","obwohl","damit"],"answer":1},
  {"skill":"Vocabulary","q":"‘Voraussetzung’ bedeutet am besten …","options":["Folge","Vorbemerkung","Bedingung, die vorher erfüllt sein muss","Fehler"],"answer":2},
  {"skill":"Reading","q":"‘Die Einführung erfolgt schrittweise, sofern die Testphase keine kritischen Fehler zeigt.’ Wann geht es weiter?","options":["Immer sofort","Nur wenn keine kritischen Fehler auftreten","Nur bei höherem Budget","Nie"],"answer":1},
  {"skill":"Grammar","q":"Der Bericht muss heute fertiggestellt ___.","options":["sein","werden","haben","worden"],"answer":1},
  {"skill":"Listening","audio":"Einerseits reduziert die neue Lösung den manuellen Aufwand, andererseits erhöht sie die Abhängigkeit von einer externen Schnittstelle.","q":"Welche Aussage trifft zu?","options":["Nur Vorteile werden genannt.","Nur Nachteile werden genannt.","Vorteil und Risiko werden gegenübergestellt.","Die Lösung wird abgelehnt."],"answer":2},
  {"skill":"Grammar","q":"Er sagte, das Projekt ___ abgeschlossen.","options":["sei","ist","war immer","sein"],"answer":0},
  {"skill":"Register","q":"Welche Formulierung ist professionell vorsichtig?","options":["Das ist garantiert perfekt.","Meines Erachtens wäre dieser Ansatz sinnvoll.","Das muss jeder wissen.","Auf keinen Fall diskutieren."],"answer":1},
  {"skill":"IT","q":"‘rückwärtskompatibel’ bedeutet …","options":["nur offline nutzbar","mit bisherigen Nutzern/Schnittstellen weiter kompatibel","schneller als vorher","nicht dokumentiert"],"answer":1},
  {"skill":"Argument","q":"Welche Struktur ist am stärksten?","options":["Meinung → Beleidigung","Behauptung → Grund → Beispiel/Evidenz → Schluss","Nur Beispiele","Nur Schluss"],"answer":1},
  {"skill":"Grammar","q":"Wir sparen Zeit, ___ wir Prozesse automatisieren.","options":["indem","trotzdem","sondern","weder"],"answer":0}
 ]},
 {"id":"B2-PRO","level":"B2","title":"B2 Professional / Workplace Mock","minutes":60,"note":"Original workplace-style mock. It is not an official telc DTB/B2 Beruf exam.","questions":[
  {"skill":"Meeting","q":"Welche Frage klärt Priorität professionell?","options":["Was ist denn jetzt?","Könnten Sie präzisieren, welche Anforderungen Priorität haben?","Mach einfach alles.","Warum ist das so schlecht?"],"answer":1},
  {"skill":"Incident","q":"Was sollte bei einem Produktionsfehler typischerweise zuerst passieren?","options":["Logs löschen","Auswirkungen begrenzen und Betrieb stabilisieren","Schuldigen suchen","Daten manuell ändern"],"answer":1},
  {"skill":"Email","q":"Welche Formulierung passt zu einer Frist?","options":["Vielleicht irgendwann.","Bitte senden Sie uns die Rückmeldung bis spätestens Freitag.","Sofort!!!","Keine Ahnung."],"answer":1},
  {"skill":"IT","q":"Warum sollte eine Schnittstelle rückwärtskompatibel bleiben?","options":["Damit bestehende Verbraucher nicht unnötig brechen","Damit sie langsamer wird","Damit keine Tests nötig sind","Damit Daten doppelt gespeichert werden"],"answer":0},
  {"skill":"Listening","audio":"Die Kernfunktion ist fertig. Offen sind zwei Randfälle in der Berechtigungsprüfung. Danach folgt der Regressionstest.","q":"Was ist noch offen?","options":["Komplette Kernfunktion","Zwei Berechtigungs-Randfälle","Datenbankinstallation","Vertrag"],"answer":1},
  {"skill":"Discussion","q":"Welche Antwort widerspricht höflich und konstruktiv?","options":["Das ist Unsinn.","Ich verstehe den Ansatz, sehe aber ein Risiko bei der Datenkonsistenz. Ich würde daher …","Nein.","Machen Sie, was Sie wollen."],"answer":1},
  {"skill":"Security","q":"Welche Aussage passt zu Auditierbarkeit?","options":["Änderungen sollten nachvollziehbar protokolliert werden.","Logs sollten vermieden werden.","Jeder darf alles ändern.","Fehler werden versteckt."],"answer":0},
  {"skill":"Writing","q":"Welche Struktur ist für ein Status-Update am klarsten?","options":["Done → offen → nächster Schritt → Risiko/Termin","Lange Geschichte ohne Ergebnis","Nur Begrüßung","Nur Problem"],"answer":0}
 ]}
]

translator_phrases={x["bn"]:x["de"] for x in phrases}
translator_phrases.update({x["en"]:x["de"] for x in phrases})

DATA={
 "meta":{"name":"LernDE","tagline":"German Learning Platform — Foundation to B2","version":"4.0.0","updated":"2026-10-04","learner":"Self-learner first","pronunciationNotice":"Bangla pronunciation is a learning approximation. German audio and standard pronunciation are authoritative."},
 "levels":levels,"lessons":lessons,"grammar":grammar,"vocabulary":vocab,"phrases":phrases,"memoryRules":memory_rules,
 "professionalTopics":professional_topics,"germanyLifeTopics":germany_life_topics,"pronunciationDrills":pronunciation_drills,"shadowingSets":shadowing_sets,"examProfiles":exam_profiles,"corrector":corrector,"mockExams":mock_exams,"translatorPhrases":translator_phrases
}
# Write versionable browser data packs instead of one monolithic bundle.
parts={
 "data-core.js": {k:DATA[k] for k in ["meta","levels","memoryRules"]},
 "data-lessons.js": {"lessons":DATA["lessons"]},
 "data-vocabulary.js": {"vocabulary":DATA["vocabulary"]},
 "data-grammar.js": {"grammar":DATA["grammar"]},
 "data-phrases.js": {"phrases":DATA["phrases"]},
 "data-pronunciation.js": {k:DATA[k] for k in ["pronunciationDrills","shadowingSets"]},
 "data-professional.js": {k:DATA[k] for k in ["professionalTopics","germanyLifeTopics","corrector"]},
 "data-exams.js": {k:DATA[k] for k in ["examProfiles","mockExams","translatorPhrases"]},
}
for filename,payload in parts.items():
    prefix="window.LERNDE_DATA = " if filename=="data-core.js" else "Object.assign(window.LERNDE_DATA, "
    suffix=";\n" if filename=="data-core.js" else ");\n"
    (ROOT/"assets/js"/filename).write_text(prefix+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+suffix,encoding="utf-8")

# Prevent stale monolithic output from becoming a second source of truth.
legacy=ROOT/"assets/js/data.js"
if legacy.exists():
    legacy.unlink()

manifest={
 "levels":len(levels),"lessons":len(lessons),"grammarTopics":len(grammar),"vocabularyEntries":len(vocab),"phraseEntries":len(phrases),"mockExams":len(mock_exams),"professionalTopics":len(professional_topics),"pronunciationDrills":len(pronunciation_drills),"germanyLifeTopics":len(germany_life_topics),"generated":"2026-10-04"
}
(ROOT/"assets/data/content-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print(manifest)
