const cartDisplay = document.getElementById('cartDisplay')
let delivery_btn = document.getElementsByClassName("delivery_btn")
document.addEventListener('DOMContentLoaded', function () {
    let prev = "dosa"

    // ------------------ WebSocket Connection ------------------
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        console.log("✅ Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "newOrder") {
            displayCartData(data.order);
        }
    };

    function displayCartData(order) {
        console.log("Ordered by ", order.items[Object.keys(order.items)[0]].name);

        const node = document.createElement("div");
        document.getElementById("cartDisplay").appendChild(node);
        node.classList.add("node-list");

        const span1 = document.createElement("span");
        const span2 = document.createElement("span");
        let spantextnode1 = document.createTextNode(`Customer: ${order.name}`);
        let spantextnode2 = document.createTextNode(`${order.orderId}`);
        span1.appendChild(spantextnode1);
        span2.appendChild(spantextnode2);
        node.appendChild(span1);
        node.appendChild(span2);
        span2.classList.add("display-none");
        node.appendChild(document.createElement('br'));

        for (const key of Object.keys(order.items)) {
            const item = order.items[key];
            if (item.quantity != undefined) {
                const textnode = document.createTextNode(`${item.name} _____ ${item.quantity}`);
                node.appendChild(textnode);
                node.appendChild(document.createElement('br'));
            }
        }

        const delivery_btn = document.createElement("button");
        let delivery_text = document.createTextNode(`Notify Customer`);
        delivery_btn.appendChild(delivery_text);
        node.appendChild(delivery_btn);

        delivery_btn.addEventListener('click', async () => {
            node.style.backgroundColor = "rgb(121 235 81)";
            delivery_btn.remove();
            const orderId = order.orderId;

            try {
                const response = await fetch('http://localhost:3000/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emailId: order.email, orderId }),
                });
            } catch (error) {
                console.error('Error:', error);
            }
        });

        delivery_btn.classList.add("delivery_btn");
        prev = order;
    }
});

// ------------------ QR Scanner Section (unchanged) ------------------
const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(function (stream) {
        video.srcObject = stream;
    })
    .catch(function (error) {
        console.error('Error accessing camera:', error);
    });

video.addEventListener('loadedmetadata', function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    async function captureFrame() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            document.getElementById('qrResult').textContent = 'QR Code Detected: ' + code.data;
            try {
                const ordersResponse = await fetch('http://localhost:3000/orders');
                const ordersData = await ordersResponse.json();
                

                for (let i = 0; i < ordersData.length; i++) {
                    if (parseInt(ordersData[i].orderId) === parseInt(code.data)) {
                        ordersData[i].delivered = "yes";
                        console.log("orderId qr found");

                        let node = document.getElementsByClassName("node-list");
                        for (let j = 0; j < node.length; j++) {
                            if ((node[j].getElementsByTagName('span')[1].innerText) == code.data) {
                                node[j].style.backgroundColor = "crimson";
                                node[j].style.color = "white";
                                node[j].getElementsByTagName('span')[0].style.color = "wheat";
                                setTimeout(() => {
                                    node[j].remove()
                                }, 10000, j);
                                console.log("Color changed");
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            document.getElementById('qrResult').textContent = 'No QR Code Detected';
        }

        requestAnimationFrame(captureFrame);
    }
    requestAnimationFrame(captureFrame);
});

video.addEventListener('error', function (e) {
    console.error('Error loading video:', e);
});
