/**
 * FoodLink AI - Internationalization (i18n)
 * Supports English (en) and Telugu (te) for Andhra Pradesh users
 */

const translations = {
  en: {
    hero_title: 'Donate food...\nEnd Hunger.',
    hero_desc: 'Join our intelligent network that connects food donors with local NGOs instantly. Zero friction, zero waste, just perfectly good food reaching those who need it most in Andhra Pradesh.',
    
    choice_donor: 'I have food to donate',
    choice_donor_desc: 'Instantly match with the nearest NGO that needs your surplus. No account required.',
    choice_ngo: 'I represent an NGO',
    choice_ngo_desc: 'Register your capacity and receive real-time alerts when food is available near you.',
    btn_donate: 'Donate Now',
    btn_join: 'Join Network',
    
    don_title: 'Donate Surplus Food',
    don_subtitle: 'Our AI will instantly match your food with the nearest verified NGO. No account needed.',
    don_name: 'Your Name / Organization',
    don_phone: 'Contact Number',
    don_type: 'Food Type',
    don_qty: 'Quantity (Approx. Meals)',
    don_expiry: 'Must be picked up/delivered by',
    don_location: 'Location',
    don_delivery: 'How will the food reach the NGO?',
    don_submit: 'Find Match & Submit',
    don_matching: 'AI is analyzing nearby capacity...',
    
    del_dropoff: 'I will drop it off',
    del_dropoff_desc: 'Show me where to go. Fastest option.',
    del_pickup: 'NGO must pick it up',
    del_pickup_desc: 'I need someone to come get it.',
    
    res_title: 'Match Found!',
    btn_submit_ngo: 'Submit Application',

    ngo_reg_title: 'Register Your NGO',
    ngo_reg_subtitle: 'Join our network to receive real-time alerts when surplus food is available near you.'
  },
  te: {
    hero_title: 'ఆహారాన్ని పంచుదాం,\nఆకలిని అంతం చేద్దాం.',
    hero_desc: 'ఆహార దాతలను స్థానిక NGOలతో తక్షణమే కనెక్ట్ చేసే మా తెలివైన నెట్‌వర్క్‌లో చేరండి. ఆంధ్రప్రదేశ్‌లో అవసరమైన వారికి మంచి ఆహారం చేరేలా చూడండి.',
    
    choice_donor: 'నేను ఆహారం దానం చేయాలి',
    choice_donor_desc: 'మీ మిగులు అవసరమైన సమీప NGOతో తక్షణమే సరిపోలండి. ఖాతా అవసరం లేదు.',
    choice_ngo: 'నేను NGO ప్రతినిధిని',
    choice_ngo_desc: 'మీ సామర్థ్యాన్ని నమోదు చేసుకోండి మరియు మీకు సమీపంలో ఆహారం అందుబాటులో ఉన్నప్పుడు రియల్ టైమ్ అలర్ట్‌లను పొందండి.',
    btn_donate: 'ఇప్పుడే దానం చేయండి',
    btn_join: 'నెట్‌వర్క్‌లో చేరండి',
    
    don_title: 'మిగులు ఆహారాన్ని దానం చేయండి',
    don_subtitle: 'మా AI మీ ఆహారాన్ని సమీప ధృవీకరించబడిన NGOతో తక్షణమే జత చేస్తుంది. ఖాతా అవసరం లేదు.',
    don_name: 'మీ పేరు / సంస్థ',
    don_phone: 'సంప్రదింపు నంబర్',
    don_type: 'ఆహార రకం',
    don_qty: 'పరిమాణం (సుమారు భోజనాలు)',
    don_expiry: 'తీసుకెళ్ళవలసిన సమయం',
    don_location: 'ప్రదేశం',
    don_delivery: 'ఆహారం NGOకి ఎలా చేరుతుంది?',
    don_submit: 'సరిపోలికను కనుగొని సమర్పించండి',
    don_matching: 'AI సమీప సామర్థ్యాన్ని విశ్లేషిస్తోంది...',
    
    del_dropoff: 'నేను డ్రాప్ చేస్తాను',
    del_dropoff_desc: 'నేను ఎక్కడికి వెళ్లాలో చూపించండి. వేగవంతమైన ఎంపిక.',
    del_pickup: 'NGO పిక్ అప్ చేసుకోవాలి',
    del_pickup_desc: 'ఎవరైనా వచ్చి తీసుకోవాలి.',
    
    res_title: 'సరిపోలిక కనుగొనబడింది!',
    btn_submit_ngo: 'దరఖాస్తు సమర్పించండి',

    ngo_reg_title: 'మీ NGOని నమోదు చేయండి',
    ngo_reg_subtitle: 'మీ దగ్గర మిగులు ఆహారం అందుబాటులో ఉన్నప్పుడు రియల్ టైమ్ అలర్ట్‌లను పొందడానికి మా నెట్‌వర్క్‌లో చేరండి.'
  },
};

function getCurrentLang() {
  return localStorage.getItem('foodlink_lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('foodlink_lang', lang);
  applyTranslations();
}

function toggleLanguage() {
  const current = getCurrentLang();
  setLang(current === 'en' ? 'te' : 'en');
}

function applyTranslations() {
  const lang = getCurrentLang();
  
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = translations[lang][key] || translations.en[key] || key;
    
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.placeholder) el.placeholder = text;
    } else {
      // Use innerHTML for multiline text (like hero title)
      el.innerHTML = text.replace(/\n/g, '<br>');
    }
  });
  
  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    btn.textContent = lang === 'en' ? 'తెలుగు' : 'English';
  });
  
  document.documentElement.lang = lang === 'te' ? 'te' : 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});