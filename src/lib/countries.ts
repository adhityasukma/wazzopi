export type CountryItem = {
  code: string;
  name: string;
  nameId: string;
};

export type CountryRegion = {
  city: string;
  province: string;
  postalCode?: string;
};

export const COUNTRIES: CountryItem[] = [
  { code: "ID", name: "Indonesia", nameId: "Indonesia" },
  { code: "MY", name: "Malaysia", nameId: "Malaysia" },
  { code: "SG", name: "Singapore", nameId: "Singapura" },
  { code: "TH", name: "Thailand", nameId: "Thailand" },
  { code: "PH", name: "Philippines", nameId: "Filipina" },
  { code: "VN", name: "Vietnam", nameId: "Vietnam" },
  { code: "BN", name: "Brunei Darussalam", nameId: "Brunei Darussalam" },
  { code: "JP", name: "Japan", nameId: "Jepang" },
  { code: "KR", name: "South Korea", nameId: "Korea Selatan" },
  { code: "CN", name: "China", nameId: "Tiongkok" },
  { code: "HK", name: "Hong Kong", nameId: "Hong Kong" },
  { code: "TW", name: "Taiwan", nameId: "Taiwan" },
  { code: "AU", name: "Australia", nameId: "Australia" },
  { code: "NZ", name: "New Zealand", nameId: "Selandia Baru" },
  { code: "US", name: "United States", nameId: "Amerika Serikat" },
  { code: "GB", name: "United Kingdom", nameId: "Inggris Raya" },
  { code: "CA", name: "Canada", nameId: "Kanada" },
  { code: "NL", name: "Netherlands", nameId: "Belanda" },
  { code: "DE", name: "Germany", nameId: "Jerman" },
  { code: "FR", name: "France", nameId: "Prancis" },
  { code: "IT", name: "Italy", nameId: "Italia" },
  { code: "ES", name: "Spain", nameId: "Spanyol" },
  { code: "CH", name: "Switzerland", nameId: "Swiss" },
  { code: "SA", name: "Saudi Arabia", nameId: "Arab Saudi" },
  { code: "AE", name: "United Arab Emirates", nameId: "Uni Emirat Arab" },
  { code: "QA", name: "Qatar", nameId: "Qatar" },
  { code: "TR", name: "Turkey", nameId: "Turki" },
  { code: "IN", name: "India", nameId: "India" },
  { code: "BR", name: "Brazil", nameId: "Brasil" },
  { code: "MX", name: "Mexico", nameId: "Meksiko" },
  { code: "ZA", name: "South Africa", nameId: "Afrika Selatan" },
  { code: "EG", name: "Egypt", nameId: "Mesir" },
];

