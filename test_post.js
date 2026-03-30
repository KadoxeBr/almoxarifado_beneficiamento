const url = "https://script.google.com/macros/s/AKfycbz-sf-9Y-X6bwxJgolI7ggFnF_J9iGNK7FBfE_bagKV34FJMtacsCM53uM6KHaahJ3kzQ/exec";
fetch(url, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    action: "addEntity",
    type: "products",
    id: "TEST-001",
    desc: "Test Product",
    un: "UN",
    saldo: 10,
    estoqueMin: 5,
    ultimoCusto: 100
  })
}).then(r => r.text()).then(console.log).catch(console.error);
