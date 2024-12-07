const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/customer/";
const apiPath = "johnny5563";

// 功能統整

// 產品列表區域
// 串接API導入商品資料渲染
axios
  .get(`${baseUrl}${apiPath}/products`)
  .then((res) => {
    data = res.data.products;
    // 渲染產品列表
    renderProducts();
    emptyCart();
    updateCartList();
  })
  .catch((err) => alert(err.response.data.message));

function renderProducts() {
  productWrap.innerHTML = data
    .map((product) => {
      return `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img
              src="${product.images}"
              alt=""
            />
            <a href="#" class="addCardBtn" data-id="${
              product.id
            }">加入購物車</a>
            <h3>${product.title}</h3>
            <del class="originPrice">NT$${numberWithCommas(
              product.origin_price
            )}</del>
            <p class="nowPrice">NT$${numberWithCommas(product.price)}</p>
          </li>`;
    })
    .join("");
}

// 加入購物車
// 監聽按鈕，用data-id綁定product id
// 點擊監聽範圍ul內的a，觸發function addCart
const productWrap = document.querySelector(".productWrap");
productWrap.addEventListener("click", addCart);
function addCart(e) {
  e.preventDefault();
  const productId = e.target.dataset.id;
  let quantity = 1;

  axios.get(`${baseUrl}${apiPath}/carts`).then((res) => {
    const cartData = res.data.carts; // 取得當下購物車列表
    cartData.forEach((item) => {
      const existingItem = cartData.find(
        (item) => item.product.id === productId
      );
      quantity = existingItem ? existingItem.quantity + 1 : 1;
    });
    const productData = {
      data: {
        productId: productId,
        quantity: quantity,
      },
    };

    if (e.target.className === "addCardBtn") {
      // 加入購物車post
      axios.post(`${baseUrl}${apiPath}/carts`, productData).then((res) => {
        updateCartList();
      });
    }
  });

  // 比對購物車列表中是否有目前點擊商品的ID
  // 目前購物車列表 >> axios.get(`${baseUrl}${apiPath}/carts`)
  // 購物車列表商品ID >> cartData.id
  // 點擊的商品ID >> productId
}

// 購物車區域
// 取得購物車列表
// 無資料 >> 顯示文字"購物車目前是空的"
// 有資料 >> 渲染列表

// 購物車列表
// 商品 >> 刪除特定商品button
// 用data-id綁定product id
const cartDetails = document.querySelector(".cart-details");
const cartTitle = document.querySelector(".cart-title");
const cartFooter = document.querySelector(".cart-footer");
function renderCartList(data) {
  if (data.length > 0) {
    cartComponentOn();
    cartDetails.innerHTML = data
      .map((cartProduct) => {
        return `
      <tr class="cart-detail">
        <td>
            <div class="cardItem-title">
              <img src="${cartProduct.product.images}" alt="" />
              <p>${cartProduct.product.title}</p>
            </div>
          </td>
          <td>NT$${numberWithCommas(cartProduct.product.price)}</td>
          <td>${cartProduct.quantity}</td>
          <td>NT$${numberWithCommas(
            cartProduct.product.price * cartProduct.quantity
          )}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${
              cartProduct.id
            }"> clear </a>
          </td>
        </tr>
      `;
      })
      .join("");
  }
}

// Cart Title / Cart Footer => ON/OFF
function cartComponentOn() {
  cartTitle.style.display = "";
  cartFooter.style.display = "";
}

function cartComponentOff() {
  cartTitle.style.display = "none";
  cartFooter.style.display = "none";
}

// 更新購物車列表
const totalAmount = document.querySelector(".total-Amout");
function updateCartList() {
  axios.get(`${baseUrl}${apiPath}/carts`).then((res) => {
    cartData = res.data.carts;
    let sum = cartData
      .map((item) => {
        return item.product.price * item.quantity;
      })
      .reduce((acc, cur) => {
        return acc + cur;
      }, 0);
    totalAmount.innerHTML = `NT$${numberWithCommas(sum)}`;
    renderCartList(cartData);
  });
}

// 購物車目前是空的
function emptyCart() {
  axios.get(`${baseUrl}${apiPath}/carts`).then((res) => {
    cartData = res.data.carts;
    if (cartData.length === 0) {
      cartDetails.innerHTML = `
            <tr>
              <td>購物車目前是空的</td>
            </tr>
            `;
      cartComponentOff();
    }
  });
}

// 清空購物車 刪除所有品項button
const clearBtn = document.querySelector(".discardAllBtn");
clearBtn.addEventListener("click", clearCart);

function clearCart(e) {
  e.preventDefault();
  axios
    .delete(`${baseUrl}${apiPath}/carts`)
    .then((res) => {
      emptyCart();
      updateCartList();
    })
    .catch((err) => alert(err.response.data.message));
}

// 刪除購物車商品
cartDetails.addEventListener("click", deleteTargetItem);
function deleteTargetItem(e) {
  e.preventDefault();
  if (e.target.className === "material-icons") {
    axios
      .delete(`${baseUrl}${apiPath}/carts/${e.target.dataset.id}`)
      .then((res) => {
        emptyCart();
        updateCartList();
      })
      .catch((err) => alert(err.response.data.message));
  }
}

// 送出訂單
const orderForm = document.querySelector(".orderInfo-form");
const orderName = document.querySelector("#customerName");
const orderTel = document.querySelector("#customerPhone");
const orderEmail = document.querySelector("#customerEmail");
const orderAddress = document.querySelector("#customerAddress");
const orderPayment = document.querySelector("#tradeWay");

function submitOrder(e) {
  e.preventDefault();
  const orderInfo = {
    data: {
      user: {
        name: orderName.value,
        tel: orderTel.value,
        email: orderEmail.value,
        address: orderAddress.value,
        payment: orderPayment.value,
      },
    },
  };
  axios
    .post(`${baseUrl}${apiPath}/orders`, orderInfo)
    .then((res) => {
      orderForm.reset();
      emptyCart();
    })
    .catch((err) => alert(err.response.data.message));
}
const submitOrderBtn = document.querySelector(".orderInfo-btn");
submitOrderBtn.addEventListener("click", submitOrder);

// 千分位
function numberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// 表單驗證
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");

const constraints = {
  姓名: {
    presence: {
      message: "必填欄位",
    },
  },
  電話: {
    presence: {
      message: "必填欄位",
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼",
    },
  },
  Email: {
    presence: {
      message: "必填欄位",
    },
    email: {
      message: "格式錯誤",
    },
  },
  寄送地址: {
    presence: {
      message: "必填欄位",
    },
  },
  交易方式: {
    presence: {
      message: "必填欄位",
    },
  },
};

inputs.forEach((item) => {
  item.addEventListener("change", function () {
    item.nextElementSibling.textContent = "";
    let errors = validate(form, constraints) || "";

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        document.querySelector(`[data-message="${keys}"]`).textContent =
          errors[keys];
      });
    }
  });
});
