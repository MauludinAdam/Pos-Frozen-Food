<script setup>
import logo from '@/assets/images/logo.png'
import { getCategories } from '@/services/CategoryApi';
import { getProducts } from '@/services/ProductApi';
import { getSatuanOptions } from '@/services/SatuanApi';
import { createTransaction } from '@/services/TransactionApi';
import Swal from 'sweetalert2';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const quantityInput = ref(null);
const quantity = ref(null);

const products = ref([]);

const categories = ref([]);
const selectedCategory = ref(null);

const satuans = ref([]);

const search = ref('');

const currentPage = ref(1);
const perPage = ref(10);
const lastPage = ref(1);
const totalData = ref(0);

const fetchCategories = async () => {
    try {
        const response = await getCategories();

        console.log(response.data);

        categories.value = response.data.data.data;

    } catch (error) {
        console.log(error);
    }
}

const fetchSatuans = async () => {
    try {
        const response = await getSatuanOptions();

        satuans.value = response.data.data;
    } catch (error) {
        console.log(error)
    }
}

const getData = async () => {
    try {
        loading.value = true;

        const response = await getProducts({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
            category_id: selectedCategory.value,
        });

        products.value = response.data.data.data;

        currentPage.value = response.data.data.meta.current_page;
        lastPage.value = response.data.data.meta.last_page;
        totalData.value = response.data.data.meta.total;
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
}

const filterCategory = (categoryId) => {
    selectedCategory.value = categoryId;

    console.log('Categori ID:', categoryId)

    currentPage.value = 1;

    getData();
}

// script searching
let timeout = null;
const debounceSearch = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        currentPage.value = 1;
        getData();
    }, 500);
}

const isSearching = computed(() => {
    return search.value !== "";
});

watch(search, () => {
    debounceSearch();
});

watch(perPage, () => {
    currentPage.value = 1;
});

const changePage = (page) => {
    if (page < 1 || page > lastPage.value) {
        return;
    }

    currentPage.value = page;

    getData();
}

// function perhitungan total keseluruhan
const subtotal = computed(() => {
    return cart.value.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
});


const cart = ref([]);

const addToCart = (item) => {
    // Cek Stok Product
    if (Number(item.stock) <= 0) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Ooops..",
            text: "Stok Produk Habis!",
            showConfirmButton: false,
            timer: 2000,
        });

        return;

    }

    // Cek Apakah produk sudah ada di keranjang
    const existingItem = cart.value.find(
        cartItem => cartItem.product_id === item.id
    );
    if (existingItem) {
        // Cek batasstok
        if (existingItem.quantity >= Number(item.stock)) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Ooooppss...",
                text: "Jumlah produk melebihi stok tersedia.!",
                showConfirmButton: false,
                timer: 2000
            });

            return;
        }

        existingItem.quantity++;
    } else {
        // Tambahkan Produk baru
        cart.value.push({
            product_id: item.id,
            code: item.code,
            name: item.name,
            price: item.price,
            stock: item.stock,
            satuan: item.satuan?.name || '',
            quantity: 1,
            image: item.image,
        });

    }
}

// function tambah quantity
const increaseQuantity = (item) => {
    if (item.quantity >= item.stock) {
        Swal.fire({
            toast: true,
            icon: "error",
            title: "Ooooopss....",
            text: "Jumlah produk melebihi stok tersedia.!",
        });

        return;
    }

    item.quantity++;
}

// function kurang quantity
const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
        item.quantity--
    } else {
        cart.value = cart.value.filter(cartItem => cartItem.product_id !== item.product_id);
    }
};

const removeItem = (productId) => {
    cart.value = cart.value.filter(
        item => item.product_id !== productId
    );
};

// proses pembayaran
const jmlPembayaran = ref('');
const methodPembayaran = ref('');
const prosessingPayment = ref(false);

const showReceipt = ref(false);
const receiptData = ref(null);
const receiptPaymentMethod = ref('');

const changeAmount = computed(() => {
    const paid = Number(jmlPembayaran.value) || 0;

    return Math.max(paid - subtotal.value, 0);
});

const isPaymentValid = computed(() => {
    return cart.value.length > 0 && Number(jmlPembayaran.value) >= subtotal.value && Number(jmlPembayaran.value) > 0;
});

