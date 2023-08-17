// --Variables--
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");

let cart = [];
let buttonsDOM = [];

class Products {
    async getProducts() {  // js'de her şey eşzamanlı çalıştığı için async dersek burada bir şeyler sırayla gerçekleşeceği anlamına geliyor
        try {
            //mockAPI sitesinde oluşturduğumuz api yardımıyla ürünleri getirme
            let result = await fetch("https://64dc87fae64a8525a0f6a412.mockapi.io/products")
            let data = await result.json();
            let products = data;
            return products;

        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(item => {
            result += `
        <div class="col-lg-4 col-md-6">
            <div class="product">
                <div class="product-image">
                    <img src="${item.image}" alt="Product" />
                </div>
                <div class="product-hover">
                    <span class="product-title">${item.title}</span>
                    <span class="product-price">$ ${item.price}</span>
                    <button class="btn-add-to-cart" data-id=${item.id}>
                        <i class="fas fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        </div>
            `
        });
        productsDOM.innerHTML = result; // yukarıdaki html kodlarını DOM içerisine yani index sayfasına entegre edeceğiz
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".btn-add-to-cart")]  // .btn-add-to-cart classına sahip tüm elementleri dizi şeklinde al
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;  // api ile gelen ürünlerin id'leri
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.setAttribute("disabled", "disabled");
                button.style.opacity = ".3";
            } else {
                button.addEventListener("click", event => {  // butona bir kere tıklandıktan sonra daha tıklanamaması için 
                    event.target.disabled = true;
                    event.target.style.opacity = ".3";

                    // get product from products
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };  // sepete eklemek istediğimiz ürüne her tıkladığımız butondaki item

                    // add product to do cart
                    cart = [...cart, cartItem];

                    // save cart in local storage
                    Storage.saveCart(cart);

                    // save cart values
                    this.saveCartValues(cart);

                    // display cart item
                    this.addCartItem(cartItem);

                    //show the cart
                    this.showCart();

                });
            }
        });
    }


    saveCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;  // alınan ürün miktarı ve fiyatını çarp
            itemsTotal += item.amount; // alışveriş sepeti üzerindeki sayıyı güncellemek için(sepette kaç ürün varsa yaz)
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2)); // virgülden sonraki basamakları almaması için
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const li = document.createElement("li");
        li.classList.add("cart-list-item");
        // Aşağıdaki kodlar html sayfasının içerisine yerleşecek
        li.innerHTML = `
        <div class="cart-left">
            <div class="cart-left-image">
                <img src="${item.image}" alt="Product" />
            </div>
            <div class="cart-left-info">
                <a href="#" class="cart-left-info-title">${item.title}</a>
                <span class="cart-left-info-price">$ ${item.price}</span>
            </div>
         </div>
        <div class="cart-right">
            <div class="cart-right-quantity">
                <button class="quantity-minus" data-id=${item.id}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.amount}</span>
                <button class="quantity-plus" data-id=${item.id}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-right-remove">
                <button class="cart-remove-btn" data-id=${item.id}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
        cartContent.appendChild(li);
    }

    showCart() {  // sepete ürün eklediğimizde sepet butonuna otomatik basılarak açılmasını sağlıyoruz
        cartBtn.click();
    }

    setupAPP() {  // sepete ürün eklediğimizde bunu locale'de kaydeder(yani sayfa tekrar yüklendiğinde ürünler kaybolmaz)
        cart = Storage.getCart();
        this.saveCartValues(cart);
        this.populateCart(cart);  // sayfayı yenilesek bile sepete eklediğimiz ürünleri storage'den alarak listeler
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {  // clear butonuna tıklandıysa tüm ürünler kaldırılacak ve bu ürünlerin butonları tekrar aktif hale getirilecek
            this.clearCart();
        });

        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("cart-remove-btn")) {  // ürün yanındaki kırmızı çöp kutusu simgesine tıklayınca silinmesini sağlayalım
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                removeItem.parentElement.parentElement.parentElement.remove(); // ürünü ui'den yani görnümden sildik
                this.removeItem(id); // ürünün localden de silinmesini sağladık sildik
            }
            else if (event.target.classList.contains("quantity-minus")) {  //cartContent içerisinde tıklanılan eleman quantity-minus ise
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1; // ürün miktarını 1 azaltma işlemi
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);  // miktar azaltma işlemini local'de kaydet
                    this.saveCartValues(cart); // miktar azalttıktan sonra fiyatlara da update işlemi gerçekleşmesi için
                    lowerAmount.nextElementSibling.innerText = tempItem.amount;

                }
                else { // ürün miktarı 1 iken tekrar ürün azaltma işlemi yaptığımızda ürün miktarı 0 olacağı için sepetten kaldırılsın
                    lowerAmount.parentElement.parentElement.parentElement.remove(); // ürünü ui'den yani görnümden sildik
                    this.removeItem(id); // ürünün localden de silinmesini sağladık sildik
                }
            }
            else if(event.target.classList.contains("quantity-plus")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1; // ürün miktarını 1 arttırma işlemi
                Storage.saveCart(cart);
                this.saveCartValues(cart);
                addAmount.previousElementSibling.innerText = tempItem.amount;
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.saveCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false; // beliritlen ürünü sepetten sildiğimizde o ürünün butonu tekrar tıklanabilir olması için
        button.style.opacity = "1";
    }

    getSingleButton(id) {  // hangi butona tıklanarak sepete eklendiyse o tıklanan butonu bul
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

class Storage {
    static saveProducts(products) // classı new'lemeden çağırmak için metodu static yazdık
    {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products")); // localdeki tüm ürünleri parse et
        return products.find(product => product.id === id); // products içerisinde yukarıdan gönderdiğimiz id'li product varsa bul

    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart)); // JSON.stringify(cart)=> cart nesnesini dizeye dönüştürür ve ardından locale kaydeder
    }

    static getCart() {
        // localStorage'de cart'da ürünler varsa onu JSON ie parse ederek javascripte dönüştür eğer cartda ürün yoksa boş bir array döndür
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}


// sayfa yüklendiğinde gerçekleşecek olaylar
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();

    products.getProducts().then(products => {  // önce ürünler gelsin ve sonrasında(then) listelensin en son da butonları alma işlemi gelsin
        ui.displayProducts(products)

        Storage.saveProducts(products);  // ürünleri local'e kaydet

    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })
});
