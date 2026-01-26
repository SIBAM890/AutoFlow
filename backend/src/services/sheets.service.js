const mockInventory = [
    { product: "Red Lipstick", price: 299, stock: 15 },
    { product: "Blue Eyeliner", price: 349, stock: 8 },
    { product: "Foundation", price: 599, stock: 0 },
    { product: "Matte Compact", price: 199, stock: 20 }
];

// Existing lookup function
exports.lookupProduct = async (productName) => {
    // Simple fuzzy search
    const item = mockInventory.find(p =>
        p.product.toLowerCase().includes(productName.toLowerCase())
    );

    if (item) {
        return { found: true, ...item };
    }
    return { found: false };
};

// NEW: Function to get list of products
exports.getAllProducts = async () => {
    return mockInventory.map(p => `- ${p.product} (₹${p.price})`).join("\n");
};