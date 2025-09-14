const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));


mongoose.connect("mongodb://127.0.0.1:27017/ordersDB")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

const orderSchema = new mongoose.Schema({
    items: Object,
    delivered: { type: String, default: "no" },
    email: String,
    name: String,
    orderId: Number,
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);


const wss = new WebSocketServer({ noServer: true });
let clients = [];

wss.on("connection", (ws) => {
    console.log("🔗 WebSocket client connected");
    clients.push(ws);

    ws.on("close", () => {
        clients = clients.filter(client => client !== ws);
        console.log("WebSocket client disconnected");
    });
});


const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});


let globalOrderId = 1;
app.post('/checkout', async (req, res) => {
    try {
        let { cartData: clientCartData } = req.body;
        let email = clientCartData[2].email;
        let cartData = {};

        Object.keys(clientCartData).forEach(itemId => {
            cartData[itemId] = { ...clientCartData[itemId] };
        });

        const newOrder = new Order({
            items: cartData,
            email,
            name: clientCartData[4].name,
            orderId: globalOrderId++
        });

        await newOrder.save();

        clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({ type: "newOrder", order: newOrder }));
            }
        });

        res.json({ success: true, message: 'Order stored successfully', order: newOrder });
    } catch (err) {
        console.error("Error saving order:", err);
        res.status(500).json({ success: false, message: 'Error saving order' });
    }
});

app.post("/", (req, res) => {
    res.sendFile("index.html", "index.html");
});

app.get("/admin", (req, res) => {
    res.sendFile(__dirname + '/public/adminindex.html');
});

app.get('/orders', async (req, res) => {
    const allOrders = await Order.find();
    res.json(allOrders);
});

app.get("/admin/cart-data", async (req, res) => {
    const latestOrder = await Order.find().sort({ createdAt: -1 }).limit(1);
    res.json(latestOrder);
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aswinja05@gmail.com',
        pass: '',
    },
});

app.post('/send-email', async (req, res) => {
    try {
        let recipientEmail = req.body.emailId;
        let recipientOrderId = String(req.body.orderId);

        QRCode.toDataURL(recipientOrderId, async (err, qrUrl) => {
            if (err) {
                console.error("ERROR creating QR code", err);
                res.status(500).json({ success: false, message: 'Error creating QR code' });
                return;
            }

            const mailOptions = {
                from: 'aswinja05@gmail.com',
                to: recipientEmail,
                subject: 'Your order is Ready!',
                html: `<p>Dear Customer,<br><br>Thank you for placing your order. Please collect your order from Counter-1 and Present the below QR Code.<br><img src="cid:qrCode" alt="QR Code"></p>`,
                attachments: [
                    {
                        filename: 'qrCode.png',
                        content: qrUrl.split(';base64,').pop(),
                        encoding: 'base64',
                        cid: 'qrCode'
                    }
                ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    res.status(500).json({ success: false, message: 'Error sending email' });
                } else {
                    res.json({ success: true, message: 'Email sent successfully' });
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

