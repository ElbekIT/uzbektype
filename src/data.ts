import { Achievement, BlogArticle, TestResult } from './types';

export const UZ_WORDS = [
  "men", "sen", "u", "biz", "siz", "ular", "yozish", "tezlik", "kompyuter", "klaviatura", 
  "bajarish", "o‘quvchi", "maktab", "dastur", "kod", "vatan", "oila", "inson", "hayot", 
  "kitob", "bilim", "yoshlar", "kelajak", "ishonch", "muvaffaqiyat", "maqsad", "harakat", 
  "natija", "do‘st", "mehnat", "yulduz", "quyosh", "oy", "osmon", "er", "suv", "havo", 
  "olov", "daraxt", "gul", "shahar", "qishloq", "toshkent", "samarqand", "buxoro", "xorazm", 
  "andijon", "farg‘ona", "namangan", "jizzax", "sirdaryo", "navoiy", "surxondaryo", "qashqadaryo", 
  "qoraqalpog‘iston", "til", "adabiyot", "tarix", "g‘alaba", "mustaqillik", "tinchlik", 
  "hamkorlik", "rivojlanish", "yuksalish", "tashabbus", "orzu", "baxt", "sog‘liq", "boylik", 
  "tadbirkor", "ijtimoiy", "iqtisodiy", "madaniyat", "sport", "sog‘lom", "barkamol", "avlod", 
  "shifokor", "ustoz", "muallim", "muhandis", "dasturchi", "olim", "ijodkor", "shoir", 
  "yozuvchi", "tarjimon", "san’at", "musiqa", "teatr", "kino", "milliy", "qadriyat", 
  "an’ana", "meros", "asr", "yillar", "kun", "tun", "tong", "oqshom", "bahor", "yoz", 
  "kuz", "qish", "yomg‘ir", "qor", "shamol", "bulut", "daryo", "ko‘l", "dengiz", "tog‘", 
  "vodiy", "sahro", "o‘rmon", "bog‘", "hosil", "bug‘doy", "paxta", "non", "osh", "somsa", 
  "shirinlik", "choy", "suhbat", "rahmat", "iltimos", "salom", "omonlik", "yangi", "faol",
  "ezgulik", "adolat", "haqiqat", "jasorat", "matonat", "g‘oya", "fikr", "reja", "loyiha"
];

export const EN_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", 
  "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", 
  "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", 
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", 
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", 
  "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", 
  "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", 
  "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", 
  "these", "give", "day", "most", "us", "keyboard", "typing", "computer", "screen", "developer"
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_test",
    title: "Tezkor Boshlanish",
    description: "UzbekType platformasida birinchi yozish testini muvaffaqiyatli yakunlang.",
    icon: "🚀",
    requirementType: "tests",
    requirementValue: 1
  },
  {
    id: "wpm_50",
    title: "50 WPM Dovoni",
    description: "Yozish tezligingizni 50 WPM (so'z daqiqasiga) yoki undan yuqoriga yetkazing.",
    icon: "🔥",
    requirementType: "wpm",
    requirementValue: 50
  },
  {
    id: "wpm_80",
    title: "80 WPM Tezurar",
    description: "Yozish tezligingizni 80 WPM yoki undan yuqoriga yetkazing. Haqiqiy professional!",
    icon: "⚡",
    requirementType: "wpm",
    requirementValue: 80
  },
  {
    id: "wpm_110",
    title: "110 WPM Kiber-Tezlik",
    description: "Aqlbovar qilmas tezlik! 110 WPM tezlikni zabt eting.",
    icon: "👑",
    requirementType: "wpm",
    requirementValue: 110
  },
  {
    id: "accuracy_100",
    title: "Xatosiz Mo'jiza",
    description: "Yozish testini 100% mukammal aniqlik bilan yakunlang.",
    icon: "🎯",
    requirementType: "accuracy",
    requirementValue: 100
  },
  {
    id: "streak_3",
    title: "Doimiy Mehnat",
    description: "Ketma-ket 3 kunlik yozish seriyasini (streak) amalga oshiring.",
    icon: "🗓️",
    requirementType: "streak",
    requirementValue: 3
  },
  {
    id: "tests_25",
    title: "Klaviatura Ustasi",
    description: "Platformada jami 25 ta yozish testini muvaffaqiyatli yakunlang.",
    icon: "🎹",
    requirementType: "tests",
    requirementValue: 25
  }
];

