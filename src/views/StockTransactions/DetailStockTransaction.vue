<script setup>
import { detailStockTransaction } from '@/services/StockTransactionApi';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const loading = ref(false);

const stockTransaction = ref([]);

const getData = async () => {
    try {
        loading.value = true;

        const response = await detailStockTransaction(route.params.id);

        console.log(response.data.data);

        stockTransaction.value = response.data.data;

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
    }).format(value)
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div v-if="loading" class="text-center py-5 mt-5">
            <p class="spinner-border text-primary"></p>
            <p class="text-muted">Sedang Memuat...</p>
        </div>
        <div v-else-if="stockTransaction">
            <div class="card">
                <div class="card-header p-3">
                    <div class="card-title d-flex align-items-center justify-content-between">
                        <h4>Detail Stok Transaksi</h4>
                        <RouterLink :to="{ name: 'stock-transaction' }" class="btn btn-info"><i
                                class="fas fa-arrow-left"></i> Kembali</RouterLink>
                    </div>
                </div>


                <div class="card-body">
                    <h4 class="mb-5">Informasi Transaksi</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <table>
                                <tr>
                                    <th width="50%">No.Transaksi</th>
                                    <th width="5%">:</th>
                                    <td>{{ stockTransaction.number_transaction }}</td>
                                </tr>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>:</th>
                                    <td>{{ stockTransaction.date }}</td>
                                </tr>
                                <tr>
                                    <th>Pengirim</th>
                                    <th>:</th>
                                    <td>{{ stockTransaction.sender_name }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table>
                                <tr>
                                    <th width="50%">Penerima</th>
                                    <th width="5%">:</th>
                                    <td>{{ stockTransaction.receiver_name }}</td>
                                </tr>
                                <tr>
                                    <th>Total Kuantitas</th>
                                    <th>:</th>
                                    <td>Rp.{{ stockTransaction.total_quantity }}</td>
                                </tr>
                                <tr>
                                    <th>Keterangan</th>
                                    <th>:</th>
                                    <td>{{ stockTransaction.description || '-' }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header p-3">
                    <div class="card-title">
                        <h4>Detail Produk</h4>
                    </div>
                </div>
                <div class="card-body">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th width="5%">No</th>
                                <th>Product</th>
                                <th class="text-center">Jumlah</th>
                                <th>Harga Satuan</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in stockTransaction.items" :key="item.id">
                                <td class="text-center">{{ index + 1 }}</td>
                                <td>{{ item.product?.name }}</td>
                                <td class="text-center">{{ item.quantity }}</td>
                                <td>{{ formatRupiah(item.unit_price) }}</td>
                                <td>{{ formatRupiah(item.subtotal) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>