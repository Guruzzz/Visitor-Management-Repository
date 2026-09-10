-- ============================================================
-- VISITOR MANAGEMENT SYSTEM - ZIMBABWEAN SAMPLE DATA
-- Run this AFTER schema.sql has been executed successfully.
-- ============================================================

-- DEPARTMENTS
INSERT INTO departments (name, description) VALUES
  ('Sales',           'Sales and Business Development'),
  ('Engineering',     'Engineering and Technical Services'),
  ('Marketing',       'Marketing and Communications'),
  ('Human Resources', 'Human Resources and Administration'),
  ('Operations',      'Operations and Logistics'),
  ('Finance',         'Finance and Accounts'),
  ('IT',              'Information Technology'),
  ('Security',        'Security and Surveillance'),
  ('Legal',           'Legal and Compliance'),
  ('Procurement',     'Procurement and Supply Chain')
ON CONFLICT (name) DO NOTHING;

-- VISITORS (20 Zimbabwean visitors)
-- National ID format: XX-XXXXXX-X-XX | Phone: +263 7X XXX XXXX
INSERT INTO visitors (id, visitor_number, full_name, phone, national_id, company, created_at, updated_at) VALUES
('a1000001-0000-0000-0000-000000000001','VIS-2026-00001','Tendai Moyo','+263 77 123 4567','63-123456-T-22','Delta Corporation Zimbabwe',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'),
('a1000001-0000-0000-0000-000000000002','VIS-2026-00002','Rudo Chikwanda','+263 78 234 5678','63-234567-R-45','Econet Wireless Zimbabwe',NOW()-INTERVAL '28 days',NOW()-INTERVAL '28 days'),
('a1000001-0000-0000-0000-000000000003','VIS-2026-00003','Farai Ndlovu','+263 71 345 6789','63-345678-F-11','CBZ Bank Limited',NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('a1000001-0000-0000-0000-000000000004','VIS-2026-00004','Chiedza Mutasa','+263 73 456 7890','63-456789-C-33','Old Mutual Zimbabwe',NOW()-INTERVAL '22 days',NOW()-INTERVAL '22 days'),
('a1000001-0000-0000-0000-000000000005','VIS-2026-00005','Takudzwa Sibanda','+263 77 567 8901','63-567890-T-67','Zimplats Holdings',NOW()-INTERVAL '20 days',NOW()-INTERVAL '20 days'),
('a1000001-0000-0000-0000-000000000006','VIS-2026-00006','Nyaradzo Gumbo','+263 78 678 9012','63-678901-N-19','Innscor Africa',NOW()-INTERVAL '18 days',NOW()-INTERVAL '18 days'),
('a1000001-0000-0000-0000-000000000007','VIS-2026-00007','Blessing Dube','+263 71 789 0123','63-789012-B-54','TelOne Zimbabwe',NOW()-INTERVAL '15 days',NOW()-INTERVAL '15 days'),
('a1000001-0000-0000-0000-000000000008','VIS-2026-00008','Simbarashe Mhuriro','+263 73 890 1234','63-890123-S-88','ZESA Holdings',NOW()-INTERVAL '12 days',NOW()-INTERVAL '12 days'),
('a1000001-0000-0000-0000-000000000009','VIS-2026-00009','Rutendo Choto','+263 77 901 2345','63-901234-R-72','NetOne Cellular',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'),
('a1000001-0000-0000-0000-000000000010','VIS-2026-00010','Kudakwashe Zvobgo','+263 78 012 3456','63-012345-K-36','Meikles Limited',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
('a1000001-0000-0000-0000-000000000011','VIS-2026-00011','Anesu Mapuranga','+263 71 123 7890','63-123789-A-14','Grain Marketing Board',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days'),
('a1000001-0000-0000-0000-000000000012','VIS-2026-00012','Tatenda Makoni','+263 73 234 8901','63-234890-T-91','Zimbabwe Revenue Authority',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
('a1000001-0000-0000-0000-000000000013','VIS-2026-00013','Makanaka Chirwa','+263 77 345 9012','63-345901-M-28','BancABC Zimbabwe',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
('a1000001-0000-0000-0000-000000000014','VIS-2026-00014','Tinotenda Mukwasi','+263 78 456 0123','63-456012-T-63','Stanbic Bank Zimbabwe',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
('a1000001-0000-0000-0000-000000000015','VIS-2026-00015','Shamiso Hungwe','+263 71 567 1234','63-567123-S-47','First Mutual Life',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
('a1000001-0000-0000-0000-000000000016','VIS-2026-00016','Zvenyika Chitsiga','+263 73 678 2345','63-678234-Z-82','Harare City Council',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
('a1000001-0000-0000-0000-000000000017','VIS-2026-00017','Vimbai Musariri','+263 77 789 3456','63-789345-V-15','Air Zimbabwe',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
('a1000001-0000-0000-0000-000000000018','VIS-2026-00018','Panashe Dzapasi','+263 78 890 4567','63-890456-P-59','NMB Bank Zimbabwe',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
('a1000001-0000-0000-0000-000000000019','VIS-2026-00019','Kudzai Matambo','+263 71 901 5678','63-901567-K-31','Zimbabwe Broadcasting Corporation',NOW()-INTERVAL '12 hours',NOW()-INTERVAL '12 hours'),
('a1000001-0000-0000-0000-000000000020','VIS-2026-00020','Tafadzwa Mpofu','+263 73 012 6789','63-012678-T-76','Zimasco Holdings',NOW()-INTERVAL '6 hours',NOW()-INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- VISITS: past checked_out (history data)
INSERT INTO visits (id,visitor_id,visit_reference,person_being_visited,department,purpose,check_in_at,check_out_at,duration,status,qr_code_identifier,created_at,updated_at) VALUES
('b2000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','VISIT-20260810-001','Tafadzwa Ncube','Sales','Business partnership discussion',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'+INTERVAL '120 minutes',120,'checked_out','VISIT-20260810-001',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'),
('b2000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000002','VISIT-20260812-001','Munyaradzi Dondo','IT','Software procurement discussion',NOW()-INTERVAL '28 days',NOW()-INTERVAL '28 days'+INTERVAL '90 minutes',90,'checked_out','VISIT-20260812-001',NOW()-INTERVAL '28 days',NOW()-INTERVAL '28 days'),
('b2000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000003','VISIT-20260815-001','Chipo Makore','Finance','Loan application review',NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'+INTERVAL '45 minutes',45,'checked_out','VISIT-20260815-001',NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('b2000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000004','VISIT-20260818-001','Tendai Zvinavashe','Human Resources','Graduate trainee interview',NOW()-INTERVAL '22 days',NOW()-INTERVAL '22 days'+INTERVAL '60 minutes',60,'checked_out','VISIT-20260818-001',NOW()-INTERVAL '22 days',NOW()-INTERVAL '22 days'),
('b2000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000005','VISIT-20260820-001','Rudo Shumba','Engineering','Mine technical site inspection',NOW()-INTERVAL '20 days',NOW()-INTERVAL '20 days'+INTERVAL '180 minutes',180,'checked_out','VISIT-20260820-001',NOW()-INTERVAL '20 days',NOW()-INTERVAL '20 days'),
('b2000001-0000-0000-0000-000000000006','a1000001-0000-0000-0000-000000000006','VISIT-20260822-001','Blessing Mawere','Marketing','Advertising campaign review',NOW()-INTERVAL '18 days',NOW()-INTERVAL '18 days'+INTERVAL '135 minutes',135,'checked_out','VISIT-20260822-001',NOW()-INTERVAL '18 days',NOW()-INTERVAL '18 days'),
('b2000001-0000-0000-0000-000000000007','a1000001-0000-0000-0000-000000000007','VISIT-20260825-001','Nyasha Mushayabasa','IT','Network infrastructure audit',NOW()-INTERVAL '15 days',NOW()-INTERVAL '15 days'+INTERVAL '240 minutes',240,'checked_out','VISIT-20260825-001',NOW()-INTERVAL '15 days',NOW()-INTERVAL '15 days'),
('b2000001-0000-0000-0000-000000000008','a1000001-0000-0000-0000-000000000008','VISIT-20260828-001','Farai Mutema','Operations','Equipment delivery and installation',NOW()-INTERVAL '12 days',NOW()-INTERVAL '12 days'+INTERVAL '330 minutes',330,'checked_out','VISIT-20260828-001',NOW()-INTERVAL '12 days',NOW()-INTERVAL '12 days'),
('b2000001-0000-0000-0000-000000000009','a1000001-0000-0000-0000-000000000009','VISIT-20260831-001','Simbarashe Chidakwa','Legal','Contract review meeting',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'+INTERVAL '105 minutes',105,'checked_out','VISIT-20260831-001',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'),
('b2000001-0000-0000-0000-000000000010','a1000001-0000-0000-0000-000000000010','VISIT-20260902-001','Kudzai Manhenzva','Procurement','Supplier qualification meeting',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'+INTERVAL '150 minutes',150,'checked_out','VISIT-20260902-001',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
('b2000001-0000-0000-0000-000000000011','a1000001-0000-0000-0000-000000000001','VISIT-20260904-001','Tafadzwa Ncube','Finance','Invoice dispute resolution',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'+INTERVAL '60 minutes',60,'checked_out','VISIT-20260904-001',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
('b2000001-0000-0000-0000-000000000012','a1000001-0000-0000-0000-000000000003','VISIT-20260905-001','Chipo Makore','Finance','Quarterly financial review',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'+INTERVAL '120 minutes',120,'checked_out','VISIT-20260905-001',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
('b2000001-0000-0000-0000-000000000013','a1000001-0000-0000-0000-000000000011','VISIT-20260906-001','Admire Zvobgo','Operations','Grain storage facility inspection',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'+INTERVAL '195 minutes',195,'checked_out','VISIT-20260906-001',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
('b2000001-0000-0000-0000-000000000014','a1000001-0000-0000-0000-000000000012','VISIT-20260907-001','Patience Mutandwa','Legal','Tax compliance consultation',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'+INTERVAL '165 minutes',165,'checked_out','VISIT-20260907-001',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
('b2000001-0000-0000-0000-000000000015','a1000001-0000-0000-0000-000000000013','VISIT-20260908-001','Wellington Banda','Finance','Credit facility application',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'+INTERVAL '75 minutes',75,'checked_out','VISIT-20260908-001',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
('b2000001-0000-0000-0000-000000000016','a1000001-0000-0000-0000-000000000014','VISIT-20260909-001','Charity Chikomo','Human Resources','Employee onboarding support',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'+INTERVAL '120 minutes',120,'checked_out','VISIT-20260909-001',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
('b2000001-0000-0000-0000-000000000017','a1000001-0000-0000-0000-000000000015','VISIT-20260910-001','Innocent Chikuni','Marketing','Insurance product presentation',NOW()-INTERVAL '5 hours',NOW()-INTERVAL '3 hours',120,'checked_out','VISIT-20260910-001',NOW()-INTERVAL '5 hours',NOW()-INTERVAL '3 hours'),
('b2000001-0000-0000-0000-000000000018','a1000001-0000-0000-0000-000000000016','VISIT-20260910-002','Tapiwa Gondo','Legal','Building permit consultation',NOW()-INTERVAL '4 hours',NOW()-INTERVAL '150 minutes',90,'checked_out','VISIT-20260910-002',NOW()-INTERVAL '4 hours',NOW()-INTERVAL '150 minutes')
ON CONFLICT (id) DO NOTHING;

-- VISITS: currently CHECKED IN (appear live on dashboard)
INSERT INTO visits (id,visitor_id,visit_reference,person_being_visited,department,purpose,check_in_at,check_out_at,duration,status,qr_code_identifier,created_at,updated_at) VALUES
('b2000001-0000-0000-0000-000000000019','a1000001-0000-0000-0000-000000000017','VISIT-20260910-003','Douglas Chivhanga','Operations','Aircraft maintenance contract discussion',NOW()-INTERVAL '2 hours',NULL,NULL,'checked_in','VISIT-20260910-003',NOW()-INTERVAL '2 hours',NOW()-INTERVAL '2 hours'),
('b2000001-0000-0000-0000-000000000020','a1000001-0000-0000-0000-000000000018','VISIT-20260910-004','Miriam Chideya','Finance','Business loan enquiry',NOW()-INTERVAL '90 minutes',NULL,NULL,'checked_in','VISIT-20260910-004',NOW()-INTERVAL '90 minutes',NOW()-INTERVAL '90 minutes'),
('b2000001-0000-0000-0000-000000000021','a1000001-0000-0000-0000-000000000019','VISIT-20260910-005','Langton Manyumwa','IT','Broadcasting system upgrade meeting',NOW()-INTERVAL '60 minutes',NULL,NULL,'checked_in','VISIT-20260910-005',NOW()-INTERVAL '60 minutes',NOW()-INTERVAL '60 minutes'),
('b2000001-0000-0000-0000-000000000022','a1000001-0000-0000-0000-000000000020','VISIT-20260910-006','Rutendo Chinyanga','Procurement','Mineral processing equipment tender',NOW()-INTERVAL '45 minutes',NULL,NULL,'checked_in','VISIT-20260910-006',NOW()-INTERVAL '45 minutes',NOW()-INTERVAL '45 minutes'),
('b2000001-0000-0000-0000-000000000023','a1000001-0000-0000-0000-000000000002','VISIT-20260910-007','Fungai Madziva','Engineering','Network tower site survey',NOW()-INTERVAL '30 minutes',NULL,NULL,'checked_in','VISIT-20260910-007',NOW()-INTERVAL '30 minutes',NOW()-INTERVAL '30 minutes'),
('b2000001-0000-0000-0000-000000000024','a1000001-0000-0000-0000-000000000005','VISIT-20260910-008','Chenjerai Maposa','Engineering','Mine safety compliance audit',NOW()-INTERVAL '20 minutes',NULL,NULL,'checked_in','VISIT-20260910-008',NOW()-INTERVAL '20 minutes',NOW()-INTERVAL '20 minutes'),
('b2000001-0000-0000-0000-000000000025','a1000001-0000-0000-0000-000000000008','VISIT-20260910-009','Simba Matutu','Operations','Power infrastructure inspection',NOW()-INTERVAL '10 minutes',NULL,NULL,'checked_in','VISIT-20260910-009',NOW()-INTERVAL '10 minutes',NOW()-INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- VERIFY row counts
SELECT 'departments'     AS "table", COUNT(*) AS rows FROM departments
UNION ALL SELECT 'visitors',       COUNT(*) FROM visitors
UNION ALL SELECT 'visits (total)', COUNT(*) FROM visits
UNION ALL SELECT 'checked_in now', COUNT(*) FROM visits WHERE status = 'checked_in'
UNION ALL SELECT 'checked_out',    COUNT(*) FROM visits WHERE status = 'checked_out';
