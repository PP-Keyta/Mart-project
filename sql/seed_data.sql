-- ============================================================
-- Extra sample data for the Pop Mart shop (run AFTER schema.sql)
-- schema.sql already inserted series 1-5 and products P001-P006;
-- this file adds more series/products, members, orders and carts.
--
-- All sample members share the test password:  Passw0rd!
--   admin login:  admin@popmart.test
--   member login: somchai@example.com (and the other @example.com users)
--   tanawat@example.com is 'suspended' (to test status checks)
-- Product names/prices are SAMPLE values for coursework, not real price data.
-- ============================================================
BEGIN;

INSERT INTO series (name) VALUES
    ('Hirono'),
    ('Hacipupu'),
    ('Twinkle Twinkle'),
    ('Nommi'),
    ('Hello Kitty Collab');

INSERT INTO members (email, password_hash, name, phone, address, role, status) VALUES
    ('admin@popmart.test', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Shop Admin', '0810000001', '99 Admin Road, Bangkok', 'admin', 'active'),
    ('somchai@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Somchai Jaidee', '0810000002', '12 Sukhumvit Rd, Bangkok', 'member', 'active'),
    ('suda@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Suda Rakdee', '0810000003', '45 Nimman Rd, Chiang Mai', 'member', 'active'),
    ('anan@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Anan Thongdee', '0810000004', '78 Beach Rd, Pattaya, Chonburi', 'member', 'active'),
    ('malee@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Malee Srisuk', '0810000005', '5 Mittraphap Rd, Khon Kaen', 'member', 'active'),
    ('preecha@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Preecha Wongsa', '0810000006', '23 Phuket Rd, Phuket', 'member', 'active'),
    ('ploy@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Ploy Chaiyo', '0810000007', '67 Ratchada Rd, Bangkok', 'member', 'active'),
    ('kritsada@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Kritsada Boonma', '0810000008', '9 Hat Yai Rd, Songkhla', 'member', 'active'),
    ('nicha@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Nicha Pimai', '0810000009', '31 Ayutthaya Rd, Ayutthaya', 'member', 'active'),
    ('tanawat@example.com', '$2b$10$1CX/0rz2XNtbiGYrjAhPCOT8ILV1rolXZFiJkGm9At7VLMIAegrLK', 'Tanawat Saetang', '0810000010', '88 Rayong Rd, Rayong', 'member', 'suspended');

INSERT INTO products (code, name, series_id, product_type, price, stock, description) VALUES
    ('P007', 'Labubu Sweet Macaron Blind Box', 1, 'blind_box', 480.00, 45, 'Sample blind box from the Labubu series'),
    ('P008', 'Labubu Sweet Macaron Whole Set', 1, 'whole_set', 5760.00, 6, 'Sample whole set from the Labubu series'),
    ('P009', 'Labubu Plush Pendant Sunny Yellow', 1, 'single', 690.00, 20, 'Sample single figure from the Labubu series'),
    ('P010', 'Labubu Big Into Energy Blind Box', 1, 'blind_box', 480.00, 38, 'Sample blind box from the Labubu series'),
    ('P011', 'Labubu Have a Seat Blind Box', 1, 'blind_box', 450.00, 42, 'Sample blind box from the Labubu series'),
    ('P012', 'Molly Jewelry Series Blind Box', 2, 'blind_box', 420.00, 36, 'Sample blind box from the Molly series'),
    ('P013', 'Molly Jewelry Series Whole Set', 2, 'whole_set', 5040.00, 5, 'Sample whole set from the Molly series'),
    ('P014', 'Molly Space Walker Figure', 2, 'single', 890.00, 15, 'Sample single figure from the Molly series'),
    ('P015', 'Molly Zodiac Blind Box', 2, 'blind_box', 420.00, 33, 'Sample blind box from the Molly series'),
    ('P016', 'Skullpanda The Warmth Blind Box', 3, 'blind_box', 450.00, 28, 'Sample blind box from the Skullpanda series'),
    ('P017', 'Skullpanda The Warmth Whole Set', 3, 'whole_set', 5400.00, 4, 'Sample whole set from the Skullpanda series'),
    ('P018', 'Skullpanda Imaginary Blind Box', 3, 'blind_box', 480.00, 26, 'Sample blind box from the Skullpanda series'),
    ('P019', 'Skullpanda Ancient Castle Figure', 3, 'single', 1290.00, 10, 'Sample single figure from the Skullpanda series'),
    ('P020', 'Dimoo Aquarium Blind Box', 4, 'blind_box', 420.00, 34, 'Sample blind box from the Dimoo series'),
    ('P021', 'Dimoo Aquarium Whole Set', 4, 'whole_set', 5040.00, 5, 'Sample whole set from the Dimoo series'),
    ('P022', 'Dimoo Retro Cinema Blind Box', 4, 'blind_box', 420.00, 30, 'Sample blind box from the Dimoo series'),
    ('P023', 'Dimoo Sleepy Moon Figure', 4, 'single', 790.00, 14, 'Sample single figure from the Dimoo series'),
    ('P024', 'Crybaby Monsters Tears Blind Box', 5, 'blind_box', 450.00, 27, 'Sample blind box from the Crybaby series'),
    ('P025', 'Crybaby Crying Again Blind Box', 5, 'blind_box', 450.00, 24, 'Sample blind box from the Crybaby series'),
    ('P026', 'Crybaby Sad Club Whole Set', 5, 'whole_set', 5400.00, 4, 'Sample whole set from the Crybaby series'),
    ('P027', 'Hirono Little Mischief Blind Box', 6, 'blind_box', 420.00, 32, 'Sample blind box from the Hirono series'),
    ('P028', 'Hirono Reshape Blind Box', 6, 'blind_box', 450.00, 29, 'Sample blind box from the Hirono series'),
    ('P029', 'Hirono City of Mercy Whole Set', 6, 'whole_set', 5040.00, 5, 'Sample whole set from the Hirono series'),
    ('P030', 'Hirono Echo Figure', 6, 'single', 990.00, 12, 'Sample single figure from the Hirono series'),
    ('P031', 'Hacipupu Warm Hugs Blind Box', 7, 'blind_box', 380.00, 40, 'Sample blind box from the Hacipupu series'),
    ('P032', 'Hacipupu Warm Hugs Whole Set', 7, 'whole_set', 4560.00, 6, 'Sample whole set from the Hacipupu series'),
    ('P033', 'Hacipupu Sleepy Plush', 7, 'single', 590.00, 22, 'Sample single figure from the Hacipupu series'),
    ('P034', 'Twinkle Twinkle Little Stars Blind Box', 8, 'blind_box', 400.00, 31, 'Sample blind box from the Twinkle Twinkle series'),
    ('P035', 'Twinkle Twinkle Dream Garden Blind Box', 8, 'blind_box', 400.00, 28, 'Sample blind box from the Twinkle Twinkle series'),
    ('P036', 'Twinkle Twinkle Star Wish Figure', 8, 'single', 850.00, 13, 'Sample single figure from the Twinkle Twinkle series'),
    ('P037', 'Nommi Sweet Treats Blind Box', 9, 'blind_box', 390.00, 37, 'Sample blind box from the Nommi series'),
    ('P038', 'Nommi Sweet Treats Whole Set', 9, 'whole_set', 4680.00, 5, 'Sample whole set from the Nommi series'),
    ('P039', 'Nommi Picnic Day Blind Box', 9, 'blind_box', 390.00, 35, 'Sample blind box from the Nommi series'),
    ('P040', 'Hello Kitty Collab Blind Box', 10, 'blind_box', 480.00, 30, 'Sample blind box from the Hello Kitty Collab series'),
    ('P041', 'Hello Kitty Collab Whole Set', 10, 'whole_set', 5760.00, 4, 'Sample whole set from the Hello Kitty Collab series'),
    ('P042', 'Hello Kitty Collab Keychain', 10, 'single', 520.00, 25, 'Sample single figure from the Hello Kitty Collab series'),
    ('P043', 'Labubu Limited Edition Figure', 1, 'single', 2490.00, 3, 'Sample single figure from the Labubu series'),
    ('P044', 'Molly Limited Edition Figure', 2, 'single', 2290.00, 0, 'Sample single figure from the Molly series');

-- confirmed orders (history). order_no is set explicitly so dates look realistic.
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608040001', 3, 'confirmed', 1440.00, '2026-08-04 18:32:00+07', '2026-08-04 18:46:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P040'), 3, 480.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608070001', 10, 'confirmed', 8460.00, '2026-08-07 19:35:00+07', '2026-08-07 19:46:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P039'), 3, 390.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P030'), 1, 990.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P017'), 1, 5400.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P001'), 2, 450.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608100001', 3, 'confirmed', 4470.00, '2026-08-10 10:52:00+07', '2026-08-10 10:59:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P015'), 2, 420.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P027'), 2, 420.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P018'), 3, 480.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P024'), 3, 450.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608140001', 3, 'confirmed', 2650.00, '2026-08-14 15:05:00+07', '2026-08-14 15:18:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P010'), 2, 480.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P042'), 1, 520.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P037'), 3, 390.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608160001', 7, 'confirmed', 1170.00, '2026-08-16 17:27:00+07', '2026-08-16 17:34:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P039'), 3, 390.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608180001', 9, 'confirmed', 8270.00, '2026-08-18 16:32:00+07', '2026-08-18 16:42:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P035'), 2, 400.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P018'), 3, 480.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P028'), 3, 450.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P038'), 1, 4680.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608210001', 5, 'confirmed', 10080.00, '2026-08-21 10:45:00+07', '2026-08-21 11:01:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P029'), 2, 5040.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608250001', 4, 'confirmed', 1140.00, '2026-08-25 13:54:00+07', '2026-08-25 14:11:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P031'), 3, 380.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608290001', 9, 'confirmed', 21680.00, '2026-08-29 18:16:00+07', '2026-08-29 18:42:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P021'), 3, 5040.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P037'), 2, 390.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P043'), 2, 2490.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P034'), 2, 400.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202608310001', 5, 'confirmed', 780.00, '2026-08-31 14:00:00+07', '2026-08-31 14:28:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P039'), 2, 390.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609030001', 10, 'confirmed', 15660.00, '2026-09-03 15:58:00+07', '2026-09-03 16:13:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P032'), 3, 4560.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P030'), 2, 990.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609070001', 8, 'confirmed', 13900.00, '2026-09-07 10:53:00+07', '2026-09-07 11:04:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P008'), 2, 5760.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P030'), 2, 990.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P034'), 1, 400.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609100001', 8, 'confirmed', 13760.00, '2026-09-10 17:04:00+07', '2026-09-10 17:20:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P025'), 3, 450.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P008'), 2, 5760.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P014'), 1, 890.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609110001', 9, 'confirmed', 34850.00, '2026-09-11 11:00:00+07', '2026-09-11 11:07:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P007'), 1, 480.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P041'), 3, 5760.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P014'), 1, 890.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P017'), 3, 5400.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609160001', 6, 'confirmed', 1170.00, '2026-09-16 15:09:00+07', '2026-09-16 15:21:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P039'), 3, 390.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609190001', 9, 'confirmed', 2880.00, '2026-09-19 12:34:00+07', '2026-09-19 12:52:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P010'), 3, 480.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P040'), 3, 480.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609200001', 6, 'confirmed', 11250.00, '2026-09-20 16:42:00+07', '2026-09-20 16:59:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P039'), 3, 390.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P021'), 2, 5040.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609230001', 8, 'confirmed', 11160.00, '2026-09-23 18:51:00+07', '2026-09-23 19:07:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P008'), 1, 5760.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P026'), 1, 5400.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609280001', 7, 'confirmed', 760.00, '2026-09-28 15:59:00+07', '2026-09-28 16:04:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P031'), 2, 380.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202609300001', 6, 'confirmed', 1140.00, '2026-09-30 15:58:00+07', '2026-09-30 16:16:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P031'), 3, 380.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202610020001', 4, 'confirmed', 2750.00, '2026-10-02 19:33:00+07', '2026-10-02 20:00:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P023'), 3, 790.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P031'), 1, 380.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202610070001', 3, 'confirmed', 16470.00, '2026-10-07 16:02:00+07', '2026-10-07 16:20:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P013'), 3, 5040.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P004'), 3, 450.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202610090001', 2, 'confirmed', 400.00, '2026-10-09 13:30:00+07', '2026-10-09 13:57:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P034'), 1, 400.00);
INSERT INTO orders (order_no, member_id, status, total_amount, created_at, confirmed_at) VALUES ('202610110001', 10, 'confirmed', 10930.00, '2026-10-11 12:42:00+07', '2026-10-11 12:52:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P029'), 2, 5040.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P036'), 1, 850.00);

