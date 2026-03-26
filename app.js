// *** ATENÇÃO: NÃO ESQUEÇA DE ALTERAR O ENDEREÇO ABAIXO!!!! ****

const API_BASE = "https://catalogo-api-i0k3.onrender.com"

const listaEl = document.getElementById("lista")
const statusEl = document.getElementById("status")
const msgEl = document.getElementById("msg")

const form = document.getElementById("formProduto")
const selectCategoria = document.getElementById("category_id")
const btnAtualizar = document.getElementById("btnAtualizar")

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)

    if (!response.ok) {
        const msg = data?.error || `Erro HTTP ${response.status}`
        throw new Error(msg)
    }

    return data
}

function setStatus(texto) {
    statusEl.textContent = texto
}

function setMsg(texto, ok = true) {
    msgEl.textContent = texto
    msgEl.style.color = ok ? "green" : "crimson"
}

function renderProdutos(produtos) {
    listaEl.innerHTML = ""

    produtos.forEach(p => {
        const div = document.createElement("div")
        div.className = "item"

        div.innerHTML = `
      <span class="badge">${p.category_name}</span>
      <h3>${p.name}</h3>
      <p>${p.description || "Sem descrição"}</p>
      <p><b>Preço:</b> R$ ${Number(p.price).toFixed(2)}</p>
      <p><b>Estoque:</b> ${p.stock}</p>
    `

        listaEl.appendChild(div)
    })
}

async function carregarCategorias() {
    const categorias = await fetchJson(`${API_BASE}/api/categories`)
    selectCategoria.innerHTML = ""

    categorias.forEach(c => {
        const opt = document.createElement("option")
        opt.value = c.id
        opt.textContent = c.name
        selectCategoria.appendChild(opt)
    })
}

async function carregarProdutos() {
    setStatus("Carregando produtos...")
    const produtos = await fetchJson(`${API_BASE}/api/products`)
    renderProdutos(produtos)
    setStatus(`Total: ${produtos.length} produto(s)`)
}

form.addEventListener("submit", async e => {
    e.preventDefault()
    setMsg("")

    const body = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        stock: Number(document.getElementById("stock").value),
        category_id: Number(selectCategoria.value)
    }

    try {
        await fetchJson(`${API_BASE}/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        setMsg("Produto cadastrado com sucesso!", true)
        form.reset()
        await carregarProdutos()
    } catch (err) {
        setMsg(err.message, false)
    }
})

btnAtualizar.addEventListener("click", () => {
    carregarProdutos().catch(err => setStatus(err.message))
})

async function init() {
    try {
        await carregarCategorias()
        await carregarProdutos()
    } catch (err) {
        setStatus(`Erro: ${err.message}`)
    }
}

init()