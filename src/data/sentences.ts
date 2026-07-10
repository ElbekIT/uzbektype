import { Difficulty } from "../types";

export const UZBEK_TEXTS: Record<Difficulty, string[]> = {
  [Difficulty.EASY]: [
    "yaxshi uyqu salomatlikning asosi har kun vaqtida yotish va vaqtida turish kerak agar kam uxlasang tana horiydi miya yaxshi ishlamaydi diqqat pasayadi yotishdan oldin telefondan uzoqlash kitobni varaqla",
    "maktab yillarida olingan bilim kelajak poydevori hisoblanadi har bir bola yangi narsalarni o'rganishni yaxshi ko'radi darslarni o'z vaqtida tayyorlash muvaffaqiyat garovidir kitob o'qish inson dunyoqarashini kengaytiradi",
    "salom do'stim bugun yozish tezligingizni sinab ko'ramiz har bir tugmani to'g'ri bosishga harakat qiling sabr va mehnat bilan yuqori natijalarga erishish mumkin klaviaturaga qaramasdan yozishni o'rganing",
    "uyga qaytgach issiq choy ichish juda yoqimli ayniqsa qish kunlarida oila davrasida suhbatlashish insonga kuch beradi har bir lahzani qadrlash va yaxshi kayfiyatda bo'lish hayotni go'zallashtiradi",
    "bugun havo juda ajoyib quyosh charqlab turibdi bog'da sayr qilish insonga zavq bag'ishlaydi daraxtlar yashil rangga burkangan qushlarning ovozi qalbni tinchlantiradi do'stlar bilan uchrashish uchun eng yaxshi kun"
  ],
  [Difficulty.MEDIUM]: [
    "kompyuter texnologiyalari hayotimizning ajralmas qismiga aylandi dasturlash tillarini o'rganish kelajakda yuqori daromadli ish topish imkonini beradi internet yordamida dunyoning istalgan nuqtasidagi ma'lumotni soniyalar ichida topish mumkin bu esa bizga katta qulaylik yaratadi",
    "sport bilan muntazam shug'ullanish inson organizmini baquvvat qiladi har kuni ertalab yugurish va jismoniy mashqlar bajarish qon aylanishini yaxshilaydi sog'lom tana doimo tetik va faol bo'ladi zararli odatlardan voz kechib sog'lom turmush tarziga rioya qiling",
    "o'zbekiston boy madaniy meros va qadimiy shaharlarga ega samarqand buxoro va xiva kabi tarixiy obidalar har yili minglab sayyohlarni jalb qiladi milliy taomlarimiz o'zining ajoyib ta'mi bilan mashhur mehmondo'stlik xalqimizning eng go'zal fazilatlaridan biridir",
    "kitobxonlik madaniyatini yuksaltirish yosh avlod tarbiyasida muhim o'rin tutadi har kuni kamida yigirma sahifa kitob o'qishni odat qiling bu nutqingizni ravon qiladi va fikrlash qobiliyatingizni charxlaydi badiiy adabiyotlar inson qalbini ezgulikka to'ldiradi",
    "vaqt insonning eng qimmatli boyligidir uni foydasiz narsalarga sarflamaslik kerak kunlik reja asosida ish tutish maqsadlarga tezroq erishishga yordam beradi muvaffaqiyatli insonlar har doim vaqt qadriga yetishadi va har soniyadan unumli foydalanishadi"
  ],
  [Difficulty.HARD]: [
    "o'zbek tilining davlat tili sifatidagi nufuzini oshirish va uning boy imkoniyatlarini keng namoyish etish har birimizning fuqarolik burchimizdir zero til millatning ruhi va uning o'zligini belgilovchi bosh omildir kelajak avlodga tilimizni sof va mukammal holda yetkazishimiz lozim",
    "sun'iy intellekt va neyron tarmoqlari sohasi jadal sur'atlar bilan rivojlanib bormoqda bugungi kunda mashinali o'rganish algoritmlari tibbiyot moliya sanoat va ta'lim tizimida keng tatbiq etilmoqda ushbu texnologiyalarni mukammal egallagan mutaxassislarga talab tobora ortib bormoqda",
    "iqtisodiy barqarorlikni ta'minlash va yangi ish o'rinlarini yaratishda kichik va xususiy tadbirkorlik sub'ektlarining hissasi beqiyosdir davlat tomonidan berilayotgan imtiyozlar va subsidiyalar biznes vakillari uchun keng imkoniyatlar eshigini ochmoqda bu esa yurtimiz ravnaqiga xizmat qiladi",
    "ekologik muammolar va global iqlim o'zgarishi bugungi kunning eng dolzarb masalalaridan biridir tabiatni asrash suv resurslaridan tejamkorlik bilan foydalanish va yashil hududlarni ko'paytirish kelajak avlod oldidagi mas'uliyatimizdir har bir inson atrof-muhit musaffoligiga hissa qo'shmog'i darkor",
    "ilmiy-texnikaviy taraqqiyot asrida yoshlarning zamonaviy ilm-fan yutuqlarini egallashlari hamda xorijiy tillarni mukammal o'rganishlari davr talabidir chuqur bilimga ega intellektual salohiyatli yoshlar mamlakatimizni yangi marralarga olib chiqadi va uning xalqaro nufuzini yuksaltiradi"
  ]
};

// Returns a random sentence of the specified difficulty
export function getRandomSentence(difficulty: Difficulty): string {
  const list = UZBEK_TEXTS[difficulty] || UZBEK_TEXTS[Difficulty.EASY];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
