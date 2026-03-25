import { ipcMain } from 'electron';

export const registerPrinterHandlers = () => {
  // This will be implemented with actual thermal printer library
  // For now, we'll implement ESC/POS commands for 58mm thermal printers
  
  ipcMain.handle('printer:printReceipt', async (_, receiptData) => {
    try {
      // Receipt formatting for 58mm thermal printer
      const receipt = formatReceiptForThermalPrinter(receiptData);
      
      // In production, this would send to actual printer via node-thermal-printer or similar
      console.log('[v0] Receipt data prepared for printing:', receipt);
      
      return {
        success: true,
        message: 'Receipt sent to printer',
        preview: receipt
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('printer:getAvailablePrinters', async () => {
    // Mock implementation - in production, detect actual thermal printers
    return [
      {
        id: 'thermal-1',
        name: 'Thermal Printer 58mm',
        type: 'thermal',
        width: 58
      }
    ];
  });

  ipcMain.handle('printer:setPrinter', async (_, printerId: string) => {
    // Set the active printer
    return { success: true, printerId };
  });
};

const formatReceiptForThermalPrinter = (receiptData: any): string => {
  const lineWidth = 32; // 58mm printer width in characters
  let receipt = '';

  // Header
  receipt += centerText(receiptData.storeName || 'TOKO ANDA', lineWidth) + '\n';
  receipt += centerText('=' .repeat(lineWidth), lineWidth) + '\n\n';

  // Date and time
  receipt += `${new Date().toLocaleString()}\n`;
  receipt += `Cashier: ${receiptData.cashierName || 'N/A'}\n`;
  receipt += '-'.repeat(lineWidth) + '\n\n';

  // Items
  receipt += formatTableRow('Item', 'Qty', 'Price', 'Total', lineWidth);
  receipt += '-'.repeat(lineWidth) + '\n';

  for (const item of receiptData.items || []) {
    receipt += `${item.name.substring(0, 18)}\n`;
    receipt += formatTableRow(
      `  ${item.quantity}x`,
      `${formatPrice(item.unit_price)}`,
      `${formatPrice(item.total)}`,
      '',
      lineWidth
    );
  }

  receipt += '\n' + '='.repeat(lineWidth) + '\n';

  // Totals
  receipt += formatTableRow('Subtotal:', '', formatPrice(receiptData.subtotal), '', lineWidth);
  
  if (receiptData.discount_amount > 0) {
    receipt += formatTableRow('Discount:', '', `-${formatPrice(receiptData.discount_amount)}`, '', lineWidth);
  }

  if (receiptData.tax > 0) {
    receipt += formatTableRow('Tax:', '', formatPrice(receiptData.tax), '', lineWidth);
  }

  receipt += '-'.repeat(lineWidth) + '\n';
  receipt += formatTableRow('TOTAL:', '', formatPrice(receiptData.total), '', lineWidth);
  receipt += '='.repeat(lineWidth) + '\n\n';

  // Payment method
  receipt += centerText(`Payment: ${receiptData.payment_method}`, lineWidth) + '\n';
  receipt += centerText('Thank You!', lineWidth) + '\n';
  receipt += centerText('Please come again', lineWidth) + '\n\n';

  // Add QR code placeholder if needed
  if (receiptData.transaction_id) {
    receipt += centerText(`Receipt ID: ${receiptData.transaction_id}`, lineWidth) + '\n';
  }

  return receipt;
};

const centerText = (text: string, width: number): string => {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
};

const formatTableRow = (col1: string, col2: string, col3: string, col4: string, width: number): string => {
  // Format: [col1 (12)] [col2 (6)] [col3 (7)] [col4 (7)]
  const col1Width = 12;
  const col2Width = 6;
  const col3Width = 7;

  const formatted = [
    col1.substring(0, col1Width).padEnd(col1Width),
    col2.substring(0, col2Width).padEnd(col2Width),
    col3.substring(0, col3Width).padEnd(col3Width),
    col4.substring(0, col4Width).padEnd(col4Width)
  ].join('');

  return formatted.substring(0, width) + '\n';
};

const col4Width = 7;

const formatPrice = (price: number): string => {
  return `Rp${price?.toLocaleString('id-ID') || '0'}`;
};
