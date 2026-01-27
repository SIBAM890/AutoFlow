const sheetsService = require('./sheets.service');

// Default active workflow (In real app, AI generates this)
let activeWorkflow = {
    trigger: "whatsapp_message",
    steps: [
        { type: "detect_intent" },
        { type: "action_router" },
        { type: "reply" }
    ]
};

exports.processMessage = async (sock, sender, messageText) => {
    // 0. SAFETY: Ensure message is a string
    if (typeof messageText !== 'string') {
        console.warn("⚠️ Engine received non-string message:", messageText);
        messageText = JSON.stringify(messageText) || "";
    }

    console.log(`⚙️ Engine Processing: "${messageText}"`);

    const lowerMsg = messageText.toLowerCase().trim();
    let replyText = "";

    // 1. HANDLE GREETINGS (Expanded)
    const greetings = ["hi", "hello", "hy", "hey", "hyy", "hlo", "hola", "start"];
    if (greetings.includes(lowerMsg)) {
        await sock.sendMessage(sender, { text: "👋 Hi there! I'm AutoFlow AI.\n\nYou can ask:\n- List all products\n- Price of Red Lipstick\n- Track order" });
        return;
    }

    // 2. DETECT INTENT (The Brain)
    let intent = "unknown";
    let productQuery = "";

    // A. LIST PRODUCTS (New!)
    if (lowerMsg.includes("list") || lowerMsg.includes("products") || lowerMsg.includes("have") || lowerMsg.includes("catalogue")) {
        intent = "list_products";
    }
    // B. BUY / PLACE ORDER (New!)
    else if (lowerMsg.includes("buy") || lowerMsg.includes("need one") || lowerMsg.includes("want") || lowerMsg.includes("book") || lowerMsg === "order one") {
        intent = "place_order";
    }
    // C. TRACK ORDER (Refined)
    // Only triggers if user says "track", "status", or "where is"
    else if (lowerMsg.includes("track") || lowerMsg.includes("status") || lowerMsg.includes("where is")) {
        intent = "order_tracking";
    }
    // D. PRODUCT INQUIRY (Price/Stock)
    else if (lowerMsg.includes("price") || lowerMsg.includes("available") || lowerMsg.includes("hai kya") || lowerMsg.includes("cost") || lowerMsg.includes("stock")) {
        intent = "product_inquiry";
        productQuery = messageText
            .replace(/price|available|hai kya|cost|stock|please|tell|me|the|for|is|of|what|are/gi, "")
            .trim();
    }

    // 3. EXECUTE ACTIONS
    if (intent === "list_products") {
        const productList = await sheetsService.getAllProducts();
        replyText = `🛍️ *Here is our Product List:*\n\n${productList}\n\nReply with a product name to check stock!`;
        await sock.sendMessage(sender, { text: replyText });
    }
    else if (intent === "place_order") {
        // Simple buying flow
        replyText = "🎉 Great choice! To place your order, please reply with your **Full Name and Address**.";
        await sock.sendMessage(sender, { text: replyText });
    }
    else if (intent === "product_inquiry") {
        const data = await sheetsService.lookupProduct(productQuery);
        if (data.found) {
            if (data.stock > 0) {
                replyText = `✅ Yes! ${data.product} is available.\n💰 Price: ₹${data.price}\n📦 Stock: ${data.stock} units.\n\nType "Buy now" to order!`;
            } else {
                replyText = `❌ Sorry, ${data.product} is currently out of stock.`;
            }
        } else {
            if (productQuery.length > 1) {
                replyText = `🤔 I couldn't find "${productQuery}". Try asking "List products" to see what we have.`;
            } else {
                replyText = "Please type the product name.";
            }
        }
        await sock.sendMessage(sender, { text: replyText });
    }
    else if (intent === "order_tracking") {
        await sock.sendMessage(sender, { text: "📦 To track your order, please send your Order ID (e.g. #ORD-123)." });
    }
    else {
        // Fallback
        await sock.sendMessage(sender, { text: "🤖 I didn't understand. Try:\n- 'List products'\n- 'Price of Red Lipstick'" });
    }
};