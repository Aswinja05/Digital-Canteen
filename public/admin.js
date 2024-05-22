
const cartDisplay = document.getElementById('cartDisplay')
let delivery_btn = document.getElementsByClassName("delivery_btn")
document.addEventListener('DOMContentLoaded', function () {
    let prev = "dosa"

    function fetchCartData() {
        fetch('http://localhost:3000/admin/cart-data')
            .then(response => response.json("fetched successfully"))
            .then(data => {
                displayCartData(data, data.length);
            })
            .catch(error => {
                console.error('Error:', error)
            })

    }




    function displayCartData(data, len) {

        let i
    //    console.log(data)
        if ((data[0].name != prev[0].name) || (data[0].quantity != prev[0].quantity)) {
        // if (data[len-2].orderId!=prev[len-2].orderId) {

            console.log("Ordered by ", data[len - 1].name)
            const node = document.createElement("div");
            document.getElementById("cartDisplay").appendChild(node);
            node.classList.add("node-list")
            let textnode
            const span1 = document.createElement("span");
            const span2 = document.createElement("span");
            let spantextnode1 = document.createTextNode(`Customer: ${data[len - 1].name}`);
            let spantextnode2 = document.createTextNode(`${data[len - 2].orderId}`);
            span1.appendChild(spantextnode1);
            span2.appendChild(spantextnode2);
            node.appendChild(span1)
            node.appendChild(span2)
            span2.classList.add("display-none")
            node.appendChild(document.createElement('br'));


            for (i = 0; i <= len - 1; i++) {
                if (data[i].quantity != undefined) {
                    textnode = document.createTextNode(`${JSON.stringify(data[i].name, null, 2)}_____${JSON.stringify(data[i].quantity, null, 2)}`);

                    node.appendChild(textnode);
                    node.appendChild(document.createElement('br'));
                }
            }

            const delivery_btn = document.createElement("button");

            let delivery_text = document.createTextNode(`Notify Customer`);
            delivery_btn.appendChild(delivery_text)


            node.appendChild(delivery_btn)


            delivery_btn.addEventListener('click', async () => {
                node.style.backgroundColor = "rgb(121 235 81)"
                // delivery_text.nodeValue = "Scan QR"
                delivery_btn.remove()
                const orderId = parseInt(node.getElementsByTagName('span')[1].innerText);
                console.log("admin orderid", orderId, typeof (orderId))
                try {
                    const ordersResponse = await fetch('http://localhost:3000/orders');
                    const ordersData = await ordersResponse.json();

                    let emailId

                    for (i = 0; i < ordersData.length; i++) {
                        if (ordersData[i][ordersData[i].length-2].orderId == orderId) {
                            console.log("orderId found")
                            emailId = ordersData[i][ordersData[i].length-3].email
                            console.log("New_____",emailId)
                            console.log(JSON.parse(JSON.stringify({ emailId })).emailId)
                            break
                        }
                    }


                    const response = await fetch('http://localhost:3000/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ emailId, orderId }),
                    });


                } catch (error) {
                    console.error('Error:', error);
                }


            })

            delivery_btn.classList.add("delivery_btn")
            prev = data


        }

    }


    setInterval(fetchCartData, 3000);
})







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
                const ordersResponse = await fetch('http://localhost:3000/orders')
                    .then()
                { console.log("  fetched") };
                const ordersData = await ordersResponse.json();
                console.log(ordersData)


                for (i = 0; i < ordersData.length; i++) {
                   
                    if (parseInt(ordersData[i][ordersData[i].length-2].orderId) == parseInt(code.data)) {
                        ordersData[i][ordersData[i].length-4].delivered="yes"
                        console.log("New----",ordersData[i][ordersData[i].length-4])
                        console.log("orderId qr found")
                        let node = document.getElementsByClassName("node-list")
                        console.log(node.length)
                        for (let i = 0; i < node.length; i++) {
                            console.log((node[i].getElementsByTagName('span')[1].innerText))
                            console.log(code.data)
                           
                            console.log((node[i].getElementsByTagName('span')[1].innerText) == code.data)
                            if ((node[i].getElementsByTagName('span')[1].innerText) == code.data) {
                                node[i].style.backgroundColor = "crimson"
                                node[i].style.color = "white"
                                node[i].getElementsByTagName('span')[0].style.color="wheat"
                                // node[i].style.scale = "1.2"
                                // node[i].remove()
                                setTimeout(() => {
                                    node[i].remove()
                                }, 10000,i);
                                console.log("Color changed")
                            }
                        }
                        break
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

    // Start capturing frames
    requestAnimationFrame(captureFrame);
});

// Handle errors if the video fails to load
video.addEventListener('error', function (e) {
    console.error('Error loading video:', e);
});







