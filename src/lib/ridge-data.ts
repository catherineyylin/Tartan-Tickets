export type Order = {
  orderNumber: string;
  lastName: string;
  customerName: string;
  items: string;
  status: string;
};

export const orders: Order[] = [
  {
    orderNumber: "A1001",
    lastName: "Shah",
    customerName: "Priya Shah",
    items: "Summit 40L Backpack, $149",
    status: "Delivered Aug 28, 2026",
  },
  {
    orderNumber: "A1002",
    lastName: "Lee",
    customerName: "Marcus Lee",
    items: "Basecamp 2P Tent, $329",
    status: "Shipped Sep 12, 2026; in transit; no tracking update since Sep 14",
  },
  {
    orderNumber: "A1003",
    lastName: "Kowalski",
    customerName: "Dana Kowalski",
    items: "Trailhead Rain Jacket, $189",
    status: "Delivered Jul 30, 2026; card was charged twice ($189 x 2)",
  },
  {
    orderNumber: "A1004",
    lastName: "Rivera",
    customerName: "Sam Rivera",
    items: "Ember Camp Stove $69 and Ridge Trekking Poles $89",
    status: "Processing; ships Oct 3, 2026",
  },
  {
    orderNumber: "A1005",
    lastName: "Blake",
    customerName: "Jordan Blake",
    items: "Northstar Sleeping Bag, $259",
    status: "Delivered Sep 18, 2026",
  },
];

export type Product = {
  name: string;
  price: number;
  stock: string;
  knownIssues: string;
};

export const products: Product[] = [
  {
    name: "Summit 40L Backpack",
    price: 149,
    stock: "In stock",
    knownIssues:
      "Main zipper failures on units sold after June 1, 2026. Free replacement under warranty.",
  },
  {
    name: "Trailhead Rain Jacket",
    price: 189,
    stock: "In stock",
    knownIssues: "None",
  },
  {
    name: "Basecamp 2P Tent",
    price: 329,
    stock: "Low stock",
    knownIssues: "None",
  },
  {
    name: "Ridge Trekking Poles",
    price: 89,
    stock: "In stock",
    knownIssues: "None",
  },
  {
    name: "Ember Camp Stove",
    price: 69,
    stock: "In stock",
    knownIssues: "None",
  },
  {
    name: "Northstar Sleeping Bag",
    price: 259,
    stock: "Out of stock until October 15",
    knownIssues: "None",
  },
];

export const policies: Record<string, string> = {
  Returns:
    "Returns: within 30 days of delivery for unused items; refund to the original payment method within 5 to 7 business days after the item arrives. Returns team.",
  Warranty:
    "Warranty: 1 year against manufacturing defects; free repair or replacement. Quality team, response within 24 hours.",
  Shipping:
    "Shipping: standard shipping takes 5 to 7 business days. If tracking has not updated in 7 or more days, open a Shipping ticket; the Logistics team traces the package within 24 hours and reships if it is lost.",
  Billing:
    "Billing: duplicate or incorrect charges go to the Finance team; confirmed duplicates are refunded within 5 to 7 business days.",
  "Price match":
    "Price match: if our own price drops within 14 days of purchase, the Finance team refunds the difference.",
  Discounts: "Discounts: support agents cannot create discount codes.",
};
