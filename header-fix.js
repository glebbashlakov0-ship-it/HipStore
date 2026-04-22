(() => {
  const LOGO_FILE = "logo1.svg";
  const TAWK_EMBED_SRC = "https://embed.tawk.to/69c04d8cd88c2b1c3430783d/1jkbitra2";
  const REMOTE_SUPABASE_URL = "https://pwihhhbomwxzznekueok.supabase.co";
  const REMOTE_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY";
  const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
    { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
    { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", rtl: true },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
    { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
    { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
    { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
    { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
    { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  ];
  const UI_TRANSLATIONS = {
    en: {
      shopAll: "Shop All",
      lastChance: "Last Chance",
      categories: "Categories",
      collections: "Collections",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
      language: "Language",
      chooseLanguage: "Choose your preferred language",
      search: "Search",
      searchSubtitle: "Find the perfect lot",
      searchPlaceholder: "Search lots, categories, or artists...",
      viewAllResults: "View All Results",
      youMightLike: "You might like",
      featuredAuctions: "Featured Auctions",
      curatedSelection: "Curated Selection of Exceptional Pieces",
      howItWorks: "How It Works",
      startBidding: "Start bidding in three simple steps",
      trustedWorldwide: "Trusted by Collectors Worldwide",
      trustedWorldwideCopy: "Join thousands of collectors who trust us with their most valuable acquisitions",
      stayInformed: "Stay Informed",
      stayInformedCopy: "Subscribe to our newsletter for exclusive auction updates",
      winterEditTitle: "The Winter Edit: Icons of Luxury",
      winterEditCopy: "Handbags · Fine Jewelry · Watches\nA curated selection of iconic handbags, fine jewelry and luxury watches. Final lots close 28 February.",
      viewAll: "View All",
      browseAuctions: "Browse Auctions",
      subscribe: "Subscribe",
      learnMore: "Learn More",
    },
    de: {
      shopAll: "Alle Auktionen",
      lastChance: "Letzte Chance",
      categories: "Kategorien",
      collections: "Kollektionen",
      about: "Über uns",
      contact: "Kontakt",
      login: "Anmelden",
      register: "Registrieren",
      language: "Sprache",
      chooseLanguage: "Bevorzugte Sprache wählen",
      search: "Suche",
      searchSubtitle: "Das perfekte Los finden",
      searchPlaceholder: "Lose, Kategorien oder Künstler suchen...",
      viewAllResults: "Alle Ergebnisse",
      youMightLike: "Empfehlungen",
      featuredAuctions: "Ausgewählte Auktionen",
      curatedSelection: "Kuratiere Auswahl außergewöhnlicher Stücke",
      howItWorks: "So funktioniert es",
      startBidding: "In drei einfachen Schritten mitbieten",
      trustedWorldwide: "Weltweit von Sammlern geschätzt",
      trustedWorldwideCopy: "Tausende Sammler vertrauen uns ihre wertvollsten Käufe an",
      stayInformed: "Informiert bleiben",
      stayInformedCopy: "Abonniere unseren Newsletter für exklusive Auktions-Updates",
      winterEditTitle: "Die Winterauswahl: Ikonen des Luxus",
      winterEditCopy: "Handtaschen · Edler Schmuck · Uhren\nEine kuratierte Auswahl ikonischer Handtaschen, edlen Schmucks und Luxusuhren. Die letzten Lose enden am 28. Februar.",
      viewAll: "Alle anzeigen",
      browseAuctions: "Auktionen durchsuchen",
      subscribe: "Abonnieren",
      learnMore: "Mehr erfahren",
    },
    es: {
      shopAll: "Ver todo",
      lastChance: "Última oportunidad",
      categories: "Categorías",
      collections: "Colecciones",
      about: "Acerca de",
      contact: "Contacto",
      login: "Iniciar sesión",
      register: "Registrarse",
      language: "Idioma",
      chooseLanguage: "Elige tu idioma",
      search: "Buscar",
      searchSubtitle: "Encuentra el lote perfecto",
      searchPlaceholder: "Buscar lotes, categorías o artistas...",
      viewAllResults: "Ver todos los resultados",
      youMightLike: "Te puede gustar",
      featuredAuctions: "Subastas destacadas",
      curatedSelection: "Selección curada de piezas excepcionales",
      howItWorks: "Cómo funciona",
      startBidding: "Empieza a pujar en tres pasos",
      trustedWorldwide: "Coleccionistas de todo el mundo confían en nosotros",
      trustedWorldwideCopy: "Miles de coleccionistas confían en nosotros sus adquisiciones más valiosas",
      stayInformed: "Mantente informado",
      stayInformedCopy: "Suscríbete para recibir actualizaciones exclusivas",
      winterEditTitle: "La selección de invierno: iconos del lujo",
      winterEditCopy: "Bolsos · Joyería fina · Relojes\nUna selección curada de bolsos icónicos, joyería fina y relojes de lujo. Los últimos lotes cierran el 28 de febrero.",
      viewAll: "Ver todo",
      browseAuctions: "Explorar subastas",
      subscribe: "Suscribirse",
      learnMore: "Más información",
    },
    fr: {
      shopAll: "Tout voir",
      lastChance: "Dernière chance",
      categories: "Catégories",
      collections: "Collections",
      about: "À propos",
      contact: "Contact",
      login: "Connexion",
      register: "S'inscrire",
      language: "Langue",
      chooseLanguage: "Choisissez votre langue",
      search: "Recherche",
      searchSubtitle: "Trouvez le lot parfait",
      searchPlaceholder: "Rechercher des lots, catégories ou artistes...",
      viewAllResults: "Voir tous les résultats",
      youMightLike: "Vous aimerez peut-être",
      featuredAuctions: "Ventes en vedette",
      curatedSelection: "Sélection soignée de pièces exceptionnelles",
      howItWorks: "Comment ça marche",
      startBidding: "Commencez à enchérir en trois étapes",
      trustedWorldwide: "Approuvé par les collectionneurs du monde entier",
      trustedWorldwideCopy: "Des milliers de collectionneurs nous confient leurs acquisitions les plus précieuses",
      stayInformed: "Restez informé",
      stayInformedCopy: "Abonnez-vous pour recevoir des mises à jour exclusives",
      winterEditTitle: "La sélection d'hiver : icônes du luxe",
      winterEditCopy: "Sacs à main · Haute joaillerie · Montres\nUne sélection soignée de sacs iconiques, de haute joaillerie et de montres de luxe. Les derniers lots se terminent le 28 février.",
      viewAll: "Voir tout",
      browseAuctions: "Parcourir les ventes",
      subscribe: "S'abonner",
      learnMore: "En savoir plus",
    },
    it: {
      shopAll: "Vedi tutto",
      lastChance: "Ultima occasione",
      categories: "Categorie",
      collections: "Collezioni",
      about: "Chi siamo",
      contact: "Contatti",
      login: "Accedi",
      register: "Registrati",
      language: "Lingua",
      chooseLanguage: "Scegli la tua lingua",
      search: "Cerca",
      searchSubtitle: "Trova il lotto perfetto",
      searchPlaceholder: "Cerca lotti, categorie o artisti...",
      viewAllResults: "Vedi tutti i risultati",
      youMightLike: "Potrebbe interessarti",
      featuredAuctions: "Aste in evidenza",
      curatedSelection: "Selezione curata di pezzi eccezionali",
      howItWorks: "Come funziona",
      startBidding: "Inizia a fare offerte in tre passaggi",
      trustedWorldwide: "Scelto dai collezionisti di tutto il mondo",
      trustedWorldwideCopy: "Migliaia di collezionisti ci affidano i loro acquisti più preziosi",
      stayInformed: "Resta informato",
      stayInformedCopy: "Iscriviti alla newsletter per aggiornamenti esclusivi",
      winterEditTitle: "La selezione invernale: icone del lusso",
      winterEditCopy: "Borse · Alta gioielleria · Orologi\nUna selezione curata di borse iconiche, alta gioielleria e orologi di lusso. Gli ultimi lotti chiudono il 28 febbraio.",
      viewAll: "Vedi tutto",
      browseAuctions: "Esplora le aste",
      subscribe: "Iscriviti",
      learnMore: "Scopri di più",
    },
    pt: {
      shopAll: "Ver tudo",
      lastChance: "Última chance",
      categories: "Categorias",
      collections: "Coleções",
      about: "Sobre",
      contact: "Contato",
      login: "Entrar",
      register: "Registrar",
      language: "Idioma",
      chooseLanguage: "Escolha seu idioma",
      search: "Buscar",
      searchSubtitle: "Encontre o lote perfeito",
      searchPlaceholder: "Buscar lotes, categorias ou artistas...",
      viewAllResults: "Ver todos os resultados",
      youMightLike: "Você pode gostar",
      featuredAuctions: "Leilões em destaque",
      curatedSelection: "Seleção curada de peças excepcionais",
      howItWorks: "Como funciona",
      startBidding: "Comece a dar lances em três passos",
      trustedWorldwide: "Confiado por colecionadores no mundo todo",
      trustedWorldwideCopy: "Milhares de colecionadores confiam em nós para suas aquisições mais valiosas",
      stayInformed: "Fique informado",
      stayInformedCopy: "Assine nossa newsletter para atualizações exclusivas",
      winterEditTitle: "A seleção de inverno: ícones do luxo",
      winterEditCopy: "Bolsas · Joias finas · Relógios\nUma seleção curada de bolsas icônicas, joias finas e relógios de luxo. Os lotes finais encerram em 28 de fevereiro.",
      viewAll: "Ver tudo",
      browseAuctions: "Explorar leilões",
      subscribe: "Assinar",
      learnMore: "Saiba mais",
    },
    nl: {
      shopAll: "Alles bekijken",
      lastChance: "Laatste kans",
      categories: "Categorieën",
      collections: "Collecties",
      about: "Over",
      contact: "Contact",
      login: "Inloggen",
      register: "Registreren",
      language: "Taal",
      chooseLanguage: "Kies je taal",
      search: "Zoeken",
      searchSubtitle: "Vind het perfecte lot",
      searchPlaceholder: "Zoek kavels, categorieën of kunstenaars...",
      viewAllResults: "Alle resultaten",
      youMightLike: "Misschien interessant",
      featuredAuctions: "Uitgelichte veilingen",
      curatedSelection: "Samengestelde selectie van uitzonderlijke stukken",
      howItWorks: "Hoe het werkt",
      startBidding: "Begin in drie eenvoudige stappen met bieden",
      trustedWorldwide: "Vertrouwd door verzamelaars wereldwijd",
      trustedWorldwideCopy: "Duizenden verzamelaars vertrouwen ons met hun waardevolste aankopen",
      stayInformed: "Blijf op de hoogte",
      stayInformedCopy: "Abonneer je op onze nieuwsbrief voor exclusieve updates",
      winterEditTitle: "De winterselectie: iconen van luxe",
      winterEditCopy: "Handtassen · Fijne sieraden · Horloges\nEen samengestelde selectie van iconische handtassen, fijne sieraden en luxe horloges. De laatste kavels sluiten op 28 februari.",
      viewAll: "Alles bekijken",
      browseAuctions: "Veilingen bekijken",
      subscribe: "Abonneren",
      learnMore: "Meer informatie",
    },
    pl: {
      shopAll: "Zobacz wszystko",
      lastChance: "Ostatnia szansa",
      categories: "Kategorie",
      collections: "Kolekcje",
      about: "O nas",
      contact: "Kontakt",
      login: "Zaloguj się",
      register: "Zarejestruj się",
      language: "Język",
      chooseLanguage: "Wybierz język",
      search: "Szukaj",
      searchSubtitle: "Znajdź idealny obiekt",
      searchPlaceholder: "Szukaj obiektów, kategorii lub artystów...",
      viewAllResults: "Zobacz wszystkie wyniki",
      youMightLike: "Może Ci się spodobać",
      featuredAuctions: "Polecane aukcje",
      curatedSelection: "Starannie wybrana selekcja wyjątkowych obiektów",
      howItWorks: "Jak to działa",
      startBidding: "Zacznij licytować w trzech krokach",
      trustedWorldwide: "Zaufanie kolekcjonerów na całym świecie",
      trustedWorldwideCopy: "Tysiące kolekcjonerów powierzają nam swoje najcenniejsze zakupy",
      stayInformed: "Bądź na bieżąco",
      stayInformedCopy: "Zapisz się do newslettera po ekskluzywne aktualizacje",
      winterEditTitle: "Zimowa edycja: ikony luksusu",
      winterEditCopy: "Torebki · Biżuteria premium · Zegarki\nStarannie wybrana kolekcja kultowych torebek, biżuterii premium i luksusowych zegarków. Ostatnie obiekty kończą się 28 lutego.",
      viewAll: "Zobacz wszystko",
      browseAuctions: "Przeglądaj aukcje",
      subscribe: "Subskrybuj",
      learnMore: "Dowiedz się więcej",
    },
    tr: {
      shopAll: "Tümünü gör",
      lastChance: "Son şans",
      categories: "Kategoriler",
      collections: "Koleksiyonlar",
      about: "Hakkında",
      contact: "İletişim",
      login: "Giriş yap",
      register: "Kayıt ol",
      language: "Dil",
      chooseLanguage: "Dil seçin",
      search: "Ara",
      searchSubtitle: "Mükemmel lotu bulun",
      searchPlaceholder: "Lot, kategori veya sanatçı ara...",
      viewAllResults: "Tüm sonuçlar",
      youMightLike: "Beğenebilirsiniz",
      featuredAuctions: "Öne çıkan müzayedeler",
      curatedSelection: "Olağanüstü parçaların özenle seçilmiş koleksiyonu",
      howItWorks: "Nasıl çalışır",
      startBidding: "Üç adımda teklif vermeye başlayın",
      trustedWorldwide: "Dünya çapında koleksiyonerlerin güvendiği",
      trustedWorldwideCopy: "Binlerce koleksiyoner en değerli alımlarında bize güveniyor",
      stayInformed: "Haberdar olun",
      stayInformedCopy: "Özel güncellemeler için bültene abone olun",
      winterEditTitle: "Kış seçkisi: lüks ikonlar",
      winterEditCopy: "Çantalar · İnce mücevherler · Saatler\nİkonik çantalar, seçkin mücevherler ve lüks saatlerden oluşan özenle seçilmiş bir koleksiyon. Son lotlar 28 Şubat'ta kapanıyor.",
      viewAll: "Tümünü gör",
      browseAuctions: "Müzayedelere göz at",
      subscribe: "Abone ol",
      learnMore: "Daha fazla bilgi",
    },
    ar: {
      shopAll: "عرض الكل",
      lastChance: "الفرصة الأخيرة",
      categories: "الفئات",
      collections: "المجموعات",
      about: "حول",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      language: "اللغة",
      chooseLanguage: "اختر لغتك",
      search: "بحث",
      searchSubtitle: "اعثر على القطعة المثالية",
      searchPlaceholder: "ابحث عن القطع أو الفئات أو الفنانين...",
      viewAllResults: "عرض كل النتائج",
      youMightLike: "قد يعجبك",
      featuredAuctions: "مزادات مميزة",
      curatedSelection: "مجموعة مختارة من القطع الاستثنائية",
      howItWorks: "كيف يعمل",
      startBidding: "ابدأ المزايدة في ثلاث خطوات",
      trustedWorldwide: "موثوق به من قبل جامعي التحف حول العالم",
      trustedWorldwideCopy: "آلاف الجامعين يثقون بنا في أهم مشترياتهم",
      stayInformed: "ابق على اطلاع",
      stayInformedCopy: "اشترك في النشرة للحصول على تحديثات حصرية",
      winterEditTitle: "اختيار الشتاء: أيقونات الفخامة",
      winterEditCopy: "حقائب · مجوهرات فاخرة · ساعات\nمجموعة مختارة من الحقائب الأيقونية والمجوهرات الفاخرة والساعات الراقية. تنتهي آخر القطع في 28 فبراير.",
      viewAll: "عرض الكل",
      browseAuctions: "تصفح المزادات",
      subscribe: "اشترك",
      learnMore: "اعرف المزيد",
    },
    zh: {
      shopAll: "查看全部",
      lastChance: "最后机会",
      categories: "分类",
      collections: "系列",
      about: "关于",
      contact: "联系",
      login: "登录",
      register: "注册",
      language: "语言",
      chooseLanguage: "选择你的语言",
      search: "搜索",
      searchSubtitle: "找到理想拍品",
      searchPlaceholder: "搜索拍品、分类或艺术家...",
      viewAllResults: "查看全部结果",
      youMightLike: "你可能喜欢",
      featuredAuctions: "精选拍卖",
      curatedSelection: "精心挑选的非凡拍品",
      howItWorks: "如何运作",
      startBidding: "三步开始出价",
      trustedWorldwide: "受到全球藏家信赖",
      trustedWorldwideCopy: "数千名藏家将最重要的购藏交给我们",
      stayInformed: "保持关注",
      stayInformedCopy: "订阅新闻获取独家拍卖更新",
      winterEditTitle: "冬季甄选：奢华经典",
      winterEditCopy: "手袋 · 高级珠宝 · 腕表\n精选标志性手袋、高级珠宝和奢华腕表。最后一批拍品将于2月28日截止。",
      viewAll: "查看全部",
      browseAuctions: "浏览拍卖",
      subscribe: "订阅",
      learnMore: "了解更多",
    },
    sv: {
      shopAll: "Se allt",
      lastChance: "Sista chansen",
      categories: "Kategorier",
      collections: "Kollektioner",
      about: "Om oss",
      contact: "Kontakt",
      login: "Logga in",
      register: "Registrera",
      language: "Språk",
      chooseLanguage: "Välj språk",
      search: "Sök",
      searchSubtitle: "Hitta det perfekta objektet",
      searchPlaceholder: "Sök objekt, kategorier eller konstnärer...",
      viewAllResults: "Visa alla resultat",
      youMightLike: "Du kanske gillar",
      featuredAuctions: "Utvalda auktioner",
      curatedSelection: "Kurerat urval av exceptionella objekt",
      howItWorks: "Så fungerar det",
      startBidding: "Börja bjuda i tre steg",
      trustedWorldwide: "Betrodd av samlare världen över",
      trustedWorldwideCopy: "Tusentals samlare litar på oss med sina mest värdefulla köp",
      stayInformed: "Håll dig uppdaterad",
      stayInformedCopy: "Prenumerera på nyhetsbrevet för exklusiva uppdateringar",
      winterEditTitle: "Vinterutgåvan: lyxens ikoner",
      winterEditCopy: "Handväskor · Fina smycken · Klockor\nEtt kurerat urval av ikoniska handväskor, fina smycken och lyxklockor. De sista objekten stänger den 28 februari.",
      viewAll: "Visa alla",
      browseAuctions: "Bläddra bland auktioner",
      subscribe: "Prenumerera",
      learnMore: "Läs mer",
    },
    da: {
      shopAll: "Se alle",
      lastChance: "Sidste chance",
      categories: "Kategorier",
      collections: "Kollektioner",
      about: "Om",
      contact: "Kontakt",
      login: "Log ind",
      register: "Registrer",
      language: "Sprog",
      chooseLanguage: "Vælg dit sprog",
      search: "Søg",
      searchSubtitle: "Find det perfekte lot",
      searchPlaceholder: "Søg lotter, kategorier eller kunstnere...",
      viewAllResults: "Se alle resultater",
      youMightLike: "Du vil måske kunne lide",
      featuredAuctions: "Fremhævede auktioner",
      curatedSelection: "Kurateret udvalg af enestående genstande",
      howItWorks: "Sådan fungerer det",
      startBidding: "Begynd at byde i tre trin",
      trustedWorldwide: "Betroet af samlere verden over",
      trustedWorldwideCopy: "Tusindvis af samlere betror os deres mest værdifulde køb",
      stayInformed: "Hold dig opdateret",
      stayInformedCopy: "Tilmeld dig nyhedsbrevet for eksklusive opdateringer",
      winterEditTitle: "Vinterudvalget: luksusikoner",
      winterEditCopy: "Håndtasker · Fine smykker · Ure\nEt kurateret udvalg af ikoniske håndtasker, fine smykker og luksusure. De sidste lots lukker den 28. februar.",
      viewAll: "Se alle",
      browseAuctions: "Se auktioner",
      subscribe: "Tilmeld",
      learnMore: "Læs mere",
    },
    no: {
      shopAll: "Se alt",
      lastChance: "Siste sjanse",
      categories: "Kategorier",
      collections: "Samlinger",
      about: "Om",
      contact: "Kontakt",
      login: "Logg inn",
      register: "Registrer",
      language: "Språk",
      chooseLanguage: "Velg språk",
      search: "Søk",
      searchSubtitle: "Finn det perfekte objektet",
      searchPlaceholder: "Søk etter objekter, kategorier eller kunstnere...",
      viewAllResults: "Se alle resultater",
      youMightLike: "Du kan like",
      featuredAuctions: "Utvalgte auksjoner",
      curatedSelection: "Kurert utvalg av eksepsjonelle objekter",
      howItWorks: "Slik fungerer det",
      startBidding: "Begynn å by i tre trinn",
      trustedWorldwide: "Betrodd av samlere over hele verden",
      trustedWorldwideCopy: "Tusenvis av samlere stoler på oss med sine mest verdifulle kjøp",
      stayInformed: "Hold deg oppdatert",
      stayInformedCopy: "Abonner på nyhetsbrevet for eksklusive oppdateringer",
      winterEditTitle: "Vinterutvalget: luksusikoner",
      winterEditCopy: "Håndvesker · Eksklusive smykker · Klokker\nEt kuratert utvalg av ikoniske håndvesker, eksklusive smykker og luksusklokker. De siste objektene avsluttes 28. februar.",
      viewAll: "Se alle",
      browseAuctions: "Bla gjennom auksjoner",
      subscribe: "Abonner",
      learnMore: "Les mer",
    },
    cs: {
      shopAll: "Zobrazit vše",
      lastChance: "Poslední šance",
      categories: "Kategorie",
      collections: "Kolekce",
      about: "O nás",
      contact: "Kontakt",
      login: "Přihlásit se",
      register: "Registrovat",
      language: "Jazyk",
      chooseLanguage: "Vyberte jazyk",
      search: "Hledat",
      searchSubtitle: "Najděte ideální položku",
      searchPlaceholder: "Hledejte položky, kategorie nebo umělce...",
      viewAllResults: "Zobrazit všechny výsledky",
      youMightLike: "Mohlo by se vám líbit",
      featuredAuctions: "Doporučené aukce",
      curatedSelection: "Pečlivě vybraný výběr výjimečných položek",
      howItWorks: "Jak to funguje",
      startBidding: "Začněte přihazovat ve třech krocích",
      trustedWorldwide: "Důvěra sběratelů po celém světě",
      trustedWorldwideCopy: "Tisíce sběratelů nám svěřují své nejcennější nákupy",
      stayInformed: "Zůstaňte v obraze",
      stayInformedCopy: "Přihlaste se k newsletteru pro exkluzivní novinky",
      winterEditTitle: "Zimní výběr: ikony luxusu",
      winterEditCopy: "Kabelky · Luxusní šperky · Hodinky\nPečlivě vybraný výběr ikonických kabelek, luxusních šperků a hodinek. Poslední položky končí 28. února.",
      viewAll: "Zobrazit vše",
      browseAuctions: "Procházet aukce",
      subscribe: "Odebírat",
      learnMore: "Zjistit více",
    },
    ro: {
      shopAll: "Vezi tot",
      lastChance: "Ultima șansă",
      categories: "Categorii",
      collections: "Colecții",
      about: "Despre",
      contact: "Contact",
      login: "Autentificare",
      register: "Înregistrare",
      language: "Limbă",
      chooseLanguage: "Alege limba",
      search: "Caută",
      searchSubtitle: "Găsește lotul perfect",
      searchPlaceholder: "Caută loturi, categorii sau artiști...",
      viewAllResults: "Vezi toate rezultatele",
      youMightLike: "S-ar putea să-ți placă",
      featuredAuctions: "Licitații recomandate",
      curatedSelection: "Selecție curată de piese excepționale",
      howItWorks: "Cum funcționează",
      startBidding: "Începe să licitezi în trei pași",
      trustedWorldwide: "De încredere pentru colecționari din toată lumea",
      trustedWorldwideCopy: "Mii de colecționari ne încredințează cele mai valoroase achiziții",
      stayInformed: "Rămâi informat",
      stayInformedCopy: "Abonează-te la newsletter pentru actualizări exclusive",
      winterEditTitle: "Selecția de iarnă: iconuri ale luxului",
      winterEditCopy: "Genți · Bijuterii fine · Ceasuri\nO selecție curatoriată de genți iconice, bijuterii fine și ceasuri de lux. Ultimele loturi se închid pe 28 februarie.",
      viewAll: "Vezi tot",
      browseAuctions: "Răsfoiește licitațiile",
      subscribe: "Abonare",
      learnMore: "Află mai multe",
    },
  };
  const AUTH_USERS_KEY = "auctio_users";
  const AUTH_SESSION_KEY = "auctio_session";
  const LEGACY_AUTH_USERS_KEY = "auctio-auth-users";
  const LEGACY_AUTH_SESSION_KEY = "auctio-auth-session";
  const AUTH_EVENT = "auctio:auth-changed";
  let currentLanguageCode = null;
  let translationDataPromise = null;
  let translationObserver = null;
  let translationReapplyTimer = null;
  let isApplyingTranslations = false;
  let searchState = {
    query: "",
    page: 0,
    total: 0,
    hasMore: false,
    loading: false,
    loadingMore: false,
    randomLoading: false,
    results: [],
    randomPicks: [],
  };
  const SEARCH_REMOTE_LOT_CACHE = new Map();
  const ORIGINAL_TEXT_NODES = new WeakMap();
  const ORIGINAL_ELEMENT_ATTRS = new WeakMap();
  const MEGA_MENU = [
    {
      title: "Watches",
      href: "category/watches.html",
      items: [
        { label: "Rolex", href: "category/watches.html" },
        { label: "Cartier", href: "category/watches.html" },
        { label: "Patek Philippe", href: "category/watches.html" },
        { label: "Audemars Piguet", href: "category/watches.html" },
      ],
    },
    {
      title: "Bags & Fashion",
      href: "category/handbag.html",
      items: [
        { label: "Hermes", href: "category/handbag.html" },
        { label: "Chanel", href: "category/handbag.html" },
        { label: "Louis Vuitton", href: "category/handbag.html" },
        { label: "Goyard", href: "category/handbag.html" },
      ],
    },
    {
      title: "Jewelry",
      href: "category/earring.html",
      items: [
        { label: "Earrings", href: "category/earring.html" },
        { label: "Rings", href: "auctions.html" },
        { label: "Bracelets", href: "auctions.html" },
        { label: "Necklaces", href: "auctions.html" },
      ],
    },
    {
      title: "Collectibles & More",
      href: "category/collectible.html",
      items: [
        { label: "Books & Manuscripts", href: "category/books-manuscripts.html" },
        { label: "Vintage Posters", href: "category/collectible.html" },
        { label: "Photographs", href: "category/collectible.html" },
        { label: "Pens", href: "category/books-manuscripts.html" },
      ],
    },
    {
      title: "Fine Art",
      href: "auctions.html",
      items: [
        { label: "Paintings", href: "auctions.html" },
        { label: "Work on Paper", href: "auctions.html" },
        { label: "Sculpture", href: "auctions.html" },
      ],
    },
    {
      title: "Spirits",
      href: "collections/the-great-whiskey-collection.html",
      items: [
        { label: "Van Winkle", href: "collections/the-great-whiskey-collection.html" },
        { label: "Weller", href: "collections/the-great-whiskey-collection.html" },
        { label: "Old Fitzgerald", href: "collections/the-great-whiskey-collection.html" },
        { label: "Four Roses", href: "collections/the-great-whiskey-collection.html" },
      ],
    },
    {
      title: "Furniture & Decor",
      href: "auctions.html",
      items: [
        { label: "Decor", href: "auctions.html" },
        { label: "Furniture", href: "auctions.html" },
        { label: "Lighting", href: "auctions.html" },
      ],
    },
    {
      title: "Science",
      href: "auctions.html",
      items: [
        { label: "Instruments", href: "auctions.html" },
        { label: "Curiosities", href: "auctions.html" },
        { label: "Discovery", href: "auctions.html" },
      ],
    },
  ];

  function getBasePath() {
    const path = window.location.pathname.replace(/\/+/g, "/");
    if (path.includes("/collections/") || path.includes("/category/") || path.includes("/auctions/") || path.includes("/lot/") || path.includes("/bidding/")) {
      return "../";
    }
    if (path === "/" || path.endsWith("/index.html")) {
      return "";
    }
    return "";
  }

  function buildMegaMenu(basePath) {
    return `
      <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 fixed left-0 right-0 top-[80px] z-[100]">
        <div class="container mx-auto px-4">
          <div class="bg-background border border-border rounded-lg shadow-2xl p-6">
            <div class="flex flex-wrap gap-x-8 gap-y-6">
              ${MEGA_MENU.map(
                (group) => `
                  <div class="min-w-[180px] max-w-[220px] space-y-3">
                    <a class="block text-sm font-semibold hover:underline underline-offset-4" href="${basePath}${group.href}">${group.title}</a>
                    <div class="space-y-2">
                      ${group.items
                        .map(
                          (item) =>
                            `<a class="block text-sm text-muted-foreground hover:text-foreground transition-colors" href="${basePath}${item.href}">${item.label}</a>`
                        )
                        .join("")}
                    </div>
                  </div>`
              ).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildHeaderActions() {
    return `
      <div class="flex items-center space-x-2 xl:space-x-4">
        <button data-slot="button" data-header-search-trigger class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9" type="button" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </button>
        <div class="relative" data-header-language-root>
          <button data-slot="dropdown-menu-trigger" data-header-language-trigger class="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50" type="button" aria-haspopup="menu" aria-expanded="false" data-state="closed" aria-label="Switch language">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
            <span data-current-language class="hidden text-[11px] font-semibold uppercase tracking-wide sm:inline">EN</span>
            <span class="sr-only">Switch language</span>
          </button>
          <div id="header-language-menu" class="hidden absolute right-0 top-full z-[150] mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-md">
            <div class="max-h-80 overflow-y-auto overscroll-contain touch-pan-y" data-language-scroll>
              ${LANGUAGES.map(
                (lang) => `
                  <button type="button" role="menuitem" data-language-code="${lang.code}" class="relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground">
                    <span class="truncate">${lang.nativeName}</span>
                  </button>
                `
              ).join("")}
            </div>
          </div>
        </div>
        <div class="hidden xl:flex items-center gap-2" data-auth-controls></div>
        <button data-slot="button" data-header-mobile-trigger class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 xl:hidden" type="button" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu h-5 w-5"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
        </button>
      </div>
    `;
  }

  function buildHeader(basePath) {
    return `
      <header class="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="container mx-auto px-4 lg:px-8">
          <div class="flex h-16 md:h-20 items-center justify-between gap-4">
            <a class="flex items-center shrink-0" href="${basePath}index.html" aria-label="Sotheby's home">
              <img alt="Sotheby's" width="160" height="33" class="block h-7 md:h-8 w-auto max-w-none" src="${basePath}${LOGO_FILE}" onerror="this.onerror=null;this.src='${basePath}logo.svg%3Fdpl=dpl_E4DfWRBoCFFJeTFNVUWWSdvjyfsT';"/>
            </a>
            <nav class="hidden xl:flex items-center space-x-8">
              <a data-i18n="shopAll" class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="${basePath}auctions.html">Shop All</a>
              <a data-i18n="lastChance" class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="${basePath}collections/last-chance.html">Last Chance</a>
              <div class="relative group">
                <button data-i18n="categories" class="flex items-center gap-1 text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" type="button">Categories<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6"></path></svg></button>
                ${buildMegaMenu(basePath)}
              </div>
              <a data-i18n="collections" class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="${basePath}collections.html">Collections</a>
              <a data-i18n="about" class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="${basePath}about.html">About</a>
              <a data-i18n="contact" class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="${basePath}contact.html">Contact</a>
            </nav>
            ${buildHeaderActions()}
          </div>
        </div>
      </header>
    `;
  }

  function replaceHeader() {
    const basePath = getBasePath();
    const header = document.querySelector("header");
    if (header) {
      header.outerHTML = buildHeader(basePath);
      return;
    }

    const body = document.body;
    if (body) {
      body.insertAdjacentHTML("afterbegin", buildHeader(basePath));
    }
  }

  function fixFooterLogo() {
    var footerLogo = document.querySelector("footer img");
    if (!footerLogo) return;
    footerLogo.setAttribute("src", getBasePath() + "logo1.svg");
    footerLogo.setAttribute("width", "160");
    footerLogo.setAttribute("height", "33");
    footerLogo.className = "block h-8 w-auto max-w-none";
  }

  function readCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function writeCookie(name, value) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readAuthStorage(key, fallbackValue) {
    try {
      const rawValue = window.localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (_error) {
      return fallbackValue;
    }
  }

  function writeAuthStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {}
  }

  function getStoredUsers() {
    const users = readAuthStorage(AUTH_USERS_KEY, readAuthStorage(LEGACY_AUTH_USERS_KEY, []));
    return Array.isArray(users) ? users : [];
  }

  function getStoredSession() {
    const session = readAuthStorage(AUTH_SESSION_KEY, readAuthStorage(LEGACY_AUTH_SESSION_KEY, null));
    return session && typeof session === "object" ? session : null;
  }

  function sanitizeUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Collector",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.createdAt || "",
    };
  }

  function getCurrentUser() {
    if (window.__AUCTIO_AUTH_USER) {
      return sanitizeUser(window.__AUCTIO_AUTH_USER);
    }
    const session = getStoredSession();
    if (!session || !session.userId) return null;
    const users = getStoredUsers();
    return sanitizeUser(users.find((user) => user.id === session.userId) || null);
  }

  function dispatchAuthChange() {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user: getCurrentUser() } }));
    window.dispatchEvent(new CustomEvent("auctio:auth", { detail: { user: getCurrentUser() } }));
  }

  function registerAuthUser(payload) {
    const users = getStoredUsers();
    const email = String(payload.email || "").trim().toLowerCase();
    if (!email) throw new Error("Email is required.");
    if (users.some((user) => user.email === email)) throw new Error("An account with this email already exists.");
    if (String(payload.password || "").length < 8) throw new Error("Password must be at least 8 characters.");

    const user = {
      id: `user_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      firstName: String(payload.firstName || "").trim(),
      lastName: String(payload.lastName || "").trim(),
      email,
      phone: String(payload.phone || "").trim(),
      password: String(payload.password || ""),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeAuthStorage(AUTH_USERS_KEY, users);
    writeAuthStorage(AUTH_SESSION_KEY, { userId: user.id, createdAt: new Date().toISOString() });
    dispatchAuthChange();
    return sanitizeUser(user);
  }

  function loginAuthUser(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = getStoredUsers().find((entry) => entry.email === normalizedEmail);
    if (!user || user.password !== String(password || "")) throw new Error("Incorrect email or password.");

    writeAuthStorage(AUTH_SESSION_KEY, { userId: user.id, createdAt: new Date().toISOString() });
    dispatchAuthChange();
    return sanitizeUser(user);
  }

  function logoutAuthUser() {
    try {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      window.localStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
    } catch (_error) {}
    dispatchAuthChange();
  }

  function getUserInitials(user) {
    const parts = [user && user.firstName, user && user.lastName].filter(Boolean);
    if (parts.length) {
      return parts
        .map((part) => String(part).trim().charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    }
    return String((user && user.email) || "A").charAt(0).toUpperCase();
  }

  function buildAuthPageUrl(pageName, basePath) {
    const redirectTo = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
    return `${basePath}${pageName}.html?redirect=${encodeURIComponent(redirectTo)}`;
  }

  function getPostAuthRedirect(basePath) {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (!redirect) return `${basePath}account.html`;
    if (redirect.startsWith("http://") || redirect.startsWith("https://")) return `${basePath}account.html`;
    if (
      /(^|\/)(login|register|account)\.html(?:$|[?#])/.test(redirect) ||
      redirect === "login" ||
      redirect === "register" ||
      redirect === "account"
    ) {
      return `${basePath}account.html`;
    }
    return redirect;
  }

  function renderAuthControls(basePath) {
    const container = document.querySelector("[data-auth-controls]");
    if (!container) return;

    const user = getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <a data-i18n="login" class="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-all h-10" href="${buildAuthPageUrl("login", basePath)}">Login</a>
        <a data-i18n="register" class="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-xs transition-all h-10 hover:opacity-90" href="${buildAuthPageUrl("register", basePath)}">Register</a>
      `;
      return;
    }

    container.innerHTML = `
      <div class="relative" data-auth-menu-root>
        <button type="button" data-auth-menu-trigger aria-expanded="false" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground h-9 py-2 gap-2 px-3">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-medium text-sm">${escapeHtml(getUserInitials(user).charAt(0))}</div>
          <div class="text-left hidden lg:block">
            <div class="text-sm font-medium leading-none truncate max-w-[140px]">${escapeHtml(user.fullName)}</div>
            <div class="text-xs text-muted-foreground mt-1 truncate max-w-[140px]">${escapeHtml(user.email)}</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
        <div data-auth-menu class="hidden absolute right-0 top-full z-[150] mt-3 w-56 overflow-x-hidden overflow-y-auto rounded-md border border-border bg-background p-1 shadow-md">
          <a href="${basePath}account.html?tab=overview" class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Overview
          </a>
          <a href="${basePath}account.html?tab=bids" class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>
            Active Bids
          </a>
          <a href="${basePath}account.html?tab=watchlist" class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
            Watchlist
          </a>
          <a href="${basePath}account.html?tab=history" class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Viewing History
          </a>
          <a href="${basePath}account.html?tab=settings" class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Settings
          </a>
          <button type="button" data-auth-logout class="relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left text-red-600 transition-colors hover:bg-accent hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            Log Out
          </button>
        </div>
      </div>
    `;
  }

  function buildMobileAuthSection(basePath) {
    const user = getCurrentUser();
    if (!user) {
      return `
        <div class="flex gap-2 mb-6">
          <a class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 bg-transparent" href="${buildAuthPageUrl("login", basePath)}">Login</a>
          <a class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 flex-1" href="${buildAuthPageUrl("register", basePath)}">Register</a>
        </div>
      `;
    }

    return `
      <a class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 mb-4 transition-colors hover:bg-muted/50" href="${basePath}account.html">
        <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-lg font-semibold text-white">${escapeHtml(getUserInitials(user).charAt(0))}</div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold">${escapeHtml(user.fullName)}</div>
          <div class="truncate text-xs text-muted-foreground">${escapeHtml(user.email)}</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 flex-shrink-0 text-muted-foreground"><path d="m9 18 6-6-6-6"></path></svg>
      </a>
      <button type="button" data-mobile-logout class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-red-600/20 bg-transparent px-4 py-2 text-sm font-medium text-red-600 shadow-xs transition-all hover:bg-red-50 hover:text-red-700 h-9 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
        Log Out
      </button>
    `;
  }

  function buildMobileCategories(basePath) {
    return `
      <div data-mobile-categories-view class="hidden flex-col h-full min-h-0">
        <div class="p-6 border-b border-border flex-shrink-0">
          <button type="button" data-mobile-categories-back class="flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 rotate-180"><path d="m9 18 6-6-6-6"></path></svg>
            Back
          </button>
        </div>
        <nav class="flex flex-col p-6 flex-1 overflow-y-auto min-h-0">
          ${MEGA_MENU.map(
            (group) => `
              <div>
                <button type="button" data-mobile-category-group class="flex items-center gap-4 py-5 group w-full text-left">
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-base line-clamp-1">${group.title}</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 flex-shrink-0 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div data-mobile-category-panel class="hidden pb-4">
                  <a class="block pb-3 text-sm font-semibold hover:underline underline-offset-4" href="${basePath}${group.href}">View all ${group.title}</a>
                  <div class="space-y-3">
                    ${group.items
                      .map(
                        (item) => `<a class="block text-sm text-muted-foreground hover:text-foreground transition-colors" href="${basePath}${item.href}">${item.label}</a>`
                      )
                      .join("")}
                  </div>
                </div>
                <div class="h-px w-full bg-border"></div>
              </div>
            `
          ).join("")}
        </nav>
      </div>
    `;
  }

  function buildMobileMenu(basePath) {
    return `
      <div data-header-mobile-overlay class="hidden fixed inset-0 z-[205] bg-black/50 backdrop-blur-[1px]"></div>
      <div role="dialog" aria-modal="true" data-header-mobile-menu class="hidden fixed inset-y-0 right-0 z-[210] h-full w-full border-l bg-background shadow-lg sm:max-w-sm sm:w-3/4">
        <div class="flex h-full flex-col">
          <div class="flex flex-col gap-1.5 border-b border-border p-6">
            <img alt="Auction House" width="120" height="30" class="h-8 w-auto" src="${basePath}logo1.svg" />
          </div>
          <nav data-mobile-main-nav class="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
            ${buildMobileAuthSection(basePath)}
            <div class="mb-4 h-px w-full bg-border"></div>
            <a class="py-4 text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4" href="${basePath}auctions.html">Shop All</a>
            <div class="h-px w-full bg-border"></div>
            <a class="py-4 text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4" href="${basePath}collections/last-chance.html">Last Chance</a>
            <div class="h-px w-full bg-border"></div>
            <button type="button" data-mobile-categories-trigger class="flex items-center justify-between py-4 text-left text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4">
              <span>Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 transition-transform"><path d="m9 18 6-6-6-6"></path></svg>
            </button>
            <div class="h-px w-full bg-border"></div>
            <a class="py-4 text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4" href="${basePath}collections.html">Collections</a>
            <div class="h-px w-full bg-border"></div>
            <a class="py-4 text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4" href="${basePath}about.html">About</a>
            <div class="h-px w-full bg-border"></div>
            <a class="py-4 text-lg font-medium transition-all hover:text-foreground hover:underline underline-offset-4" href="${basePath}contact.html">Contact</a>
          </nav>
          ${buildMobileCategories(basePath)}
          <button type="button" data-mobile-menu-close class="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            <span class="sr-only">Close</span>
          </button>
        </div>
      </div>
    `;
  }

  function ensureMobileMenu(basePath) {
    const existing = document.querySelector("[data-header-mobile-menu]");
    if (existing) {
      existing.remove();
    }
    document.querySelector("[data-header-mobile-overlay]")?.remove();
    document.body.insertAdjacentHTML("beforeend", buildMobileMenu(basePath));
  }

  function getLanguageByCode(code) {
    return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function loadTranslationData(basePath) {
    if (!translationDataPromise) {
      const resolvedBasePath = basePath || getBasePath();
      translationDataPromise = Promise.all([
        fetch(`${resolvedBasePath}data/site-translations.json`, { cache: "no-store" }).then((response) =>
          response.ok ? response.json() : null
        ),
        fetch(`${resolvedBasePath}data/site-languages.json`, { cache: "no-store" }).then((response) =>
          response.ok ? response.json() : null
        ),
      ])
        .then(([translations, languages]) => {
          if (Array.isArray(languages) && languages.length) {
            LANGUAGES.splice(0, LANGUAGES.length, ...languages);
          }
          return {
            translations: translations || null,
          };
        })
        .catch(function () {
          return { translations: null };
        });
    }

    return translationDataPromise;
  }

  function collectTranslationPairs(source, target, map) {
    if (typeof source === "string") {
      if (typeof target === "string" && source && target && source !== target) {
        map.set(source, target);
        map.set(normalizeText(source), target);
      }
      return;
    }

    if (!source || typeof source !== "object") {
      return;
    }

    Object.keys(source).forEach(function (key) {
      collectTranslationPairs(source[key], target && typeof target === "object" ? target[key] : undefined, map);
    });
  }

  function buildTranslationMap(translations, langCode, fallbackCopy) {
    const map = new Map();
    const english = translations && translations.en ? translations.en : null;
    const target = translations && translations[langCode] ? translations[langCode] : english;

    if (english && target) {
      collectTranslationPairs(english, target, map);
    }

    const fallback = fallbackCopy || UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS.en;
    const fallbackBase = UI_TRANSLATIONS.en || {};
    collectTranslationPairs(fallbackBase, fallback, map);

    return map;
  }

  function translateRawText(rawText, translationMap) {
    if (!rawText) return rawText;
    const leadingWhitespace = (rawText.match(/^\s*/) || [""])[0];
    const trailingWhitespace = (rawText.match(/\s*$/) || [""])[0];
    const core = rawText.trim();

    if (!core) return rawText;

    const translated = translationMap.get(core) || translationMap.get(normalizeText(core));
    if (!translated) return rawText;

    return `${leadingWhitespace}${translated}${trailingWhitespace}`;
  }

  function rememberOriginalAttr(element, attribute, value) {
    let cached = ORIGINAL_ELEMENT_ATTRS.get(element);
    if (!cached) {
      cached = {};
      ORIGINAL_ELEMENT_ATTRS.set(element, cached);
    }
    if (!(attribute in cached)) {
      cached[attribute] = value;
    }
    return cached[attribute];
  }

  function translateElementAttributes(translationMap) {
    const attrNames = ["placeholder", "title", "aria-label"];

    document.body.querySelectorAll("*").forEach(function (element) {
      if (element.closest("header, #header-search-dialog, #header-language-menu, [data-language-code], [data-no-translate]")) return;

      attrNames.forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        const original = rememberOriginalAttr(element, attribute, element.getAttribute(attribute));
        const translated = translateRawText(original, translationMap);
        if (translated !== element.getAttribute(attribute)) {
          element.setAttribute(attribute, translated);
        }
      });

      if (element.tagName === "INPUT" && /^(submit|button|reset)$/i.test(element.type || "")) {
        const originalValue = rememberOriginalAttr(element, "value", element.value);
        const translatedValue = translateRawText(originalValue, translationMap);
        if (translatedValue !== element.value) {
          element.value = translatedValue;
        }
      }
    });
  }

  function translateTextNodes(translationMap) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          if (
            parent.closest(
              "header, #header-search-dialog, #header-language-menu, script, style, noscript, svg, code, pre, [data-language-code], [data-current-language], [data-no-translate]"
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!ORIGINAL_TEXT_NODES.has(node)) {
        ORIGINAL_TEXT_NODES.set(node, node.textContent);
      }
      const originalText = ORIGINAL_TEXT_NODES.get(node);
      const translatedText = translateRawText(originalText, translationMap);
      if (translatedText !== node.textContent) {
        node.textContent = translatedText;
      }
    }
  }

  function setNodeText(node, value) {
    if (!node || !value) return;
    const firstTextNode = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
    if (firstTextNode) {
      firstTextNode.textContent = value;
      return;
    }
    node.textContent = value;
  }

  function applyHeaderTranslations(targetTranslation, copy) {
    const nav = (targetTranslation && targetTranslation.nav) || {};
    const search = (targetTranslation && targetTranslation.search) || {};
    const auth = (targetTranslation && targetTranslation.auth) || {};
    const home = (targetTranslation && targetTranslation.home) || {};
    const categories = (targetTranslation && targetTranslation.categories) || {};

    document.querySelectorAll("[data-i18n='shopAll']").forEach((node) => setNodeText(node, nav.shopAll || copy.shopAll));
    document.querySelectorAll("[data-i18n='lastChance']").forEach((node) => setNodeText(node, copy.lastChance));
    document.querySelectorAll("[data-i18n='categories']").forEach((node) => setNodeText(node, nav.categories || copy.categories));
    document.querySelectorAll("[data-i18n='collections']").forEach((node) => setNodeText(node, nav.collections || copy.collections));
    document.querySelectorAll("[data-i18n='about']").forEach((node) => setNodeText(node, nav.about || copy.about));
    document.querySelectorAll("[data-i18n='contact']").forEach((node) => setNodeText(node, nav.contact || copy.contact));
    document.querySelectorAll("[data-i18n='login']").forEach((node) => setNodeText(node, auth.login || copy.login));
    document.querySelectorAll("[data-i18n='register']").forEach((node) => setNodeText(node, auth.register || copy.register));

    replaceExactText("#header-search-dialog h2", search.title || copy.search);
    replaceExactText("#header-search-dialog [data-search-view-all]", search.viewAll || copy.viewAllResults);
    replaceExactText("#header-search-dialog [data-search-summary]", search.randomPicks || copy.youMightLike);

    const searchSubtitle = document.querySelector("#header-search-dialog h2 + p");
    if (searchSubtitle) searchSubtitle.textContent = search.subtitle || copy.searchSubtitle;
    const searchInput = document.querySelector("[data-search-input]");
    if (searchInput) searchInput.placeholder = search.placeholder || copy.searchPlaceholder;

    const megaMenuMap = new Map([
      ["Watches", (home.watches && home.watches.title) || (categories.watches && categories.watches.name)],
      ["Bags & Fashion", categories["bags-fashion"] && categories["bags-fashion"].name],
      ["Jewelry", categories.jewelry && categories.jewelry.name],
      ["Collectibles & More", categories.collectibles && categories.collectibles.name],
      ["Fine Art", categories["fine-art"] && categories["fine-art"].name],
      ["Spirits", categories.spirits && categories.spirits.name],
      ["Furniture & Decor", categories["furniture-decor"] && categories["furniture-decor"].name],
      ["Science", categories.science && categories.science.name],
    ]);

    document.querySelectorAll(".group .bg-background.border.border-border.rounded-lg.shadow-2xl a.block.text-sm.font-semibold").forEach((node) => {
      const translated = megaMenuMap.get(normalizeText(node.textContent));
      if (translated) node.textContent = translated;
    });
  }

  async function applySiteTranslations(langCode, copy, basePath) {
    const translationData = await loadTranslationData(basePath);
    const translationMap = buildTranslationMap(translationData.translations, langCode, copy);
    const targetTranslation =
      (translationData.translations && translationData.translations[langCode]) ||
      (translationData.translations && translationData.translations.en) ||
      null;

    if (!translationMap.size) {
      applyHeaderTranslations(targetTranslation, copy);
      applyPageTranslations(copy);
      return;
    }

    isApplyingTranslations = true;
    try {
      applyHeaderTranslations(targetTranslation, copy);
      translateTextNodes(translationMap);
      translateElementAttributes(translationMap);
      applyPageTranslations(copy);
    } finally {
      isApplyingTranslations = false;
    }
  }

  function ensureTranslationObserver(basePath) {
    if (translationObserver || !document.body) return;

    translationObserver = new MutationObserver(function () {
      if (isApplyingTranslations) return;
      window.clearTimeout(translationReapplyTimer);
      translationReapplyTimer = window.setTimeout(function () {
        syncLanguage(undefined, basePath);
      }, 60);
    });

    translationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function getCurrentLanguage() {
    if (currentLanguageCode && LANGUAGES.some((lang) => lang.code === currentLanguageCode)) {
      return currentLanguageCode;
    }
    try {
      const stored = window.localStorage.getItem("language");
      if (stored && LANGUAGES.some((lang) => lang.code === stored)) {
        currentLanguageCode = stored;
        return stored;
      }
    } catch (_error) {}
    const saved = readCookie("language");
    if (saved && LANGUAGES.some((lang) => lang.code === saved)) {
      currentLanguageCode = saved;
      return saved;
    }
    const browser = String(navigator.language || "en").toLowerCase().split("-")[0];
    currentLanguageCode = LANGUAGES.some((lang) => lang.code === browser) ? browser : "en";
    return currentLanguageCode;
  }

  function syncLanguage(nextCode, basePath) {
    if (nextCode && LANGUAGES.some((lang) => lang.code === nextCode)) {
      currentLanguageCode = nextCode;
      try {
        window.localStorage.setItem("language", nextCode);
      } catch (_error) {}
      writeCookie("language", nextCode);
    }
    const current = getLanguageByCode(getCurrentLanguage());
    const copy = UI_TRANSLATIONS[current.code] || UI_TRANSLATIONS.en;
    document.documentElement.setAttribute("lang", current.code);
    document.documentElement.setAttribute("dir", current.rtl ? "rtl" : "ltr");
    document.body.setAttribute("data-language", current.code);
    const trigger = document.querySelector("[data-header-language-trigger]");
    if (trigger) {
      trigger.setAttribute("title", current.nativeName);
      trigger.setAttribute("aria-label", `Language: ${current.nativeName}`);
    }
    document.querySelectorAll("[data-current-language]").forEach((node) => {
      node.textContent = current.code.toUpperCase();
    });
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (copy[key]) {
        const firstTextNode = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
        if (firstTextNode) {
          firstTextNode.textContent = copy[key];
        } else {
          node.textContent = copy[key];
        }
      }
    });
    document.querySelectorAll("[data-language-code]").forEach((node) => {
      const active = node.getAttribute("data-language-code") === current.code;
      node.classList.toggle("bg-accent", active);
      node.classList.toggle("font-medium", active);
    });
    applyHeaderTranslations(null, copy);
    applySiteTranslations(current.code, copy, basePath).catch(function () {
      applyHeaderTranslations(null, copy);
      applyPageTranslations(copy);
    });
  }

  function replaceExactText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  function isHomePage() {
    var path = String(window.location.pathname || "/");
    return (
      path === "/" ||
      path === "/index.html" ||
      path.endsWith("/index.html") && !path.includes("/lot/") && !path.includes("/collections/") && !path.includes("/category/")
    );
  }

  function applyPageTranslations(copy) {
    replaceExactText("#header-search-dialog h2", copy.search);
    replaceExactText("#header-search-dialog [data-search-summary]", copy.youMightLike);
    replaceExactText("#header-search-dialog [data-search-view-all]", copy.viewAllResults);

    const searchSubtitle = document.querySelector("#header-search-dialog h2 + p");
    if (searchSubtitle) searchSubtitle.textContent = copy.searchSubtitle;
    const searchInput = document.querySelector("[data-search-input]");
    if (searchInput) searchInput.placeholder = copy.searchPlaceholder;

    if (!isHomePage()) {
      return;
    }

    const sections = Array.from(document.querySelectorAll("main > section"));
    const featured = sections[1];
    const howItWorks = sections[2];
    const trusted = sections.find((section) => section.querySelectorAll("div.text-2xl, div.sm\\:text-3xl, div.lg\\:text-4xl").length >= 4);
    const stayInformed = sections.find((section) => section.querySelector("input[type='email']") && section.querySelector("button[type='submit']"));

    if (featured) {
      replaceExactText("main > section:nth-of-type(2) h2", copy.featuredAuctions);
      replaceExactText("main > section:nth-of-type(2) p.text-muted-foreground", copy.curatedSelection);
    }

    if (howItWorks) {
      replaceExactText("main > section:nth-of-type(3) h2", copy.howItWorks);
      replaceExactText("main > section:nth-of-type(3) .text-center p.text-muted-foreground", copy.startBidding);
      const learnMoreButton = howItWorks.querySelector("a[href='how-to-bid.html'] button");
      if (learnMoreButton) {
        const textNode = Array.from(learnMoreButton.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = copy.learnMore;
      }
    }

    if (trusted) {
      const title = trusted.querySelector("h2");
      const subtitle = trusted.querySelector("p.text-muted-foreground");
      if (title) title.textContent = copy.trustedWorldwide;
      if (subtitle) subtitle.textContent = UI_TRANSLATIONS[getCurrentLanguage()]?.trustedWorldwideCopy || subtitle.textContent;
    }

    if (stayInformed) {
      const title = stayInformed.querySelector("h2");
      const subtitle = stayInformed.querySelector("p");
      const subscribeButton = stayInformed.querySelector("button[type='submit']");
      if (title) title.textContent = copy.stayInformed;
      if (subtitle) subtitle.textContent = UI_TRANSLATIONS[getCurrentLanguage()]?.stayInformedCopy || subtitle.textContent;
      if (subscribeButton) subscribeButton.textContent = copy.subscribe;
    }

    const winterEditSection = sections.find((section) =>
      section.querySelector("a[href='collections/the-winter-edit-icons-of-luxury.html']")
    );
    if (winterEditSection) {
      const title = winterEditSection.querySelector("h2");
      const subtitle = winterEditSection.querySelector("p.text-base");
      const viewAllLink = winterEditSection.querySelector("a[href='collections/the-winter-edit-icons-of-luxury.html']");
      if (title) title.textContent = copy.winterEditTitle;
      if (subtitle) subtitle.textContent = copy.winterEditCopy;
      if (viewAllLink) {
        const textNode = Array.from(viewAllLink.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
        if (textNode) {
          textNode.textContent = copy.viewAll;
        }
        const innerSpan = viewAllLink.querySelector("span");
        if (innerSpan) innerSpan.textContent = copy.viewAll;
      }
    }

    document.querySelectorAll("a[href='auctions.html'] button").forEach((button) => {
      const textNode = Array.from(button.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
      if (textNode && textNode.textContent.trim() === "Browse Auctions") {
        textNode.textContent = copy.browseAuctions;
      }
    });
  }

  function ensureLanguageMenu() {
    return;
  }

  function ensureSearchDialog() {
    const existing = document.getElementById("header-search-dialog");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div id="header-search-dialog" class="hidden fixed inset-0 z-[150]">
          <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" data-search-close></div>
          <div class="relative h-[90vh] overflow-y-auto bg-background" data-search-scroll>
            <div class="container mx-auto px-4 lg:px-8 py-8">
              <div class="mx-auto max-w-4xl">
                <div class="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <h2 class="text-2xl font-serif">Search</h2>
                    <p class="text-sm text-muted-foreground">Find the perfect lot</p>
                  </div>
                  <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors" data-search-close aria-label="Close search">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
                <div class="space-y-6">
                  <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    <input data-search-input type="search" placeholder="Search lots, categories, or artists..." class="h-12 w-full rounded-md border border-input bg-background pl-10 pr-10 text-base outline-none placeholder:text-muted-foreground" />
                    <div class="absolute right-3 top-1/2 hidden -translate-y-1/2" data-search-spinner>
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  </div>
                  <div class="space-y-4" data-search-body>
                    <div class="hidden space-y-4" data-search-query-state>
                      <div class="flex items-center justify-between">
                        <p class="text-sm text-muted-foreground" data-search-query-summary></p>
                        <a data-search-view-all class="text-sm font-medium hover:underline underline-offset-4" href="#">View All Results</a>
                      </div>
                      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" data-search-results></div>
                      <div class="hidden py-4" data-search-loading-more>
                        <div class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                      <p class="hidden text-center text-sm text-muted-foreground" data-search-scroll-more>Scroll for more results...</p>
                    </div>
                    <div class="hidden py-12 text-center" data-search-empty-state>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 h-12 w-12 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                      <p class="text-muted-foreground" data-search-empty-title>No results found</p>
                      <p class="mt-2 text-sm text-muted-foreground" data-search-empty-copy>Try different keywords</p>
                    </div>
                    <div class="space-y-4" data-search-random-state>
                      <p class="text-sm text-muted-foreground" data-search-summary>You might like</p>
                      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" data-search-random-results></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  function getSearchStrings() {
    const langCode = getCurrentLanguage();
    let remote = null;
    try {
      remote = window.__AUCTIO_TRANSLATIONS && window.__AUCTIO_TRANSLATIONS[langCode];
    } catch (_error) {}
    const search = (remote && remote.search) || {};
    const product = (remote && remote.product) || {};
    const fallback = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS.en;
    return {
      title: search.title || fallback.search,
      subtitle: search.subtitle || fallback.searchSubtitle,
      placeholder: search.placeholder || fallback.searchPlaceholder,
      noResults: search.noResults || "No results found",
      tryDifferent: search.tryDifferent || "Try different keywords",
      viewAll: search.viewAll || fallback.viewAllResults,
      randomPicks: search.randomPicks || fallback.youMightLike,
      scrollForMore: search.scrollForMore || "Scroll for more results...",
      resultsFoundWord: search.resultsFound || "results found",
      resultWord: search.result || "result",
      resultsWord: search.results || "results",
      currentBid: product.currentBid || "Current Bid",
    };
  }

  function requestRemoteSupabase(path) {
    return fetch(REMOTE_SUPABASE_URL + path, {
      headers: {
        apikey: REMOTE_SUPABASE_KEY,
      },
    }).then(function (response) {
      if (!response.ok) throw new Error("Remote request failed: " + response.status);
      return response.json();
    });
  }

  function chunkArray(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  function buildRemoteSearchLotMap(slugs) {
    const map = new Map();
    (Array.isArray(slugs) ? slugs : []).forEach(function (slug) {
      if (SEARCH_REMOTE_LOT_CACHE.has(slug)) {
        map.set(slug, SEARCH_REMOTE_LOT_CACHE.get(slug));
      }
    });
    return map;
  }

  function fetchRemoteSearchLotsBySlugs(slugs) {
    const cleanSlugs = Array.from(
      new Set(
        (Array.isArray(slugs) ? slugs : [])
          .map(function (slug) {
            return String(slug || "").trim();
          })
          .filter(Boolean)
      )
    );

    if (!cleanSlugs.length) return Promise.resolve(new Map());

    const missingSlugs = cleanSlugs.filter(function (slug) {
      return !SEARCH_REMOTE_LOT_CACHE.has(slug);
    });

    if (!missingSlugs.length) {
      return Promise.resolve(buildRemoteSearchLotMap(cleanSlugs));
    }

    return Promise.allSettled(
      chunkArray(missingSlugs, 20).map(function (batch) {
        const batchFilter =
          "(" +
          batch
            .map(function (slug) {
              return '"' + slug.replace(/"/g, "") + '"';
            })
            .join(",") +
          ")";

        return requestRemoteSupabase(
          "/rest/v1/lots?select=id,slug,title,current_bid,end_time,status&slug=in." + encodeURIComponent(batchFilter)
        );
      })
    )
      .then(function (results) {
        results.forEach(function (result) {
          if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
          result.value.forEach(function (lot) {
            const lotSlug = String((lot && lot.slug) || "").trim();
            if (!lotSlug) return;
            SEARCH_REMOTE_LOT_CACHE.set(lotSlug, lot);
          });
        });

        missingSlugs.forEach(function (slug) {
          if (!SEARCH_REMOTE_LOT_CACHE.has(slug)) {
            SEARCH_REMOTE_LOT_CACHE.set(slug, null);
          }
        });

        return buildRemoteSearchLotMap(cleanSlugs);
      })
      .catch(function () {
        return buildRemoteSearchLotMap(cleanSlugs);
      });
  }

  function mergeRemoteDataIntoSearchLot(lot, remoteLot) {
    if (!lot || !remoteLot) return lot;

    return Object.assign({}, lot, {
      title: remoteLot.title || lot.title,
      currentBid:
        remoteLot.current_bid != null ? Number(remoteLot.current_bid) : Number(lot.currentBid || lot.current_bid || lot.startingBid || 0),
      endTime: remoteLot.end_time || lot.endTime || lot.end_time,
      status: remoteLot.status || lot.status,
    });
  }

  function hydrateSearchLots(lots) {
    const sourceLots = Array.isArray(lots) ? lots.slice() : [];
    const slugs = sourceLots.map(function (lot) {
      return lot && lot.slug;
    });

    return fetchRemoteSearchLotsBySlugs(slugs)
      .then(function (remoteLotsBySlug) {
        return sourceLots.map(function (lot) {
          const slug = String((lot && lot.slug) || "").trim();
          return mergeRemoteDataIntoSearchLot(lot, remoteLotsBySlug.get(slug));
        });
      })
      .catch(function () {
        return sourceLots;
      });
  }

  function getSearchImage(lot, basePath) {
    const candidate =
      lot.image ||
      (Array.isArray(lot.images) && lot.images[0] && (lot.images[0].image_url || lot.images[0])) ||
      "placeholder.svg";
    const value = String(candidate || "");
    if (/^https?:\/\//i.test(value)) return value;
    return `${basePath}${value.replace(/^\.?\//, "")}`;
  }

  function buildSearchCard(lot, basePath) {
    const bidValue = Math.round(Number(lot.currentBid || lot.current_bid || lot.startingBid || lot.starting_bid || 0)).toLocaleString("en-US");
    const href = `${basePath}lot/index.html?slug=${encodeURIComponent(lot.slug || "")}`;
    return `
      <a href="${href}" class="group flex flex-col gap-2 overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50">
        <div class="aspect-square relative overflow-hidden bg-muted">
          <img src="${getSearchImage(lot, basePath)}" alt="${lot.title || "Lot"}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null;this.src='${basePath}placeholder.svg';" />
        </div>
        <div class="space-y-1 p-3">
          <h3 class="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">${lot.title || "Untitled Lot"}</h3>
          <p class="text-sm text-muted-foreground">€${bidValue}</p>
        </div>
      </a>
    `;
  }

  function buildSearchSkeletonGrid(count) {
    return Array.from({ length: count })
      .map(
        (_, index) => `
          <div class="space-y-3" data-search-skeleton="${index}">
            <div class="aspect-square rounded-lg bg-muted animate-pulse"></div>
            <div class="space-y-2">
              <div class="h-4 rounded bg-muted animate-pulse"></div>
              <div class="h-3 w-2/3 rounded bg-muted animate-pulse"></div>
            </div>
          </div>
        `
      )
      .join("");
  }

  function renderSearchResults(basePath) {
    const strings = getSearchStrings();
    const queryState = document.querySelector("[data-search-query-state]");
    const randomState = document.querySelector("[data-search-random-state]");
    const emptyState = document.querySelector("[data-search-empty-state]");
    const resultsNode = document.querySelector("[data-search-results]");
    const randomResultsNode = document.querySelector("[data-search-random-results]");
    const summaryNode = document.querySelector("[data-search-summary]");
    const querySummaryNode = document.querySelector("[data-search-query-summary]");
    const viewAllNode = document.querySelector("[data-search-view-all]");
    const spinner = document.querySelector("[data-search-spinner]");
    const loadingMore = document.querySelector("[data-search-loading-more]");
    const scrollMore = document.querySelector("[data-search-scroll-more]");
    const emptyTitle = document.querySelector("[data-search-empty-title]");
    const emptyCopy = document.querySelector("[data-search-empty-copy]");
    if (!queryState || !randomState || !emptyState || !resultsNode || !randomResultsNode) return;

    const query = searchState.query.trim();
    const hasQuery = Boolean(query);
    const results = searchState.results || [];
    const randomPicks = searchState.randomPicks || [];

    if (spinner) spinner.classList.toggle("hidden", !searchState.loading);
    if (loadingMore) loadingMore.classList.toggle("hidden", !searchState.loadingMore);
    if (scrollMore) {
      scrollMore.classList.toggle("hidden", !(hasQuery && searchState.hasMore && !searchState.loadingMore));
      scrollMore.textContent = strings.scrollForMore;
    }
    if (viewAllNode) {
      viewAllNode.textContent = strings.viewAll;
      viewAllNode.setAttribute("href", `${basePath}auctions.html`);
    }
    if (summaryNode) summaryNode.textContent = strings.randomPicks;
    if (emptyTitle) emptyTitle.textContent = strings.noResults;
    if (emptyCopy) emptyCopy.textContent = strings.tryDifferent;

    if (hasQuery) {
      queryState.classList.remove("hidden");
      randomState.classList.add("hidden");
      emptyState.classList.toggle("hidden", searchState.loading || results.length > 0);

      if (querySummaryNode) {
        querySummaryNode.textContent = `${searchState.total || results.length} ${strings.resultsFoundWord}`;
      }

      if (searchState.loading && !results.length) {
        resultsNode.innerHTML = buildSearchSkeletonGrid(8);
      } else {
        resultsNode.innerHTML = results.map((lot) => buildSearchCard(lot, basePath)).join("");
      }
      return;
    }

    queryState.classList.add("hidden");
    emptyState.classList.add("hidden");
    randomState.classList.remove("hidden");
    randomResultsNode.innerHTML = searchState.randomLoading ? buildSearchSkeletonGrid(8) : randomPicks.map((lot) => buildSearchCard(lot, basePath)).join("");
  }

  function searchLots(allLots, query, offset, limit) {
    const normalized = query.trim().toLowerCase();
    const matched = allLots.filter((lot) => {
      const haystack = [
        lot.title,
        lot.category,
        lot.description,
        lot.slug,
        lot.lotNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
    return {
      results: matched.slice(offset, offset + limit),
      hasMore: matched.length > offset + limit,
      total: matched.length,
    };
  }

  async function ensureRandomPicks(basePath) {
    if (searchState.randomPicks.length) return searchState.randomPicks;
    searchState.randomLoading = true;
    renderSearchResults(basePath);
    const lots = await loadSearchLots(basePath);
    const shuffled = lots
      .slice()
      .sort(function () {
        return Math.random() - 0.5;
      })
      .slice(0, 8);
    searchState.randomPicks = await hydrateSearchLots(shuffled);
    searchState.randomLoading = false;
    renderSearchResults(basePath);
    return searchState.randomPicks;
  }

  async function runSearch(basePath, query, append) {
    const lots = await loadSearchLots(basePath);
    const nextPage = append ? searchState.page + 1 : 0;
    const offset = nextPage * 20;
    if (append) {
      searchState.loadingMore = true;
    } else {
      searchState.loading = true;
      searchState.results = [];
      searchState.page = 0;
      searchState.total = 0;
      searchState.hasMore = false;
    }
    searchState.query = query;
    renderSearchResults(basePath);

    const outcome = searchLots(lots, query, offset, 20);
    const hydratedResults = await hydrateSearchLots(outcome.results);
    if (append) {
      searchState.results = searchState.results.concat(hydratedResults);
      searchState.page = nextPage;
    } else {
      searchState.results = hydratedResults;
      searchState.page = 0;
    }
    searchState.total = outcome.total;
    searchState.hasMore = outcome.hasMore;
    searchState.loading = false;
    searchState.loadingMore = false;
    renderSearchResults(basePath);
  }

  async function loadSearchLots(basePath) {
    if (window.__AUCTIO_SEARCH_LOTS) return window.__AUCTIO_SEARCH_LOTS;
    const response = await fetch(`${basePath}data/all-shop-lots.json`, { cache: "no-store" });
    const lots = await response.json();
    window.__AUCTIO_SEARCH_LOTS = Array.isArray(lots) ? lots : [];
    return window.__AUCTIO_SEARCH_LOTS;
  }

  function bindHeaderInteractions(basePath) {
    const languageTrigger = document.querySelector("[data-header-language-trigger]");
    const searchTrigger = document.querySelector("[data-header-search-trigger]");
    const mobileTrigger = document.querySelector("[data-header-mobile-trigger]");
    const languageMenu = document.getElementById("header-language-menu");
    const languageScroll = document.querySelector("[data-language-scroll]");
    const searchDialog = document.getElementById("header-search-dialog");
    const searchInput = document.querySelector("[data-search-input]");
    const searchScroll = document.querySelector("[data-search-scroll]");
    const mobileOverlay = document.querySelector("[data-header-mobile-overlay]");
    const mobileMenu = document.querySelector("[data-header-mobile-menu]");
    const mobileMainNav = document.querySelector("[data-mobile-main-nav]");
    const mobileClose = document.querySelector("[data-mobile-menu-close]");
    const mobileCategoriesTrigger = document.querySelector("[data-mobile-categories-trigger]");
    const mobileCategoriesView = document.querySelector("[data-mobile-categories-view]");
    const mobileCategoriesBack = document.querySelector("[data-mobile-categories-back]");
    const authRoot = document.querySelector("[data-auth-menu-root]");
    const authTrigger = authRoot ? authRoot.querySelector("[data-auth-menu-trigger]") : null;
    const authMenu = authRoot ? authRoot.querySelector("[data-auth-menu]") : null;

    const closeLanguageMenu = function () {
      if (!languageMenu || !languageTrigger) return;
      languageMenu.classList.add("hidden");
      languageTrigger.setAttribute("aria-expanded", "false");
      languageTrigger.setAttribute("data-state", "closed");
    };

    const openLanguageMenu = function () {
      if (!languageMenu || !languageTrigger) return;
      languageMenu.classList.remove("hidden");
      languageTrigger.setAttribute("aria-expanded", "true");
      languageTrigger.setAttribute("data-state", "open");
    };

    function getMobileRefs() {
      return {
        menu: document.querySelector("[data-header-mobile-menu]"),
        overlay: document.querySelector("[data-header-mobile-overlay]"),
        mainNav: document.querySelector("[data-mobile-main-nav]"),
        categoriesView: document.querySelector("[data-mobile-categories-view]"),
      };
    }

    const closeMobileMenu = function () {
      const refs = getMobileRefs();
      if (!refs.menu || !refs.overlay) return;
      refs.menu.classList.add("hidden");
      refs.overlay.classList.add("hidden");
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };

    const openMobileMenu = function () {
      let refs = getMobileRefs();
      if (!refs.menu || !refs.overlay) {
        ensureMobileMenu(basePath);
        refs = getMobileRefs();
      }
      if (!refs.menu || !refs.overlay) return;
      closeLanguageMenu();
      closeSearch();
      closeAuthMenu();
      if (refs.mainNav && refs.categoriesView) {
        refs.mainNav.classList.remove("hidden");
        refs.categoriesView.classList.add("hidden");
        refs.categoriesView.classList.remove("flex");
      }
      refs.menu.classList.remove("hidden");
      refs.overlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };

    const closeAuthMenu = function () {
      if (!authMenu || !authTrigger) return;
      authMenu.classList.add("hidden");
      authTrigger.setAttribute("aria-expanded", "false");
    };

    const toggleAuthMenu = function () {
      if (!authMenu || !authTrigger) return;
      const shouldOpen = authMenu.classList.contains("hidden");
      authMenu.classList.toggle("hidden", !shouldOpen);
      authTrigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    };

    const closeSearch = function () {
      if (!searchDialog) return;
      searchDialog.classList.add("hidden");
      document.body.style.removeProperty("overflow");
    };

    const openSearch = async function () {
      if (!searchDialog || !searchInput) return;
      searchDialog.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(() => {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      });
      searchState.query = searchInput.value || "";
      renderSearchResults(basePath);
      if (searchInput.value.trim()) {
        await runSearch(basePath, searchInput.value, false);
      } else {
        await ensureRandomPicks(basePath);
        renderSearchResults(basePath);
      }
    };

    if (languageTrigger && languageMenu && !languageTrigger.dataset.bound) {
      languageTrigger.dataset.bound = "true";
      languageTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (languageMenu.classList.contains("hidden")) {
          openLanguageMenu();
        } else {
          closeLanguageMenu();
        }
      });

      languageMenu.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      if (languageScroll) {
        languageScroll.addEventListener(
          "wheel",
          function (event) {
            event.preventDefault();
            event.stopPropagation();
            languageScroll.scrollTop += event.deltaY;
          },
          { passive: false }
        );
      }

      languageMenu.querySelectorAll("[data-language-code]").forEach((button) => {
        button.addEventListener("click", function () {
          syncLanguage(button.getAttribute("data-language-code"));
          closeLanguageMenu();
        });
      });
    }

    if (searchTrigger && searchDialog && searchInput && !searchTrigger.dataset.bound) {
      searchTrigger.dataset.bound = "true";
      searchTrigger.addEventListener("click", async function (event) {
        event.preventDefault();
        event.stopPropagation();
        await openSearch();
      });

      searchDialog.querySelectorAll("[data-search-close]").forEach((node) => {
        node.addEventListener("click", function (event) {
          event.preventDefault();
          closeSearch();
        });
      });

      searchDialog.querySelector("[data-search-scroll]")?.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      searchInput.addEventListener("input", async function () {
        searchState.query = searchInput.value || "";
        if (!searchInput.value.trim()) {
          searchState.results = [];
          searchState.page = 0;
          searchState.hasMore = false;
          await ensureRandomPicks(basePath);
          renderSearchResults(basePath);
          return;
        }
        await runSearch(basePath, searchInput.value, false);
      });

      if (searchScroll) {
        searchScroll.addEventListener("scroll", function () {
          if (
            !searchState.query.trim() ||
            searchState.loadingMore ||
            searchState.loading ||
            !searchState.hasMore
          ) {
            return;
          }
          const threshold = (searchScroll.scrollTop + searchScroll.clientHeight) / searchScroll.scrollHeight;
          if (threshold > 0.8) {
            runSearch(basePath, searchState.query, true);
          }
        });
      }
    }

    if (mobileTrigger && !mobileTrigger.dataset.bound) {
      mobileTrigger.dataset.bound = "true";
      mobileTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        openMobileMenu();
      });
    }

    if (mobileClose && !mobileClose.dataset.bound) {
      mobileClose.dataset.bound = "true";
      mobileClose.addEventListener("click", function (event) {
        event.preventDefault();
        closeMobileMenu();
      });
    }

    if (mobileOverlay && !mobileOverlay.dataset.bound) {
      mobileOverlay.dataset.bound = "true";
      mobileOverlay.addEventListener("click", closeMobileMenu);
    }

    if (mobileCategoriesTrigger && mobileMainNav && mobileCategoriesView && !mobileCategoriesTrigger.dataset.bound) {
      mobileCategoriesTrigger.dataset.bound = "true";
      mobileCategoriesTrigger.addEventListener("click", function () {
        mobileMainNav.classList.add("hidden");
        mobileCategoriesView.classList.remove("hidden");
        mobileCategoriesView.classList.add("flex");
      });
    }

    if (mobileCategoriesBack && mobileMainNav && mobileCategoriesView && !mobileCategoriesBack.dataset.bound) {
      mobileCategoriesBack.dataset.bound = "true";
      mobileCategoriesBack.addEventListener("click", function () {
        mobileCategoriesView.classList.add("hidden");
        mobileCategoriesView.classList.remove("flex");
        mobileMainNav.classList.remove("hidden");
      });
    }

    mobileMenu?.querySelectorAll("[data-mobile-category-group]").forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        const panel = button.parentElement?.querySelector("[data-mobile-category-panel]");
        const icon = button.querySelector("svg");
        const isHidden = panel?.classList.contains("hidden");
        panel?.classList.toggle("hidden", !isHidden);
        icon?.classList.toggle("rotate-180", Boolean(isHidden));
      });
    });

    mobileMenu?.querySelectorAll("a").forEach((link) => {
      if (link.dataset.bound) return;
      link.dataset.bound = "true";
      link.addEventListener("click", closeMobileMenu);
    });

    const mobileLogout = mobileMenu?.querySelector("[data-mobile-logout]");
    if (mobileLogout && !mobileLogout.dataset.bound) {
      mobileLogout.dataset.bound = "true";
      mobileLogout.addEventListener("click", function (event) {
        event.preventDefault();
        Promise.resolve(window.AuctioAuth.logout()).then(function () {
          closeMobileMenu();
          window.location.href = basePath + "index.html";
        });
      });
    }

    if (document.body.dataset.headerGlobalBindingsReady !== "true") {
      document.body.dataset.headerGlobalBindingsReady = "true";
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeLanguageMenu();
          closeSearch();
          closeAuthMenu();
          closeMobileMenu();
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && searchTrigger) {
          event.preventDefault();
          openSearch();
        }
      });

      document.addEventListener("click", function (event) {
        if (
          languageMenu &&
          languageTrigger &&
          !languageMenu.classList.contains("hidden") &&
          !languageMenu.contains(event.target) &&
          !languageTrigger.contains(event.target)
        ) {
          closeLanguageMenu();
        }
        if (authMenu && authTrigger && !authMenu.classList.contains("hidden") && !authMenu.contains(event.target) && !authTrigger.contains(event.target)) {
          closeAuthMenu();
        }
      });
    }

    if (authTrigger && authMenu && !authTrigger.dataset.bound) {
      authTrigger.dataset.bound = "true";
      authTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleAuthMenu();
      });

      authMenu.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      authMenu.querySelector("[data-auth-logout]")?.addEventListener("click", function (event) {
        event.preventDefault();
        Promise.resolve(window.AuctioAuth.logout()).then(function () {
          window.location.href = basePath + "index.html";
        });
      });
    }
  }

  function enhanceHeader(basePath) {
    const resolvedBasePath = basePath || getBasePath();
    const header = document.querySelector("header");
    if (header && !header.querySelector("[data-header-search-trigger]")) {
      header.outerHTML = buildHeader(resolvedBasePath);
    }
    renderAuthControls(resolvedBasePath);
    ensureMobileMenu(resolvedBasePath);
    ensureLanguageMenu();
    ensureSearchDialog();
    syncLanguage(undefined, resolvedBasePath);
    bindHeaderInteractions(resolvedBasePath);
    ensureTranslationObserver(resolvedBasePath);
  }

  function ensureTawkChat() {
    if (typeof document === "undefined") {
      return;
    }
    configureTawkChatDisplay();
    if (document.querySelector(`script[src="${TAWK_EMBED_SRC}"]`)) {
      scheduleTawkDisplayRefresh();
      return;
    }
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
    const firstScript = document.getElementsByTagName("script")[0];
    if (!firstScript || !firstScript.parentNode) {
      return;
    }
    const embedScript = document.createElement("script");
    embedScript.async = true;
    embedScript.src = TAWK_EMBED_SRC;
    embedScript.charset = "UTF-8";
    firstScript.parentNode.insertBefore(embedScript, firstScript);
  }

  function shouldShowExpandedTawk() {
    return isHomePage();
  }

  function isLikelyTawkNode(node) {
    if (!node || typeof node.getAttribute !== "function") {
      return false;
    }
    const id = String(node.id || "").toLowerCase();
    const className = String(node.className || "").toLowerCase();
    const title = String(node.getAttribute("title") || "").toLowerCase();
    const name = String(node.getAttribute("name") || "").toLowerCase();
    const src = String(node.getAttribute("src") || "").toLowerCase();
    return (
      id.includes("tawk") ||
      className.includes("tawk") ||
      title.includes("chat") ||
      name.includes("tawk") ||
      src.includes("tawk")
    );
  }

  function pruneTawkOverlays() {
    if (typeof window === "undefined" || typeof document === "undefined" || shouldShowExpandedTawk()) {
      return;
    }
    const nodes = Array.from(
      document.querySelectorAll(
        'iframe[src*="tawk"], iframe[title*="chat" i], iframe[name*="tawk" i], [id*="tawk" i], [class*="tawk" i]'
      )
    );
    nodes.forEach(function (node) {
      if (!isLikelyTawkNode(node)) {
        return;
      }
      const style = window.getComputedStyle(node);
      if (style.position !== "fixed") {
        return;
      }
      const rect = node.getBoundingClientRect();
      const isLargeOverlay = rect.width > 100 || rect.height > 100;
      if (!isLargeOverlay) {
        node.style.removeProperty("display");
        return;
      }
      node.style.setProperty("display", "none", "important");
    });
  }

  function applyTawkDisplayMode() {
    if (typeof window === "undefined") {
      return;
    }
    const api = window.Tawk_API;
    if (!api) {
      return;
    }
    if (typeof api.showWidget === "function") {
      try {
        api.showWidget();
      } catch (_error) {}
    }
    if (!shouldShowExpandedTawk() && typeof api.minimize === "function") {
      try {
        api.minimize();
      } catch (_error) {}
    }
    pruneTawkOverlays();
  }

  function scheduleTawkDisplayRefresh() {
    [0, 250, 900, 1800, 3200].forEach(function (delay) {
      window.setTimeout(applyTawkDisplayMode, delay);
    });
  }

  function configureTawkChatDisplay() {
    if (typeof window === "undefined") {
      return;
    }
    const existingApi = window.Tawk_API || {};
    if (existingApi.__auctioDisplayConfigured) {
      scheduleTawkDisplayRefresh();
      return;
    }
    const previousOnLoad = typeof existingApi.onLoad === "function" ? existingApi.onLoad : null;
    const previousOnChatMinimized = typeof existingApi.onChatMinimized === "function" ? existingApi.onChatMinimized : null;
    const previousOnChatHidden = typeof existingApi.onChatHidden === "function" ? existingApi.onChatHidden : null;
    existingApi.onLoad = function () {
      if (previousOnLoad) {
        previousOnLoad.apply(this, arguments);
      }
      scheduleTawkDisplayRefresh();
    };
    existingApi.onChatMinimized = function () {
      if (previousOnChatMinimized) {
        previousOnChatMinimized.apply(this, arguments);
      }
      if (!shouldShowExpandedTawk()) {
        scheduleTawkDisplayRefresh();
      }
    };
    existingApi.onChatHidden = function () {
      if (previousOnChatHidden) {
        previousOnChatHidden.apply(this, arguments);
      }
      if (!shouldShowExpandedTawk()) {
        scheduleTawkDisplayRefresh();
      }
    };
    existingApi.__auctioDisplayConfigured = true;
    window.Tawk_API = existingApi;
    window.addEventListener("pageshow", scheduleTawkDisplayRefresh);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        scheduleTawkDisplayRefresh();
      }
    });
  }

  window.__AUCTIO_HEADER = {
    enhanceHeader,
    syncLanguage,
  };
  window.AuctioAuth = {
    getCurrentUser,
    getStoredUsers,
    register: registerAuthUser,
    login: loginAuthUser,
    logout: logoutAuthUser,
    getPostAuthRedirect,
    buildAuthPageUrl,
  };
  window.addEventListener(AUTH_EVENT, function () {
    const basePath = getBasePath();
    renderAuthControls(basePath);
    ensureMobileMenu(basePath);
    syncLanguage(undefined, basePath);
    bindHeaderInteractions(basePath);
  });
  window.addEventListener("auctio:auth", function () {
    const basePath = getBasePath();
    renderAuthControls(basePath);
    ensureMobileMenu(basePath);
    syncLanguage(undefined, basePath);
    bindHeaderInteractions(basePath);
  });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        const basePath = getBasePath();
        replaceHeader();
        fixFooterLogo();
        enhanceHeader(basePath);
        ensureTawkChat();
      },
      { once: true }
    );
  } else {
    const basePath = getBasePath();
    replaceHeader();
    fixFooterLogo();
    enhanceHeader(basePath);
    ensureTawkChat();
  }
})();
