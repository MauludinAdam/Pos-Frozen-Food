<script setup>
import { getDetailTransaction } from '@/services/TransactionApi';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const transaction = ref({});

const getData = async () => {
    loading.value = true;
    errors.value = {};
    message.value = "";

    try {
        const response = await getDetailTransaction(route.params.id);

        transaction.value = response.data.data;

    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
}

const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(value);
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div class="card" style="margin-bottom: 7rem;">
            <div class="card-header p-3">
                <div class="card-title d-flex justify-content-between">
                    <h4>Detail Riwayat Transaksi</h4>
                    <RouterLink :to="{ name: 'riwayat-transaction' }" class="btn btn-warning"><i
                            class="fas fa-arrow-left"></i> Kembali</RouterLink>
                </div>
            </div>
            <div class="card-body">
                <div v-if="loading" class="py-4 text-center">
                    <p class="spinner-border text-primary"></p>
                    <p class="text-muted">Sedang Memuat...</p>
                </div>
                <div v-else>
                    <div class="row mx-3">
                        <table>
                            <thead>
                                <tr>
                                    <th width="14%">No.Transaksi</th>
                                    <th>:</th>
                                    <td>{{ transaction.number_transaction }}</td>
                                </tr>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>:</th>
                                    <td>{{ new Date(transaction.created_at).toLocaleDateString('id-ID') }}</td>
                                </tr>
                                <tr>
                                    <th>Nama Kasir</th>
                                    <th>:</th>
                                    <td>{{ transaction.user?.name ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <th>:</th>
                                    <td>{{ transaction.payment?.status ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Methode Pembayaran</th>
                                    <th>:</th>
                                    <td>{{ transaction.payment?.payment_method }}</td>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="table-row mt-5">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Nama Product</th>
                                    <th>Kategori</th>
                                    <th>Satuan</th>
                                    <th>Qty</th>
                                    <th>Harga Satuan</th>
                                    <th>subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in transaction.details" :key="item.id">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ item.product_name }}</td>
                                    <td>{{ item.category }}</td>
                                    <td>{{ item.satuan }}</td>
                                    <td>{{ item.quantity }}</td>
                                    <td>{{ formatRupiah(item.unit_price) }}</td>
                                    <td>{{ formatRupiah(item.subtotal) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="col-12 col-lg-4 ms-auto mt-4 mx-4">
                            <h5 class="mb-4">Ringkasan Pembayaran</h5>

                            <div class="d-flex justify-content-between">
                                <span class="fw-bold">Grand Total</span>
                                <span class="fw-semibold">{{ formatRupiah(transaction.subtotal) }}</span>
                            </div>
                            <div class="d-flex justify-content-between py-3">
                                <span class="fw-bold">Dibayar</span>
                                <span class="fw-semibold">{{ formatRupiah(transaction.paid_amount) }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="fw-bold">Kembalian</span>
                                <span class="fw-semibold">{{ formatRupiah(transaction.change_amount) }}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <h5 class="mb-0">Total Pembayaran</h5>
                                <h5 class="mb-0 text-dark">{{ formatRupiah(transaction.subtotal) }}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
table tr th td {
    margin-bottom: 1.5rem;
}
</style>