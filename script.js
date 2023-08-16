// --Variables--
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");

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
        productsDOM.innerHTML=result; // yukarıdaki html kodlarını DOM içerisine yani index sayfasına entegre edeceğiz
    }
}

class Storage {

}

// sayfa yüklendiğinde gerçekleşecek olaylar
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    products.getProducts().then(products => {
        ui.displayProducts(products);
    });
});
