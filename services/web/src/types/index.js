/**
 * Shared type hints for the Endfield Ltd Supply Chain Dashboard.
 * These are JSDoc typedefs used across services, pages, and components.
 */

/**
 * @typedef {Object} Material
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} unit
 * @property {number} currentStock
 * @property {number} minStock
 * @property {"Healthy"|"Low Stock"|"Critical"} status
 * @property {string} updatedAt ISO timestamp
 */

/**
 * @typedef {Object} StockMovement
 * @property {string} id
 * @property {string} materialId
 * @property {"inflow"|"outflow"} type
 * @property {number} quantity
 * @property {string} source
 * @property {string} note
 * @property {string} timestamp ISO timestamp
 */

/**
 * @typedef {Object} PurchaseRequest
 * @property {string} id
 * @property {string} requestCode
 * @property {string} materialId
 * @property {number} quantity
 * @property {string} reason
 * @property {"Pending"|"Approved"|"Received"} status
 * @property {string} requestedBy
 * @property {string} createdAt ISO timestamp
 */

/**
 * @typedef {Object} StockAlert
 * @property {string} id
 * @property {string} materialId
 * @property {number} currentStock
 * @property {number} minStock
 * @property {"Low Stock"|"Critical"} severity
 * @property {string} createdAt ISO timestamp
 */

/**
 * @typedef {Object} InventorySummary
 * @property {number} totalMaterials
 * @property {number} lowStockItems
 * @property {number} todaysInflow
 */

/**
 * @typedef {Object} ProcurementSummary
 * @property {number} pendingRequests
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {any} data
 * @property {string} message
 */

export {};