const prosessPayment = async () => {
    const payload = {
        subtotal: Number(subtotal.value),
        discount_amount: 0,
        total_amount: Number(subtotal.value),
        paid_amount: Number(jmlPembayaran.value),
        change_amount: Number(changeAmount.value),
        status_payment: 'paid',
        payment_method: methodPembayaran.value,
        items: cart.value.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
        })),
    };

    try {
        prosessingPayment.value = true;

        const response = await createTransaction(payload);

        console.log("RESPONSE TRANSAKSI:", response.data);

        // Simpan data transaksi untuk struk
        receiptData.value = response.data.data;

        // Tampil modal untuk struk
        showReceipt.value = true;

        cart.value = [];
        jmlPembayaran.value = '';
        methodPembayaran.value = 'cash';

        await getData();
    } catch (error) {
        console.log(error);

        Swal.fire({
            icon: "error",
            title: "Pembayaran Gagal.!",
            text: error.response?.data?.message || "Transaksi gagal diprosess!.",
        })
    } finally {
        prosessingPayment.value = false;
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

const printReceipt = () => {
    window.print();
}

// function close modal 
const closeReceipt = () => {
    showReceipt.value = false;
    receiptData.value = null;
}


onMounted(() => {
    getData();
    fetchCategories();
    fetchSatuans();
})

</script>

<template>
    <div class="container-fluid">
        <div class="title">
            <h4>Point Of Sales / KASIR (FROZEN FOOD)</h4>
        </div>
        <div class="row mt-2">
            <div class="col-md-8">
                <div class="card cart-product shadow" style="height: 50rem;">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <h5 style="color: #2563eb;">Produk Tersedia</h5>
                        <div class="searching">
                            <input type="text" v-model="search" class="form-control"
                                placeholder="Cari Barang Disini...">
                        </div>
                    </div>
                    <div class="content-product">
                        <div class="p-3">
                            <div class="d-flex gap-2 py-2 categories">
                                <button class="btn btn-category" :class="{ active: selectedCategory === null }"
                                    @click="filterCategory(null)">Semua</button>

                                <button v-for="category in categories" :key="category.id" :value="category.id"
                                    class="btn btn-category" :class="{ active: selectedCategory === category.id }"
                                    @click="filterCategory(category.id)">{{ category.name }}</button>
                            </div>

                        </div>
                        <div class="row gap-2 mx-3">
                            <div v-if="products.length > 0" v-for="item in products" :key="item.id" class="card p-3"
                                style="width: 11rem;">
                                <div class="image text-center">
                                    <img :src="item.image || logo" width="120" height="115" alt="">
                                </div>
                                <div class="content mt-3">
                                    <h5>{{ item.name }}</h5>
                                    <small class="fw-bold" style="font-size: 9px;">{{ item.code }} - {{
                                        item.category?.name }}</small>
                                    <h5 class="mt-3" style="color: #2563eb;">Rp.{{
                                        Number(item.price).toLocaleString('id-ID') }}/ <small class="text-secondary">{{
                                            item.satuan?.name
                                            }}</small></h5>
                                    <small>Stok: {{ item.stock }} {{ item.satuan?.name }}</small><br>
                                    <div class="submit mt-2">
                                        <button @click="addToCart(item)" class="btn btn-sm text-white w-100"
                                            style="background: #2563eb;"><i class="fas fa-shopping-cart"></i>
                                            Tambah</button>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="loading">
                                <div class="text-center">
                                    <p class="spinner-border text-primary mt-4"></p>
                                    <p class="text-muted">Sedang Memuat....</p>
                                </div>
                            </div>
                            <div v-else class="text-center mt-5">
                                <i class="fas fa-folder-closed text-muted fa-4x mb-3"></i><br>
                                {{ isSearching ? 'Data tidak ditemukan...!' : 'Data belum ada' }}
                            </div>
                        </div>
                    </div>
                    <div class="card-footer footer">
                        <marquee scrollamount="5" direction="right">
                            <h4>Belanja Praktis, Kualitas Terjamin, Pilihan Keluarga...</h4>
                        </marquee>
                        <marquee scrollamount="4" direction="left">
                            <p>Nikmati beragam pilihan frozen food berkualitas
                                untuk keluarga
                                anda.!</p>
                        </marquee>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card shadow cart-card" style="height: 50rem;">
                    <div class="card-header d-flex justify-content-between">
                        <h5 style="color: #2563eb;"><i class="fas fa-shopping-cart"></i> Keranjang Belanja</h5>
                        <h5 class="fw-bold" style="color: #2563eb;"> Frozen Food</h5>
                    </div>
                    <div class="content-cart p-4">
                        <div v-if="cart.length > 0" v-for="item in cart" :key="item.product_id" class="image">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="item-content d-flex gap-3">

                                    <img :src="item.image" alt="" width="45" height="55">

                                    <div class="text-content flex-grow-1 mb-3">
                                        <h5>{{ item.name }}</h5>

                                        <div class="d-flex align-items-center gap-2 mt-1">
                                            <span>Rp.{{ Number(item.price).toLocaleString('id-ID') }} </span>

                                            <div class="quantity-control">
                                                <button @click="decreaseQuantity(item)" class="btn-qty"
                                                    :disabled="item.quantity <= 1">-</button>
                                                <span>{{ item.quantity }}</span>
                                                <button @click="increaseQuantity(item)" class="btn-qty">+</button>
                                            </div>
                                        </div>
                                        <div class="mt-1 subtotal">
                                            <small class="fw-semibold">Subtotal: Rp.{{ (Number(item.price) *
                                                Number(item.quantity)).toLocaleString('id-ID') }}</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="remove-item">
                                    <button @click="removeItem(item.product_id)"
                                        class="btn btn-outline-danger btn-sm ml-3" title="Hapus produk"><i
                                            class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <hr>
                        </div>
                        <div v-else-if="loading" class="text-center" style="margin-top: 5rem;">
                            <i class="spinner-border text-primary mb-3"></i>
                            <p class="text-muted">Sedang Memuat...</p>
                        </div>

                        <div v-else class="text-center" style="margin-top: 5rem;">
                            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                            <h4 class="text-muted">Keranjang Belanja Kosong</h4>
                        </div>
                    </div>
                    <div class="card-footer footer">
                        <div class="subtotal d-flex align-items-center justify-content-between">
                            <span>Subtotal</span>
                            <span>Rp.{{ subtotal.toLocaleString('id-ID') }}</span>
                        </div>
                        <hr>
                        <div class="total fw-bold d-flex align-items-center justify-content-between">
                            <h5>Total</h5>
                            <h5>Rp.{{ subtotal.toLocaleString('id-ID') }}</h5>
                        </div>
                        <hr>
                        <div class="form-group">
                            <label for="">Bayar</label>
                            <input type="text" v-model.number="jmlPembayaran" class="form-control"
                                placeholder="Masukkan jumlah pembayaran">
                        </div>
                        <div class="form-group">
                            <label for="">Kembalian</label>
                            <input type="text" class="form-control"
                                :value="'Rp.' + changeAmount.toLocaleString('id-ID')" readonly
                                style="background: #e8efff;">
                        </div>
                        <div class="form-group">
                            <label for="">Metode Pembayaran</label>
                            <select class="form-control" v-model="methodPembayaran">
                                <option value="">--- Pilih ---</option>
                                <option value="cash">CASH</option>
                                <option value="transfer">TRANSFER</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>
                        <button class="btn w-100 text-white" @click="prosessPayment"
                            :disabled="!isPaymentValid || prosessingPayment" style="background: #2563eb;">{{
                                prosessingPayment ? 'Memproses...' : 'Bayar' }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Show Modal Struk -->
    <div v-if="showReceipt" class="modal receipt-modal d-block">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content receipt-modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Struk Pembayara</h5>
                </div>
                <div class="modal-body receipt-body" id="receipt">
                    <div class="text-center mt-3">
                        <h4>TOKO FROZEN FOOD</h4>
                        <p class="mb-0">Terimakasih telah berbelanja</p>
                        <span>Di toko frozen food</span>
                        <hr>
                    </div>

                    <div class="receipt-info p-3">
                        <div class="d-flex justify-content-between">
                            <span>No. Transaksi</span>
                            <span>#{{ receiptData.id }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Tanggal</span>
                            <span>{{ formatDate(receiptData.created_at) }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Kasir</span>
                            <span>{{ receiptData.user?.name || '-' }}</span>
                        </div>


                        <hr>
                        <div v-for="item in receiptData.details" :key="item.id" class="mb-2">
                            <div class="fw-bold">{{ item.product_name }}</div>
                            <div class="d-flex justify-content-between">
                                <span>{{ Number(item.quantity) }} x {{ Number(item.unit_price).toLocaleString('id-ID')
                                    }}</span>
                                <span>Rp.{{ Number(item.subtotal).toLocaleString('id-ID') }}</span>
                            </div>
                        </div>
                        <hr>

                        <div class="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>Rp.{{ Number(receiptData.subtotal).toLocaleString('id-ID') }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Discount</span>
                            <span>Rp.{{ Number(receiptData.discount_amount).toLocaleString('id-ID') }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Total</span>
                            Rp.{{ Number(receiptData.total_amount).toLocaleString('id-ID') }}
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Metode Pembayara</span>
                            <span>{{ receiptPaymentMethod.toUpperCase() }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Dibayar</span>
                            <span>Rp.{{ Number(receiptData.paid_amount).toLocaleString('id-ID') }}</span>
                        </div>

                        <div class="d-flex justify-content-between">
                            <span>Kembalian</span>
                            <span>Rp.{{ Number(receiptData.change_amount).toLocaleString('id-ID') }}</span>
                        </div>

                    </div>
                    <hr>

                    <div class="text-center">
                        <p class="fw-bold mb-1">-------TERIMA KASIH------</p>
                        <span>Selamat Berbekanja Kembali</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="showReceipt = false">
                        <i class="fas fa-times"></i> Tutup
                    </button>
                    <button @click="printReceipt" class="btn btn-primary"><i class="fas fa-print"></i>Cetak
                        Struk</button>
                </div>
            </div>
        </div>
    </div>


</template>

<style scoped>
.cart-card {
    height: 55rem;
    display: flex;
    flex-direction: column;
}

.content-cart {
    flex: 1;
    min-height: 0;
    overflow: auto;
}

.footer {
    flex-shrink: 0;
    background: white;
}

.footer h4 {
    font-family: sans-serif;
    color: #2563eb;
    font-weight: bold;
}

.footer p {
    font-family: sans-serif;
    color: #192c56;
    font-size: 15px;
    font-weight: 600;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 8;
}

.btn-qty {
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 6px;
    background: #e8efff;
    color: #2563eb;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
}

.btn-qty:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #e5e7eb;
    color: #9ca3af;
}

.btn-qty:hover {
    background: #2563eb;
    color: white;
}

.quantity-control span {
    min-width: 18px;
    text-align: center;
    font-weight: 600;
}

.subtotal small {
    color: #2563eb;
}

.categories {
    overflow: auto;
    white-space: nowrap;
    scrollbar-width: auto;
    width: 100%;
}

.categories::-webkit-scrollbar {
    display: block;
}

.btn-category {
    background: #e8efff;
    color: #2563eb;
    border: none;
    border-radius: 5px;
    padding: 5px 18px;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
}

.btn-category.active {
    background: #2563eb;
    color: white;
}

.btn-category:hover {
    background: #2563eb;
    color: white;
}

.card-product {
    display: flex;
    flex-direction: column;
}

.content-product {
    flex: 1;
    min-height: 0;
    overflow: auto;
}

.image img {
    border-radius: .7rem;
}

.receipt-modal {
    position: fixed;
    inset: 0;
    z-index: 1055;
    background: rgba(0, 0, 0, 0.5);
    overflow: hidden;

}

.receipt-modal .modal-dialog {
    max-width: 450px;
    height: calc(100% - 2rem);
    margin: 1rem auto;
}

.receipt-modal-content {
    background: #fff;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    border-radius: 7px;
}

.receipt-modal-content .modal-header {
    flex-shrink: 0;
}

.receipt-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

.receipt-modal-content .modal-footer {
    flex-shrink: 0;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: #fff;
    border-top: 1px solid #dee2e6;
}
</style>