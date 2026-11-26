<script setup>
import { getLaporanTransaction } from '@/services/LaporanTransactionApi';
import { ref, onMounted, watch, computed } from 'vue';

const loading = ref(false);

const summary = ref({});
const transactions = ref([]);

const search = ref('');

// Pagination
const currentPage = ref(1);
const perPage = ref(10)
const lastPage = ref(1);
const totalData = ref(1);


const filters = ref({
    start_date: '',
    end_date: '',
});

const getReport = async () => {
    loading.value = true;

    try {

        const params = {};

        const response = await getLaporanTransaction(params)

        if (filters.value.start_date) {
            params.start_date = filters.value.start_date;
        }

        if (filters.value.end_date) {
            params.end_date = filters.value.end_date;
        }

        const result = response.data.data;

        summary.value = result.summary;

        transactions.value = result.transactions.data;

        console.log(response.data.data.transactions);

        currentPage.value = result.transactions.meta.current_page;
        lastPage.value = result.transactions.meta.last_page;
        totalData.value = result.transactions.meta.total;


    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false;
    }
}

const changePage = (page) => {
    if (page < 1 || page > lastPage.value) {
        return;
    }

    currentPage.value = page;

    getReport();
}

let timeout = null;
const debounceSearch = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        currentPage.value = 1;
        getReport();
    }, 500);
}


const isSearching = computed(() => {
    return search.value.trim() !== "";
});

watch(search, () => {
    debounceSearch();
});

watch(perPage, () => {
    currentPage.value = 1;
})

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
        <div class="col-md-6 col-xl-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="f-w-400">Total Transaksi</h5>
                        <p class="text-muted fs-2 mt-3"><i class="fas fa-shopping-cart text-primary"></i>
                        </p>
                    </div>
                    <h4 class="text-primary">{{ summary.total_transactions ? summary.total_transactions : 0 }} </h4>
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
                    <h4 class="text-info">{{ summary.total_sales ? formatRupiah(summary.total_sales) : 0 }}
                    </h4>
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
                    <h4 class="text-success">{{ summary.average_transaction ?
                        formatRupiah(summary.average_transaction)
                        : 0 }} </h4>
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
                    <h4 class="text-warning">{{ summary.total_product_terjual ? summary.total_product_terjual : 0 }}
                    </h4>
                </div>
            </div>
        </div>
    </div>

    <div class="laporan mb-3">
        <div class="row mt-3">
            <div class="d-flex align-items-center justify-content-between">
                <div class="perPage d-flex gap-2 align-items-center">
                    <label for="">Show</label>
                    <select class="form-select" v-model="perPage">
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>
                <div class="d-flex gap-2">
                    <div class="starts">
                        <input type="date" v-model="filters.start_date" class="form-control">
                    </div>
                    <div class="ends">
                        <input type="date" v-model="filters.end_date" class="form-control">
                    </div>
                    <button @click="getReport" class="btn btn-primary mt-1" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                        <i class="fas fa-filter"></i>
                        Filter
                    </button>

                </div>
            </div>
        </div>
    </div>

    <div class="table-scroll mt-2">
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th>No. Transaksi</th>
                    <th>Tanggal</th>
                    <th>Kasir</th>
                    <th class="text-end">Subtotal</th>
                    <th class="text-center">Status</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loading" class="text-center">
                    <td colspan="7" class="py-5">
                        <p class="spinner spinner-border text-primary"></p>
                        <p class="text-muted">Sedang Memuat....</p>
                    </td>
                </tr>
                <tr v-else-if="transactions.length > 0" v-for="(item, index) in transactions" :key="item.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>{{ item.number_transaction }}</td>
                    <td>{{ new Date(item.date).toLocaleDateString('id-ID') }}</td>
                    <td><i class="fas fa-user text-muted"></i> {{ item.cashier }}</td>
                    <td class="text-end">{{ formatRupiah(item.subtotal) }}</td>
                    <td class="text-success text-center"><i class="fas fa-check-circle"></i> {{ item.status_payment
                        }}
                    </td>
                    <td class="text-end">{{ formatRupiah(item.total_amount) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="d-flex align-items-center justify-content-between">
        <div class="page">
            <span>Halaman {{ currentPage }} dari {{ lastPage }}</span>
        </div>
        <div class="pagination">
            <nav aria-label="...">
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
                    </li>

                    <li class="page-item" v-for="page in lastPage" :key="page"
                        :class="{ active: currentPage === page }">
                        <button class="page-link" @click="changePage(currentPage === page)">{{ page }}</button>
                    </li>

                    <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                        <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
                    </li>
                </ul>
            </nav>
        </div>
    </div>

</template>

<style scoped>
.scroll-table {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>