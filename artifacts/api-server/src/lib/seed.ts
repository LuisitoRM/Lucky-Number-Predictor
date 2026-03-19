import { db } from "@workspace/db";
import { jackpotsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { eq } from "drizzle-orm";

const BALOTO_JACKPOTS = [
  { sorteo: 3,    fecha: "08/09/2001", ciudad: "Bogotá",              monto: 9500,  n1:4,  n2:15, n3:20, n4:26, n5:31, especial:41, sorteosAcumulados: 0,   notas:"Sorteo #3" },
  { sorteo: 38,   fecha: "11/05/2002", ciudad: "Medellín",            monto: 4500,  n1:2,  n2:9,  n3:22, n4:29, n5:31, especial:35, sorteosAcumulados: 35,  notas:"Sorteo #38" },
  { sorteo: 84,   fecha: "19/10/2002", ciudad: "Bogotá",              monto: 11000, n1:4,  n2:5,  n3:10, n4:21, n5:23, especial:44, sorteosAcumulados: 46,  notas:"Sorteo #84" },
  { sorteo: 128,  fecha: "22/03/2003", ciudad: "Cali",                monto: 23000, n1:1,  n2:15, n3:25, n4:30, n5:40, especial:44, sorteosAcumulados: 44,  notas:"Sorteo #128" },
  { sorteo: 281,  fecha: "11/09/2004", ciudad: "Bogotá",              monto: 14000, n1:3,  n2:8,  n3:17, n4:18, n5:26, especial:31, sorteosAcumulados: 153, notas:"Sorteo #281" },
  { sorteo: 294,  fecha: "27/10/2004", ciudad: "Ibagué",              monto: 6000,  n1:4,  n2:15, n3:23, n4:26, n5:30, especial:42, sorteosAcumulados: 13,  notas:"Sorteo #294" },
  { sorteo: 379,  fecha: "20/08/2005", ciudad: "Pasto",               monto: 25000, n1:1,  n2:4,  n3:11, n4:12, n5:16, especial:43, sorteosAcumulados: 85,  notas:"Sorteo #379" },
  { sorteo: 394,  fecha: "12/10/2005", ciudad: "Barranquilla",        monto: 4000,  n1:2,  n2:10, n3:11, n4:14, n5:27, especial:29, sorteosAcumulados: 15,  notas:"Sorteo #394" },
  { sorteo: 484,  fecha: "23/08/2006", ciudad: "Medellín",            monto: 0,     n1:2,  n2:9,  n3:22, n4:29, n5:31, especial:35, sorteosAcumulados: 90,  notas:"Sorteo #484" },
  { sorteo: 563,  fecha: "26/05/2007", ciudad: "Bogotá",              monto: 0,     n1:12, n2:25, n3:34, n4:40, n5:41, especial:45, sorteosAcumulados: 79,  notas:"Sorteo #563" },
  { sorteo: 693,  fecha: "23/08/2008", ciudad: "Bogotá",              monto: 0,     n1:5,  n2:9,  n3:11, n4:20, n5:22, especial:38, sorteosAcumulados: 130, notas:"Sorteo #693" },
  { sorteo: 756,  fecha: "01/04/2009", ciudad: "Bogotá",              monto: 0,     n1:12, n2:17, n3:33, n4:35, n5:38, especial:43, sorteosAcumulados: 63,  notas:"Sorteo #756" },
  { sorteo: 823,  fecha: "21/11/2009", ciudad: "Cali",                monto: 0,     n1:5,  n2:24, n3:34, n4:36, n5:41, especial:44, sorteosAcumulados: 67,  notas:"Sorteo #823" },
  { sorteo: 901,  fecha: "18/08/2010", ciudad: "Medellín",            monto: 0,     n1:2,  n2:12, n3:19, n4:21, n5:27, especial:37, sorteosAcumulados: 78,  notas:"Sorteo #901" },
  { sorteo: 920,  fecha: "23/10/2010", ciudad: "Cali",                monto: 0,     n1:2,  n2:5,  n3:13, n4:14, n5:16, especial:17, sorteosAcumulados: 19,  notas:"Sorteo #920" },
  { sorteo: 935,  fecha: "15/12/2010", ciudad: "Pasto",               monto: 0,     n1:2,  n2:4,  n3:9,  n4:10, n5:14, especial:27, sorteosAcumulados: 15,  notas:"Sorteo #935" },
  { sorteo: 1024, fecha: "02/02/2011", ciudad: "Medellín",            monto: 0,     n1:12, n2:13, n3:17, n4:31, n5:32, especial:40, sorteosAcumulados: 89,  notas:"Sorteo #1024" },
  { sorteo: 1193, fecha: "22/09/2012", ciudad: "Bucaramanga",         monto: 0,     n1:16, n2:27, n3:29, n4:35, n5:36, especial:40, sorteosAcumulados: 169, notas:"Sorteo #1193" },
  { sorteo: 1333, fecha: "25/01/2014", ciudad: "Medellín",            monto: 0,     n1:14, n2:23, n3:29, n4:31, n5:33, especial:40, sorteosAcumulados: 140, notas:"Sorteo #1333" },
  { sorteo: 1416, fecha: "20/12/2014", ciudad: "Medellín",            monto: 0,     n1:1,  n2:4,  n3:15, n4:20, n5:33, especial:34, sorteosAcumulados: 83,  notas:"Sorteo #1416" },
  { sorteo: 1424, fecha: "17/01/2015", ciudad: "Envigado y Espinal",  monto: 0,     n1:13, n2:18, n3:20, n4:22, n5:30, especial:36, sorteosAcumulados: 8,   notas:"Sorteo #1424" },
  { sorteo: 1451, fecha: "22/04/2015", ciudad: "N/A",                 monto: 0,     n1:1,  n2:14, n3:16, n4:30, n5:38, especial:41, sorteosAcumulados: 27,  notas:"Sorteo #1451" },
  { sorteo: 1511, fecha: "18/11/2015", ciudad: "Bogotá",              monto: 0,     n1:3,  n2:10, n3:22, n4:25, n5:32, especial:42, sorteosAcumulados: 60,  notas:"Sorteo #1511" },
  { sorteo: 1544, fecha: "23/01/2016", ciudad: "Medellín",            monto: 0,     n1:15, n2:19, n3:25, n4:33, n5:39, especial:41, sorteosAcumulados: 33,  notas:"Sorteo #1544" },
  { sorteo: 1611, fecha: "14/09/2016", ciudad: "Bogotá",              monto: 0,     n1:8,  n2:14, n3:21, n4:25, n5:28, especial:35, sorteosAcumulados: 67,  notas:"Sorteo #1611" },
  { sorteo: 1716, fecha: "20/09/2017", ciudad: "Medellín",            monto: 0,     n1:8,  n2:16, n3:24, n4:29, n5:31, especial:11, sorteosAcumulados: 105, notas:"Sorteo #1716" },
  { sorteo: 2022, fecha: "03/10/2020", ciudad: "Cali",                monto: 0,     n1:1,  n2:9,  n3:17, n4:28, n5:35, especial:11, sorteosAcumulados: 306, notas:"Sorteo #2022" },
  { sorteo: 2073, fecha: "31/03/2021", ciudad: "Medellín",            monto: 0,     n1:14, n2:15, n3:27, n4:35, n5:43, especial:13, sorteosAcumulados: 51,  notas:"Sorteo #2073" },
  { sorteo: 2232, fecha: "22/10/2022", ciudad: "Medellín",            monto: 0,     n1:3,  n2:10, n3:14, n4:19, n5:34, especial:9,  sorteosAcumulados: 159, notas:"Sorteo #2232" },
  { sorteo: 2341, fecha: "25/10/2023", ciudad: "Villavicencio",       monto: 0,     n1:2,  n2:14, n3:17, n4:21, n5:33, especial:8,  sorteosAcumulados: 109, notas:"Sorteo #2341" },
  { sorteo: 2421, fecha: "31/07/2024", ciudad: "Internet",            monto: 0,     n1:7,  n2:23, n3:26, n4:29, n5:36, especial:10, sorteosAcumulados: 80,  notas:"Sorteo #2421" },
  { sorteo: 2471, fecha: "22/01/2025", ciudad: "Bogotá",              monto: 0,     n1:5,  n2:11, n3:13, n4:17, n5:35, especial:2,  sorteosAcumulados: 50,  notas:"Sorteo #2471" },
  { sorteo: 2508, fecha: "01/06/2025", ciudad: "Floridablanca",       monto: 0,     n1:6,  n2:9,  n3:22, n4:34, n5:39, especial:6,  sorteosAcumulados: 37,  notas:"Sorteo #2508" },
];

const REVANCHA_JACKPOTS = [
  { fecha: "16/09/2015", ciudad: "Envigado",   monto: 0, n1:1,  n2:4,  n3:18, n4:19, n5:26, especial:34, sorteosAcumulados: 0,   notas:"Sorteo #1493" },
  { fecha: "21/05/2016", ciudad: "Envigado",   monto: 0, n1:7,  n2:16, n3:21, n4:25, n5:34, especial:40, sorteosAcumulados: 85,  notas:"Sorteo #1578" },
  { fecha: "20/05/2017", ciudad: "N/A",        monto: 0, n1:3,  n2:7,  n3:24, n4:26, n5:40, especial:6,  sorteosAcumulados: 103, notas:"Sorteo #1681" },
  { fecha: "31/01/2018", ciudad: "Bogotá",     monto: 0, n1:8,  n2:18, n3:32, n4:34, n5:36, especial:4,  sorteosAcumulados: 73,  notas:"Sorteo #1754" },
  { fecha: "13/11/2019", ciudad: "Bogotá",     monto: 0, n1:7,  n2:12, n3:16, n4:32, n5:42, especial:10, sorteosAcumulados: 180, notas:"Sorteo #1934" },
  { fecha: "12/05/2021", ciudad: "Manizales",  monto: 0, n1:4,  n2:6,  n3:8,  n4:11, n5:16, especial:9,  sorteosAcumulados: 151, notas:"Sorteo #2085" },
  { fecha: "01/07/2023", ciudad: "Valledupar", monto: 0, n1:15, n2:19, n3:20, n4:24, n5:43, especial:6,  sorteosAcumulados: 222, notas:"Sorteo #2307" },
  { fecha: "11/05/2024", ciudad: "Bogotá",     monto: 0, n1:3,  n2:8,  n3:14, n4:32, n5:42, especial:8,  sorteosAcumulados: 91,  notas:"Sorteo #2398" },
  { fecha: "27/07/2025", ciudad: "Medellín",   monto: 0, n1:1,  n2:4,  n3:5,  n4:11, n5:26, especial:10, sorteosAcumulados: 126, notas:"Sorteo #2524" },
];

const POWERBALL_JACKPOTS = [
  { fecha: "12/08/1992", ciudad: "Indiana",                          monto: 10400,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Primer Jackpot Powerball" },
  { fecha: "02/09/1992", ciudad: "Montana",                          monto: 10700,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "14/10/1992", ciudad: "Delaware",                         monto: 38400,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "14/11/1992", ciudad: "Indiana",                          monto: 22100,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "23/12/1992", ciudad: "Misuri",                           monto: 10400,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "07/07/1993", ciudad: "Wisconsin",                        monto: 111000,  n1:4,  n2:8,  n3:19, n4:28, n5:41, especial:30, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "22/12/1993", ciudad: "Washington D.C.",                  monto: 92200,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "22/01/1994", ciudad: "Kansas",                           monto: 20200,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "31/08/1994", ciudad: "Delaware",                         monto: 54800,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "04/03/1995", ciudad: "Indiana",                          monto: 74100,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "29/07/1995", ciudad: "Oregón",                           monto: 101800,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "25/05/1996", ciudad: "Iowa",                             monto: 55900,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "30/11/1996", ciudad: "Florida",                          monto: 80000,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "11/01/1997", ciudad: "Míchigan",                         monto: 33500,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "05/04/1997", ciudad: "Luisiana",                         monto: 45700,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "20/05/1998", ciudad: "Illinois",                         monto: 195000,  n1:4,  n2:9,  n3:30, n4:34, n5:48, especial:8,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "29/07/1998", ciudad: "Ohio",                             monto: 161500,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "06/01/1999", ciudad: "Pensilvania",                      monto: 80100,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "16/06/1999", ciudad: "Indiana",                          monto: 79000,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "11/02/2000", ciudad: "Míchigan / Illinois",              monto: 363000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "16/08/2000", ciudad: "Virginia",                         monto: 150000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "21/02/2001", ciudad: "Arizona",                          monto: 55000,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "25/08/2001", ciudad: "Kentucky",                         monto: 294800,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "22/12/2001", ciudad: "Kentucky",                         monto: 84000,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "29/01/2002", ciudad: "Kentucky",                         monto: 116000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "25/12/2002", ciudad: "Virginia Occidental",              monto: 314900,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "26/03/2003", ciudad: "Nuevo Hampshire",                  monto: 88700,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "09/07/2003", ciudad: "Misuri / Pensilvania",             monto: 261300,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "25/10/2003", ciudad: "Indiana",                          monto: 190900,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "08/05/2004", ciudad: "Delaware",                         monto: 214700,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "22/12/2004", ciudad: "Pensilvania",                      monto: 159000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "19/10/2005", ciudad: "Oregón",                           monto: 340000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "18/02/2006", ciudad: "Nebraska",                         monto: 365000,  n1:15, n2:17, n3:43, n4:44, n5:48, especial:29, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "20/12/2006", ciudad: "Misuri",                           monto: 254000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "15/08/2007", ciudad: "Indiana",                          monto: 314300,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "12/03/2008", ciudad: "Virginia Occidental",              monto: 276300,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "01/04/2009", ciudad: "Washington D.C.",                  monto: 144100,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "15/08/2009", ciudad: "Carolina del Sur",                 monto: 259900,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "21/04/2010", ciudad: "Misuri",                           monto: 258500,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "04/09/2010", ciudad: "Georgia",                          monto: 116000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "25/12/2010", ciudad: "Nueva York",                       monto: 48800,   n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "20/01/2011", ciudad: "Maryland",                         monto: 731100,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "01/06/2011", ciudad: "Florida",                          monto: 121100,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "14/09/2011", ciudad: "Nueva York",                       monto: 189000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "26/10/2011", ciudad: "Connecticut",                      monto: 254200,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "11/02/2012", ciudad: "Rhode Island",                     monto: 336400,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "15/08/2012", ciudad: "Michigan",                         monto: 337000,  n1:6,  n2:27, n3:46, n4:51, n5:56, especial:21, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "28/11/2012", ciudad: "Arizona / Missouri",               monto: 587500,  n1:5,  n2:16, n3:22, n4:23, n5:29, especial:6,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "18/05/2013", ciudad: "Florida",                          monto: 590500,  n1:10, n2:13, n3:14, n4:22, n5:52, especial:11, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "07/08/2013", ciudad: "Minnesota / New Jersey",           monto: 448400,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "19/02/2014", ciudad: "California",                       monto: 425300,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "11/02/2015", ciudad: "NC / PR / TX",                     monto: 564100,  n1:11, n2:13, n3:25, n4:39, n5:54, especial:19, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "30/09/2015", ciudad: "Michigan",                         monto: 310500,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "13/01/2016", ciudad: "CA / FL / TN",                     monto: 1586000, n1:4,  n2:8,  n3:19, n4:27, n5:34, especial:10, sorteosAcumulados: 0,   notas:"Récord mundial — números verificados" },
  { fecha: "07/05/2016", ciudad: "New Jersey",                       monto: 429600,  n1:5,  n2:25, n3:26, n4:44, n5:66, especial:9,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "30/07/2016", ciudad: "New Hampshire",                    monto: 487000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "26/11/2016", ciudad: "Tennessee",                        monto: 420900,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "22/02/2017", ciudad: "Lafayette, Indiana",               monto: 435300,  n1:10, n2:13, n3:28, n4:52, n5:61, especial:2,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "10/06/2017", ciudad: "Sun City, California",             monto: 447800,  n1:20, n2:26, n3:32, n4:38, n5:58, especial:3,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "23/08/2017", ciudad: "Chicopee, Massachusetts",          monto: 758700,  n1:6,  n2:7,  n3:16, n4:23, n5:26, especial:4,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "06/01/2018", ciudad: "Merrimack, New Hampshire",         monto: 559700,  n1:12, n2:29, n3:30, n4:33, n5:61, especial:26, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "17/03/2018", ciudad: "Manheim, Pennsylvania",            monto: 456700,  n1:22, n2:57, n3:59, n4:60, n5:66, especial:7,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "27/10/2018", ciudad: "Redfield, Iowa / Manhattan, NY",   monto: 687800,  n1:8,  n2:12, n3:13, n4:19, n5:27, especial:4,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "27/03/2019", ciudad: "New Berlin, Wisconsin",            monto: 768400,  n1:16, n2:20, n3:37, n4:44, n5:62, especial:12, sorteosAcumulados: 26,  notas:"Números verificados" },
  { fecha: "01/06/2019", ciudad: "North Carolina",                   monto: 344600,  n1:6,  n2:15, n3:34, n4:45, n5:52, especial:8,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "29/01/2020", ciudad: "Bonita Springs, Florida",          monto: 396900,  n1:9,  n2:12, n3:15, n4:31, n5:60, especial:2,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "08/04/2020", ciudad: "Piscataway, New Jersey",           monto: 190000,  n1:2,  n2:37, n3:39, n4:48, n5:54, especial:5,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "20/01/2021", ciudad: "Lonaconing, Maryland",             monto: 731100,  n1:40, n2:53, n3:60, n4:68, n5:69, especial:22, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "27/03/2021", ciudad: "Lutz, Florida",                    monto: 235400,  n1:6,  n2:14, n3:38, n4:39, n5:65, especial:6,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "04/10/2021", ciudad: "Morro Bay, California",            monto: 699800,  n1:12, n2:22, n3:54, n4:66, n5:69, especial:15, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "05/01/2022", ciudad: "Sacramento, CA / Green Bay, WI",   monto: 632600,  n1:6,  n2:14, n3:25, n4:33, n5:46, especial:17, sorteosAcumulados: 39,  notas:"Números verificados" },
  { fecha: "27/04/2022", ciudad: "Arizona",                          monto: 473100,  n1:11, n2:36, n3:61, n4:62, n5:68, especial:4,  sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "03/08/2022", ciudad: "New Stanton, Pennsylvania",        monto: 206900,  n1:9,  n2:21, n3:56, n4:57, n5:66, especial:11, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "07/11/2022", ciudad: "Altadena, California",             monto: 2040000, n1:10, n2:33, n3:41, n4:47, n5:56, especial:10, sorteosAcumulados: 40,  notas:"Récord mundial — números verificados" },
  { fecha: "06/02/2023", ciudad: "Auburn, Washington",               monto: 754600,  n1:5,  n2:11, n3:22, n4:23, n5:69, especial:7,  sorteosAcumulados: 34,  notas:"Números verificados" },
  { fecha: "19/07/2023", ciudad: "Los Angeles, California",          monto: 1080000, n1:7,  n2:10, n3:45, n4:56, n5:61, especial:22, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "11/10/2023", ciudad: "Frazier Park, California",         monto: 1765000, n1:16, n2:34, n3:45, n4:67, n5:68, especial:14, sorteosAcumulados: 36,  notas:"Números verificados" },
  { fecha: "01/01/2024", ciudad: "Grand Blanc, Michigan",            monto: 842400,  n1:12, n2:21, n3:42, n4:44, n5:49, especial:1,  sorteosAcumulados: 35,  notas:"Números verificados" },
  { fecha: "06/04/2024", ciudad: "Portland, Oregon",                 monto: 1326000, n1:22, n2:27, n3:44, n4:52, n5:69, especial:9,  sorteosAcumulados: 40,  notas:"Números verificados" },
  { fecha: "03/07/2024", ciudad: "Huber Heights, Ohio",              monto: 139300,  n1:2,  n2:26, n3:33, n4:55, n5:57, especial:22, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "19/08/2024", ciudad: "Dana Point, California",           monto: 44300,   n1:1,  n2:2,  n3:15, n4:23, n5:28, especial:10, sorteosAcumulados: 0,   notas:"Números verificados" },
  { fecha: "14/02/2026", ciudad: "Indiana",                          monto: 342000,  n1:0,  n2:0,  n3:0,  n4:0,  n5:0,  especial:0,  sorteosAcumulados: 0,   notas:"Números pendientes" },
  { fecha: "24/12/2025", ciudad: "Cabot, Arkansas",                  monto: 1817000, n1:4,  n2:25, n3:31, n4:52, n5:59, especial:19, sorteosAcumulados: 46,  notas:"Números verificados" },
];

export async function seedJackpots() {
  const [row] = await db.select({ total: count() }).from(jackpotsTable);
  if ((row?.total ?? 0) > 0) {
    console.log(`[seed] jackpots table already has ${row?.total} records — skipping seed`);
    return;
  }

  console.log("[seed] jackpots table is empty — seeding data...");

  const balotoRows = BALOTO_JACKPOTS.map((j) => ({
    tipo: "baloto" as const,
    fecha: j.fecha,
    ciudad: j.ciudad,
    monto: j.monto,
    n1: j.n1, n2: j.n2, n3: j.n3, n4: j.n4, n5: j.n5,
    especial: j.especial,
    sorteosAcumulados: j.sorteosAcumulados,
    numGanadores: 1,
    notas: j.notas,
  }));

  const revanchaRows = REVANCHA_JACKPOTS.map((j) => ({
    tipo: "revancha" as const,
    fecha: j.fecha,
    ciudad: j.ciudad,
    monto: j.monto,
    n1: j.n1, n2: j.n2, n3: j.n3, n4: j.n4, n5: j.n5,
    especial: j.especial,
    sorteosAcumulados: j.sorteosAcumulados,
    numGanadores: 1,
    notas: j.notas,
  }));

  const powerballRows = POWERBALL_JACKPOTS.map((j) => ({
    tipo: "powerball" as const,
    fecha: j.fecha,
    ciudad: j.ciudad,
    monto: j.monto,
    n1: j.n1, n2: j.n2, n3: j.n3, n4: j.n4, n5: j.n5,
    especial: j.especial,
    sorteosAcumulados: j.sorteosAcumulados,
    numGanadores: 1,
    notas: j.notas,
  }));

  await db.insert(jackpotsTable).values(balotoRows).onConflictDoNothing();
  await db.insert(jackpotsTable).values(revanchaRows).onConflictDoNothing();
  await db.insert(jackpotsTable).values(powerballRows).onConflictDoNothing();

  const [after] = await db.select({ total: count() }).from(jackpotsTable);
  console.log(`[seed] done — ${after?.total} jackpots loaded`);
}
