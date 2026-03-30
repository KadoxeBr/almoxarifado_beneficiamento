const url = "https://script.google.com/macros/s/AKfycbz-sf-9Y-X6bwxJgolI7ggFnF_J9iGNK7FBfE_bagKV34FJMtacsCM53uM6KHaahJ3kzQ/exec?action=getProducts";
fetch(url).then(r => r.text()).then(console.log).catch(console.error);
