import type { DiseaseClass } from '../types'

export interface Pesticide {
  name: string
  dose: string
  where: string
  warning: string
}

export interface DiseaseMeta {
  nameBn: string
  en: string
  imgUrl: string
  sevLabel: string
  sevClass: 'sev-high' | 'sev-med' | 'sev-low'
  what: string
  today: string
  prevent: string
  pesticide: Pesticide | null
}

export const DISEASE_META: Record<DiseaseClass, DiseaseMeta> = {
  leaf_blast: {
    nameBn: 'পাতা ঝলসানো রোগ',
    en: 'Leaf Blast',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Rice_blast_Magnaporthe_grisea.jpg',
    sevLabel: 'উচ্চ ঝুঁকি',
    sevClass: 'sev-high',
    what: 'ছত্রাকজনিত রোগ — পাতায় ধূসর হীরার মতো দাগ পড়ে। বৃষ্টি হলে দ্রুত সারা মাঠে ছড়িয়ে যায়।',
    today: 'আক্রান্ত পাতা ও ডাল ভেঙে মাঠের বাইরে ফেলে দিন। সেচ বন্ধ রাখুন, মাঠ কিছুটা শুকিয়ে নিন।',
    prevent: 'রোগ প্রতিরোধী জাত ব্যবহার করুন। নাইট্রোজেন সার পরিমিত দিন। মাঠ পর্যবেক্ষণ নিয়মিত করুন।',
    pesticide: {
      name: 'ট্রাইসাইক্লাজল ৭৫% WP',
      dose: '১ গ্রাম প্রতি ১ লিটার পানিতে',
      where: 'নিকটস্থ সার ও কীটনাশক দোকানে',
      warning: 'ছোট বাচ্চাদের হাতের নাগালে রাখবেন না',
    },
  },
  bacterial_leaf_blight: {
    nameBn: 'ব্যাকটেরিয়াল ব্লাইট',
    en: 'Bacterial Leaf Blight',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Xanthomonas-disease.jpg',
    sevLabel: 'উচ্চ ঝুঁকি',
    sevClass: 'sev-high',
    what: 'ব্যাকটেরিয়াজনিত রোগ — পাতার কিনারা হলদে হয়ে শুকিয়ে যায়। জলাবদ্ধ অবস্থায় দ্রুত বাড়ে।',
    today: 'জলাবদ্ধতা দূর করুন। নাইট্রোজেন সার বন্ধ রাখুন।',
    prevent: 'পানি নিষ্কাশনের ব্যবস্থা করুন। সুস্থ বীজ ব্যবহার করুন। বীজ শোধন করে রোপণ করুন।',
    pesticide: {
      name: 'কপার অক্সিক্লোরাইড ৫০% WP',
      dose: '২ গ্রাম প্রতি ১ লিটার পানিতে',
      where: 'নিকটস্থ সার ও কীটনাশক দোকানে',
      warning: 'স্প্রে করার সময় মুখ ঢেকে রাখুন',
    },
  },
  brown_spot: {
    nameBn: 'বাদামি দাগ রোগ',
    en: 'Brown Spot',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Cochliobolus_miyabeanus.jpg',
    sevLabel: 'মাঝারি',
    sevClass: 'sev-med',
    what: 'ছত্রাকজনিত রোগ — পাতায় গোলাকার বাদামি দাগ, চারদিকে হলদে হালো। মাটির পুষ্টির অভাবে বাড়ে।',
    today: 'ম্যাঙ্গানিজ ও পটাশ সার দিন। ম্যানকোজেব স্প্রে করুন।',
    prevent: 'মাটি পরীক্ষা করে সুষম সার দিন। জৈব সার ব্যবহার বাড়ান।',
    pesticide: {
      name: 'ম্যানকোজেব ৮০% WP',
      dose: '২ গ্রাম প্রতি ১ লিটার পানিতে',
      where: 'নিকটস্থ সার ও কীটনাশক দোকানে',
      warning: 'ছোট বাচ্চাদের হাতের নাগালে রাখবেন না',
    },
  },
  tungro: {
    nameBn: 'টুংরো ভাইরাস',
    en: 'Rice Tungro Disease',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Rice_plants_affected_by_tungro_disease1.jpg',
    sevLabel: 'উচ্চ ঝুঁকি',
    sevClass: 'sev-high',
    what: 'ভাইরাসজনিত রোগ — পাতা হলুদ-কমলা রঙ ধারণ করে। গ্রিন লিফহপার পোকা দ্বারা ছড়ায়।',
    today: 'আক্রান্ত গাছ উপড়ে পুড়িয়ে ফেলুন। কীটনাশক দিয়ে পোকা দমন করুন।',
    prevent: 'রোগ প্রতিরোধী জাত লাগান। লিফহপার পোকা নিয়ন্ত্রণ করুন।',
    pesticide: {
      name: 'ইমিডাক্লোপ্রিড ২০০ SL',
      dose: '০.৫ মিলি প্রতি ১ লিটার পানিতে',
      where: 'নিকটস্থ সার ও কীটনাশক দোকানে',
      warning: 'মাছের পুকুর থেকে দূরে স্প্রে করুন',
    },
  },
  healthy: {
    nameBn: 'সুস্থ ধান',
    en: 'Healthy Rice Plant',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rice_plant.jpg',
    sevLabel: 'সুস্থ',
    sevClass: 'sev-low',
    what: 'আপনার ধান গাছ সুস্থ দেখাচ্ছে। পাতা সবুজ ও তাজা, কোনো রোগের লক্ষণ নেই।',
    today: 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান। সার ও সেচ পরিকল্পনামতো দিন।',
    prevent: 'প্রতিরোধ সবচেয়ে ভালো চিকিৎসা। সপ্তাহে একবার মাঠ পরিদর্শন করুন।',
    pesticide: null,
  },
  not_rice_leaf: {
    nameBn: 'ধানের পাতা নয়',
    en: 'Not a Rice Leaf',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rice_plant.jpg',
    sevLabel: 'প্রযোজ্য নয়',
    sevClass: 'sev-low',
    what: 'ছবিতে ধানের পাতা শনাক্ত করা যায়নি।',
    today: 'ধানের পাতার ছবি আবার তুলুন।',
    prevent: '',
    pesticide: null,
  },
}
