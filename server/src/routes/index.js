import { registerRoutes as registerStoreRoutes } from './store.routes.js';
import { registerRoutes as registerAccountRoutes } from './account.routes.js';
import { registerRoutes as registerCartRoutes } from './cart.routes.js';
import { registerRoutes as registerCheckoutRoutes } from './checkout.routes.js';
import { registerRoutes as registerPaymentRoutes } from './payments.routes.js';
import { registerRoutes as registerOrderRoutes } from './orders.routes.js';
import { registerRoutes as registerCatalogAdminRoutes } from './admin/catalog.routes.js';
import { registerRoutes as registerInventoryAdminRoutes } from './admin/inventory.routes.js';
import { registerRoutes as registerOrderAdminRoutes } from './admin/orders.routes.js';
import { registerRoutes as registerCustomerAdminRoutes } from './admin/customers.routes.js';
import { registerRoutes as registerSettingsAdminRoutes } from './admin/settings.routes.js';
import { registerRoutes as registerContentRoutes } from './content.routes.js';

export function registerApiRoutes() {
  registerStoreRoutes();
  registerAccountRoutes();
  registerCartRoutes();
  registerCheckoutRoutes();
  registerPaymentRoutes();
  registerOrderRoutes();
  registerCatalogAdminRoutes();
  registerInventoryAdminRoutes();
  registerOrderAdminRoutes();
  registerCustomerAdminRoutes();
  registerSettingsAdminRoutes();
  registerContentRoutes();
}
