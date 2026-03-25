import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  // Database calls
  getProducts: () => ipcRenderer.invoke('db:getProducts'),
  getProduct: (id: string) => ipcRenderer.invoke('db:getProduct', id),
  addProduct: (product: any) => ipcRenderer.invoke('db:addProduct', product),
  updateProduct: (id: string, product: any) => ipcRenderer.invoke('db:updateProduct', id, product),
  deleteProduct: (id: string) => ipcRenderer.invoke('db:deleteProduct', id),

  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  addCategory: (name: string) => ipcRenderer.invoke('db:addCategory', name),

  getInventory: (productId: string) => ipcRenderer.invoke('db:getInventory', productId),
  updateInventory: (productId: string, quantity: number) => ipcRenderer.invoke('db:updateInventory', productId, quantity),

  saveTransaction: (transaction: any) => ipcRenderer.invoke('db:saveTransaction', transaction),
  getTransactions: (startDate?: string, endDate?: string) => ipcRenderer.invoke('db:getTransactions', startDate, endDate),
  getTransactionDetails: (transactionId: string) => ipcRenderer.invoke('db:getTransactionDetails', transactionId),

  getUsers: () => ipcRenderer.invoke('db:getUsers'),
  addUser: (user: any) => ipcRenderer.invoke('db:addUser', user),
  verifyPin: (pin: string) => ipcRenderer.invoke('db:verifyPin', pin),

  getDailySales: (date: string) => ipcRenderer.invoke('db:getDailySales', date),
  getSalesReport: (startDate: string, endDate: string) => ipcRenderer.invoke('db:getSalesReport', startDate, endDate),

  // Printer calls
  printReceipt: (receiptData: any) => ipcRenderer.invoke('printer:printReceipt', receiptData),
  getAvailablePrinters: () => ipcRenderer.invoke('printer:getAvailablePrinters'),
  setPrinter: (printerId: string) => ipcRenderer.invoke('printer:setPrinter', printerId),
};

contextBridge.exposeInMainWorld('electron', { api });

declare global {
  interface Window {
    electron: {
      api: typeof api;
    };
  }
}
