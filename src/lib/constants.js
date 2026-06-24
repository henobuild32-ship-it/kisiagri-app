export const AFRICAN_COUNTRIES = [
  { name: "RD Congo", code: "CD", dial: "+243" },
  { name: "Congo", code: "CG", dial: "+242" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Rwanda", code: "RW", dial: "+250" },
  { name: "Burundi", code: "BI", dial: "+257" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Tanzanie", code: "TZ", dial: "+255" },
  { name: "Ouganda", code: "UG", dial: "+256" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Cameroun", code: "CM", dial: "+237" },
  { name: "Côte d'Ivoire", code: "CI", dial: "+225" },
  { name: "Sénégal", code: "SN", dial: "+221" },
  { name: "Mali", code: "ML", dial: "+223" },
  { name: "Burkina Faso", code: "BF", dial: "+226" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Afrique du Sud", code: "ZA", dial: "+27" },
  { name: "Éthiopie", code: "ET", dial: "+251" },
  { name: "Maroc", code: "MA", dial: "+212" },
  { name: "Tunisie", code: "TN", dial: "+216" },
  { name: "Algérie", code: "DZ", dial: "+213" },
  { name: "Égypte", code: "EG", dial: "+20" },
  { name: "Mozambique", code: "MZ", dial: "+258" },
  { name: "Zambie", code: "ZM", dial: "+260" },
  { name: "Zimbabwe", code: "ZW", dial: "+263" },
  { name: "Madagascar", code: "MG", dial: "+261" },
  { name: "Bénin", code: "BJ", dial: "+229" },
  { name: "Togo", code: "TG", dial: "+228" },
  { name: "Niger", code: "NE", dial: "+227" },
  { name: "Tchad", code: "TD", dial: "+235" },
  { name: "Centrafrique", code: "CF", dial: "+236" },
  { name: "Gabon", code: "GA", dial: "+241" },
  { name: "Guinée Équatoriale", code: "GQ", dial: "+240" },
  { name: "Guinée", code: "GN", dial: "+224" },
  { name: "Sierra Leone", code: "SL", dial: "+232" },
  { name: "Liberia", code: "LR", dial: "+231" },
  { name: "Mauritanie", code: "MR", dial: "+222" },
  { name: "Somalie", code: "SO", dial: "+252" },
  { name: "Soudan", code: "SD", dial: "+249" },
  { name: "Soudan du Sud", code: "SS", dial: "+211" },
  { name: "Érythrée", code: "ER", dial: "+291" },
  { name: "Djibouti", code: "DJ", dial: "+253" },
  { name: "Malawi", code: "MW", dial: "+265" },
  { name: "Namibie", code: "NA", dial: "+264" },
  { name: "Botswana", code: "BW", dial: "+267" },
  { name: "Eswatini", code: "SZ", dial: "+268" },
  { name: "Lesotho", code: "LS", dial: "+266" },
  { name: "Gambie", code: "GM", dial: "+220" },
  { name: "Cabo Verde", code: "CV", dial: "+238" },
  { name: "Comores", code: "KM", dial: "+269" },
  { name: "Maurice", code: "MU", dial: "+230" },
  { name: "Seychelles", code: "SC", dial: "+248" },
  { name: "São Tomé", code: "ST", dial: "+239" },
  { name: "Libye", code: "LY", dial: "+218" },
  { name: "Guinée-Bissau", code: "GW", dial: "+245" }
];

export const DRC_CITIES = [
  "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani",
  "Bukavu", "Goma", "Tshikapa", "Kolwezi", "Likasi",
  "Matadi", "Kikwit", "Uvira", "Bunia", "Mbandaka",
  "Boma", "Kalemie", "Mwene-Ditu", "Isiro", "Kindu",
  "Beni", "Butembo", "Gemena", "Bandundu", "Lisala",
  "Kamina", "Kipushi", "Fungurume", "Kasumbalesa", "Ilebo",
  "Tshilenge", "Lodja", "Bumba", "Gbadolite", "Zongo",
  "Inongo", "Boende", "Kabinda", "Kongolo", "Manono"
];

export const DEFAULT_PRODUCTS = [
  "Maïs", "Manioc", "Riz", "Haricots", "Tomates", "Arachides",
  "Bananes", "Pommes de terre", "Oignons", "Soja", "Café", "Cacao"
];

export const MOBILE_MONEY_PROVIDERS = [
  { id: "mpesa", name: "M-Pesa", color: "#E60000" },
  { id: "orange_money", name: "Orange Money", color: "#FF6600" },
  { id: "airtel_money", name: "Airtel Money", color: "#FF0000" },
  { id: "afrimoney", name: "Afrimoney", color: "#0066CC" },
  { id: "mtn_momo", name: "MTN MoMo", color: "#FFCC00" }
];

export const CONTRACT_TYPES = [
  { id: "vente_agricole", label: "Contrat de vente agricole" },
  { id: "achat", label: "Contrat d'achat" },
  { id: "fourniture", label: "Contrat de fourniture" },
  { id: "partenariat", label: "Contrat de partenariat" },
  { id: "personnalise", label: "Contrat personnalisé" }
];

export function countryFlag(code) {
  if (!code || code.length !== 2) return "🏳️";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export const LANGUAGES = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "ln", label: "Lingala", flag: "🇨🇩" },
  { id: "sw", label: "Swahili", flag: "🇹🇿" }
];

export const USER_ROLES = [
  { id: "agriculteur", label: "Agriculteur" },
  { id: "cooperative", label: "Coopérative agricole" },
  { id: "grossiste", label: "Grossiste" },
  { id: "commercant", label: "Commerçant" },
  { id: "boutiquier", label: "Boutiquier" },
  { id: "revendeur", label: "Revendeur" },
  { id: "marchand", label: "Marchand de marché" },
  { id: "acheteur", label: "Acheteur agricole" }
];