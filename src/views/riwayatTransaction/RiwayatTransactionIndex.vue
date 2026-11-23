<script setup>
import { deleteTransaction, getTransactions } from '@/services/TransactionApi';
import Swal from 'sweetalert2';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const transaction = ref([]);

const startDate = ref('');
const endDate = ref('');

const filters = ref({
    startDate: '',
    endDate: '',
});


const search = ref('');

const currentPage = ref(1);
const perPage = ref(10);
const lastPage = ref(1);
const totalData = ref(0);

const getData = async () => {
    try {
        loading.value = true;
        errors.value = {};
        message.value = "";

        const response = await getTransactions({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
            startDate: startDate.value,
            endDate: endDate.value,
        });

        console.log(response.data)

        transaction.value = response.data.data.data;

        currentPage.value = response.data.data.meta.current_page;
        lastPage.value = response.data.data.meta.last_page;
        totalData.value = response.data.data.meta.total;
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

    getData();
}

let timeout = null;
const debounseSearch = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        currentPage.value = 1;
        getData();
    }, 500);
}

const isSearching = computed(() => {
    return search.value.trim() !== "";
});

watch(search, () => {
    debounseSearch();
})

watch(perPage, () => {
    currentPage.value = 1;
    getData();
})

const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(value)
}

const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin ?",
        text: "Data yang sudah dihapus tidak dapat dikembalikan.!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    });

    if (!result.isConfirmed)
        return;

    try {
        await deleteTransaction(id);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Data berhasil dihapus",
            showConfirmButton: false,
            timer: 3000
        });

        getData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Oooopss...",
            text: "Gagal menghapus data.",
        });

        console.log(error);
    }
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div class="card" style="margin-bottom: 10rem;">
            <div class="card-header p-3">
                <div class="card-title">
                    <h4>Riwayat Transaksi</h4>
                    <small>Daftar seluruh transaksi penjualan di POS/Kasir</small>
                </div>
            </div>
            <div class="card-body">

                <div class="d-flex align-items-center justify-content-between mt-4">
                    <div class="search">
                        <input type="text" v-model="search" class="form-control" placeholder="Cari No.Transaksi">
                    </div>

                    <div class="date d-flex gap-3">
                        <div class="start">
                            <input type="date" v-model="startDate" class="form-control">
                        </div>
                        <div class="end">
                            <input type="date" v-model="endDate" class="form-control">
                        </div>
                        <div class="filter">
                            <button @click="getData" class="btn btn-primary"><i class="fa-solid fa-filter mt-1"></i>
                                Filter</button>
                        </div>
                    </div>
                </div>

                <div class="table-scroll">
                    <table class="table table-bordered table-striped mt-4">
                        <thead>
                            <tr>
                                <th>No.Transaksi</th>
                                <th class="text-center">Tanggal</th>
                                <th>Kasir</th>
                                <th class="text-center">quantity</th>
                                <th class="text-end">Subtotal</th>
                                <th>Status</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="11" class="text-center py-5">
                                    <p class="spinner-border text-primary"></p>
                                    <p class="text-muted">Sedang Memuat...</p>
                                </td>
                            </tr>
                            <tr v-else-if="transaction.length === 0">
                                <td colspan="11" class="text-center py-5">
                                    <p class="text-muted"><i class="fas fa-folder-closed"></i></p>
                                    <p class="text-muted">{{ isSearching ? 'Data tidak ditemukan' :
                                        'Data masih kosong.!' }}</p>
                                </td>
                            </tr>
                            <tr v-for="(item, index) in transaction" :key="item.id">
                                <td>{{ item.number_transaction }}</td>
                                <td class="text-center">{{ new Date(item.created_at).toLocaleDateString('id-ID') }}</td>
                                <td>{{ item.user?.name }}</td>
                                <td class="text-center">{{item.details?.reduce((total, detail) => total +
                                    Number(detail.quantity), 0) ?? 0}}</td>

                                <td class="text-end">{{ formatRupiah(item.subtotal) }}</td>
                                <td class="text-success text-center"><i class="fas fa-check-circle"></i> {{
                                    item.payment?.status }}
                                </td>

                                <td width="12%" class="text-center">
                                    <RouterLink :to="{ name: 'detail-riwayat-transaction', params: { id: item.id } }"
                                        class="btn btn-outline-info btn-sm mx-1"><i class="fas fa-eye"></i></RouterLink>
                                    <button @click="deleteData(item.id)" class="btn btn-outline-danger btn-sm"><i
                                            class="fas fa-trash"></i></button>
                                </td>
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
                                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                                </li>

                                <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                                    <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-scroll {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>