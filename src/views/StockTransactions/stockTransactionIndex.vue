<script setup>
import { deleteStockTransaction, getStockTransaction } from '@/services/StockTransactionApi';
import Swal from 'sweetalert2';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const search = ref('');

const stockTransaction = ref([]);

// Pagination
const currentPage = ref(1);
const perPage = ref(10);
const lastPage = ref(1);
const totalData = ref(0);

const getData = async () => {
    try {
        loading.value = true;
        errors.value = {};
        message.value = "";

        const response = await getStockTransaction({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value.trim() || null,
        });

        console.log(response.data);

        stockTransaction.value = response.data.data.data;

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
const debounceSearch = () => {
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
    debounceSearch();
});

watch(perPage, () => {
    currentPage.value = 1;
    getData();
});

const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin ?",
        text: "Data yang sudah dihapus tidak datap dikembalikan.!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
        await deleteStockTransaction(id);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Data berhasil dihapus",
            showConfirmButton: false,
            timer: 3000
        })

        getData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Ooooopss...",
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
        <div class="card">
            <div class="card-header p-2" style="background: #F8FAFC;">
                <div class="card-title d-flex align-items-center justify-content-between mt-2">
                    <h4>Stok Transaksi</h4>
                    <div class="card-tools">
                        <RouterLink :to="{ name: 'add-stock-transaction' }" class="btn btn-outline-primary">Tambah Data
                        </RouterLink>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="date d-flex gap-2 align-items-center justify-content-between">
                        <div class="d-flex gap-2 align-items-center">
                            <input type="date" class="form-control">
                        </div>
                        <div class="d-flex gap-2 align-items-center">
                            <label for="">Ke</label>
                            <input type="date" class="form-control">
                        </div>
                    </div>
                    <div class="search d-flex align-items-center gap-2">
                        <label for="">Cari</label>
                        <input type="text" v-model="search" class="form-control" placeholder="Cari....">
                    </div>
                </div>
                <div class="scroll-table">
                    <table class="table table-striped table-bordered">
                        <thead class="bg-primary">
                            <tr>
                                <th width="5%" class="text-white">No</th>
                                <th class="text-white">No.Transaksi</th>
                                <th class="text-white">Tanggal</th>
                                <th class="text-white">Pengirim</th>
                                <th class="text-white">Penerima</th>
                                <th class="text-white">Total</th>
                                <th class="text-white">Type</th>
                                <th class="text-white">No.Telp</th>
                                <th class="text-center text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="9" class="text-center mt-4">
                                    <p class="spinner-border text-primary"></p>
                                    <p class="text-muted">Sedang Memuat...</p>
                                </td>
                            </tr>
                            <tr v-else-if="stockTransaction.length === 0">
                                <td colspan="9" class="text-center py-5">
                                    <p class="text-muted"><i class="fas fa-folder-closed fa-3x"></i></p>
                                    <p class="fs-5 text-muted">
                                        {{ isSearching ? 'Data tidak ditemukan' : 'Data masih kosong' }}
                                    </p>
                                </td>
                            </tr>

                            <tr v-else v-for="(item, index) in stockTransaction" :key="item.id">
                                <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                                <td>{{ item.number_transaction }}</td>
                                <td>{{ item.date }}</td>
                                <td>{{ item.sender_name }}</td>
                                <td>{{ item.user?.name }}</td>
                                <td>Rp.{{ item.total_quantity }}</td>
                                <td class="text-center text-success">{{ item.type }}</td>
                                <td>{{ item.phone }}</td>
                                <td class="text-center">
                                    <RouterLink :to="{ name: 'detail-stock-transaction', params: { id: item.id } }"
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
                        <nav aria-label="navigation">
                            <ul class="pagination">
                                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                    <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
                                </li>
                                <li class="page-item" v-for="page in lastPage" :key="page"
                                    :class="{ active: currentPage === page }">
                                    <button class="page-link" @click="changePage(page)">{{ page
                                        }}</button>
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
.scroll-table {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>