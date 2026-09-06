/**
 * 部品カタログ（/sections）で使う見本データ。
 *
 * 意味のない文字列は置かない。実際の商売で書かれるであろう言葉にしてある。
 * 機能ごとに違う業種を当てて、どの業種でも成立するかを目で確かめられるようにした。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import type {
  AccessData, BookingData, CompanyData, ContactData, FaqData, FlowData, HeroData,
  MenuData, NewsData, ServicesData, StaffData, StrengthsData, VoicesData, WorksData,
} from "@/components/sections/types";

/* ═══════════════════════════════════════
   土台になるサイト設定（工務店）
   ═══════════════════════════════════════ */

export const DEMO_CONFIG: SiteConfig = {
  templateId: "warm-craft",
  plan: "omakase",
  orderId: "demo",
  siteUrl: "https://example.com",
  company: {
    name: "菅原工務店",
    nameEn: "SUGAWARA KOUMUTEN",
    tagline: "木の家で、家族の時間を長くする。",
    description:
      "長野県松本市で、地元の木を使った家づくりをしています。設計から施工、引き渡し後の点検まで、同じ担当がひとりで受け持ちます。",
    phone: "0263-33-4120",
    email: "info@example.com",
    address: "長野県松本市中央3-5-12",
    hours: "8:30〜17:30（日曜・祝日休み）",
    since: "1998",
    ceo: "菅原 健一",
    ceoTitle: "代表 / 一級建築士",
    bio:
      "祖父が建具屋、父が大工でした。木の狂いや反りを見て育ったので、無理のない木の使い方が体に入っています。\n\n家は建てて終わりではありません。10年経ってから「あそこを直したい」と言っていただけるように、引き渡しのあとも同じ担当が伺います。図面と現場と暮らしを、ひとつづきのものとして考えています。",
    license: "長野県知事許可（般-3）第12345号",
    capital: "1,000万円",
    employees: "14名（うち大工6名・一級建築士2名）",
    founded: "2004年4月（創業 1998年）",
    business: "木造住宅の設計・施工 / リフォーム・耐震改修 / 店舗の内装 / 引き渡し後の点検と修繕",
    fax: "0263-33-4121",
    domain: "example.com",
    // 地図の埋め込みURLはあえて空。設計された地図の絵が出ることを見本で確かめる
  },
  projects: [],
  strengths: [],
  style: {
    colors: {
      primary: "#C05A2E", accent: "#A9764C", background: "#FBF8F3",
      text: "#3D3226", textMuted: "#8B7D6B", border: "#E8DFD3",
    },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
};

/* ═══════════════════════════════════════
   機能ごとの見本
   ═══════════════════════════════════════ */

/** hero — 工務店 */
export const HERO_SAMPLE: HeroData = {
  badge: "創業 1998年",
  eyebrow: "SUGAWARA KOUMUTEN",
  title: "木の家で、家族の時間を長くする。",
  lead:
    "長野県松本市で、地元の木を使った家づくりをしています。設計から施工、引き渡し後10年の点検まで、同じ担当がひとりで受け持ちます。",
  primaryCta: { label: "相談してみる", href: "#contact" },
  secondaryCta: { label: "施工事例を見る", href: "#works" },
  facts: ["1998／創業", "312棟／これまでの施工", "10年／無償の定期点検"],
};

/** strengths — 工務店 */
export const STRENGTHS_SAMPLE: StrengthsData = {
  eyebrow: "OUR STRENGTHS",
  heading: "うちに頼むと、こうなります",
  lead: "大きな会社ではできないことを、うちの規模だからできることとしてやっています。",
  items: [
    {
      title: "使う木を、製材所で一緒に選べます",
      description:
        "県内の製材所へご一緒して、梁や床に使う木を実際に見て決めていただきます。同じ樹種でも1本ずつ表情が違うので、写真ではなく現物で選んでいただくようにしています。",
      icon: "Leaf",
    },
    {
      title: "現場には毎日、同じ担当がいます",
      description:
        "着工から引き渡しまで、担当が変わりません。現場で決めたことが伝わらずに違う形になる、ということが起きません。",
      icon: "HardHat",
    },
    {
      title: "見積もりは一式でなく、単価で出します",
      description:
        "「木工事一式」ではなく、材料と手間を分けて書きます。減らしたい所と残したい所を、金額を見ながら一緒に決められます。",
      icon: "Ruler",
    },
    {
      title: "引き渡しから10年、点検に伺います",
      description:
        "1年・3年・5年・10年で伺います。木は動くものなので、建具の調整や隙間の手当てはこちらから声をかけます。",
      icon: "Shield",
    },
  ],
};

/** services — 税理士事務所 */
export const SERVICES_SAMPLE: ServicesData = {
  eyebrow: "SERVICE",
  heading: "取扱業務",
  lead: "創業から事業承継まで、社長がひとりで抱えがちなお金まわりを引き受けます。",
  items: [
    {
      title: "法人の税務顧問",
      description:
        "月次の試算表を翌月10日までにお渡しし、数字の読み方を毎月ご説明します。決算の3か月前には着地の見込みを出して、納税額が急に膨らまないようにします。",
      icon: "Briefcase",
      duration: "月1回訪問",
      price: "月額 30,000円〜",
      details: "月次試算表 / 決算・申告 / 年末調整 / 税務調査の立ち会い",
      steps: ["初回面談で今の帳簿を拝見します", "月次の資料の受け渡し方法を決めます", "毎月10日までに試算表をお渡しします"],
    },
    {
      title: "相続・事業承継",
      description:
        "会社の株と個人の資産を分けて整理し、誰にどう渡すかを図にしてお見せします。もめる原因になりやすい所から先に手当てします。",
      icon: "Scale",
      duration: "3〜12か月",
      price: "着手金 200,000円〜",
      details: "財産の棚卸し / 株価の算定 / 遺言・信託の検討 / 申告",
    },
    {
      title: "創業サポート",
      description:
        "会社をつくる前の相談から、日本政策金融公庫の創業融資の書類づくりまで。開業1年目は帳簿の付け方から一緒にやります。",
      icon: "Sun",
      duration: "初回相談 60分",
      price: "初回無料",
      steps: ["何屋としてやるかを言葉にします", "数字の計画をつくります", "融資の面談まで同席します"],
    },
    {
      title: "補助金・助成金の申請支援",
      description:
        "使えそうな制度を毎月お知らせし、通る見込みがあるものだけ手を挙げます。書類は当方で作り、社長には確認だけお願いします。",
      icon: "BadgeCheck",
      duration: "公募ごと",
      price: "成功報酬 10%",
    },
    {
      title: "記帳代行",
      description:
        "領収書と通帳のコピーをお預かりして、こちらで入力します。ご自身で入力する形へ切り替える時は、操作をお教えします。",
      icon: "PenTool",
      duration: "月1回",
      price: "月額 15,000円〜",
    },
  ],
};

/** works — 工務店・設計 */
export const WORKS_SAMPLE: WorksData = {
  eyebrow: "WORKS",
  heading: "これまでの仕事",
  lead: "松本・安曇野・塩尻を中心に、新築とリフォームを年に12〜15棟お引き受けしています。",
  items: [
    {
      id: 1, title: "里山の見える平屋", titleEn: "House in Satoyama", category: "新築", year: "2025",
      description: "北側の窓から常念岳が見えるように、寝室と居間の高さをずらしました。冬の朝でも床が冷えないよう、床下に断熱を回しています。",
      specs: "木造平屋 / 延床 96㎡ / 3LDK", client: "H様ご家族", size: "landscape",
    },
    {
      id: 2, title: "築48年の家を、二世帯に", category: "リフォーム", year: "2024",
      description: "梁と柱を残して、間取りを組み替えました。もとの梁を、あらわしの天井として見せています。",
      specs: "木造2階 / 改修 132㎡", client: "K様", size: "portrait",
    },
    {
      id: 3, title: "本と暮らす家", titleEn: "House for Books", category: "新築", year: "2024",
      description: "壁いっぱいの本棚を構造の一部にしました。地震のときに本が落ちないよう、棚板の手前に細い桟を入れています。",
      specs: "木造2階 / 延床 118㎡ / 4LDK", client: "S様ご家族",
    },
    {
      id: 4, title: "商店街のパン屋", category: "店舗", year: "2023",
      description: "元は畳屋だった建物です。表の格子を残して、通りから中の作業が見えるようにしました。",
      specs: "木造2階 / 改修 64㎡", client: "ベーカリー木戸",
    },
    {
      id: 5, title: "工場のとなりの事務所", category: "オフィス", year: "2023",
      description: "作業服のまま入れる土間と、来客用の玄関を分けました。会議室からは工場の様子が見えます。",
      specs: "鉄骨2階 / 延床 210㎡", client: "有限会社丸山製作所",
    },
    {
      id: 6, title: "川沿いの週末住宅", category: "新築", year: "2022",
      description: "普段は無人になるので、屋根と外壁の手入れが要らない仕上げを選びました。",
      specs: "木造平屋 / 延床 72㎡", client: "T様", size: "landscape",
    },
  ],
};

/** menu — イタリア食堂 */
export const MENU_SAMPLE: MenuData = {
  eyebrow: "MENU",
  heading: "お品書き",
  lead: "朝どれの野菜と、その日の魚で決めています。書いていないものもお出しできます。",
  note: "表示は税込です。ディナーのみ席料300円をいただきます。",
  items: [
    { id: 1, name: "季節野菜のグリル 盛り合わせ", price: "1,320円", category: "前菜", isRecommended: false,
      description: "松本の畑から届いた野菜を8種、炭火で焼いて塩とオリーブ油だけで。" },
    { id: 2, name: "信州サーモンのカルパッチョ", price: "1,540円", category: "前菜",
      description: "薄く引いて、レモンとディルで。" },
    { id: 3, name: "手打ちタリアテッレ 猪のラグー", price: "1,980円", category: "パスタ", isRecommended: true,
      description: "地元の猟師さんから届く猪を、赤ワインで3時間煮込んでいます。当店の看板です。" },
    { id: 4, name: "空豆とペコリーノのスパゲッティ", price: "1,760円", category: "パスタ",
      description: "5月から6月だけのお品です。" },
    { id: 5, name: "信州牛のビステッカ 200g", price: "3,850円", category: "メイン",
      description: "塊で焼いて休ませ、切り分けてお出しします。2人でも取り分けられます。" },
    { id: 6, name: "本日の魚 アクアパッツァ", price: "2,640円", category: "メイン",
      description: "その日に届いた魚で。魚の種類は席でお伝えします。" },
    { id: 7, name: "ティラミス", price: "660円", category: "デザート",
      description: "エスプレッソを効かせて、甘さは控えめに。" },
    { id: 8, name: "グラスワイン（赤・白）", price: "660円", category: "ドリンク",
      description: "イタリア各州から月替わりで4種類。" },
  ],
};

/** staff — 歯科クリニック */
export const STAFF_SAMPLE: StaffData = {
  eyebrow: "STAFF",
  heading: "スタッフ紹介",
  lead: "痛いこと・怖いことは、始める前に必ずお伝えします。急に始めることはありません。",
  items: [
    {
      id: 1, name: "森本 直人", role: "院長 / 歯科医師",
      bio: "できるだけ削らない、抜かないことを方針にしています。治療の前に、今の状態と選べる方法を紙に書いてお渡しします。",
      philosophy:
        "歯を削れば、その歯は二度と元に戻りません。だから当院では、削る前に必ず立ち止まります。今すぐ治療したほうがよいのか、経過を見てよいのかを、レントゲンと口の中の写真をお見せしながらご説明します。\n\nお子さんには、器具を口に入れる前に必ず見せて、音を聞かせます。何をされるか分かっていれば、多くのお子さんは座っていられます。急がないことが、いちばんの近道だと思っています。",
      experience: "歯科医師 22年", specialty: "むし歯治療・小児歯科",
      qualifications: ["日本小児歯科学会 専門医", "歯学博士"],
      schedule: "月〜土（木曜午後を除く）",
    },
    {
      id: 2, name: "岡田 千尋", role: "歯科衛生士",
      bio: "クリーニングと歯みがきの相談を担当しています。力の入れすぎで歯ぐきを傷めている方が多いので、まず持ち方から見直します。",
      experience: "衛生士 14年", specialty: "予防・歯周病のケア",
      qualifications: ["日本歯周病学会 認定歯科衛生士"], schedule: "月・火・木・金・土",
    },
    {
      id: 3, name: "白石 あゆみ", role: "歯科衛生士",
      bio: "小さなお子さんの担当が多いです。泣いてしまった日は、座れただけで十分と考えています。",
      experience: "衛生士 8年", specialty: "小児のケア・フッ素塗布", schedule: "水・金・土",
    },
    {
      id: 4, name: "須藤 郁子", role: "受付 / 歯科助手",
      bio: "予約と保険のことは何でも聞いてください。治療費の目安も、始める前にお出しします。",
      experience: "受付 11年", schedule: "月〜土",
    },
  ],
};

/** voices — 工務店 */
export const VOICES_SAMPLE: VoicesData = {
  eyebrow: "VOICE",
  heading: "建てた方の言葉",
  lead: "引き渡しから1年経った方に、率直なところを伺っています。",
  stats: [
    { num: "312", unit: "棟", label: "1998年からの施工数" },
    { num: "27", unit: "年", label: "松本で家をつくってきた年数" },
    { num: "94", unit: "%", label: "紹介・再依頼のお客様の割合" },
    { num: "10", unit: "年", label: "引き渡し後の無償点検" },
  ],
  items: [
    {
      name: "H様ご家族", project: "新築 / 里山の見える平屋", rating: 5,
      text: "打ち合わせのたびに図面が少しずつ変わっていくのが楽しかったです。こちらが言葉にできていないことを、菅原さんが先に図にして持ってきてくださいました。住み始めて1年、朝いちばんに山が見える窓の位置は、本当にこれで良かったと思っています。",
    },
    {
      name: "K様", project: "リフォーム / 二世帯", rating: 5,
      text: "父の代からの家なので、壊さずに残せた梁を見るたびに安心します。工事中も職人さんが毎日同じ方で、母が話し相手にしてもらっていました。",
    },
    {
      name: "ベーカリー木戸 様", project: "店舗改装", rating: 5,
      text: "開店の日程が決まっていたので不安でしたが、遅れは1日もありませんでした。表の格子を残す案は、こちらでは思いつかなかったです。",
    },
    {
      name: "S様ご家族", project: "新築 / 本と暮らす家", rating: 4,
      text: "本の重さを何度も計算し直してもらいました。棚のことばかり相談していたのに、収納全体を考え直す提案をいただけて助かりました。",
    },
  ],
};

/** flow — 学習塾（入塾までの流れ） */
export const FLOW_SAMPLE: FlowData = {
  eyebrow: "FLOW",
  heading: "入塾までの流れ",
  lead: "体験のあとで、通うかどうかを決めていただいて構いません。そのために体験は2回まで無料にしています。",
  note: "学年の途中からでも入れます。転塾のご相談も同じ流れで承ります。",
  items: [
    {
      step: 1,
      title: "お問い合わせ",
      description:
        "お電話かフォームで、学年と今つまずいている科目をお知らせください。その日のうちか翌日までにご返信します。",
      duration: "当日〜翌日",
    },
    {
      step: 2,
      title: "学習相談（無料・60分）",
      description:
        "直近のテストや答案を見ながら、どこで止まっているのかを一緒に探します。この場で入塾を決める必要はありません。",
      duration: "60分",
    },
    {
      step: 3,
      title: "体験授業（2回まで無料）",
      description:
        "実際のクラスに入っていただきます。教室の空気と、講師との相性を見てください。ご家庭には毎回、様子をお伝えします。",
      duration: "1〜2週間",
    },
    {
      step: 4,
      title: "コースのご提案",
      description:
        "体験の様子と志望校から、通う回数・科目・時間帯をご提案します。月謝と教材費もここで確定し、書面でお渡しします。",
      duration: "面談30分",
    },
    {
      step: 5,
      title: "手続き・通塾開始",
      description:
        "入塾の書類と引き落としのご登録をいただければ、その週から通えます。最初の1か月は毎週、様子をご報告します。",
      duration: "1週間以内",
    },
  ],
};

/** faq — 美容室 */
export const FAQ_SAMPLE: FaqData = {
  eyebrow: "FAQ",
  heading: "よくいただくご質問",
  lead: "お店に入る前に気になることを、先にお答えしておきます。",
  note: "ここに無いことは、ご予約のときのメモ欄にお書きください。",
  items: [
    {
      category: "ご予約のこと",
      question: "当日の予約はできますか？",
      answer:
        "空きがあればお受けします。当日は電話のほうが確実です。ネット予約は前日の20時までの受付になっています。",
    },
    {
      category: "ご予約のこと",
      question: "担当を指名しないと予約できませんか？",
      answer:
        "指名なしでも予約できます。その場合は、ご希望のスタイルを見て手の空いているスタイリストが担当します。次回から指名に変えることもできます。",
    },
    {
      category: "ご予約のこと",
      question: "遅れそうなときはどうすればいいですか？",
      answer:
        "分かった時点でお電話ください。15分ほどの遅れなら、そのまま入っていただけます。それ以上になるとメニューを短くしてご案内する場合があります。",
    },
    {
      category: "料金のこと",
      question: "表示の料金以外にかかるものはありますか？",
      answer:
        "シャンプー・ブロー・仕上げのスタイリングは料金に含まれています。髪の量や長さで薬剤を足す場合だけ、施術の前に金額をお伝えしてから追加します。黙って足すことはありません。",
    },
    {
      category: "料金のこと",
      question: "支払いにカードや電子マネーは使えますか？",
      answer:
        "クレジットカード各種、交通系IC、PayPay がお使いいただけます。分割でのお支払いは承っておりません。",
    },
    {
      category: "施術のこと",
      question: "髪や頭皮が弱いのですが、カラーはできますか？",
      answer:
        "しみにくい薬剤と、頭皮に付けない塗り方をご用意しています。心配な方には施術の2日前までにパッチテストをお願いしています。ご予約のときにお申し付けください。",
    },
    {
      category: "施術のこと",
      question: "子どもを連れて行っても大丈夫ですか？",
      answer:
        "大丈夫です。ベビーカーのまま入れる席が1つあり、キッズチェアもあります。混み合う土日は、午前中のほうがゆっくりお過ごしいただけます。",
    },
    {
      category: "施術のこと",
      question: "どのくらいの間隔で通えばいいですか？",
      answer:
        "カットは6〜8週、カラーの根元は4〜6週が目安です。ただし髪の伸び方と生活の都合で変わるので、帰り際に次のおすすめ時期をお伝えしています。",
    },
  ],
};

/** news — まちの本屋 */
export const NEWS_SAMPLE: NewsData = {
  eyebrow: "NEWS",
  heading: "お知らせ・入荷",
  lead: "新しく入った本と、店で開く会のお知らせです。",
  moreCta: { label: "お知らせをすべて見る", href: "#news" },
  items: [
    {
      id: 1,
      slug: "autumn-reading-night",
      date: "2026.09.02",
      category: "イベント",
      title: "9月20日（日）夜の読書会「町と本のはなし」を開きます",
      excerpt:
        "月に一度の読書会です。今回は課題本を決めず、それぞれが「町のことを考えた1冊」を持ち寄ります。初めての方が半分くらいです。",
      body:
        "月に一度、閉店後の店内で開いている読書会です。今回は課題本を決めません。「町のことを考えた1冊」を1人1冊お持ちください。\n\n読んでいない本でも構いません。棚から選んで持ってきていただいても大丈夫です。話すのが苦手な方は、聞いているだけでも歓迎します。\n\n定員は12名、参加費は500円（お茶つき）です。店頭かお電話でお申し込みください。",
    },
    {
      id: 2,
      slug: "new-arrival-local-press",
      date: "2026.08.28",
      category: "入荷",
      title: "地元の小さな出版社の新刊が5点入りました",
      excerpt:
        "県内で本を作っている3社から、新しい本が届いています。どれも刷り部数が少ないので、店頭ぶんが無くなり次第で終わりです。",
    },
    {
      id: 3,
      slug: "summer-hours-2026",
      date: "2026.08.09",
      category: "お知らせ",
      title: "お盆期間（8月13日〜16日）の営業時間について",
      excerpt: "13日から16日は11時から17時までの短縮営業です。17日から通常どおりに戻ります。",
    },
    {
      id: 4,
      slug: "media-shinshu-book",
      date: "2026.07.21",
      category: "メディア",
      title: "地域情報誌『しんしゅう本の道』に店を載せていただきました",
      excerpt: "棚の作り方と、選書の考え方について4ページで取り上げていただきました。誌面は店頭でご覧いただけます。",
    },
    {
      id: 5,
      slug: "kids-picture-book-corner",
      date: "2026.07.03",
      category: "店内",
      title: "奥の一角を、子どもが座って読める場所にしました",
      excerpt: "低い棚と畳を入れて、絵本を座って読める場所を作りました。靴を脱いで上がっていただけます。",
    },
    {
      id: 6,
      slug: "order-service-start",
      date: "2026.06.15",
      category: "お知らせ",
      title: "店に無い本のお取り寄せを始めました",
      excerpt: "在庫のある本なら、おおむね3〜5日でお渡しできます。送料はいただきません。",
    },
  ],
};

/** access — 工務店（事務所と現場の時間） */
export const ACCESS_SAMPLE: AccessData = {
  eyebrow: "ACCESS",
  heading: "工房と事務所のご案内",
  lead:
    "松本駅から車で7分、市役所の裏手にあります。木を触っていただけるので、打ち合わせの前に工房もご覧ください。",
  note: "駐車場は建物の裏に3台分あります。満車のときは前の道に停めていただいて構いません。",
  ways: [
    "JR松本駅 お城口から車で7分（徒歩22分）",
    "松本バスターミナルから「中央3丁目」下車、徒歩3分",
    "駐車場3台（建物裏・軽自動車2台可）",
  ],
  hoursTable: {
    head: ["月", "火", "水", "木", "金", "土", "日"],
    rows: [
      { label: "事務所（電話・来所）", cells: ["8:30-17:30", "8:30-17:30", "／", "8:30-17:30", "8:30-17:30", "8:30-17:30", "／"] },
      { label: "打ち合わせ（要予約）", cells: ["●", "●", "／", "●", "●", "●", "●"] },
      { label: "工房の見学", cells: ["●", "●", "／", "●", "●", "●", "／"] },
    ],
    note: "水曜は定休です。日曜の打ち合わせはご予約のある方のみお受けしています。",
  },
};

/** booking — 工務店（完成見学会） */
export const BOOKING_SAMPLE: BookingData = {
  eyebrow: "OPEN HOUSE",
  heading: "完成見学会のご予約",
  lead:
    "お引き渡しの前に、実際に住む家を見ていただける日を設けています。図面や写真では分からない、天井の高さと光の入り方を確かめてください。",
  note: "その場で契約をお願いすることはありません。お子さま連れでお越しいただけます。",
  purposes: ["完成見学会に行きたい", "工房を見学したい", "家づくりの相談をしたい", "そのほか"],
  primaryCta: { label: "見学を申し込む", href: "#booking-form" },
  items: [
    { id: 1, date: "10/11（土）", time: "10:00〜16:00", title: "里山の見える平屋（松本市里山辺）", location: "松本市里山辺 現地", spots: 4 },
    { id: 2, date: "10/12（日）", time: "10:00〜15:00", title: "里山の見える平屋（松本市里山辺）", location: "松本市里山辺 現地", spots: 2 },
    { id: 3, date: "10/25（土）", time: "13:00〜17:00", title: "本と暮らす家（安曇野市穂高）", location: "安曇野市穂高 現地", spots: 6 },
    { id: 4, date: "11/8（土）", time: "10:00〜16:00", title: "二世帯のリフォーム（塩尻市広丘）", location: "塩尻市広丘 現地", spots: 0 },
  ],
};

/** contact — 工務店 */
export const CONTACT_SAMPLE: ContactData = {
  eyebrow: "CONTACT",
  heading: "お問い合わせ",
  lead:
    "「まだ土地も決まっていない」という段階で構いません。予算の目安だけ知りたい、という方もよくいらっしゃいます。",
  note: "いただいた内容はご返信にだけ使います。営業の電話をこちらからかけることはありません。",
  purposes: [
    "家づくりの相談をしたい",
    "リフォームの見積もりがほしい",
    "見学会に参加したい",
    "資料を送ってほしい",
    "そのほか",
  ],
};

/** company — 工務店 */
export const COMPANY_SAMPLE: CompanyData = {
  eyebrow: "COMPANY",
  heading: "会社概要",
  lead: "松本で27年、木の家をつくってきました。",
  messageHeading: "代表あいさつ",
  messageTitle: "図面と現場と暮らしを、ひとつづきに。",
  message:
    "祖父が建具屋、父が大工でした。木の狂いや反りを見て育ったので、無理のない木の使い方が体に入っています。\n\n家は建てて終わりではありません。10年経ってから「あそこを直したい」と言っていただけるように、引き渡しのあとも同じ担当が伺います。図面と現場と暮らしを、ひとつづきのものとして考えています。\n\n大きな会社にはできない代わりに、年に建てる棟数は決めています。手が回る数だけをお引き受けします。",
  historyHeading: "沿革",
  history: [
    { year: "1998", title: "菅原健一が松本市中央で創業", description: "大工2名で、住宅の改修から始める。" },
    { year: "2004", title: "有限会社として法人化", description: "設計担当を迎え、設計から施工まで自社で行う体制にする。" },
    { year: "2009", title: "現在の工房と事務所へ移転", description: "手刻みができる作業場を持ち、県内の製材所との取引を始める。" },
    { year: "2014", title: "株式会社へ組織変更", description: "耐震改修の登録事業者となる。" },
    { year: "2018", title: "引き渡し後10年の無償点検を開始", description: "1年・3年・5年・10年で担当が伺う仕組みにする。" },
    { year: "2023", title: "施工実績が300棟を超える", description: "紹介と再依頼が全体の9割を占めるようになる。" },
  ],
};

/* ═══════════════════════════════════════
   機能 → 見本
   ═══════════════════════════════════════ */

export const SAMPLE_BY_TYPE: Record<string, Record<string, unknown>> = {
  hero: HERO_SAMPLE,
  strengths: STRENGTHS_SAMPLE,
  services: SERVICES_SAMPLE,
  works: WORKS_SAMPLE,
  menu: MENU_SAMPLE,
  staff: STAFF_SAMPLE,
  voices: VOICES_SAMPLE,
  flow: FLOW_SAMPLE,
  faq: FAQ_SAMPLE,
  news: NEWS_SAMPLE,
  access: ACCESS_SAMPLE,
  booking: BOOKING_SAMPLE,
  contact: CONTACT_SAMPLE,
  company: COMPANY_SAMPLE,
};

/** その機能の見本に使った業種（画面に出す） */
export const SAMPLE_INDUSTRY: Record<string, string> = {
  hero: "工務店",
  strengths: "工務店",
  services: "税理士事務所",
  works: "工務店・設計",
  menu: "イタリア食堂",
  staff: "歯科クリニック",
  voices: "工務店",
  flow: "学習塾",
  faq: "美容室",
  news: "まちの本屋",
  access: "工務店",
  booking: "工務店（見学会）",
  contact: "工務店",
  company: "工務店",
};
