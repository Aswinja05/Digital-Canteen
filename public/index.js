import { foodItem } from './fooditem.js'
import { Details } from '../details.js'


console.log(Details)

let login_flag = 0
function displayItems() {
    var biryani = document.getElementById('biryani');

    const biryaniData = foodItem.filter((item) => item.category == 'biryani');

    biryaniData.map(item => {

        var itemCard = document.createElement('div');
        itemCard.setAttribute('id', 'item-card')

        var cardTop = document.createElement('div');
        cardTop.setAttribute('id', 'card-top');

        var star = document.createElement('i');

        star.innerText = ' ' + item.rating;

        var heart = document.createElement('i');
        heart.setAttribute('class', 'fa fa-plus add-to-cart');
        heart.setAttribute('id', item.id)
        // cardTop.setAttribute('onClick','add-to-cart()')

        // cardTop.appendChild(star);
        cardTop.appendChild(heart);


        var img = document.createElement('img');
        img.src = item.img;

        var itemName = document.createElement('p');
        itemName.setAttribute('id', 'item-name');
        itemName.innerText = item.name;

        var itemPrice = document.createElement('p');
        itemPrice.setAttribute('id', 'item-price');
        itemPrice.innerText = 'Price : ₹ ' + item.price;

        itemCard.appendChild(cardTop);
        itemCard.appendChild(img);
        itemCard.appendChild(itemName);
        itemCard.appendChild(itemPrice);

        biryani.appendChild(itemCard);

    })

}

displayItems();

const vegData = [...new Map(foodItem.map(item => [item['category'], item])).values()];



document.querySelectorAll('.add-to-cart').forEach(item => {
    item.addEventListener('click', addToCart)
})


var cartData = [];
console.log(cartData)
function addToCart() {

    var itemToAdd = this.parentNode.nextSibling.nextSibling.innerText;
    var itemObj = foodItem.find(element => element.name == itemToAdd);

    var index = cartData.indexOf(itemObj);
    if (index === -1) {
        document.getElementById(itemObj.id).classList.add('toggle-heart');
        cartData = [...cartData, itemObj];
        console.log(cartData)
    }
    else if (index > -1) {
        alert("Added to cart!");
    }

    document.getElementById('cart-plus').innerText =
        ' ' + cartData.length + ' Items';
    document.getElementById('m-cart-plus').innerText =
        ' ' + cartData.length;
    totalAmount();
    cartItems();
    sendCartDataToServer();
}


function sendCartDataToServer() {

    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartData }),
    })
        .then(response => response.json())
        .then(data => {

            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

console.log(cartData)
function cartItems() {
    var tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    console.log(cartData)
    cartData.map(item => {
        var tableRow = document.createElement('tr');

        var rowData1 = document.createElement('td');
        var img = document.createElement('img');
        img.src = item.img;
        rowData1.appendChild(img);

        var rowData2 = document.createElement('td');
        rowData2.innerText = item.name;

        var rowData3 = document.createElement('td');
        var btn1 = document.createElement('button');
        btn1.setAttribute('class', 'decrease-item');
        btn1.innerText = '-';
        var span = document.createElement('span');
        span.innerText = item.quantity;
        var btn2 = document.createElement('button');
        btn2.setAttribute('class', 'increase-item');
        btn2.innerText = '+';

        rowData3.appendChild(btn1);
        rowData3.appendChild(span);
        rowData3.appendChild(btn2);

        var rowData4 = document.createElement('td');
        rowData4.innerText = item.price;

        tableRow.appendChild(rowData1);
        tableRow.appendChild(rowData2);
        tableRow.appendChild(rowData3);
        tableRow.appendChild(rowData4);

        tableBody.appendChild(tableRow);
    })
    document.querySelectorAll('.increase-item').forEach(item => {
        item.addEventListener('click', incrementItem)
    })

    document.querySelectorAll('.decrease-item').forEach(item => {
        item.addEventListener('click', decrementItem)
    })
}



let name
let email

function checkout() {
    if (login_flag == 0) {
        login()
    }
    else {
        let orderId = Math.floor(Math.random() * (999 - 100 + 1) + 100);

        // cartData.push({"delivered": "no"})
        cartData.push({ "email": email })
        cartData.push({ "orderId": orderId })
        cartData.push({ "name": name })

        
        console.log(cartData)




        console.log("clicked...")
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cartData }),

        })
            .then(response => response.json())
            .then(data => {

                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        // alert("Checked out succesfully....Your order has been recorded")
        // cartData=[];
    }
    if (login_flag == 1) {
        location.reload()
    }
}

let checkoutbtn = document.getElementsByClassName('checkoutbtn');
let mob_checkoutbtn = document.getElementsByClassName('mob_checkoutbtn');


checkoutbtn[0].addEventListener('click', checkout);
mob_checkoutbtn[0].addEventListener('click', checkout);






function incrementItem() {
    let itemToInc = this.parentNode.previousSibling.innerText;
    console.log(itemToInc)
    var incObj = cartData.find(element => element.name == itemToInc);
    incObj.quantity += 1;

    currPrice = (incObj.price * incObj.quantity - incObj.price * (incObj.quantity - 1)) / (incObj.quantity - 1);
    incObj.price = currPrice * incObj.quantity;
    totalAmount()
    cartItems();
}

