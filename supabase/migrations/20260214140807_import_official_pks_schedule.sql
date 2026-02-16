/*
  # Import Oficjalnego Rozkładu Jazdy PKS Grójec

  1. Czyszczenie
    - Usunięcie wszystkich istniejących kursów z tabeli `bus_schedules` (CASCADE)
  
  2. Import Rozkładu
    - Wszystkie kursy z oficjalnego rozkładu PKS ważnego od 12.01.2026
    - route_type: 'PKS'
    - days_filter: tylko kody dni (D, S, 6, 7G)
    - symbols: pozostałe oznaczenia (U, e, m, n, Ex, C, M, a, b, d, g, h, l, p, ~W, &, ł)
    - via: trasy "przez ..."
  
  3. Legenda symboli
    - D = dni robocze (poniedziałek-piątek oprócz świąt)
    - S = dni nauki szkolnej
    - 6 = soboty
    - 7G = niedziele giełdowe
    - U = przewóz użyteczności publicznej
    - Ex = kurs ekspresowy
    - C = soboty, niedziele i święta
    - M = ferie letnie/zimowe
    - e = nie kursuje w ferie letnie
    - m = nie kursuje 24 i 31.XII
    - n = dodatkowe oznaczenie
    - i inne...
*/

-- Wyczyść istniejące kursy
DELETE FROM bus_schedules;

-- ===== BELSK DUŻY =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:40', 'BELSK DUŻY ul Nocznickiego T.', 'PKS', 'S', 'U', 'przez ROŚCE I 01/02', false);

-- ===== BIAŁA RAWSKA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:30', 'Biała Rawska pl. Wolności', 'PKS', 'D', 'U', 'przez RĄBOWOLA II 725/7/05/16, BŁĘDÓW ul. Nowy Rynek 08', false),
('14:30', 'Biała Rawska pl. Wolności', 'PKS', 'D', 'U', 'przez RĄBOWOLA II 725/7/05/16, BŁĘDÓW ul. Nowy Rynek 08', false);

