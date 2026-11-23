<script setup>
import { useRouter } from 'vue-router';
import { getProducts } from '@/services/ProductApi';
import { createStockTransaction, getGenerateNumberTransaction } from '@/services/StockTransactionApi';
import { getMe } from '@/services/userApi';
import Swal from 'sweetalert2';
import { ref, onMounted, computed } from 'vue';

const router = useRouter();

const products = ref([]);
const user = ref(null);

const loading = ref(false);
const saving = ref(false);

const form = ref({
    number_transaction: '',
    date: new Date().toISOString().slice(0, 10),
    sender_name: '',
    phone: '',
    description: '',
    items: [
        {
            product_id: '',
            quantity: 1,
            unit_price: 0,
        }
    ]
});

// Mengambil data product
const fetchProduct = async () => {
    try {
        const response = await getProducts();

        products.value = response.data.data.data;
    } catch (error) {
        console.log(error);
    }
}

const fetchUser = async () => {
    try {
        const response = await getMe();

        user.value = response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const generateNumberTransaction = async () => {
    try {
        const response = await getGenerateNumberTransaction();

        form.value.number_transaction = response.data.data.number_transaction
    } catch (error) {
        console.log('Gagal generate nomor transaksi:', error);
    }
}

// memilih product
const selectProduct = (item) => {
    const product = products.value.find(product => product.id == item.product_id)

    if (product) {
        item.unit_price = Number(product.price) || 0
    } else {
        item.unit_price = 0
    }
}

// Tambah baris product
const addItem = () => {
    form.value.items.push({
        product_id: '',
        quantity: 1,
        unit_price: 0,
    })
}

// Hapus baris product
const removeItem = (index) => {
    if (form.value.items.length > 1) {
        form.value.items.splice(index, 1)
    }
}

// Hitung subtotal setiap product
const subtotal = (item) => {
    return Number(item.quantity || 0) * Number(item.unit_price || 0)
}

// Total quantity
const totalQuantity = computed(() => {
    return form.value.items.reduce((total, item) => {
        return total + Number(item.quantity || 0)
    }, 0)
})


// total keseluruhan
const grandTotal = computed(() => {
    return form.value.items.reduce((total, item) => {
        return total + subtotal(item)
    }, 0)
})


// format Rupiah
const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(value)
}


// Simpan transaction
const saveTransaction = async () => {
    if (!form.value.items.length) return

    saving.value = true;

    try {
        const payload = {
            date: form.value.date,
            sender_name: form.value.sender_name,
            phone: form.value.phone,
            description: form.value.description,
            total_quantity: totalQuantity.value,
            items: form.value.items.map(item => ({
                product_id: item.product_id,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
            }))
        }

        const response = await createStockTransaction(payload)

        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: response.data.message
        })

        router.push({
            name: 'stock-transaction'
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error)

        Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: error.response?.data?.message || 'Stok transaksi gagal di simpan.'
        })
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    fetchProduct();
    fetchUser();
    generateNumberTransaction();
})

</script>

<template>
    <div class="container-fluid">
        <div class="card" style="margin-bottom: 8rem;">
            <div class="card-header p-3">
                <div class="card-title">
                    <h4>Tambah Stok Masuk</h4>
                </div>
            </div>
            <div class="card-body">
                <form action="">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="" class="mb-2">No. Transaksi</label>
                                <input type="text" v-model="form.number_transaction" class="form-control" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="" class="mb-2">Nama Pengirim</label>
                                <input type="text" v-model="form.sender_name" class="form-control"
                                    placeholder="Masukkan Nama Pengirim">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="" class="mb-2">Tanggal</label>
                                <input type="date" v-model="form.date" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="" class="mb-2">Nama Penerima</label>
                                <input type="text" class="form-control" :value="user?.name || ''" readonly>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="" class="mb-2">No. Telp</label>
                                <input type="text" v-model="form.phone" class="form-control"
                                    placeholder="Masukkan No.Telp">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="" class="mb-2">Deskripsi</label>
                            <textarea rows="2" v-model="form.description" class="form-control"
                                placeholder="Masukkan Deskripsi"></textarea>
                        </div>
                        <hr class="mt-3">
                        <div class="title-detail mb-4 mt-3 d-flex align-items-center justify-content-between">
                            <h4>Detail Produk</h4>
                            <button type="button" @click="addItem" class="btn btn-primary"><i class="fas fa-plus"></i>
                                Tambah
                                Product</button>
                        </div>
                        <div v-for="(item, index) in form.items" :key="index">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Nama Product</label>
                                        <select class="form-control" v-model="item.product_id">
                                            <option value="">--- Pilih ---</option>
                                            <option v-for="product in products" :value="product.id" :key="product.id">{{
                                                product.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Quantity</label>
                                        <input type="number" v-model.number="item.quantity" min="0" step="any"
                                            class="form-control">
                                    </div>
                                </div>

                                <div class="col-md-2">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Harga Satuan</label>
                                        <input type="number" min="0" v-model="item.unit_price" class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label for="" class="mb-2">Subtotal</label>
                                    <input type="text" class="form-control" :value="formatRupiah(subtotal(item))">
                                </div>
                                <div class="col-md-1 mt-4">
                                    <button @click="removeItem(index)" class="btn btn-danger"
                                        :disabled="form.items.length === 1"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mt-4">
                            <div class="d-flex justify-content-between">
                                <h5>Total Quantity :</h5>
                                <strong>{{ totalQuantity }}</strong>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <h5>Total Nilai Barang :</h5>
                                <h5>{{ formatRupiah(grandTotal) }}</h5>
                            </div>
                            <button @click="saveTransaction" :disabled="saving" class="btn btn-primary mt-4 w-100">{{
                                saving ? 'Menyimpan...' : 'Simpan' }}</button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>