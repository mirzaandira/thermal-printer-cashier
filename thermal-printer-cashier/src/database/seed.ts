import { v4 as uuidv4 } from 'uuid';
import { getOne, runQuery } from './db';

export const seedDatabase = async () => {
  try {
    // Check if already seeded
    const existingCategory = await getOne('SELECT id FROM categories LIMIT 1');
    if (existingCategory) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with sample data...');

    // Seed categories
    const categories = [
      { id: uuidv4(), name: 'Beverages' },
      { id: uuidv4(), name: 'Food' },
      { id: uuidv4(), name: 'Snacks' },
      { id: uuidv4(), name: 'Desserts' },
    ];

    for (const category of categories) {
      await runQuery(
        'INSERT INTO categories (id, name) VALUES (?, ?)',
        [category.id, category.name]
      );
    }

    // Seed products
    const products = [
      {
        id: uuidv4(),
        name: 'Iced Coffee',
        category_id: categories[0].id,
        price: 25000,
        cost: 10000,
        sku: 'BEV001',
      },
      {
        id: uuidv4(),
        name: 'Iced Tea',
        category_id: categories[0].id,
        price: 15000,
        cost: 5000,
        sku: 'BEV002',
      },
      {
        id: uuidv4(),
        name: 'Burger',
        category_id: categories[1].id,
        price: 50000,
        cost: 25000,
        sku: 'FOOD001',
      },
      {
        id: uuidv4(),
        name: 'Chicken Sandwich',
        category_id: categories[1].id,
        price: 35000,
        cost: 15000,
        sku: 'FOOD002',
      },
      {
        id: uuidv4(),
        name: 'Fries',
        category_id: categories[2].id,
        price: 20000,
        cost: 8000,
        sku: 'SNACK001',
      },
      {
        id: uuidv4(),
        name: 'Cheesecake',
        category_id: categories[3].id,
        price: 30000,
        cost: 12000,
        sku: 'DESERT001',
      },
    ];

    for (const product of products) {
      await runQuery(
        `INSERT INTO products (id, name, category_id, price, cost, sku, active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.category_id, product.price, product.cost, product.sku, 1]
      );

      // Create inventory entry
      await runQuery(
        `INSERT INTO inventory (id, product_id, quantity, reorder_level)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), product.id, 100, 10]
      );
    }

    // Seed default users
    const users = [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@cashier.app',
        pin: '1234',
        role: 'admin',
      },
      {
        id: uuidv4(),
        name: 'Cashier 1',
        email: 'cashier1@cashier.app',
        pin: '5678',
        role: 'cashier',
      },
      {
        id: uuidv4(),
        name: 'Cashier 2',
        email: 'cashier2@cashier.app',
        pin: '9012',
        role: 'cashier',
      },
    ];

    for (const user of users) {
      await runQuery(
        `INSERT INTO users (id, name, email, pin, role, active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.pin, user.role, 1]
      );
    }

    console.log('Database seeded successfully!');
    console.log('\nDefault Users:');
    console.log('- Admin: PIN 1234');
    console.log('- Cashier 1: PIN 5678');
    console.log('- Cashier 2: PIN 9012');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
