// const Instascan=require("instascan")
const express = require('express');
const QRCode = require('qrcode');
const axios = require('axios');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;


app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));


let cartData = [];
let orders = [];
app.post('/checkout', (req, res) => {
    let { cartData: clientCartData } = req.body;
    cartData = []

    Object.keys(clientCartData).forEach(itemId => {

        cartData[itemId] = { ...clientCartData[itemId] };

    })

    orders.push(cartData)
    console.log('CartData:', cartData);
    console.log("orders:", orders)




    res.json({ success: true, message: 'Order received successfully', serverCartData: cartData });
});





app.post("/", (req, res) => {
    res.sendFile("index.html", "index.html")
})


app.get("/admin", (req, res) => {
    res.sendFile(__dirname + '/public/adminindex.html')



})

app.get('/orders', (req, res) => {
    res.json(orders);
});

app.get("/admin/cart-data", (req, res) => {

    res.json(cartData)
    cartData = []
})




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aswinja05@gmail.com',
        pass: 'awkr wknl ylxm skvj',
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
                        content: qrUrl.split(';base64,').pop(), // Extract Base64 data
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
                    // console.log('Email sent:', info.response);
                    res.json({ success: true, message: 'Email sent successfully' });
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);

});










