-- Clear existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM bag_embeddings;
DELETE FROM bags;
DELETE FROM restaurants;

-- 5 restaurants assigned to owners 4, 5, 6
INSERT INTO restaurants (name, description, address, phone, email, owner_id, status, created_at, updated_at)
VALUES
    ('Kallio Kitchen', 'Nordic comfort food in the heart of Kallio', 'Vaasankatu 12, Helsinki', '+358401234501', 'kallio@smartfood.local', 4, 'ACTIVE', NOW(), NOW()),
    ('Kamppi Bakery', 'Artisan sourdough and Finnish pastries', 'Urho Kekkosen katu 8, Helsinki', '+358401234502', 'kamppi@smartfood.local', 4, 'ACTIVE', NOW(), NOW()),
    ('Töölö Sushi', 'Fresh sushi and Japanese bowls', 'Runeberginkatu 40, Helsinki', '+358401234503', 'toolo@smartfood.local', 5, 'ACTIVE', NOW(), NOW()),
    ('Punavuori Pizzeria', 'Wood-fired Neapolitan pizza', 'Iso Roobertinkatu 22, Helsinki', '+358401234504', 'punavuori@smartfood.local', 5, 'ACTIVE', NOW(), NOW()),
    ('Eira Green Bowl', 'Plant-based salads and grain bowls', 'Laivurinkatu 15, Helsinki', '+358401234505', 'eira@smartfood.local', 6, 'ACTIVE', NOW(), NOW());

-- 12 bags with images and realistic Helsinki coordinates
INSERT INTO bags (name, description, image_url, original_price, discounted_price, quantity, pickup_time, status, latitude, longitude, restaurant_id, current_discount, created_at, updated_at)
VALUES
    ('Lunch Bag – Salmon & Potatoes', 'Roasted salmon with dill potatoes and seasonal greens',
     'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
     12.90, 6.45, 3, NOW() + INTERVAL '4 hours', 'AVAILABLE', 60.1872, 24.9541,
     (SELECT id FROM restaurants WHERE name='Kallio Kitchen'), 0.50, NOW(), NOW()),

    ('Vegan Buddha Bowl', 'Quinoa, roasted vegetables, tahini dressing',
     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
     11.50, 5.75, 5, NOW() + INTERVAL '3 hours', 'AVAILABLE', 60.1872, 24.9541,
     (SELECT id FROM restaurants WHERE name='Kallio Kitchen'), 0.50, NOW(), NOW()),

    ('Sourdough Bread Box', 'Assorted artisan sourdough loaves from today''s batch',
     'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
     9.00, 4.50, 4, NOW() + INTERVAL '2 hours', 'AVAILABLE', 60.1683, 24.9317,
     (SELECT id FROM restaurants WHERE name='Kamppi Bakery'), 0.50, NOW(), NOW()),

    ('Cinnamon Bun Dozen', '12 fresh Finnish korvapuusti',
     'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80',
     15.00, 7.50, 2, NOW() + INTERVAL '5 hours', 'AVAILABLE', 60.1683, 24.9317,
     (SELECT id FROM restaurants WHERE name='Kamppi Bakery'), 0.50, NOW(), NOW()),

    ('Sushi Set – 12 pieces', 'Chef''s selection of salmon, tuna, and avocado rolls',
     'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
     19.90, 9.95, 3, NOW() + INTERVAL '3 hours', 'AVAILABLE', 60.1817, 24.9213,
     (SELECT id FROM restaurants WHERE name='Töölö Sushi'), 0.50, NOW(), NOW()),

    ('Poke Bowl – Tuna', 'Fresh tuna poke with rice, edamame, mango',
     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
     14.50, 7.25, 4, NOW() + INTERVAL '4 hours', 'AVAILABLE', 60.1817, 24.9213,
     (SELECT id FROM restaurants WHERE name='Töölö Sushi'), 0.50, NOW(), NOW()),

    ('Margherita Pizza', 'Neapolitan with San Marzano tomatoes and mozzarella',
     'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80',
     13.00, 6.50, 5, NOW() + INTERVAL '2 hours', 'AVAILABLE', 60.1624, 24.9408,
     (SELECT id FROM restaurants WHERE name='Punavuori Pizzeria'), 0.50, NOW(), NOW()),

    ('Diavola Pizza', 'Spicy salami, chili flakes, mozzarella',
     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
     15.00, 7.50, 3, NOW() + INTERVAL '3 hours', 'AVAILABLE', 60.1624, 24.9408,
     (SELECT id FROM restaurants WHERE name='Punavuori Pizzeria'), 0.50, NOW(), NOW()),

    ('Green Bowl – Kale & Avocado', 'Kale, avocado, roasted chickpeas, lemon tahini',
     'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
     12.50, 6.25, 6, NOW() + INTERVAL '5 hours', 'AVAILABLE', 60.1573, 24.9453,
     (SELECT id FROM restaurants WHERE name='Eira Green Bowl'), 0.50, NOW(), NOW()),

    ('Mediterranean Bowl', 'Falafel, hummus, tabbouleh, pickled vegetables',
     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
     11.90, 5.95, 4, NOW() + INTERVAL '4 hours', 'AVAILABLE', 60.1573, 24.9453,
     (SELECT id FROM restaurants WHERE name='Eira Green Bowl'), 0.50, NOW(), NOW()),

    ('Breakfast Pastry Box', 'Croissants, pain au chocolat, danishes',
     'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
     10.00, 5.00, 7, NOW() + INTERVAL '1 hour', 'AVAILABLE', 60.1683, 24.9317,
     (SELECT id FROM restaurants WHERE name='Kamppi Bakery'), 0.50, NOW(), NOW()),

    ('Salmon Nigiri Set', '8 pieces of fresh salmon nigiri',
     'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80',
     16.50, 8.25, 2, NOW() + INTERVAL '2 hours', 'AVAILABLE', 60.1817, 24.9213,
     (SELECT id FROM restaurants WHERE name='Töölö Sushi'), 0.50, NOW(), NOW());