export const INTERNATIONAL_REGIONS: Record<string, CountryRegion[]> = {
  MY: [
    { city: "Kuala Lumpur", province: "Wilayah Persekutuan Kuala Lumpur", postalCode: "50000" },
    { city: "Petaling Jaya", province: "Selangor", postalCode: "46000" },
    { city: "Shah Alam", province: "Selangor", postalCode: "40000" },
    { city: "Subang Jaya", province: "Selangor", postalCode: "47500" },
    { city: "Klang", province: "Selangor", postalCode: "41000" },
    { city: "George Town", province: "Pulau Pinang", postalCode: "10000" },
    { city: "Butterworth", province: "Pulau Pinang", postalCode: "12000" },
    { city: "Johor Bahru", province: "Johor", postalCode: "80000" },
    { city: "Iskandar Puteri", province: "Johor", postalCode: "79000" },
    { city: "Batu Pahat", province: "Johor", postalCode: "83000" },
    { city: "Ipoh", province: "Perak", postalCode: "30000" },
    { city: "Taiping", province: "Perak", postalCode: "34000" },
    { city: "Malacca City", province: "Melaka", postalCode: "75000" },
    { city: "Kota Kinabalu", province: "Sabah", postalCode: "88000" },
    { city: "Sandakan", province: "Sabah", postalCode: "90000" },
    { city: "Kuching", province: "Sarawak", postalCode: "93000" },
    { city: "Miri", province: "Sarawak", postalCode: "98000" },
    { city: "Kuantan", province: "Pahang", postalCode: "25000" },
    { city: "Alor Setar", province: "Kedah", postalCode: "05000" },
    { city: "Sungai Petani", province: "Kedah", postalCode: "08000" },
    { city: "Kota Bharu", province: "Kelantan", postalCode: "15000" },
    { city: "Kuala Terengganu", province: "Terengganu", postalCode: "20000" },
    { city: "Seremban", province: "Negeri Sembilan", postalCode: "70000" },
    { city: "Kangar", province: "Perlis", postalCode: "01000" },
    { city: "Putrajaya", province: "Wilayah Persekutuan Putrajaya", postalCode: "62000" },
    { city: "Labuan", province: "Wilayah Persekutuan Labuan", postalCode: "87000" },
  ],
  SG: [
    { city: "Central Area", province: "Central Region", postalCode: "018989" },
    { city: "Downtown Core", province: "Central Region", postalCode: "048581" },
    { city: "Orchard", province: "Central Region", postalCode: "238867" },
    { city: "Marina Bay", province: "Central Region", postalCode: "018956" },
    { city: "Bukit Merah", province: "Central Region", postalCode: "159471" },
    { city: "Queenstown", province: "Central Region", postalCode: "149043" },
    { city: "Bedok", province: "East Region", postalCode: "460200" },
    { city: "Tampines", province: "East Region", postalCode: "529538" },
    { city: "Pasir Ris", province: "East Region", postalCode: "519634" },
    { city: "Jurong East", province: "West Region", postalCode: "609602" },
    { city: "Jurong West", province: "West Region", postalCode: "640505" },
    { city: "Clementi", province: "West Region", postalCode: "129588" },
    { city: "Woodlands", province: "North Region", postalCode: "738344" },
    { city: "Sembawang", province: "North Region", postalCode: "757713" },
    { city: "Yishun", province: "North Region", postalCode: "768828" },
    { city: "Ang Mo Kio", province: "North-East Region", postalCode: "569814" },
    { city: "Hougang", province: "North-East Region", postalCode: "538766" },
    { city: "Sengkang", province: "North-East Region", postalCode: "545025" },
    { city: "Punggol", province: "North-East Region", postalCode: "828629" },
  ],
  US: [
    { city: "New York", province: "New York", postalCode: "10001" },
    { city: "Los Angeles", province: "California", postalCode: "90001" },
    { city: "Chicago", province: "Illinois", postalCode: "60601" },
    { city: "Houston", province: "Texas", postalCode: "77001" },
    { city: "Phoenix", province: "Arizona", postalCode: "85001" },
    { city: "Philadelphia", province: "Pennsylvania", postalCode: "19101" },
    { city: "San Antonio", province: "Texas", postalCode: "78201" },
    { city: "San Diego", province: "California", postalCode: "92101" },
    { city: "Dallas", province: "Texas", postalCode: "75201" },
    { city: "Austin", province: "Texas", postalCode: "73301" },
    { city: "San Jose", province: "California", postalCode: "95101" },
    { city: "San Francisco", province: "California", postalCode: "94101" },
    { city: "Seattle", province: "Washington", postalCode: "98101" },
    { city: "Denver", province: "Colorado", postalCode: "80201" },
    { city: "Boston", province: "Massachusetts", postalCode: "02101" },
    { city: "Miami", province: "Florida", postalCode: "33101" },
    { city: "Atlanta", province: "Georgia", postalCode: "30301" },
    { city: "Las Vegas", province: "Nevada", postalCode: "89101" },
    { city: "Portland", province: "Oregon", postalCode: "97201" },
    { city: "Washington", province: "District of Columbia", postalCode: "20001" },
  ],
  GB: [
    { city: "London", province: "Greater London", postalCode: "EC1A 1BB" },
    { city: "Manchester", province: "Greater Manchester", postalCode: "M1 1AE" },
    { city: "Birmingham", province: "West Midlands", postalCode: "B1 1AA" },
    { city: "Edinburgh", province: "Scotland", postalCode: "EH1 1YZ" },
    { city: "Glasgow", province: "Scotland", postalCode: "G1 1XQ" },
    { city: "Liverpool", province: "Merseyside", postalCode: "L1 1DP" },
    { city: "Leeds", province: "West Yorkshire", postalCode: "LS1 1UR" },
    { city: "Bristol", province: "South West", postalCode: "BS1 1AA" },
    { city: "Newcastle", province: "Tyne and Wear", postalCode: "NE1 1AD" },
    { city: "Cardiff", province: "Wales", postalCode: "CF10 1AA" },
    { city: "Belfast", province: "Northern Ireland", postalCode: "BT1 1AA" },
  ],
  AU: [
    { city: "Sydney", province: "New South Wales", postalCode: "2000" },
    { city: "Melbourne", province: "Victoria", postalCode: "3000" },
    { city: "Brisbane", province: "Queensland", postalCode: "4000" },
    { city: "Perth", province: "Western Australia", postalCode: "6000" },
    { city: "Adelaide", province: "South Australia", postalCode: "5000" },
    { city: "Gold Coast", province: "Queensland", postalCode: "4217" },
    { city: "Canberra", province: "Australian Capital Territory", postalCode: "2600" },
    { city: "Newcastle", province: "New South Wales", postalCode: "2300" },
    { city: "Hobart", province: "Tasmania", postalCode: "7000" },
    { city: "Darwin", province: "Northern Territory", postalCode: "0800" },
  ],
  JP: [
    { city: "Tokyo", province: "Tokyo", postalCode: "100-0001" },
    { city: "Yokohama", province: "Kanagawa", postalCode: "220-0001" },
    { city: "Osaka", province: "Osaka", postalCode: "530-0001" },
    { city: "Nagoya", province: "Aichi", postalCode: "460-0001" },
    { city: "Sapporo", province: "Hokkaido", postalCode: "060-0001" },
    { city: "Fukuoka", province: "Fukuoka", postalCode: "810-0001" },
    { city: "Kobe", province: "Hyogo", postalCode: "650-0001" },
    { city: "Kyoto", province: "Kyoto", postalCode: "600-0001" },
    { city: "Kawasaki", province: "Kanagawa", postalCode: "210-0001" },
    { city: "Hiroshima", province: "Hiroshima", postalCode: "730-0001" },
    { city: "Sendai", province: "Miyagi", postalCode: "980-0001" },
  ],
  SA: [
    { city: "Riyadh", province: "Riyadh Province", postalCode: "11564" },
    { city: "Jeddah", province: "Makkah Province", postalCode: "21589" },
    { city: "Mecca", province: "Makkah Province", postalCode: "24231" },
    { city: "Medina", province: "Al Madinah Province", postalCode: "42311" },
    { city: "Dammam", province: "Eastern Province", postalCode: "31411" },
    { city: "Khobar", province: "Eastern Province", postalCode: "31952" },
    { city: "Tabuk", province: "Tabuk Province", postalCode: "47512" },
  ],
  AE: [
    { city: "Dubai", province: "Emirate of Dubai", postalCode: "00000" },
    { city: "Abu Dhabi", province: "Emirate of Abu Dhabi", postalCode: "00000" },
    { city: "Sharjah", province: "Emirate of Sharjah", postalCode: "00000" },
    { city: "Ajman", province: "Emirate of Ajman", postalCode: "00000" },
    { city: "Ras Al Khaimah", province: "Emirate of Ras Al Khaimah", postalCode: "00000" },
    { city: "Fujairah", province: "Emirate of Fujairah", postalCode: "00000" },
  ],
  NL: [
    { city: "Amsterdam", province: "North Holland", postalCode: "1012 JS" },
    { city: "Rotterdam", province: "South Holland", postalCode: "3011 AA" },
    { city: "The Hague", province: "South Holland", postalCode: "2511 BT" },
    { city: "Utrecht", province: "Utrecht", postalCode: "3511 AZ" },
    { city: "Eindhoven", province: "North Brabant", postalCode: "5611 AA" },
  ],
  DE: [
    { city: "Berlin", province: "Berlin", postalCode: "10115" },
    { city: "Munich", province: "Bavaria", postalCode: "80331" },
    { city: "Frankfurt", province: "Hesse", postalCode: "60311" },
    { city: "Hamburg", province: "Hamburg", postalCode: "20095" },
    { city: "Cologne", province: "North Rhine-Westphalia", postalCode: "50667" },
  ],
};

export function getCountryCode(nameOrCode?: string | null): string {
  if (!nameOrCode) return "ID";
  const trimmed = nameOrCode.trim();
  const byCode = COUNTRIES.find((c) => c.code.toLowerCase() === trimmed.toLowerCase());
  if (byCode) return byCode.code;

  const byName = COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === trimmed.toLowerCase() ||
      c.nameId.toLowerCase() === trimmed.toLowerCase()
  );
  if (byName) return byName.code;

  return "ID";
}

export function getCountryName(nameOrCode?: string | null, locale: "en" | "id" = "en"): string {
  if (!nameOrCode) return "Indonesia";
  const code = getCountryCode(nameOrCode);
  const found = COUNTRIES.find((c) => c.code === code);
  if (!found) return nameOrCode;
  return locale === "id" ? found.nameId : found.name;
}
