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
  { code: "BE", name: "Belgium", nameId: "Belgia" },
  { code: "AT", name: "Austria", nameId: "Austria" },
  { code: "SE", name: "Sweden", nameId: "Swedia" },
  { code: "NO", name: "Norway", nameId: "Norwegia" },
  { code: "DK", name: "Denmark", nameId: "Denmark" },
  { code: "FI", name: "Finland", nameId: "Finlandia" },
  { code: "IE", name: "Ireland", nameId: "Irlandia" },
  { code: "PT", name: "Portugal", nameId: "Portugal" },
  { code: "PL", name: "Poland", nameId: "Polandia" },
  { code: "SA", name: "Saudi Arabia", nameId: "Arab Saudi" },
  { code: "AE", name: "United Arab Emirates", nameId: "Uni Emirat Arab" },
  { code: "QA", name: "Qatar", nameId: "Qatar" },
  { code: "TR", name: "Turkey", nameId: "Turki" },
  { code: "IN", name: "India", nameId: "India" },
  { code: "BR", name: "Brazil", nameId: "Brasil" },
  { code: "MX", name: "Mexico", nameId: "Meksiko" },
  { code: "AR", name: "Argentina", nameId: "Argentina" },
  { code: "CL", name: "Chile", nameId: "Chili" },
  { code: "CO", name: "Colombia", nameId: "Kolombia" },
  { code: "ZA", name: "South Africa", nameId: "Afrika Selatan" },
  { code: "EG", name: "Egypt", nameId: "Mesir" },
];

