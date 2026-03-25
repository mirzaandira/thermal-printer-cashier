// Thermal Printer Configuration
// Customize these settings for your thermal printer

export const PRINTER_CONFIG = {
  // Paper width in characters (58mm printer typically has 32 chars per line)
  WIDTH: 32,
  
  // Shop/Store information displayed on receipts
  STORE_NAME: 'TOKO ANDA', // Change this to your store name
  STORE_ADDRESS: '', // Optional store address
  STORE_PHONE: '', // Optional phone number
  
  // Receipt settings
  RECEIPT: {
    // Show header
    SHOW_HEADER: true,
    
    // Show footer with thank you message
    SHOW_FOOTER: true,
    
    // Include transaction ID on receipt
    SHOW_TRANSACTION_ID: true,
    
    // Tax percentage (0-100)
    TAX_PERCENTAGE: 10,
    
    // Footer message
    FOOTER_MESSAGE: 'Terima Kasih!', // "Thank you" in Indonesian
  },
  
  // ESC/POS Commands for thermal printer
  ESC_POS: {
    // Initialize printer
    INIT: '\x1B\x40',
    
    // Set alignment - LEFT
    ALIGN_LEFT: '\x1B\x61\x00',
    
    // Set alignment - CENTER
    ALIGN_CENTER: '\x1B\x61\x01',
    
    // Set alignment - RIGHT
    ALIGN_RIGHT: '\x1B\x61\x02',
    
    // Font emphasis ON
    EMPHASIS_ON: '\x1B\x45\x01',
    
    // Font emphasis OFF
    EMPHASIS_OFF: '\x1B\x45\x00',
    
    // Bold ON
    BOLD_ON: '\x1B\x21\x08',
    
    // Bold OFF
    BOLD_OFF: '\x1B\x21\x00',
    
    // Double width ON
    DOUBLE_WIDTH_ON: '\x1B\x21\x20',
    
    // Double width OFF
    DOUBLE_WIDTH_OFF: '\x1B\x21\x00',
    
    // Line spacing
    LINE_SPACING_DEFAULT: '\x1B\x32',
    
    // Line spacing (n/180 inch)
    LINE_SPACING_CUSTOM: (n: number) => `\x1B\x33${String.fromCharCode(n)}`,
    
    // Cut paper
    CUT_PAPER: '\x1D\x56\x42\x00',
    
    // Partial cut
    CUT_PAPER_PARTIAL: '\x1D\x56\x41\x03',
    
    // Open cash drawer
    OPEN_DRAWER: '\x1B\x70\x00\x19\xFA',
  },
  
  // Payment method labels
  PAYMENT_METHODS: {
    cash: 'CASH',
    card: 'CARD',
    transfer: 'BANK TRANSFER',
    ewallet: 'E-WALLET',
  },
  
  // Currency settings
  CURRENCY: {
    SYMBOL: 'Rp',
    LOCALE: 'id-ID',
    DECIMAL_PLACES: 0,
  },
  
  // Date/Time format
  DATE_TIME: {
    // Format: 'dd/MM/yyyy HH:mm:ss'
    FORMAT: 'dd/MM/yyyy HH:mm:ss',
    LOCALE: 'id-ID',
  },
  
  // Product display on receipt
  PRODUCT_DISPLAY: {
    // Show SKU on receipt
    SHOW_SKU: true,
    
    // Show cost price (for internal use only)
    SHOW_COST: false,
    
    // Show profit margin
    SHOW_MARGIN: false,
  },
  
  // Discount display
  DISCOUNT: {
    // Show discount percentage
    SHOW_PERCENTAGE: true,
    
    // Show discount amount
    SHOW_AMOUNT: true,
  },
  
  // Column widths for receipt table
  COLUMNS: {
    PRODUCT_NAME: 16,
    QUANTITY: 4,
    UNIT_PRICE: 6,
    TOTAL: 6,
  },
};

// Function to format receipt amount using configured currency
export const formatAmount = (amount: number): string => {
  const config = PRINTER_CONFIG;
  return `${config.CURRENCY.SYMBOL}${amount.toLocaleString(
    config.CURRENCY.LOCALE,
    { maximumFractionDigits: config.CURRENCY.DECIMAL_PLACES }
  )}`;
};

// Function to format date/time for receipt
export const formatReceiptDateTime = (date: Date): string => {
  return date.toLocaleString(
    PRINTER_CONFIG.DATE_TIME.LOCALE,
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );
};

// Function to apply ESC/POS text formatting
export const applyFormatting = (
  text: string,
  options: {
    bold?: boolean;
    emphasis?: boolean;
    align?: 'left' | 'center' | 'right';
    doubleWidth?: boolean;
  } = {}
): string => {
  let result = '';
  const config = PRINTER_CONFIG;
  
  if (options.bold) result += config.ESC_POS.BOLD_ON;
  if (options.emphasis) result += config.ESC_POS.EMPHASIS_ON;
  if (options.doubleWidth) result += config.ESC_POS.DOUBLE_WIDTH_ON;
  
  if (options.align) {
    switch (options.align) {
      case 'center':
        result += config.ESC_POS.ALIGN_CENTER;
        break;
      case 'right':
        result += config.ESC_POS.ALIGN_RIGHT;
        break;
      default:
        result += config.ESC_POS.ALIGN_LEFT;
    }
  }
  
  result += text;
  
  if (options.bold) result += config.ESC_POS.BOLD_OFF;
  if (options.emphasis) result += config.ESC_POS.EMPHASIS_OFF;
  if (options.doubleWidth) result += config.ESC_POS.DOUBLE_WIDTH_OFF;
  
  return result;
};
