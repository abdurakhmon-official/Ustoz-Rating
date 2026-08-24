import { PrismaClient } from '../generated/prisma';
import { hashPassword } from '../modules/auth';

const prisma = new PrismaClient();

const REGIONS: { name: string; districts: string[] }[] = [
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      'Nukus shahri', 'Amudaryo', 'Beruniy', 'Chimboy', "Ellikqal'a", 'Kegeyli', "Mo'ynoq",
      "Qanliko'l", "Qorao'zak", "Qo'ng'irot", 'Shumanay', "Taxtako'pir", "To'rtko'l", "Xo'jayli",
    ],
  },
  {
    name: 'Andijon viloyati',
    districts: [
      'Andijon shahri', 'Andijon tumani', 'Asaka', 'Baliqchi', "Bo'z", 'Buloqboshi', 'Izboskan',
      'Jalaquduq', "Xo'jaobod", "Qo'rg'ontepa", 'Marhamat', "Oltinko'l", 'Paxtaobod', 'Shahrixon',
      "Ulug'nor", 'Xonobod shahri',
    ],
  },
  {
    name: 'Buxoro viloyati',
    districts: [
      'Buxoro shahri', 'Buxoro tumani', "G'ijduvon", 'Jondor', 'Kogon shahri', 'Kogon tumani',
      'Olot', 'Peshku', "Qorako'l", 'Romitan', 'Shofirkon', 'Vobkent',
    ],
  },
  {
    name: "Farg'ona viloyati",
    districts: [
      "Farg'ona shahri", "Farg'ona tumani", 'Beshariq', "Bog'dod", 'Buvayda', "Dang'ara", 'Furqat',
      "Qo'shtepa", 'Quva', 'Quvasoy shahri', 'Rishton', 'So\'x', 'Toshloq', "Uchko'prik", 'Oltiariq',
      "O'zbekiston tumani", 'Yozyovon', "Marg'ilon shahri", "Qo'qon shahri",
    ],
  },
  {
    name: 'Jizzax viloyati',
    districts: [
      'Jizzax shahri', 'Arnasoy', 'Baxmal', "Do'stlik", 'Forish', "G'allaorol", 'Sharof Rashidov',
      'Zafarobod', 'Zarbdor', 'Zomin', 'Paxtakor', "Mirzacho'l",
    ],
  },
  {
    name: 'Xorazm viloyati',
    districts: [
      'Urganch shahri', 'Urganch tumani', "Bog'ot", 'Gurlan', 'Xazorasp', 'Xiva shahri', 'Xiva tumani',
      "Qo'shko'pir", 'Shovot', 'Yangiariq', 'Yangibozor', "Tuproqqal'a",
    ],
  },
  {
    name: 'Namangan viloyati',
    districts: [
      'Namangan shahri', 'Namangan tumani', 'Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq', 'Norin',
      'Pop', "To'raqo'rg'on", "Uchqo'rg'on", 'Uychi', "Yangiqo'rg'on", 'Davlatobod',
    ],
  },
  {
    name: 'Navoiy viloyati',
    districts: [
      'Navoiy shahri', 'Konimex', 'Karmana', 'Qiziltepa', 'Xatirchi', 'Nurota', 'Tomdi', 'Uchquduq',
      'Zarafshon shahri', 'Navbahor',
    ],
  },
  {
    name: 'Qashqadaryo viloyati',
    districts: [
      'Qarshi shahri', 'Qarshi tumani', 'Chiroqchi', 'Dehqonobod', "G'uzor", 'Kasbi', 'Kitob',
      'Koson', 'Mirishkor', 'Muborak', 'Nishon', 'Shahrisabz shahri', 'Shahrisabz tumani',
      "Yakkabog'", 'Kamashi',
    ],
  },
  {
    name: 'Samarqand viloyati',
    districts: [
      'Samarqand shahri', 'Samarqand tumani', "Bulung'ur", 'Ishtixon', 'Jomboy', "Kattaqo'rg'on shahri",
      "Kattaqo'rg'on tumani", 'Narpay', 'Nurobod', 'Oqdaryo', 'Payariq', "Pastdarg'om", 'Paxtachi',
      'Toyloq', 'Urgut', "Qo'shrabot",
    ],
  },
  {
    name: 'Sirdaryo viloyati',
    districts: [
      'Guliston shahri', 'Guliston tumani', 'Boyovut', 'Xovos', 'Mirzaobod', 'Oqoltin', 'Sardoba',
      'Sayxunobod', 'Sirdaryo tumani', 'Yangiyer shahri', 'Shirin shahri',
    ],
  },
  {
    name: 'Surxondaryo viloyati',
    districts: [
      'Termiz shahri', 'Angor', 'Bandixon', 'Boysun', 'Denov', "Jarqo'rg'on", 'Muzrabot', 'Oltinsoy',
      'Qiziriq', "Qumqo'rg'on", 'Sariosiyo', 'Sherobod', "Sho'rchi", 'Uzun',
    ],
  },
  {
    name: 'Toshkent viloyati',
    districts: [
      'Nurafshon shahri', 'Angren shahri', 'Bekobod shahri', 'Bekobod tumani', "Bo'stonliq", "Bo'ka",
      'Chinoz', 'Qibray', 'Ohangaron shahri', 'Ohangaron tumani', "Oqqo'rg'on", 'Parkent', 'Piskent',
      "Quyichirchiq", "Yangiyo'l shahri", "Yangiyo'l tumani", 'Yuqorichirchiq', "O'rtachirchiq",
      'Zangiota', 'Chirchiq shahri', 'Olmaliq shahri', 'Toshkent tumani',
    ],
  },
  {
    name: 'Toshkent shahri',
    districts: [
      'Bektemir', 'Chilonzor', 'Yashnobod', "Mirzo Ulug'bek", 'Mirobod', 'Sergeli', 'Shayxontohur',
      'Olmazor', 'Uchtepa', 'Yakkasaroy', 'Yunusobod',
    ],
  },
];