-- ===== BIAŁOBRZEGI P.D. =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('12:15', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'eU', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false),
('14:20', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', '6', 'dU', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false),
('14:20', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', '7G', 'dU', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false),
('15:30', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false),
('16:30', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false),
('19:40', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'S', 'U', 'przez DŁUGOWOLA 01/02, GOSZCZYN ul. Warszawska 01, BRONISZEW I', false);

-- BIAŁOBRZEGI - przez Jasieniec, Nowa Wieś, Warka
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:00', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false),
('08:00', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'M', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false),
('12:00', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false),
('13:45', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false),
('14:45', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false),
('16:30', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33, WARKA DŁUGA /04, WARKA P. DW. UL. WYSOCKIEGO P.', false);

-- BIAŁOBRZEGI - przez Lewiczyn
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:45', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'S', 'U', 'przez LEWICZYN 01/02', false),
('07:00', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'MC', 'dU', 'przez LEWICZYN 01/02', false),
('07:00', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'MC', 'dU', 'przez LEWICZYN 01/02', false),
('09:15', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', 'PKS', 'D', 'U', 'przez LEWICZYN 01/02', false);

-- ===== CYCHRY =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('12:15', 'CYCHRY', 'PKS', 'S', 'U', 'przez WORÓW 03/04, MACHNATKA', false);

-- ===== DĘBNOWOLA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('08:45', 'DĘBNOWOLA', 'PKS', 'S', 'U', 'przez WÓLKA DĄBKOWSKA', false),
('13:45', 'DĘBNOWOLA', 'PKS', 'D', 'U', 'przez WÓLKA DĄBKOWSKA', false),
('18:00', 'DĘBNOWOLA', 'PKS', 'S', 'U', 'przez WÓLKA DĄBKOWSKA', false);

-- ===== DRZEWICA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('17:15', 'DRZEWICA UL. SIKORSKIEGO D.A.', 'PKS', 'D', '', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false);

-- ===== FALĘCIN II =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:40', 'FALĘCIN II', 'PKS', 'D', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('05:30', 'FALĘCIN II', 'PKS', 'D', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('06:40', 'FALĘCIN II', 'PKS', 'S', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('06:45', 'FALĘCIN II', 'PKS', 'C', 'MU', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('06:45', 'FALĘCIN II', 'PKS', 'C', 'MU', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('07:50', 'FALĘCIN II', 'PKS', 'S', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('11:00', 'FALĘCIN II', 'PKS', '6', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('11:00', 'FALĘCIN II', 'PKS', '7G', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('12:30', 'FALĘCIN II', 'PKS', 'D', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('14:35', 'FALĘCIN II', 'PKS', 'S', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('15:30', 'FALĘCIN II', 'PKS', '6', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('15:30', 'FALĘCIN II', 'PKS', '7G', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false),
('17:15', 'FALĘCIN II', 'PKS', 'D', 'U', 'przez KROBÓW, OGRODZIENICE, MIĄSY', false);

-- ===== GOŁOSZE II =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('15:45', 'GOŁOSZE II /03/04', 'PKS', 'D', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08', false);

-- ===== GOŚCIEŃCZYCE =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('15:20', 'GOŚCIEŃCZYCE Remiza', 'PKS', 'S', 'U', 'przez MIROWICE 722/8/09/44', false),
('16:10', 'GOŚCIEŃCZYCE Remiza', 'PKS', 'S', 'U', 'przez MIROWICE 722/8/09/44', false);

-- ===== GÓRA KALWARIA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('05:50', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez CHYNÓW', false),
('06:45', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez CHYNÓW', false),
('08:30', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez CHYNÓW', false),
('13:45', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez CHYNÓW', false),
('15:00', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez CHYNÓW', false);

-- GÓRA KALWARIA - przez Sułkowice
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('10:30', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez SUŁKOWICE I', false),
('15:40', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez SUŁKOWICE I', false),
('16:20', 'GÓRA KALWARIA Rynek 02', 'PKS', 'D', 'U', 'przez SUŁKOWICE I', false);

-- ===== GRÓJEC (powrót do Dworca Laskowa) =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:22', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('07:37', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('07:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('07:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('08:43', 'Grójec DA Laskowa', 'PKS', '7G', 'U', '', false),
('09:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('09:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('10:12', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('10:28', 'Grójec DA Laskowa', 'PKS', '7G', 'U', '', false),
('12:28', 'Grójec DA Laskowa', 'PKS', '7G', 'U', '', false),
('13:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('13:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('14:02', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('15:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('15:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('16:02', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('17:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('17:42', 'Grójec DA Laskowa', 'PKS', 'C', 'dU', '', false),
('18:07', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('19:07', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false),
('22:57', 'Grójec DA Laskowa', 'PKS', 'D', 'U', '', false);

-- ===== JASIENIEC II =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:30', 'JASIENIEC II 730/8/08/47', 'PKS', 'S', 'U', 'przez SKURÓW 2', false),
('07:35', 'JASIENIEC II 730/8/08/47', 'PKS', 'S', 'U', 'przez SKURÓW 2', false),
('12:45', 'JASIENIEC II 730/8/08/47', 'PKS', 'S', 'U', 'przez SKURÓW 2', false);

-- ===== KOŃSKIE =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:15', 'Końskie Wojska Polskiego Centr', 'PKS', 'D', 'd', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false),
('07:15', 'Końskie Wojska Polskiego Centr', 'PKS', '6', 'd', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false),
('07:15', 'Końskie Wojska Polskiego Centr', 'PKS', '7G', 'd', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false),
('15:45', 'Końskie Wojska Polskiego Centr', 'PKS', 'D', 'ph', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false),
('15:45', 'Końskie Wojska Polskiego Centr', 'PKS', '6', 'ph', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false),
('15:45', 'Końskie Wojska Polskiego Centr', 'PKS', '7G', 'ph', 'przez NOWE MIASTO Dworzec, DRZEWICA UL. SIKORSKIEGO D.A.', false);

-- ===== KOPANA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('13:30', 'KOPANA 01/02', 'PKS', 'S', 'U', 'przez ŻYRÓW 01/02', false);

-- ===== KRUSZEW =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:00', 'KRUSZEW', 'PKS', 'S', 'U', '', false),
('14:20', 'KRUSZEW', 'PKS', 'S', 'U', 'przez PNIEWY', false);

-- ===== LESZNOWOLA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:55', 'LESZNOWOLA k/Grójca 722/8/07/4', 'PKS', 'S', 'U', '', false);

-- ===== LIPIE =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:45', 'LIPIE 01/02', 'PKS', 'S', 'U', 'przez JEZIÓRKA 01/02, MACHNATKA', false),
('17:15', 'LIPIE 01/02', 'PKS', 'S', 'U', 'przez JEZIÓRKA 01/02, MACHNATKA', false),
('15:45', 'LIPIE 01/02', 'PKS', 'S', 'U', 'przez JEZIÓRKA 01/02, ZALESIE koło Wilkowa', false),
('14:30', 'LIPIE 01/02', 'PKS', 'S', 'U', 'przez WORÓW 03/04, Bikówek /1604W', false);

-- ===== MOGIELNICA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('10:15', 'MOGIELNICA 728/30/39', 'PKS', 'S', 'U', 'przez LEWICZYN 01/02, OLSZEW 02', false),
('14:45', 'MOGIELNICA 728/30/39', 'PKS', 'S', 'U', 'przez LEWICZYN 01/02, OLSZEW 02', false);

-- ===== MSZCZONÓW =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:55', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('05:50', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('06:45', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('10:00', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('12:30', 'MSZCZONÓW Rynek 02', 'PKS', 'S', 'U', 'przez KONIE II', false),
('14:45', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('16:00', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false),
('18:15', 'MSZCZONÓW Rynek 02', 'PKS', 'D', 'U', 'przez KONIE II', false);

-- ===== NOWA WIEŚ II =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:30', 'NOWA WIEŚ II 730/8/22/33', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35', false);

-- ===== NOWE MIASTO =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:20', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('07:40', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('10:00', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('11:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '6', 'dmU', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('11:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '7G', 'dmU', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('14:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '6', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false),
('14:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '7G', 'U', 'przez GOLIANY 02, BŁĘDÓW ul. Nowy Rynek 08, NOWE MIASTO Dworzec', false);

-- NOWE MIASTO - przez Mogielnicę
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'S', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('07:00', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'S', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('10:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '6', '', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('10:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '7G', '', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('11:00', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'S', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('11:40', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('15:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('17:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '6', 'C', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('17:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', '7G', 'C', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('19:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'C', 'bl&', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('19:15', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'C', 'bl&', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false),
('20:30', 'NOWE MIASTO Ul. TOMASZOWSKA', 'PKS', 'D', '', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec', false);

-- ===== PRAŻMÓW =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:55', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('05:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('06:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('06:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('06:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('06:20', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('06:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('06:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('08:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('08:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('08:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('08:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('08:40', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('09:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('12:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('12:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('12:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('12:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('12:40', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('13:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('13:40', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('14:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('14:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('14:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('14:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('14:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('15:40', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('16:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('16:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('16:15', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('16:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('16:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'C', 'dU', 'przez Lesznowola II', false),
('16:40', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('17:00', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('21:35', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false),
('21:55', 'PRAŻMÓW URZĄD GMINY', 'PKS', 'D', 'U', 'przez Lesznowola II', false);

-- ===== RADOM =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('05:00', 'Radom Dw. Główny PKP / Poczta', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec, POTWORÓW', false),
('06:35', 'Radom Dw. Główny PKP / Poczta', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec, POTWORÓW', false),
('09:40', 'Radom Dw. Główny PKP / Poczta', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec, POTWORÓW', false),
('12:40', 'Radom Dw. Główny PKP / Poczta', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec, POTWORÓW', false),
('14:40', 'Radom Dw. Główny PKP / Poczta', 'PKS', 'D', 'U', 'przez MOGIELNICA 728/30/39, NOWE MIASTO Dworzec, POTWORÓW', false);

-- ===== SADKÓW SZLACHECKI =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('12:45', 'SADKÓW SZLACHECKI', 'PKS', 'S', 'U', 'przez WORÓW 03/04, ULENIEC I 07/08', false),
('14:45', 'SADKÓW SZLACHECKI', 'PKS', 'S', 'U', 'przez WORÓW 03/04, ULENIEC I 07/08', false),
('06:00', 'SADKÓW SZLACHECKI', 'PKS', 'S', 'U', 'przez ZŁOTA GÓRA, Aleksandrówka 02', false),
('15:50', 'SADKÓW SZLACHECKI', 'PKS', 'S', 'U', 'przez ZŁOTA GÓRA, Aleksandrówka 02', false);

-- ===== SŁOMCZYN =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:30', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false),
('07:37', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false),
('09:15', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false),
('09:22', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false),
('11:30', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false),
('11:37', 'SŁOMCZYN "G"', 'PKS', '7G', 'U', '', false);

-- ===== SUCHA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('16:51', 'SUCHA ul. Białobrzeska', 'PKS', 'D', 'Ex', 'przez BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', false);

-- ===== TARCZYN =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:50', 'TARCZYN P.D. UL. WARSZAWSKA', 'PKS', 'D', 'U', 'przez Pamiątka SZKOŁA', false);

-- ===== WARKA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:25', 'WARKA DŁUGA /04', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('08:00', 'WARKA DŁUGA /04', 'PKS', 'SC', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('08:00', 'WARKA DŁUGA /04', 'PKS', 'SC', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('09:45', 'WARKA DŁUGA /04', 'PKS', '6', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('09:45', 'WARKA DŁUGA /04', 'PKS', '7G', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('11:00', 'WARKA DŁUGA /04', 'PKS', 'M', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('13:00', 'WARKA DŁUGA /04', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('14:45', 'WARKA DŁUGA /04', 'PKS', 'C', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('14:45', 'WARKA DŁUGA /04', 'PKS', 'C', 'bU', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('15:00', 'WARKA DŁUGA /04', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('17:15', 'WARKA DŁUGA /04', 'PKS', 'SC', 'b', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('17:15', 'WARKA DŁUGA /04', 'PKS', 'SC', 'b', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('17:35', 'WARKA DŁUGA /04', 'PKS', 'M', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('18:00', 'WARKA DŁUGA /04', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('18:30', 'WARKA DŁUGA /04', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false),
('19:30', 'WARKA DŁUGA /04', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWA WIEŚ I 730/8/20/35, NOWA WIEŚ II 730/8/22/33', false);

-- WARKA - przez Jasieniec, Nowy Miedzechów
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:45', 'WARKA DŁUGA /04', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47, NOWY MIEDZECHÓW 01/02, STEFANKÓW I /06/01, FRANCISZKÓW /10/05, BRONISŁAWÓW k/JASIEŃCA /12/07', false),
('12:45', 'WARKA DŁUGA /04', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWY MIEDZECHÓW 01/02, STEFANKÓW I /06/01, FRANCISZKÓW /10/05, BRONISŁAWÓW k/JASIEŃCA /12/07', false),
('15:40', 'WARKA DŁUGA /04', 'PKS', 'D', 'U', 'przez JASIENIEC II 730/8/08/47, NOWY MIEDZECHÓW 01/02, STEFANKÓW I /06/01, FRANCISZKÓW /10/05, BRONISŁAWÓW k/JASIEŃCA /12/07', false);

-- ===== WARSZAWA Dw.Zach. PKS =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:40', 'Warszawa Dw.Zach. PKS', 'PKS', 'S', 'U', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA', false);

-- WARSZAWA - przez Głuchów, Tarczyn, Mroków, Janki Działkowa
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('05:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', 'd', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('05:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', 'd', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('05:40', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('05:40', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('06:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('07:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', 'C', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('07:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', 'C', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('07:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('07:23', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'a', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('07:23', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'a', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('08:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D6', 'dł', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('09:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('09:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('10:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('10:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'D', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('10:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'D', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('10:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('11:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('11:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('12:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('12:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('12:40', 'Warszawa Dw.Zach. PKS', 'PKS', 'S', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('13:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'g&a', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('13:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'g&a', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('13:40', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('14:20', 'Warszawa Dw.Zach. PKS', 'PKS', 'S', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('15:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('15:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('15:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('16:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('16:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('16:30', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('16:30', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('17:01', 'Warszawa Dw.Zach. PKS', 'PKS', 'SC', 'pl', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('17:01', 'Warszawa Dw.Zach. PKS', 'PKS', 'SC', 'pl', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('17:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('18:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', 'm', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('19:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('19:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('20:00', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('20:00', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false);

-- WARSZAWA - przez Tarczyn (tylko)
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('05:31', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('06:19', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('07:20', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('12:22', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'a', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('12:22', 'Warszawa Dw.Zach. PKS', 'PKS', 'C', 'a', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('13:14', 'Warszawa Dw.Zach. PKS', 'PKS', '6', 'd', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('13:14', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', 'd', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('20:24', 'Warszawa Dw.Zach. PKS', 'PKS', '6', 'pmh', 'przez TARCZYN P.D. UL. WARSZAWSKA', false),
('20:24', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', 'pmh', 'przez TARCZYN P.D. UL. WARSZAWSKA', false);

-- WARSZAWA - przez Tarczyn, Janki Działkowa
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:40', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez TARCZYN P.D. UL. WARSZAWSKA, Janki Działkowa 01, 02', false);

-- WARSZAWA - przez Głuchów, Tarczyn, Mroków, Janki Plac Szwedzki
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:45', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('06:30', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('06:30', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('08:30', 'Warszawa Dw.Zach. PKS', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('08:30', 'Warszawa Dw.Zach. PKS', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('11:30', 'Warszawa Dw.Zach. PKS', 'PKS', 'D6', 'd', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('12:20', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('14:40', 'Warszawa Dw.Zach. PKS', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false),
('18:00', 'Warszawa Dw.Zach. PKS', 'PKS', 'D6', 'b', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Plac Szwedzki 03', false);

-- ===== WARSZAWA Metro Wilanowska =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:40', 'Warszawa Metro Wilanowska 13', 'PKS', 'D', 'U~W', '', false),
('05:20', 'Warszawa Metro Wilanowska 13', 'PKS', '6', 'dU~W', '', false),
('06:05', 'Warszawa Metro Wilanowska 13', 'PKS', 'D', 'U~W', '', false),
('06:45', 'Warszawa Metro Wilanowska 13', 'PKS', 'S', 'U~W', '', false),
('07:45', 'Warszawa Metro Wilanowska 13', 'PKS', 'D', 'U~W', '', false),
('09:35', 'Warszawa Metro Wilanowska 13', 'PKS', 'D6', 'dU', '', false),
('10:45', 'Warszawa Metro Wilanowska 13', 'PKS', 'D', 'U~W', '', false),
('12:00', 'Warszawa Metro Wilanowska 13', 'PKS', 'D6', 'dU', '', false),
('13:20', 'Warszawa Metro Wilanowska 13', 'PKS', 'D', 'U~W', '', false),
('14:15', 'Warszawa Metro Wilanowska 13', 'PKS', 'S', 'U~W', '', false),
('15:30', 'Warszawa Metro Wilanowska 13', 'PKS', 'D6', 'dU', '', false),
('19:15', 'Warszawa Metro Wilanowska 13', 'PKS', 'D6', 'dU', '', false);

-- ===== WARSZAWA P+R AL. KRAKOWSKA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('04:20', 'Warszawa P+R AL. KRAKOWSKA 05', 'PKS', 'D6', 'h', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('04:20', 'Warszawa P+R AL. KRAKOWSKA 05', 'PKS', '6', 'h', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false);

-- ===== WARSZAWA PKP Służewiec =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:18', 'Warszawa PKP Służewiec 02', 'PKS', 'D', 'Ex', 'przez Warszawa Metro Wilanowska 13', false);

-- ===== WARSZAWA Bitwy Warszawskiej =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('05:20', 'Warszawa, Bitwy War1920 01', 'PKS', 'S', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('14:00', 'Warszawa, Bitwy War1920 01', 'PKS', '6', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('14:00', 'Warszawa, Bitwy War1920 01', 'PKS', '7G', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false),
('21:00', 'Warszawa, Bitwy War1920 01', 'PKS', 'D', '', 'przez GŁUCHÓW, TARCZYN P.D. UL. WARSZAWSKA, MROKÓW 01/02, Janki Działkowa 01, 02', false);

-- ===== WÓLKA TUROWSKA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('07:05', 'WÓLKA TUROWSKA', 'PKS', 'S', 'U', 'przez GRUDZKOWOLA, PIEKIEŁKO 02, KĘPINA', false);

-- ===== ZALESIE koło Wilkowa =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('08:45', 'ZALESIE koło Wilkowa', 'PKS', 'D', 'U', 'przez JADWIGÓW II 725/7/08/13', false),
('16:00', 'ZALESIE koło Wilkowa', 'PKS', 'D', 'U', 'przez JADWIGÓW II 725/7/08/13', false),
('18:15', 'ZALESIE koło Wilkowa', 'PKS', 'S', 'U', 'przez JADWIGÓW II 725/7/08/13', false);

-- ===== ZBROSZA DUŻA =====
INSERT INTO bus_schedules (departure_time, destination, route_type, days_filter, symbols, via, is_cancelled) VALUES
('06:00', 'ZBROSZA DUŻA 13/14', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47', false),
('11:00', 'ZBROSZA DUŻA 13/14', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47', false),
('13:50', 'ZBROSZA DUŻA 13/14', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47', false),
('16:30', 'ZBROSZA DUŻA 13/14', 'PKS', 'S', 'U', 'przez JASIENIEC II 730/8/08/47', false);
