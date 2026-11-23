<script setup>
import { getLaporanTransaction } from '@/services/LaporanTransactionApi';
import { ref, onMounted } from 'vue';

const loading = ref(false);

const summary = ref({});
const transactions = ref([]);

const filters = ref({
    start_date: '',
    end_date: '',
})

const getReport = async () => {
    loading.value = true;

    try {
        const params = {};

        if (filters.value.start_date) {
            params.start_date = filters.value.start_date;
        }

        if (filters.value.end_date) {
            params.end_date = filters.value.end_date;
        }

        // Panggil API Laporan Transaksi
        const response = await getLaporanTransaction(params);

        console.log(response.data);
        summary.value = response.data.data.summary;

        transactions.value = response.data.data.transactions;


    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false;
    }
}

const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

onMounted(() => {
    getReport();
})

</script>

<template>
    <h4>Data Laporan Transaksi</h4>
    <div class="row">
        <!-- [ sample-page ] start -->
        <div class="col-md-6 col-xl-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="f-w-400">Total Transaksi</h5>
                        <p class="text-muted fs-2 mt-3"><i class="fas fa-shopping-cart text-primary"></i>
                        </p>
                    </div>
                    <h4 class="text-primary">{{ summary.total_transactions }} </h4>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="f-w-400">Total Pendapatan</h5>
                        <p class="text-info fs-2 mt-3"><i class="fa-solid fa-money-bill-trend-up"></i>
                        </p>
                    </div>
                    <h4 class="text-info">{{ formatRupiah(summary.total_sales) }} </h4>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="f-w-400">Rata-Rata Uang Per Transaksi</h5>
                        <p class="text-success fs-2 mt-3"><i class="fas fa-money-bill-wave"></i>
                        </p>
                    </div>
                    <h4 class="text-success">{{ formatRupiah(summary.average_transaction) }} </h4>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="f-w-400 text-muted">Total Item Terjual</h5>
                        <p class="text-warning fs-2 mt-3"><i class="fa-brands fa-product-hunt"></i></p>
                    </div>
                    <h4 class="text-warning">{{ summary.total_product_terjual }} </h4>
                </div>
            </div>
        </div>
    </div>

    <div class="filter-laporan">
        <h5>Filter Laporan</h5>

        <div class="row mt-3">
            <div class="col-md-4">
                <label for="" class="mb-2">Tanggal Mulai</label>
                <input v-model="filters.start_date" type="date" class="form-control">
            </div>
            <div class="col-md-4">
                <label for="" class="mb-2">Tanggal Akhir</label>
                <input v-model="filters.end_date" type="date" class="form-control">
            </div>
            <div class="col-md-2 mt-4">
                <button @click="getReport" class="btn btn-primary mt-1" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    <i class="fas fa-search"></i>
                    Tampilkan
                </button>
            </div>
        </div>
    </div>

    <div class="table-scroll mt-4">
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th>No. Transaksi</th>
                    <th>Tanggal</th>
                    <th>Kasir</th>
                    <th class="text-end">Subtotal</th>
                    <th>Status</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in transactions" :key="item.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>{{ item.number_transaction }}</td>
                    <td>{{ new Date(item.date).toLocaleDateString('id-ID') }}</td>
                    <td>{{ item.cashier }}</td>
                    <td class="text-end">{{ formatRupiah(item.subtotal) }}</td>
                    <td class="text-success"><i class="fas fa-check-circle"></i> {{ item.status_payment }}</td>
                    <td class="text-end">{{ formatRupiah(item.total_amount) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

</template>