export const INTERNATIONAL_REGIONS: Record<string, CountryRegion[]> = {
  // MALAYSIA
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

  // SINGAPORE
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

  // THAILAND
  TH: [
    { city: "Bangkok", province: "Bangkok", postalCode: "10100" },
    { city: "Nonthaburi", province: "Nonthaburi", postalCode: "11000" },
    { city: "Pak Kret", province: "Nonthaburi", postalCode: "11120" },
    { city: "Chiang Mai", province: "Chiang Mai", postalCode: "50000" },
    { city: "Phuket", province: "Phuket", postalCode: "83000" },
    { city: "Pattaya", province: "Chon Buri", postalCode: "20150" },
    { city: "Hat Yai", province: "Songkhla", postalCode: "90110" },
    { city: "Nakhon Ratchasima", province: "Nakhon Ratchasima", postalCode: "30000" },
    { city: "Udon Thani", province: "Udon Thani", postalCode: "41000" },
    { city: "Surat Thani", province: "Surat Thani", postalCode: "84000" },
    { city: "Khon Kaen", province: "Khon Kaen", postalCode: "40000" },
    { city: "Hua Hin", province: "Prachuap Khiri Khan", postalCode: "77110" },
    { city: "Chiang Rai", province: "Chiang Rai", postalCode: "57000" },
    { city: "Ubon Ratchathani", province: "Ubon Ratchathani", postalCode: "34000" },
    { city: "Nakhon Si Thammarat", province: "Nakhon Si Thammarat", postalCode: "80000" },
  ],

  // PHILIPPINES
  PH: [
    { city: "Quezon City", province: "Metro Manila", postalCode: "1100" },
    { city: "Manila", province: "Metro Manila", postalCode: "1000" },
    { city: "Makati", province: "Metro Manila", postalCode: "1200" },
    { city: "Taguig", province: "Metro Manila", postalCode: "1630" },
    { city: "Pasig", province: "Metro Manila", postalCode: "1600" },
    { city: "Cebu City", province: "Cebu", postalCode: "6000" },
    { city: "Davao City", province: "Davao del Sur", postalCode: "8000" },
    { city: "Caloocan", province: "Metro Manila", postalCode: "1400" },
    { city: "Zamboanga City", province: "Zamboanga del Sur", postalCode: "7000" },
    { city: "Parañaque", province: "Metro Manila", postalCode: "1700" },
    { city: "Cagayan de Oro", province: "Misamis Oriental", postalCode: "9000" },
    { city: "Bacolod", province: "Negros Occidental", postalCode: "6100" },
    { city: "Iloilo City", province: "Iloilo", postalCode: "5000" },
    { city: "Baguio", province: "Benguet", postalCode: "2600" },
    { city: "General Santos", province: "South Cotabato", postalCode: "9500" },
    { city: "Angeles", province: "Pampanga", postalCode: "2009" },
  ],

  // VIETNAM
  VN: [
    { city: "Ho Chi Minh City", province: "Ho Chi Minh City", postalCode: "70000" },
    { city: "Hanoi", province: "Hanoi", postalCode: "10000" },
    { city: "Da Nang", province: "Da Nang", postalCode: "55000" },
    { city: "Hai Phong", province: "Hai Phong", postalCode: "18000" },
    { city: "Can Tho", province: "Can Tho", postalCode: "90000" },
    { city: "Bien Hoa", province: "Dong Nai", postalCode: "81000" },
    { city: "Nha Trang", province: "Khanh Hoa", postalCode: "65000" },
    { city: "Hue", province: "Thua Thien Hue", postalCode: "53000" },
    { city: "Vung Tau", province: "Ba Ria-Vung Tau", postalCode: "79000" },
    { city: "Da Lat", province: "Lam Dong", postalCode: "67000" },
    { city: "Buon Ma Thuot", province: "Dak Lak", postalCode: "63000" },
    { city: "Quy Nhon", province: "Binh Dinh", postalCode: "59000" },
    { city: "Ha Long", province: "Quang Ninh", postalCode: "20000" },
  ],

  // BRUNEI DARUSSALAM
  BN: [
    { city: "Bandar Seri Begawan", province: "Brunei-Muara", postalCode: "BS8811" },
    { city: "Kuala Belait", province: "Belait", postalCode: "KA1131" },
    { city: "Seria", province: "Belait", postalCode: "KB1133" },
    { city: "Tutong", province: "Tutong", postalCode: "TA1141" },
    { city: "Bangar", province: "Temburong", postalCode: "PA1151" },
    { city: "Muara", province: "Brunei-Muara", postalCode: "BT1128" },
    { city: "Gadong", province: "Brunei-Muara", postalCode: "BE1118" },
    { city: "Jerudong", province: "Brunei-Muara", postalCode: "BG3122" },
  ],

  // JAPAN
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
    { city: "Saitama", province: "Saitama", postalCode: "330-0063" },
    { city: "Hiroshima", province: "Hiroshima", postalCode: "730-0001" },
    { city: "Sendai", province: "Miyagi", postalCode: "980-0001" },
    { city: "Chiba", province: "Chiba", postalCode: "260-0001" },
    { city: "Kitakyushu", province: "Fukuoka", postalCode: "803-0801" },
    { city: "Naha", province: "Okinawa", postalCode: "900-0001" },
  ],

  // SOUTH KOREA
  KR: [
    { city: "Seoul", province: "Seoul Capital Area", postalCode: "03000" },
    { city: "Busan", province: "Gyeongsangnam-do", postalCode: "48000" },
    { city: "Incheon", province: "Sudogwon", postalCode: "22000" },
    { city: "Daegu", province: "Gyeongsangbuk-do", postalCode: "41000" },
    { city: "Daejeon", province: "Chungcheongnam-do", postalCode: "35000" },
    { city: "Gwangju", province: "Jeollanam-do", postalCode: "61000" },
    { city: "Suwon", province: "Gyeonggi-do", postalCode: "16000" },
    { city: "Ulsan", province: "Gyeongsangnam-do", postalCode: "44000" },
    { city: "Changwon", province: "Gyeongsangnam-do", postalCode: "51000" },
    { city: "Seongnam", province: "Gyeonggi-do", postalCode: "13000" },
    { city: "Goyang", province: "Gyeonggi-do", postalCode: "10000" },
    { city: "Yongin", province: "Gyeonggi-do", postalCode: "17000" },
    { city: "Cheongju", province: "Chungcheongbuk-do", postalCode: "28000" },
    { city: "Jeonju", province: "Jeollabuk-do", postalCode: "55000" },
    { city: "Jeju City", province: "Jeju-do", postalCode: "63000" },
  ],

  // CHINA
  CN: [
    { city: "Beijing", province: "Beijing Municipality", postalCode: "100000" },
    { city: "Shanghai", province: "Shanghai Municipality", postalCode: "200000" },
    { city: "Guangzhou", province: "Guangdong", postalCode: "510000" },
    { city: "Shenzhen", province: "Guangdong", postalCode: "518000" },
    { city: "Chengdu", province: "Sichuan", postalCode: "610000" },
    { city: "Hangzhou", province: "Zhejiang", postalCode: "310000" },
    { city: "Wuhan", province: "Hubei", postalCode: "430000" },
    { city: "Chongqing", province: "Chongqing Municipality", postalCode: "400000" },
    { city: "Nanjing", province: "Jiangsu", postalCode: "210000" },
    { city: "Xi'an", province: "Shaanxi", postalCode: "710000" },
    { city: "Tianjin", province: "Tianjin Municipality", postalCode: "300000" },
    { city: "Suzhou", province: "Jiangsu", postalCode: "215000" },
    { city: "Qingdao", province: "Shandong", postalCode: "266000" },
    { city: "Xiamen", province: "Fujian", postalCode: "361000" },
    { city: "Changsha", province: "Hunan", postalCode: "410000" },
    { city: "Kunming", province: "Yunnan", postalCode: "650000" },
  ],

  // HONG KONG
  HK: [
    { city: "Central", province: "Hong Kong Island", postalCode: "999077" },
    { city: "Wan Chai", province: "Hong Kong Island", postalCode: "999077" },
    { city: "Causeway Bay", province: "Hong Kong Island", postalCode: "999077" },
    { city: "Tsim Sha Tsui", province: "Kowloon", postalCode: "999077" },
    { city: "Mong Kok", province: "Kowloon", postalCode: "999077" },
    { city: "Kowloon City", province: "Kowloon", postalCode: "999077" },
    { city: "Kwun Tong", province: "Kowloon", postalCode: "999077" },
    { city: "Sha Tin", province: "New Territories", postalCode: "999077" },
    { city: "Tsuen Wan", province: "New Territories", postalCode: "999077" },
    { city: "Tuen Mun", province: "New Territories", postalCode: "999077" },
    { city: "Yuen Long", province: "New Territories", postalCode: "999077" },
    { city: "Tai Po", province: "New Territories", postalCode: "999077" },
  ],

  // TAIWAN
  TW: [
    { city: "Taipei City", province: "Taipei", postalCode: "100" },
    { city: "New Taipei City", province: "New Taipei", postalCode: "220" },
    { city: "Kaohsiung City", province: "Kaohsiung", postalCode: "800" },
    { city: "Taichung City", province: "Taichung", postalCode: "400" },
    { city: "Tainan City", province: "Tainan", postalCode: "700" },
    { city: "Taoyuan City", province: "Taoyuan", postalCode: "330" },
    { city: "Hsinchu City", province: "Hsinchu", postalCode: "300" },
    { city: "Keelung City", province: "Keelung", postalCode: "200" },
    { city: "Chiayi City", province: "Chiayi", postalCode: "600" },
    { city: "Hualien City", province: "Hualien", postalCode: "970" },
    { city: "Yilan City", province: "Yilan", postalCode: "260" },
  ],

  // AUSTRALIA
  AU: [
    { city: "Sydney", province: "New South Wales", postalCode: "2000" },
    { city: "Melbourne", province: "Victoria", postalCode: "3000" },
    { city: "Brisbane", province: "Queensland", postalCode: "4000" },
    { city: "Perth", province: "Western Australia", postalCode: "6000" },
    { city: "Adelaide", province: "South Australia", postalCode: "5000" },
    { city: "Gold Coast", province: "Queensland", postalCode: "4217" },
    { city: "Canberra", province: "Australian Capital Territory", postalCode: "2600" },
    { city: "Newcastle", province: "New South Wales", postalCode: "2300" },
    { city: "Wollongong", province: "New South Wales", postalCode: "2500" },
    { city: "Sunshine Coast", province: "Queensland", postalCode: "4551" },
    { city: "Hobart", province: "Tasmania", postalCode: "7000" },
    { city: "Geelong", province: "Victoria", postalCode: "3220" },
    { city: "Darwin", province: "Northern Territory", postalCode: "0800" },
  ],

  // NEW ZEALAND
  NZ: [
    { city: "Auckland", province: "Auckland Region", postalCode: "1010" },
    { city: "Wellington", province: "Wellington Region", postalCode: "6011" },
    { city: "Christchurch", province: "Canterbury", postalCode: "8011" },
    { city: "Hamilton", province: "Waikato", postalCode: "3204" },
    { city: "Tauranga", province: "Bay of Plenty", postalCode: "3110" },
    { city: "Dunedin", province: "Otago", postalCode: "9016" },
    { city: "Palmerston North", province: "Manawatū-Whanganui", postalCode: "4410" },
    { city: "Napier", province: "Hawke's Bay", postalCode: "4110" },
    { city: "Nelson", province: "Nelson Region", postalCode: "7010" },
    { city: "Rotorua", province: "Bay of Plenty", postalCode: "3010" },
    { city: "New Plymouth", province: "Taranaki", postalCode: "4310" },
    { city: "Whangārei", province: "Northland", postalCode: "0110" },
    { city: "Queenstown", province: "Otago", postalCode: "9300" },
  ],

  // UNITED STATES
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

  // UNITED KINGDOM
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
    { city: "Sheffield", province: "South Yorkshire", postalCode: "S1 2HH" },
    { city: "Cardiff", province: "Wales", postalCode: "CF10 1AA" },
    { city: "Belfast", province: "Northern Ireland", postalCode: "BT1 1AA" },
  ],

  // CANADA
  CA: [
    { city: "Toronto", province: "Ontario", postalCode: "M5H 2N2" },
    { city: "Montreal", province: "Quebec", postalCode: "H2Y 1C6" },
    { city: "Vancouver", province: "British Columbia", postalCode: "V6B 1A1" },
    { city: "Calgary", province: "Alberta", postalCode: "T2P 1J9" },
    { city: "Edmonton", province: "Alberta", postalCode: "T5J 0N3" },
    { city: "Ottawa", province: "Ontario", postalCode: "K1P 1J1" },
    { city: "Winnipeg", province: "Manitoba", postalCode: "R3C 0V8" },
    { city: "Quebec City", province: "Quebec", postalCode: "G1R 4P5" },
    { city: "Hamilton", province: "Ontario", postalCode: "L8P 1A1" },
    { city: "Kitchener", province: "Ontario", postalCode: "N2G 1A1" },
    { city: "Victoria", province: "British Columbia", postalCode: "V8W 1P5" },
    { city: "Halifax", province: "Nova Scotia", postalCode: "B3H 1A1" },
    { city: "London", province: "Ontario", postalCode: "N6A 1A1" },
    { city: "Saskatoon", province: "Saskatchewan", postalCode: "S7K 0A1" },
  ],

  // NETHERLANDS
  NL: [
    { city: "Amsterdam", province: "North Holland", postalCode: "1012 JS" },
    { city: "Rotterdam", province: "South Holland", postalCode: "3011 AA" },
    { city: "The Hague", province: "South Holland", postalCode: "2511 BT" },
    { city: "Utrecht", province: "Utrecht", postalCode: "3511 AZ" },
    { city: "Eindhoven", province: "North Brabant", postalCode: "5611 AA" },
    { city: "Groningen", province: "Groningen", postalCode: "9711 AA" },
    { city: "Tilburg", province: "North Brabant", postalCode: "5038 EA" },
    { city: "Almere", province: "Flevoland", postalCode: "1315 AA" },
    { city: "Breda", province: "North Brabant", postalCode: "4811 AA" },
    { city: "Nijmegen", province: "Gelderland", postalCode: "6511 AA" },
  ],

  // GERMANY
  DE: [
    { city: "Berlin", province: "Berlin", postalCode: "10115" },
    { city: "Munich", province: "Bavaria", postalCode: "80331" },
    { city: "Frankfurt", province: "Hesse", postalCode: "60311" },
    { city: "Hamburg", province: "Hamburg", postalCode: "20095" },
    { city: "Cologne", province: "North Rhine-Westphalia", postalCode: "50667" },
    { city: "Stuttgart", province: "Baden-Württemberg", postalCode: "70173" },
    { city: "Düsseldorf", province: "North Rhine-Westphalia", postalCode: "40213" },
    { city: "Leipzig", province: "Saxony", postalCode: "04109" },
    { city: "Dortmund", province: "North Rhine-Westphalia", postalCode: "44137" },
    { city: "Essen", province: "North Rhine-Westphalia", postalCode: "45127" },
    { city: "Bremen", province: "Bremen", postalCode: "28195" },
    { city: "Dresden", province: "Saxony", postalCode: "01067" },
    { city: "Hanover", province: "Lower Saxony", postalCode: "30159" },
    { city: "Nuremberg", province: "Bavaria", postalCode: "90403" },
  ],

  // FRANCE
  FR: [
    { city: "Paris", province: "Île-de-France", postalCode: "75001" },
    { city: "Marseille", province: "Provence-Alpes-Côte d'Azur", postalCode: "13001" },
    { city: "Lyon", province: "Auvergne-Rhône-Alpes", postalCode: "69001" },
    { city: "Toulouse", province: "Occitanie", postalCode: "31000" },
    { city: "Nice", province: "Provence-Alpes-Côte d'Azur", postalCode: "06000" },
    { city: "Nantes", province: "Pays de la Loire", postalCode: "44000" },
    { city: "Montpellier", province: "Occitanie", postalCode: "34000" },
    { city: "Strasbourg", province: "Grand Est", postalCode: "67000" },
    { city: "Bordeaux", province: "Nouvelle-Aquitaine", postalCode: "33000" },
    { city: "Lille", province: "Hauts-de-France", postalCode: "59000" },
    { city: "Rennes", province: "Brittany", postalCode: "35000" },
    { city: "Reims", province: "Grand Est", postalCode: "51100" },
    { city: "Toulon", province: "Provence-Alpes-Côte d'Azur", postalCode: "83000" },
    { city: "Grenoble", province: "Auvergne-Rhône-Alpes", postalCode: "38000" },
  ],

  // ITALY
  IT: [
    { city: "Rome", province: "Lazio", postalCode: "00118" },
    { city: "Milan", province: "Lombardy", postalCode: "20121" },
    { city: "Naples", province: "Campania", postalCode: "80121" },
    { city: "Turin", province: "Piedmont", postalCode: "10121" },
    { city: "Palermo", province: "Sicily", postalCode: "90121" },
    { city: "Genoa", province: "Liguria", postalCode: "16121" },
    { city: "Bologna", province: "Emilia-Romagna", postalCode: "40121" },
    { city: "Florence", province: "Tuscany", postalCode: "50121" },
    { city: "Bari", province: "Apulia", postalCode: "70121" },
    { city: "Catania", province: "Sicily", postalCode: "95121" },
    { city: "Venice", province: "Veneto", postalCode: "30121" },
    { city: "Verona", province: "Veneto", postalCode: "37121" },
  ],

  // SPAIN
  ES: [
    { city: "Madrid", province: "Community of Madrid", postalCode: "28001" },
    { city: "Barcelona", province: "Catalonia", postalCode: "08001" },
    { city: "Valencia", province: "Valencian Community", postalCode: "46001" },
    { city: "Seville", province: "Andalusia", postalCode: "41001" },
    { city: "Zaragoza", province: "Aragon", postalCode: "50001" },
    { city: "Málaga", province: "Andalusia", postalCode: "29001" },
    { city: "Murcia", province: "Region of Murcia", postalCode: "30001" },
    { city: "Palma de Mallorca", province: "Balearic Islands", postalCode: "07001" },
    { city: "Las Palmas", province: "Canary Islands", postalCode: "35001" },
    { city: "Bilbao", province: "Basque Country", postalCode: "48001" },
    { city: "Alicante", province: "Valencian Community", postalCode: "03001" },
    { city: "Granada", province: "Andalusia", postalCode: "18001" },
  ],

  // SWITZERLAND
  CH: [
    { city: "Zurich", province: "Canton of Zurich", postalCode: "8001" },
    { city: "Geneva", province: "Canton of Geneva", postalCode: "1201" },
    { city: "Basel", province: "Basel-Stadt", postalCode: "4001" },
    { city: "Lausanne", province: "Vaud", postalCode: "1003" },
    { city: "Bern", province: "Canton of Bern", postalCode: "3001" },
    { city: "Winterthur", province: "Canton of Zurich", postalCode: "8400" },
    { city: "Lucerne", province: "Canton of Lucerne", postalCode: "6003" },
    { city: "St. Gallen", province: "Canton of St. Gallen", postalCode: "9000" },
    { city: "Lugano", province: "Ticino", postalCode: "6900" },
  ],

  // BELGIUM
  BE: [
    { city: "Brussels", province: "Brussels-Capital Region", postalCode: "1000" },
    { city: "Antwerp", province: "Antwerp", postalCode: "2000" },
    { city: "Ghent", province: "East Flanders", postalCode: "9000" },
    { city: "Charleroi", province: "Hainaut", postalCode: "6000" },
    { city: "Liège", province: "Liège", postalCode: "4000" },
    { city: "Bruges", province: "West Flanders", postalCode: "8000" },
    { city: "Namur", province: "Namur", postalCode: "5000" },
    { city: "Leuven", province: "Flemish Brabant", postalCode: "3000" },
  ],

  // AUSTRIA
  AT: [
    { city: "Vienna", province: "Vienna", postalCode: "1010" },
    { city: "Graz", province: "Styria", postalCode: "8010" },
    { city: "Linz", province: "Upper Austria", postalCode: "4020" },
    { city: "Salzburg", province: "Salzburg", postalCode: "5020" },
    { city: "Innsbruck", province: "Tyrol", postalCode: "6020" },
    { city: "Klagenfurt", province: "Carinthia", postalCode: "9020" },
    { city: "Villach", province: "Carinthia", postalCode: "9500" },
    { city: "Wels", province: "Upper Austria", postalCode: "4600" },
  ],

  // SWEDEN
  SE: [
    { city: "Stockholm", province: "Stockholm County", postalCode: "111 21" },
    { city: "Gothenburg", province: "Västra Götaland", postalCode: "411 01" },
    { city: "Malmö", province: "Skåne", postalCode: "211 11" },
    { city: "Uppsala", province: "Uppsala County", postalCode: "753 10" },
    { city: "Västerås", province: "Västmanland", postalCode: "722 11" },
    { city: "Örebro", province: "Örebro County", postalCode: "702 10" },
    { city: "Linköping", province: "Östergötland", postalCode: "582 22" },
    { city: "Helsingborg", province: "Skåne", postalCode: "252 20" },
  ],

  // NORWAY
  NO: [
    { city: "Oslo", province: "Oslo", postalCode: "0150" },
    { city: "Bergen", province: "Vestland", postalCode: "5003" },
    { city: "Trondheim", province: "Trøndelag", postalCode: "7011" },
    { city: "Stavanger", province: "Rogaland", postalCode: "4005" },
    { city: "Bærum", province: "Akershus", postalCode: "1337" },
    { city: "Kristiansand", province: "Agder", postalCode: "4610" },
    { city: "Drammen", province: "Buskerud", postalCode: "3015" },
    { city: "Tromsø", province: "Troms", postalCode: "9008" },
  ],

  // DENMARK
  DK: [
    { city: "Copenhagen", province: "Capital Region of Denmark", postalCode: "1050" },
    { city: "Aarhus", province: "Central Denmark Region", postalCode: "8000" },
    { city: "Odense", province: "Region of Southern Denmark", postalCode: "5000" },
    { city: "Aalborg", province: "North Denmark Region", postalCode: "9000" },
    { city: "Esbjerg", province: "Region of Southern Denmark", postalCode: "6700" },
    { city: "Randers", province: "Central Denmark Region", postalCode: "8900" },
    { city: "Kolding", province: "Region of Southern Denmark", postalCode: "6000" },
    { city: "Horsens", province: "Central Denmark Region", postalCode: "8700" },
  ],

  // FINLAND
  FI: [
    { city: "Helsinki", province: "Uusimaa", postalCode: "00100" },
    { city: "Espoo", province: "Uusimaa", postalCode: "02100" },
    { city: "Tampere", province: "Pirkanmaa", postalCode: "33100" },
    { city: "Vantaa", province: "Uusimaa", postalCode: "01300" },
    { city: "Oulu", province: "North Ostrobothnia", postalCode: "90100" },
    { city: "Turku", province: "Southwest Finland", postalCode: "20100" },
    { city: "Jyväskylä", province: "Central Finland", postalCode: "40100" },
    { city: "Lahti", province: "Päijät-Häme", postalCode: "15110" },
  ],

  // IRELAND
  IE: [
    { city: "Dublin", province: "Leinster", postalCode: "D01 A1B2" },
    { city: "Cork", province: "Munster", postalCode: "T12 A1B2" },
    { city: "Galway", province: "Connacht", postalCode: "H91 A1B2" },
    { city: "Limerick", province: "Munster", postalCode: "V94 A1B2" },
    { city: "Waterford", province: "Munster", postalCode: "X91 A1B2" },
    { city: "Drogheda", province: "Leinster", postalCode: "A92 A1B2" },
    { city: "Dundalk", province: "Leinster", postalCode: "A91 A1B2" },
    { city: "Swords", province: "Leinster", postalCode: "K67 A1B2" },
  ],

  // PORTUGAL
  PT: [
    { city: "Lisbon", province: "Lisbon District", postalCode: "1000-001" },
    { city: "Porto", province: "Porto District", postalCode: "4000-001" },
    { city: "Vila Nova de Gaia", province: "Porto District", postalCode: "4400-001" },
    { city: "Amadora", province: "Lisbon District", postalCode: "2700-001" },
    { city: "Braga", province: "Braga District", postalCode: "4700-001" },
    { city: "Funchal", province: "Madeira", postalCode: "9000-001" },
    { city: "Coimbra", province: "Coimbra District", postalCode: "3000-001" },
    { city: "Setúbal", province: "Setúbal District", postalCode: "2900-001" },
  ],

  // POLAND
  PL: [
    { city: "Warsaw", province: "Masovian", postalCode: "00-001" },
    { city: "Kraków", province: "Lesser Poland", postalCode: "30-001" },
    { city: "Łódź", province: "Łódź", postalCode: "90-001" },
    { city: "Wrocław", province: "Lower Silesian", postalCode: "50-001" },
    { city: "Poznań", province: "Greater Poland", postalCode: "60-001" },
    { city: "Gdańsk", province: "Pomeranian", postalCode: "80-001" },
    { city: "Szczecin", province: "West Pomeranian", postalCode: "70-001" },
    { city: "Bydgoszcz", province: "Kuyavian-Pomeranian", postalCode: "85-001" },
    { city: "Lublin", province: "Lublin", postalCode: "20-001" },
    { city: "Katowice", province: "Silesian", postalCode: "40-001" },
  ],

  // SAUDI ARABIA
  SA: [
    { city: "Riyadh", province: "Riyadh Province", postalCode: "11564" },
    { city: "Jeddah", province: "Makkah Province", postalCode: "21589" },
    { city: "Mecca", province: "Makkah Province", postalCode: "24231" },
    { city: "Medina", province: "Al Madinah Province", postalCode: "42311" },
    { city: "Dammam", province: "Eastern Province", postalCode: "31411" },
    { city: "Khobar", province: "Eastern Province", postalCode: "31952" },
    { city: "Tabuk", province: "Tabuk Province", postalCode: "47512" },
    { city: "Buraidah", province: "Al-Qassim Province", postalCode: "51411" },
    { city: "Abha", province: "Asir Province", postalCode: "61411" },
    { city: "Taif", province: "Makkah Province", postalCode: "21944" },
    { city: "Jubail", province: "Eastern Province", postalCode: "31951" },
  ],

  // UNITED ARAB EMIRATES
  AE: [
    { city: "Dubai", province: "Emirate of Dubai", postalCode: "00000" },
    { city: "Abu Dhabi", province: "Emirate of Abu Dhabi", postalCode: "00000" },
    { city: "Sharjah", province: "Emirate of Sharjah", postalCode: "00000" },
    { city: "Al Ain", province: "Emirate of Abu Dhabi", postalCode: "00000" },
    { city: "Ajman", province: "Emirate of Ajman", postalCode: "00000" },
    { city: "Ras Al Khaimah", province: "Emirate of Ras Al Khaimah", postalCode: "00000" },
    { city: "Fujairah", province: "Emirate of Fujairah", postalCode: "00000" },
    { city: "Umm Al Quwain", province: "Emirate of Umm Al Quwain", postalCode: "00000" },
  ],

  // QATAR
  QA: [
    { city: "Doha", province: "Ad Dawhah", postalCode: "00000" },
    { city: "Al Rayyan", province: "Al Rayyan", postalCode: "00000" },
    { city: "Al Wakrah", province: "Al Wakrah", postalCode: "00000" },
    { city: "Al Khor", province: "Al Khor", postalCode: "00000" },
    { city: "Umm Salal", province: "Umm Salal", postalCode: "00000" },
    { city: "Al Daayen", province: "Al Daayen", postalCode: "00000" },
    { city: "Lusail", province: "Al Daayen", postalCode: "00000" },
    { city: "Mesaieed", province: "Al Wakrah", postalCode: "00000" },
  ],

  // TURKEY
  TR: [
    { city: "Istanbul", province: "Marmara", postalCode: "34000" },
    { city: "Ankara", province: "Central Anatolia", postalCode: "06000" },
    { city: "Izmir", province: "Aegean", postalCode: "35000" },
    { city: "Bursa", province: "Marmara", postalCode: "16000" },
    { city: "Antalya", province: "Mediterranean", postalCode: "07000" },
    { city: "Adana", province: "Mediterranean", postalCode: "01000" },
    { city: "Konya", province: "Central Anatolia", postalCode: "42000" },
    { city: "Gaziantep", province: "Southeastern Anatolia", postalCode: "27000" },
    { city: "Mersin", province: "Mediterranean", postalCode: "33000" },
    { city: "Diyarbakir", province: "Southeastern Anatolia", postalCode: "21000" },
    { city: "Kayseri", province: "Central Anatolia", postalCode: "38000" },
    { city: "Eskisehir", province: "Central Anatolia", postalCode: "26000" },
    { city: "Trabzon", province: "Black Sea", postalCode: "61000" },
  ],

  // INDIA
  IN: [
    { city: "Mumbai", province: "Maharashtra", postalCode: "400001" },
    { city: "Delhi", province: "National Capital Territory of Delhi", postalCode: "110001" },
    { city: "Bengaluru", province: "Karnataka", postalCode: "560001" },
    { city: "Hyderabad", province: "Telangana", postalCode: "500001" },
    { city: "Ahmedabad", province: "Gujarat", postalCode: "380001" },
    { city: "Chennai", province: "Tamil Nadu", postalCode: "600001" },
    { city: "Kolkata", province: "West Bengal", postalCode: "700001" },
    { city: "Surat", province: "Gujarat", postalCode: "395001" },
    { city: "Pune", province: "Maharashtra", postalCode: "411001" },
    { city: "Jaipur", province: "Rajasthan", postalCode: "302001" },
    { city: "Lucknow", province: "Uttar Pradesh", postalCode: "226001" },
    { city: "Kanpur", province: "Uttar Pradesh", postalCode: "208001" },
    { city: "Nagpur", province: "Maharashtra", postalCode: "440001" },
    { city: "Indore", province: "Madhya Pradesh", postalCode: "452001" },
    { city: "Kochi", province: "Kerala", postalCode: "682001" },
  ],

  // BRAZIL
  BR: [
    { city: "São Paulo", province: "São Paulo", postalCode: "01000-000" },
    { city: "Rio de Janeiro", province: "Rio de Janeiro", postalCode: "20000-000" },
    { city: "Brasília", province: "Federal District", postalCode: "70000-000" },
    { city: "Salvador", province: "Bahia", postalCode: "40000-000" },
    { city: "Fortaleza", province: "Ceará", postalCode: "60000-000" },
    { city: "Belo Horizonte", province: "Minas Gerais", postalCode: "30000-000" },
    { city: "Manaus", province: "Amazonas", postalCode: "69000-000" },
    { city: "Curitiba", province: "Paraná", postalCode: "80000-000" },
    { city: "Recife", province: "Pernambuco", postalCode: "50000-000" },
    { city: "Porto Alegre", province: "Rio Grande do Sul", postalCode: "90000-000" },
    { city: "Belém", province: "Pará", postalCode: "66000-000" },
    { city: "Goiânia", province: "Goiás", postalCode: "74000-000" },
    { city: "Campinas", province: "São Paulo", postalCode: "13000-000" },
  ],

  // MEXICO
  MX: [
    { city: "Mexico City", province: "Ciudad de México", postalCode: "01000" },
    { city: "Tijuana", province: "Baja California", postalCode: "22000" },
    { city: "Guadalajara", province: "Jalisco", postalCode: "44100" },
    { city: "Monterrey", province: "Nuevo León", postalCode: "64000" },
    { city: "Puebla", province: "Puebla", postalCode: "72000" },
    { city: "Ciudad Juárez", province: "Chihuahua", postalCode: "32000" },
    { city: "León", province: "Guanajuato", postalCode: "37000" },
    { city: "Zapopan", province: "Jalisco", postalCode: "45010" },
    { city: "Mérida", province: "Yucatán", postalCode: "97000" },
    { city: "Cancún", province: "Quintana Roo", postalCode: "77500" },
    { city: "Chihuahua", province: "Chihuahua", postalCode: "31000" },
  ],

  // ARGENTINA
  AR: [
    { city: "Buenos Aires", province: "Autonomous City of Buenos Aires", postalCode: "C1000" },
    { city: "Córdoba", province: "Córdoba", postalCode: "X5000" },
    { city: "Rosario", province: "Santa Fe", postalCode: "S2000" },
    { city: "Mendoza", province: "Mendoza", postalCode: "M5500" },
    { city: "La Plata", province: "Buenos Aires", postalCode: "B1900" },
    { city: "San Miguel de Tucumán", province: "Tucumán", postalCode: "T4000" },
    { city: "Mar del Plata", province: "Buenos Aires", postalCode: "B7600" },
    { city: "Salta", province: "Salta", postalCode: "A4400" },
  ],

  // CHILE
  CL: [
    { city: "Santiago", province: "Santiago Metropolitan Region", postalCode: "8320000" },
    { city: "Valparaíso", province: "Valparaíso Region", postalCode: "2340000" },
    { city: "Viña del Mar", province: "Valparaíso Region", postalCode: "2520000" },
    { city: "Concepción", province: "Biobío Region", postalCode: "4030000" },
    { city: "Antofagasta", province: "Antofagasta Region", postalCode: "1240000" },
    { city: "La Serena", province: "Coquimbo Region", postalCode: "1700000" },
    { city: "Temuco", province: "Araucanía Region", postalCode: "4780000" },
    { city: "Puerto Montt", province: "Los Lagos Region", postalCode: "5480000" },
  ],

  // COLOMBIA
  CO: [
    { city: "Bogotá", province: "Bogotá D.C.", postalCode: "110111" },
    { city: "Medellín", province: "Antioquia", postalCode: "050001" },
    { city: "Cali", province: "Valle del Cauca", postalCode: "760001" },
    { city: "Barranquilla", province: "Atlántico", postalCode: "080001" },
    { city: "Cartagena", province: "Bolívar", postalCode: "130001" },
    { city: "Cúcuta", province: "Norte de Santander", postalCode: "540001" },
    { city: "Bucaramanga", province: "Santander", postalCode: "680001" },
    { city: "Pereira", province: "Risaralda", postalCode: "660001" },
    { city: "Santa Marta", province: "Magdalena", postalCode: "470001" },
  ],

  // SOUTH AFRICA
  ZA: [
    { city: "Johannesburg", province: "Gauteng", postalCode: "2000" },
    { city: "Cape Town", province: "Western Cape", postalCode: "8000" },
    { city: "Durban", province: "KwaZulu-Natal", postalCode: "4000" },
    { city: "Pretoria", province: "Gauteng", postalCode: "0001" },
    { city: "Gqeberha (Port Elizabeth)", province: "Eastern Cape", postalCode: "6001" },
    { city: "Bloemfontein", province: "Free State", postalCode: "9301" },
    { city: "East London", province: "Eastern Cape", postalCode: "5201" },
    { city: "Pietermaritzburg", province: "KwaZulu-Natal", postalCode: "3201" },
    { city: "Polokwane", province: "Limpopo", postalCode: "0700" },
    { city: "Nelspruit (Mbombela)", province: "Mpumalanga", postalCode: "1200" },
  ],

  // EGYPT
  EG: [
    { city: "Cairo", province: "Cairo Governorate", postalCode: "11511" },
    { city: "Alexandria", province: "Alexandria Governorate", postalCode: "21500" },
    { city: "Giza", province: "Giza Governorate", postalCode: "12511" },
    { city: "Shubra El Kheima", province: "Qalyubia Governorate", postalCode: "13511" },
    { city: "Port Said", province: "Port Said Governorate", postalCode: "42511" },
    { city: "Suez", province: "Suez Governorate", postalCode: "43511" },
    { city: "Mansoura", province: "Dakahlia Governorate", postalCode: "35511" },
    { city: "Tanta", province: "Gharbia Governorate", postalCode: "31511" },
    { city: "Asyut", province: "Asyut Governorate", postalCode: "71511" },
    { city: "Ismailia", province: "Ismailia Governorate", postalCode: "41511" },
    { city: "Aswan", province: "Aswan Governorate", postalCode: "81511" },
    { city: "Luxor", province: "Luxor Governorate", postalCode: "85951" },
    { city: "Hurghada", province: "Red Sea Governorate", postalCode: "84511" },
    { city: "Sharm El Sheikh", province: "South Sinai Governorate", postalCode: "46619" },
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

export function getCountryCanonicalName(nameOrCode?: string | null): string {
  const code = getCountryCode(nameOrCode);
  const found = COUNTRIES.find((c) => c.code === code);
  return found ? found.name : "Indonesia";
}

export function getCountryName(nameOrCode?: string | null, locale: "en" | "id" = "en"): string {
  if (!nameOrCode) return "Indonesia";
  const code = getCountryCode(nameOrCode);
  const found = COUNTRIES.find((c) => c.code === code);
  if (!found) return nameOrCode;
  return locale === "id" ? found.nameId : found.name;
}