-- pending carts (one per member, not confirmed yet)
INSERT INTO orders (member_id, status, created_at) VALUES (2, 'pending', '2026-10-26 20:15:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P001'), 2, 450.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P009'), 1, 690.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P020'), 1, 420.00);
INSERT INTO orders (member_id, status, created_at) VALUES (4, 'pending', '2026-10-27 09:40:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P005'), 3, 420.00);
INSERT INTO orders (member_id, status, created_at) VALUES (7, 'pending', '2026-10-27 18:05:00+07');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P030'), 1, 990.00), (currval(pg_get_serial_sequence('orders','id')), (SELECT id FROM products WHERE code='P031'), 2, 380.00);

-- stock = starting stock minus quantities in confirmed orders (carts don't reserve stock)
UPDATE products SET stock = 48 WHERE code = 'P001';
UPDATE products SET stock = 8 WHERE code = 'P002';
UPDATE products SET stock = 40 WHERE code = 'P003';
UPDATE products SET stock = 27 WHERE code = 'P004';
UPDATE products SET stock = 35 WHERE code = 'P005';
UPDATE products SET stock = 25 WHERE code = 'P006';
UPDATE products SET stock = 44 WHERE code = 'P007';
UPDATE products SET stock = 1 WHERE code = 'P008';
UPDATE products SET stock = 20 WHERE code = 'P009';
UPDATE products SET stock = 33 WHERE code = 'P010';
UPDATE products SET stock = 42 WHERE code = 'P011';
UPDATE products SET stock = 36 WHERE code = 'P012';
UPDATE products SET stock = 2 WHERE code = 'P013';
UPDATE products SET stock = 13 WHERE code = 'P014';
UPDATE products SET stock = 31 WHERE code = 'P015';
UPDATE products SET stock = 28 WHERE code = 'P016';
UPDATE products SET stock = 0 WHERE code = 'P017';
UPDATE products SET stock = 20 WHERE code = 'P018';
UPDATE products SET stock = 10 WHERE code = 'P019';
UPDATE products SET stock = 34 WHERE code = 'P020';
UPDATE products SET stock = 0 WHERE code = 'P021';
UPDATE products SET stock = 30 WHERE code = 'P022';
UPDATE products SET stock = 11 WHERE code = 'P023';
UPDATE products SET stock = 24 WHERE code = 'P024';
UPDATE products SET stock = 21 WHERE code = 'P025';
UPDATE products SET stock = 3 WHERE code = 'P026';
UPDATE products SET stock = 30 WHERE code = 'P027';
UPDATE products SET stock = 26 WHERE code = 'P028';
UPDATE products SET stock = 1 WHERE code = 'P029';
UPDATE products SET stock = 7 WHERE code = 'P030';
UPDATE products SET stock = 31 WHERE code = 'P031';
UPDATE products SET stock = 3 WHERE code = 'P032';
UPDATE products SET stock = 22 WHERE code = 'P033';
UPDATE products SET stock = 27 WHERE code = 'P034';
UPDATE products SET stock = 26 WHERE code = 'P035';
UPDATE products SET stock = 12 WHERE code = 'P036';
UPDATE products SET stock = 32 WHERE code = 'P037';
UPDATE products SET stock = 4 WHERE code = 'P038';
UPDATE products SET stock = 21 WHERE code = 'P039';
UPDATE products SET stock = 24 WHERE code = 'P040';
UPDATE products SET stock = 1 WHERE code = 'P041';
UPDATE products SET stock = 24 WHERE code = 'P042';
UPDATE products SET stock = 1 WHERE code = 'P043';
UPDATE products SET stock = 0 WHERE code = 'P044';

COMMIT;