const SUBJECTS = [
  'Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Informatika', 'Ona tili', 'Adabiyot',
  "O'zbekiston tarixi", 'Jahon tarixi', 'Geografiya', 'Ingliz tili', 'Rus tili', 'Nemis tili',
  "Boshlang'ich ta'lim", "Maktabgacha ta'lim", 'Jismoniy tarbiya', 'Musiqa', "Tasviriy san'at",
  'Texnologiya',
];

const DEMO_SCHOOLS: { region: string; district: string; schools: string[] }[] = [
  { region: 'Toshkent shahri', district: 'Chilonzor', schools: ['1-maktab', '25-maktab', '50-maktab'] },
  { region: 'Samarqand viloyati', district: 'Samarqand shahri', schools: ['3-maktab', '12-maktab'] },
  { region: "Farg'ona viloyati", district: "Farg'ona shahri", schools: ['7-maktab'] },
];

async function seedGeo() {
  for (const [order, region] of REGIONS.entries()) {
    const createdRegion = await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: { name: region.name, order },
    });

    for (const [districtOrder, districtName] of region.districts.entries()) {
      await prisma.district.upsert({
        where: { regionId_name: { regionId: createdRegion.id, name: districtName } },
        update: {},
        create: { name: districtName, regionId: createdRegion.id, order: districtOrder },
      });
    }
  }
}

async function seedSubjects() {
  for (const [order, name] of SUBJECTS.entries()) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, order },
    });
  }
}

async function seedDemoSchools() {
  for (const group of DEMO_SCHOOLS) {
    const region = await prisma.region.findUnique({ where: { name: group.region } });
    if (!region) continue;

    const district = await prisma.district.findUnique({
      where: { regionId_name: { regionId: region.id, name: group.district } },
    });
    if (!district) continue;

    for (const schoolName of group.schools) {
      await prisma.school.upsert({
        where: { districtId_name: { districtId: district.id, name: schoolName } },
        update: {},
        create: { name: schoolName, regionId: region.id, districtId: district.id },
      });
    }
  }
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.user.create({
    data: {
      fullName: 'Administrator',
      email,
      password: await hashPassword(password),
      role: 'ADMIN',
      emailVerified: true,
    },
  });
}

async function main() {
  await seedGeo();
  await seedSubjects();
  await seedDemoSchools();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