export const DEFAULT_BLOGS: BlogArticle[] = [
  {
    id: "blog-1",
    title: "Yozish tezligini 100 WPM ga oshirishning 5 ta oltin qoidasi",
    excerpt: "Tez va aniq yozish nafaqat vaqtingizni tejaydi, balki miyangiz faolligini ham oshiradi. Ushbu maqolada professional yozish sirlari bilan bo'lishamiz.",
    content: `# Yozish tezligini 100 WPM ga oshirishning 5 ta oltin qoidasi

Tez va xatosiz yozish (touch typing) zamonaviy dunyoda eng muhim ko'nikmalardan biridir. Dasturchilar, yozuvchilar va ma'murlar uchun bu bevosita samaradorlik ko'rsatkichidir.

Ushbu maqolada sizga tezlikni **100 WPM** (so'z daqiqasiga) va undan yuqori darajaga ko'tarishga yordam beradigan amaliy tavsiyalarni taqdim etamiz.

## 1. Doimiy ravishda "Köröshish" (Touch Typing) usulidan foydalaning
Yozayotganda klaviaturaga umuman qaramang! Buning o'rniga, barmoqlaringizni standart **F** va **J** tugmalaridagi bo'rtiqchalarga qo'yib, markaziy qatordan boshlang. Har bir barmoq o'ziga ajratilgan hududdagi tugmalarni boshqarishi kerak.

## 2. Dastlab Tezlikka Emas, Aniqlikka E'tibor Bering
Tez yozishning eng katta dushmani xatolardir. Har safar xato qilganingizda, uni o'chirish (Backspace) va qayta yozish uchun ikki barobar ko'p vaqt yo'qotasiz.
*   **Maqsad qiling:** Aniqlik ko'rsatkichi 97-100% bo'lishi kerak.
*   Sekin, lekin ritm bilan va xatosiz yozish orqali mushak xotirasini shakllantiring.

## 3. To'g'ri tana holatini saqlang
*   Orqangizni tik tuting.
*   Tirsaklaringiz 90 gradus burchak ostida tursin.
*   Monitor ko'z darajasidan bir oz pastroqda bo'lishi kerak.
*   Mushaklaringizni bo'sh tuting, taranglik tez charchashga va xatolarga olib keladi.

## 4. UzbekType yordamida har kuni 15 daqiqa mashq qiling
Muntazamlik - muvaffaqiyat garovidir. Haftada bir marta 2 soat mashq qilgandan ko'ra, har kuni 15 daqiqa diqqat bilan yozish ancha samaralidir. O'zbekcha matnlarda maxsus harflar (o‘, g‘, sh, ch) ko'p uchrashini inobatga olsak, milliy matnlarda mashq qilish mushak xotirangizni aynan shu harflarga moslashtiradi.

## 5. Sabrli bo'ling va o'z yutuqlaringizni kuzatib boring
Yozish tezligi birdaniga oshmaydi. Profilingizdagi grafiklar yordamida o'z o'sishingizni kuzatib boring. Bir necha haftalik doimiy mashqlardan so'ng, tezligingiz 20-30 WPM ga oshganini guvohi bo'lasiz!

*Mashq qilishni hoziroq UzbeType Asosiy sahifasida boshlang va milliy reytingimizda peshqadam bo'ling!*`,
    category: "Tavsiyalar",
    readingTime: "5 min o'qish",
    author: "UzbekType Team",
    date: "July 9, 2026",
    coverUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400",
    likesCount: 124,
    viewsCount: 452
  },
  {
    id: "blog-2",
    title: "Nega o‘, g‘, sh, ch harflari klaviaturada qiyinchilik tug‘diradi?",
    excerpt: "O‘zbek tilidagi o‘ziga xos harflarning klaviaturadagi o'rni va ularni tez yozish uchun qanday klaviatura layoutlari eng yaxshiligi haqida tahliliy maqola.",
    content: `# Nega o‘, g‘, sh, ch harflari klaviaturada qiyinchilik tug‘diradi?

O'zbek lotin alifbosi o'zining o'ziga xos harflari (**o‘, g‘, sh, ch**) bilan ajralib turadi. Ko'pchilik foydalanuvchilar kompyuterda yoki telefonda o'zbekcha yozishda tezlik pasayib ketishidan shikoyat qiladilar.

Bugun ushbu muammoning ildizini va uni yengish usullarini ko'rib chiqamiz.

## Muammoning sabablari
Aksariyat foydalanuvchilar o'zbekcha yozish uchun inglizcha yoki ruscha klaviatura maketlaridan (layout) foydalanishadi. 
*   **Opostrof chalkashligi:** O‘zbek tilidagi \`‘\` (tutuq belgisi / egri apostrof) belgisi uchun ko'pincha inglizcha klaviaturadagi standart apostrof \`'\` yoki teskari apostrof \`\`\` ishlatiladi.
*   **Ortiqcha harakat:** "sh" va "ch" harflarini yozish uchun ikkita alohida tugmani ketma-ket bosish kerak, bu esa bitta tovushni yozish vaqtini ikki barobarga uzaytiradi.

## Yechimlar va qulayliklar

1.  **Standart O'zbekcha Klaviatura Maketini o'rganish:**
    Windows, macOS va Linux operatsion tizimlarida rasmiy o'zbek klaviatura maketi mavjud. Unda \`o‘\` va \`g‘\` harflari uchun alohida bitta tugma ajratilgan. Garchi unga o'rganish biroz vaqt talab qilsa-da, uzoq muddatda u yozish tezligini sezilarli darajada oshiradi.
2.  **Mushak Xotirasini Shakllantirish:**
    UzbekType platformasida maxsus o'zbekcha so'zlar bazasida mashq qilish orqali barmoqlaringizni ushbu qiyin birikmalarga avtomatik tarzda o'rgatasiz. Ko'p o'tmay, miyangiz o'ylamasdan barmoqlaringiz apostrof va sh/ch tugmalariga yuguradigan bo'ladi.

## Xulosa
Klaviatura tartibingiz qanday bo'lishidan qat'iy nazar, yagona yechim - amaliyot. Kundalik yozishmalaringizda ham qisqartmalarsiz va to'liq to'g'ri harflar bilan yozishga odatlaning.

*UzbekType orqali o'zbekcha yozish tezligingizni sinab ko'ring va natijalarni do'stlaringiz bilan ulashing!*`,
    category: "Klaviatura",
    readingTime: "4 min o'qish",
    author: "Farhod Karimov",
    date: "June 25, 2026",
    coverUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=400",
    likesCount: 89,
    viewsCount: 312
  },
  {
    id: "blog-3",
    title: "Klaviatura tovushlari (Keyboard sounds) va uning typingga ta'siri",
    excerpt: "Nega Monkeytype va UzbekType kabi platformalarda klaviatura tovushlari juda mashhur? Ushbu xususiyat typing aniqligi va tezligiga qanday ta'sir qiladi?",
    content: `# Klaviatura tovushlari (Keyboard sounds) va uning typingga ta'siri

Yozish tezligini oshiruvchi veb-saytlarga kirganingizda, ko'pincha virtual klaviatura tovushlarini (mexanik klaviatura ovozi, chertish, click) yoqish imkoniyatini ko'rasiz. Nega bu xususiyat bunchalik seviladi?

Ushbu maqolada akustik qayta aloqaning (acoustic feedback) inson miyasiga ta'sirini ilmiy va amaliy tomondan o'rganamiz.

## Audiologik Qayta Aloqa (Acoustic Feedback) nima?
Biz biror tugmani bosganimizda, miyamiz bir vaqtning o'zida bir nechta signallarni qabul qiladi:
1.  **Taktil (Sinfiy):** Barmoq uchi orqali bosilganlik hissi.
2.  **Vizual:** Ekrandagi harfning paydo bo'lishi.
3.  **Akustik:** Tugmaning tovushi.

Ushbu uchta signal birlashganda, miya operatsiyani "muvaffaqiyatli yakunlandi" deb qabul qiladi. Agar tovush o'chirilsa, yozish paytida vizual nazoratga ko'proq tayanib qolamiz, bu esa ko'zning charchashiga va tezlikning biroz pasayishiga olib kelishi mumkin.

## Mexanik klaviatura ovozining jozibasi
Ko'pgina professionallar mexanik klaviaturalarni yaxshi ko'radilar. UzbekType platformasida ham biz sizga bir necha xil klaviatura tovushlarini taqdim etganmiz:
*   **Mechanical:** Moviy kalitli (Blue switch) haqiqiy kiber-sport mexanik ovozi.
*   **Click:** Yumshoq va yoqimli chertish ovozi.
*   **Beep:** Texnik, retro kompyuter ohangi.

Ushbu tovushlar yozish ritmini ushlashga juda yaxshi yordam beradi. Ritmik yozish esa tezlikni barqaror (consistent) ushlab turishning bosh sirdir.

## Xulosa
Agar siz hali sinab ko'rmagan bo'lsangiz, UzbekType o'ng yuqoridagi Sozlamalar yoki Asosiy sahifasidan **Typing Sound** xususiyatini yoqing. O'zingizga mos ritmni toping va yangi rekordlarni o'rnating!`,
    category: "Texnologiya",
    readingTime: "3 min o'qish",
    author: "Shaxzod Alimov",
    date: "May 14, 2026",
    coverUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400",
    likesCount: 156,
    viewsCount: 602
  }
];

