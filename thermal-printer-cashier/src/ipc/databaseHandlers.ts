import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, runQuery } from '../database/db';

export const registerDatabaseHandlers = () => {
  // Products
  ipcMain.handle('db:getProducts', async () => {
    return getAll('SELECT * FROM products WHERE active = 1 ORDER BY name');
  });

  ipcMain.handle('db:getProduct', async (_, id: string) => {
    return getOne('SELECT * FROM products WHERE id = ?', [id]);
  });

  ipcMain.handle('db:addProduct', async (_, product) => {
    const id = uuidv4();
    await runQuery(
      `INSERT INTO products (id, name, category_id, price, cost, sku, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, product.name, product.category_id, product.price, product.cost, product.sku, product.image_url]
    );
    await runQuery(
      `INSERT INTO inventory (id, product_id, quantity) VALUES (?, ?, ?)`,
      [uuidv4(), id, product.quantity || 0]
    );
    return id;
  });

  ipcMain.handle('db:updateProduct', async (_, id: string, product) => {
    await runQuery(
      `UPDATE products SET name = ?, category_id = ?, price = ?, cost = ?, sku = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [product.name, product.category_id, product.price, product.cost, product.sku, product.image_url, id]
    );
  });

  ipcMain.handle('db:deleteProduct', async (_, id: string) => {
    await runQuery('UPDATE products SET active = 0 WHERE id = ?', [id]);
  });

  // Categories
  ipcMain.handle('db:getCategories', async () => {
    return getAll('SELECT * FROM categories ORDER BY name');
  });

  ipcMain.handle('db:addCategory', async (_, name: string) => {
    const id = uuidv4();
    await runQuery(
      'INSERT INTO categories (id, name) VALUES (?, ?)',
      [id, name]
    );
    return id;
  });

  // Inventory
  ipcMain.handle('db:getInventory', async (_, productId: string) => {
    return getOne('SELECT * FROM inventory WHERE product_id = ?', [productId]);
  });

  ipcMain.handle('db:updateInventory', async (_, productId: string, quantity: number) => {
    await runQuery(
      'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
      [quantity, productId]
    );
  });

  // Transactions
  ipcMain.handle('db:saveTransaction', async (_, transaction) => {
    const transactionId = uuidv4();
    
    await runQuery(
      `INSERT INTO transactions (id, cashier_id, subtotal, tax, discount_amount, discount_percent, total, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        transaction.cashier_id,
        transaction.subtotal,
        transaction.tax,
        transaction.discount_amount,
        transaction.discount_percent,
        transaction.total,
        transaction.payment_method,
        transaction.status || 'completed'
      ]
    );

    // Save transaction items
    for (const item of transaction.items) {
      await runQuery(
        `INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, discount_amount, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          transactionId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount_amount || 0,
          item.total
        ]
      );

      // Update inventory
      const inventory = await getOne('SELECT quantity FROM inventory WHERE product_id = ?', [item.product_id]);
      if (inventory) {
        await runQuery(
          'UPDATE inventory SET quantity = ? WHERE product_id = ?',
          [inventory.quantity - item.quantity, item.product_id]
        );
      }
    }

    return transactionId;
  });

  ipcMain.handle('db:getTransactions', async (_, startDate?: string, endDate?: string) => {
    let query = 'SELECT * FROM transactions WHERE status = "completed"';
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' AND date(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY created_at DESC';
    return getAll(query, params);
  });

  ipcMain.handle('db:getTransactionDetails', async (_, transactionId: string) => {
    const transaction = await getOne(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    if (transaction) {
      transaction.items = await getAll(
        `SELECT ti.*, p.name, p.sku FROM transaction_items ti
         JOIN products p ON ti.product_id = p.id
         WHERE ti.transaction_id = ?`,
        [transactionId]
      );
    }

    return transaction;
  });

  // Users
  ipcMain.handle('db:getUsers', async () => {
    return getAll('SELECT id, name, email, role, active, created_at FROM users WHERE active = 1');
  });

  ipcMain.handle('db:addUser', async (_, user) => {
    const id = uuidv4();
    await runQuery(
      `INSERT INTO users (id, name, email, pin, role, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.name, user.email, user.pin, user.role || 'cashier', 1]
    );
    return id;
  });

  ipcMain.handle('db:verifyPin', async (_, pin: string) => {
    const user = await getOne(
      'SELECT id, name, email, role FROM users WHERE pin = ? AND active = 1',
      [pin]
    );
    return user;
  });

  // Reports
  ipcMain.handle('db:getDailySales', async (_, date: string) => {
    return getAll(
      `SELECT 
        SUM(total) as total_sales,
        SUM(subtotal) as subtotal,
        SUM(tax) as total_tax,
        SUM(discount_amount) as total_discount,
        COUNT(*) as transaction_count
       FROM transactions 
       WHERE date(created_at) = ? AND status = 'completed'`,
      [date]
    );
  });

  ipcMain.handle('db:getSalesReport', async (_, startDate: string, endDate: string) => {
    return getAll(
      `SELECT 
        date(created_at) as date,
        SUM(total) as total_sales,
        COUNT(*) as transaction_count,
        AVG(total) as average_sale
       FROM transactions
       WHERE date(created_at) BETWEEN ? AND ? AND status = 'completed'
       GROUP BY date(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
  });
};