var currPrice = 0;
function decrementItem() {
    let itemToInc = this.parentNode.previousSibling.innerText;
    let decObj = cartData.find(element => element.name == itemToInc);
    let ind = cartData.indexOf(decObj);
    if (decObj.quantity > 1) {
        currPrice = (decObj.price * decObj.quantity - decObj.price * (decObj.quantity - 1)) / (decObj.quantity);
        decObj.quantity -= 1;
        decObj.price = currPrice * decObj.quantity;
    }
    else {
        document.getElementById(decObj.id).classList.remove('toggle-heart')
        cartData.splice(ind, 1);
        document.getElementById('cart-plus').innerText = ' ' + cartData.length + ' Items';
        document.getElementById('m-cart-plus').innerText = ' ' + cartData.length;
        if (cartData.length < 1 && flag) {
            document.getElementById('food-items').classList.toggle('food-items');
            document.getElementById('category-list').classList.toggle('food-items');
            document.getElementById('m-cart-plus').classList.toggle('m-cart-toggle')
            document.getElementById('cart-page').classList.toggle('cart-toggle');
            document.getElementById('category-header').classList.toggle('toggle-category');
            document.getElementById('checkout').classList.toggle('cart-toggle');
            flag = false;
            alert("Currently no item in cart!");
            console.log(flag)
        }
    }
    totalAmount()
    cartItems()
}

function totalAmount() {
    var sum = 0;
    cartData.map(item => {
        sum += item.price;
    })
    // document.getElementById('total-item').innerText= 'Total Item : ' + cartData.length;
    document.getElementById('total-price').innerText = 'Total Price : ₹ ' + sum;
    document.getElementById('m-total-amount').innerText = 'Total Price : ₹ ' + sum;
}

document.getElementById('cart-plus').addEventListener('click', cartToggle);
document.getElementById('m-cart-plus').addEventListener('click', cartToggle);

var flag = false;
function cartToggle() {
    if (cartData.length > 0) {
        document.getElementById('food-items').classList.toggle('food-items');
        document.getElementById('category-list').classList.toggle('food-items');
        document.getElementById('category-header').classList.toggle('toggle-category');
        document.getElementById('m-cart-plus').classList.toggle('m-cart-toggle')
        document.getElementById('cart-page').classList.toggle('cart-toggle');
        document.getElementById('checkout').classList.toggle('cart-toggle');
        document.getElementsByClassName('mob_checkoutbtn')[0].style.display = "block";
        flag = true;
        console.log(flag)
        document.getElementById("menu").style.display = "none";
        // document.getElementsByClassName("mobile_checkoutbtn").style.display="block"
    }
    else {
        alert("Currently no item in cart!");
    }
}


window.onresize = window.onload = function () {
    var size = window.screen.width;
    console.log(size)
    if (size < 800) {
        var cloneFoodItems = document.getElementById('food-items').cloneNode(true);
        var cloneCartPage = document.getElementById('cart-page').cloneNode(true);
        document.getElementById('food-items').remove();
        document.getElementById('cart-page').remove();
        document.getElementById('category-header').after(cloneFoodItems);
        document.getElementById('food-items').after(cloneCartPage);
        addEvents()
    }
    if (size > 800) {
        var cloneFoodItems = document.getElementById('food-items').cloneNode(true);
        document.getElementById('food-items').remove();
        document.getElementById('header').after(cloneFoodItems);

        var cloneCartPage = document.getElementById('cart-page').cloneNode(true);
        document.getElementById('cart-page').remove();
        document.getElementById('food-items').after(cloneCartPage);
        addEvents()
    }
}



function addEvents() {
    document.querySelectorAll('.add-to-cart').forEach(item => {
        item.addEventListener('click', addToCart)
    });
    document.querySelectorAll('.increase-item').forEach(item => {
        item.addEventListener('click', incrementItem)
    })

    document.querySelectorAll('.decrease-item').forEach(item => {
        item.addEventListener('click', decrementItem)
    })
}

document.getElementById('login').addEventListener('click', login);
document.getElementsByClassName('m-login')[0].addEventListener('click', login);
if (login_flag == 1) {
    document.getElementsByClassName("m-login").style.display = "none"
}



function register() {
    let reg_name = prompt("Enter your name(As in id card)")
    let reg_email = prompt("Enter your Email id")
    let reg_id_no = prompt("Enter your Id card Number")
    let reg_obj = {
        id_no: reg_id_no,
        name: reg_name,
        email: reg_email
    }
    Details.push(reg_obj)
    console.log(Details)
}
document.getElementById("reg_btn").addEventListener('click',register)


function login() {



    const video = document.getElementById('l_video');
    const login_cont = document.getElementsByClassName("login_cont");
    login_cont[0].style.display = "block";

    let stream;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (streamObj) {
            stream = streamObj
            video.srcObject = stream;
            video.play();
        })
        .catch(function (error) {
            console.error('Error accessing camera:', error);
        });

    document.getElementById("close").addEventListener('click', () => {
        login_cont[0].style.display = "none";
        if (stream) {
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    });
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: video,
        },
        decoder: {
            readers: ["code_128_reader"],
        },
    }, (err) => {
        if (err) {
            console.error('Error initializing Quagga:', err)
        }
        Quagga.start()
    })

    Quagga.onDetected((result) => {
        console.log('Detected barcode:', result.codeResult.code);
        document.getElementsByClassName('result')[0].textContent = result.codeResult.code;
        const pattern = /^\d{2}[A-Z]{2}\d{3}$/;
        const idno = result.codeResult.code
        const isMatch = pattern.test(idno);
        if (isMatch) {
            alert("Log-in Successfull")
            login_flag = 1

            const selectedObject = Details.find(obj => obj.id_no === idno);
            email = selectedObject.email
            name = selectedObject.name
            console.log(email + "-----" + name)

            document.getElementsByClassName("m-login")[0].style.display = "none"
            login_cont[0].style.display = "none";
            if (stream) {
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
            }
        }

    });
    document.getElementsByClassName('result')[0].innerText = 'No BarCode Detected';

}


// const isMatch = pattern.test(inputString);
// console.log("Test:",isMatch); // true or false