export const INITIAL_LEADERBOARD = [
  { rank: 1, uid: "top-1", username: "Alisher_Cyber", avatar: "🤖", bestWPM: 124, accuracy: 99.1, country: "UZ", difficulty: "medium" },
  { rank: 2, uid: "top-2", username: "Dilnoza_type", avatar: "🦊", bestWPM: 112, accuracy: 98.4, country: "UZ", difficulty: "medium" },
  { rank: 3, uid: "top-3", username: "RustamDev", avatar: "💻", bestWPM: 105, accuracy: 97.9, country: "UZ", difficulty: "medium" },
  { rank: 4, uid: "top-4", username: "Nodira_K", avatar: "🌸", bestWPM: 98, accuracy: 98.8, country: "UZ", difficulty: "medium" },
  { rank: 5, uid: "top-5", username: "KlaviaturaUstasi", avatar: "⚡", bestWPM: 95, accuracy: 96.5, country: "UZ", difficulty: "medium" },
  { rank: 6, uid: "top-6", username: "Jasur_Turbo", avatar: "🏎️", bestWPM: 91, accuracy: 95.9, country: "UZ", difficulty: "medium" },
  { rank: 7, uid: "top-7", username: "Sherzod_Mac", avatar: "🍏", bestWPM: 88, accuracy: 97.2, country: "UZ", difficulty: "medium" },
  { rank: 8, uid: "top-8", username: "Malika_Typist", avatar: "✨", bestWPM: 85, accuracy: 98.1, country: "UZ", difficulty: "medium" },
  { rank: 9, uid: "top-9", username: "Bexruz_Pro", avatar: "🚀", bestWPM: 82, accuracy: 96.0, country: "UZ", difficulty: "medium" },
  { rank: 10, uid: "top-10", username: "Azizbek_Coder", avatar: "👾", bestWPM: 79, accuracy: 95.2, country: "UZ", difficulty: "medium" }
];
